import {
  users,
  teams,
  teamMembers,
  projects,
  feedback,
  feedbackComments,
  type User,
  type UpsertUser,
  type Team,
  type InsertTeam,
  type TeamMember,
  type InsertTeamMember,
  type Project,
  type InsertProject,
  type Feedback,
  type InsertFeedback,
  type FeedbackComment,
  type InsertFeedbackComment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Team operations
  createTeam(team: InsertTeam): Promise<Team>;
  getTeamsByUser(userId: string): Promise<Team[]>;
  getTeamMembers(teamId: number): Promise<(TeamMember & { user: User })[]>;
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProjectsByTeam(teamId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  
  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackByProject(projectId: number, filters?: {
    sentiment?: string;
    isRead?: boolean;
    assignedTo?: string;
    search?: string;
  }): Promise<(Feedback & { assignedUser?: User })[]>;
  updateFeedbackSentiment(id: number, sentiment: string, sentimentScore: number, confidence: number): Promise<void>;
  updateFeedback(id: number, updates: Partial<Feedback>): Promise<Feedback>;
  
  // Comment operations
  createFeedbackComment(comment: InsertFeedbackComment): Promise<FeedbackComment>;
  getFeedbackComments(feedbackId: number): Promise<(FeedbackComment & { user: User })[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Team operations
  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    
    // Add creator as team owner
    await db.insert(teamMembers).values({
      teamId: newTeam.id,
      userId: team.createdBy,
      role: "owner",
    });
    
    return newTeam;
  }

  async getTeamsByUser(userId: string): Promise<Team[]> {
    const userTeams = await db
      .select({ team: teams })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, userId));
    
    return userTeams.map(({ team }) => team);
  }

  async getTeamMembers(teamId: number): Promise<(TeamMember & { user: User })[]> {
    const members = await db
      .select()
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));
    
    return members.map(({ team_members, users }) => ({
      ...team_members,
      user: users,
    }));
  }

  async addTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db.insert(teamMembers).values(member).returning();
    return newMember;
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async getProjectsByTeam(teamId: number): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.teamId, teamId))
      .orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  // Feedback operations
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db.insert(feedback).values(feedbackData).returning();
    return newFeedback;
  }

  async getFeedbackByProject(
    projectId: number,
    filters?: {
      sentiment?: string;
      isRead?: boolean;
      assignedTo?: string;
      search?: string;
    }
  ): Promise<(Feedback & { assignedUser?: User })[]> {
    let query = db
      .select({
        feedback: feedback,
        assignedUser: users,
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.assignedTo, users.id))
      .where(eq(feedback.projectId, projectId));

    const conditions = [eq(feedback.projectId, projectId)];

    if (filters) {
      if (filters.sentiment) {
        conditions.push(eq(feedback.sentiment, filters.sentiment));
      }
      if (filters.isRead !== undefined) {
        conditions.push(eq(feedback.isRead, filters.isRead));
      }
      if (filters.assignedTo) {
        conditions.push(eq(feedback.assignedTo, filters.assignedTo));
      }
      if (filters.search) {
        conditions.push(
          or(
            ilike(feedback.content, `%${filters.search}%`),
            ilike(feedback.customerName, `%${filters.search}%`),
            ilike(feedback.customerEmail, `%${filters.search}%`)
          )
        );
      }
    }

    const results = await db
      .select({
        feedback: feedback,
        assignedUser: users,
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.assignedTo, users.id))
      .where(and(...conditions))
      .orderBy(desc(feedback.createdAt));

    return results.map(({ feedback, assignedUser }) => ({
      ...feedback,
      assignedUser: assignedUser || undefined,
    }));
  }

  async updateFeedbackSentiment(
    id: number,
    sentiment: string,
    sentimentScore: number,
    confidence: number
  ): Promise<void> {
    await db
      .update(feedback)
      .set({ sentiment, sentimentScore, confidence, updatedAt: new Date() })
      .where(eq(feedback.id, id));
  }

  async updateFeedback(id: number, updates: Partial<Feedback>): Promise<Feedback> {
    const [updatedFeedback] = await db
      .update(feedback)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(feedback.id, id))
      .returning();
    return updatedFeedback;
  }

  // Comment operations
  async createFeedbackComment(comment: InsertFeedbackComment): Promise<FeedbackComment> {
    const [newComment] = await db.insert(feedbackComments).values(comment).returning();
    return newComment;
  }

  async getFeedbackComments(feedbackId: number): Promise<(FeedbackComment & { user: User })[]> {
    const comments = await db
      .select()
      .from(feedbackComments)
      .innerJoin(users, eq(feedbackComments.userId, users.id))
      .where(eq(feedbackComments.feedbackId, feedbackId))
      .orderBy(feedbackComments.createdAt);

    return comments.map(({ feedback_comments, users }) => ({
      ...feedback_comments,
      user: users,
    }));
  }
}

export const storage = new DatabaseStorage();