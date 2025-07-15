import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams for collaboration
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Team memberships
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 50 }).notNull().default("member"), // member, admin, owner
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Projects within teams
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  teamId: integer("team_id").notNull().references(() => teams.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feedback entries
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  content: text("content").notNull(),
  source: varchar("source", { length: 100 }).notNull(), // email, social, survey, etc.
  customerEmail: varchar("customer_email"),
  customerName: varchar("customer_name"),
  sentiment: varchar("sentiment", { length: 20 }), // positive, negative, neutral
  sentimentScore: integer("sentiment_score"), // -100 to 100
  confidence: integer("confidence"), // 0 to 100
  tags: text("tags").array().default([]),
  isRead: boolean("is_read").default(false),
  isArchived: boolean("is_archived").default(false),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comments on feedback for team collaboration
export const feedbackComments = pgTable("feedback_comments", {
  id: serial("id").primaryKey(),
  feedbackId: integer("feedback_id").notNull().references(() => feedback.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  teams: many(teams),
  teamMemberships: many(teamMembers),
  projects: many(projects),
  assignedFeedback: many(feedback),
  comments: many(feedbackComments),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  creator: one(users, {
    fields: [teams.createdBy],
    references: [users.id],
  }),
  members: many(teamMembers),
  projects: many(projects),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  team: one(teams, {
    fields: [projects.teamId],
    references: [teams.id],
  }),
  creator: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  feedback: many(feedback),
}));

export const feedbackRelations = relations(feedback, ({ one, many }) => ({
  project: one(projects, {
    fields: [feedback.projectId],
    references: [projects.id],
  }),
  assignedUser: one(users, {
    fields: [feedback.assignedTo],
    references: [users.id],
  }),
  comments: many(feedbackComments),
}));

export const feedbackCommentsRelations = relations(feedbackComments, ({ one }) => ({
  feedback: one(feedback, {
    fields: [feedbackComments.feedbackId],
    references: [feedback.id],
  }),
  user: one(users, {
    fields: [feedbackComments.userId],
    references: [users.id],
  }),
}));

// Types and schemas
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Team = typeof teams.$inferSelect;
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, createdAt: true });
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true, joinedAt: true });
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type Project = typeof projects.$inferSelect;
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Feedback = typeof feedback.$inferSelect;
export const insertFeedbackSchema = createInsertSchema(feedback).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  sentiment: true,
  sentimentScore: true,
  confidence: true 
});
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type FeedbackComment = typeof feedbackComments.$inferSelect;
export const insertFeedbackCommentSchema = createInsertSchema(feedbackComments).omit({ id: true, createdAt: true });
export type InsertFeedbackComment = z.infer<typeof insertFeedbackCommentSchema>;