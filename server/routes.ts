import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeSentiment } from "./sentimentAnalysis";
import { 
  insertTeamSchema, 
  insertProjectSchema, 
  insertFeedbackSchema,
  insertFeedbackCommentSchema,
  insertTeamMemberSchema 
} from "@shared/schema";

// Simple auth middleware for demo
const demoAuth = (req: any, res: any, next: any) => {
  // Create a demo user for testing
  req.user = {
    claims: {
      sub: "demo-user-1",
      email: "demo@example.com",
      first_name: "Demo",
      last_name: "User"
    }
  };
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Demo auth routes
  app.get('/api/auth/user', demoAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // Create demo user if doesn't exist
      if (!user) {
        user = await storage.upsertUser({
          id: userId,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Team routes
  app.post('/api/teams', demoAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const teamData = insertTeamSchema.parse({ ...req.body, createdBy: userId });
      const team = await storage.createTeam(teamData);
      res.json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(400).json({ message: "Failed to create team" });
    }
  });

  app.get('/api/teams', demoAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const teams = await storage.getTeamsByUser(userId);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get('/api/teams/:teamId/members', demoAuth, async (req: any, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const members = await storage.getTeamMembers(teamId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post('/api/teams/:teamId/members', demoAuth, async (req: any, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const memberData = insertTeamMemberSchema.parse({ 
        ...req.body, 
        teamId 
      });
      const member = await storage.addTeamMember(memberData);
      res.json(member);
    } catch (error) {
      console.error("Error adding team member:", error);
      res.status(400).json({ message: "Failed to add team member" });
    }
  });

  // Project routes
  app.post('/api/projects', demoAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({ ...req.body, createdBy: userId });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Failed to create project" });
    }
  });

  app.get('/api/teams/:teamId/projects', demoAuth, async (req: any, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const projects = await storage.getProjectsByTeam(teamId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', demoAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Feedback routes
  app.post('/api/feedback', demoAuth, async (req: any, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(feedbackData);
      
      // Analyze sentiment
      const sentimentResult = analyzeSentiment(feedback.content);
      await storage.updateFeedbackSentiment(
        feedback.id,
        sentimentResult.sentiment,
        sentimentResult.score,
        sentimentResult.confidence
      );
      
      res.json({ ...feedback, ...sentimentResult });
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(400).json({ message: "Failed to create feedback" });
    }
  });

  app.get('/api/projects/:projectId/feedback', demoAuth, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { sentiment, isRead, assignedTo, search } = req.query;
      
      const filters: any = {};
      if (sentiment) filters.sentiment = sentiment as string;
      if (isRead !== undefined) filters.isRead = isRead === 'true';
      if (assignedTo) filters.assignedTo = assignedTo as string;
      if (search) filters.search = search as string;
      
      const feedback = await storage.getFeedbackByProject(projectId, filters);
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.patch('/api/feedback/:id', demoAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const feedback = await storage.updateFeedback(id, updates);
      res.json(feedback);
    } catch (error) {
      console.error("Error updating feedback:", error);
      res.status(400).json({ message: "Failed to update feedback" });
    }
  });

  // Comment routes
  app.post('/api/feedback/:feedbackId/comments', demoAuth, async (req: any, res) => {
    try {
      const feedbackId = parseInt(req.params.feedbackId);
      const userId = req.user.claims.sub;
      const commentData = insertFeedbackCommentSchema.parse({
        ...req.body,
        feedbackId,
        userId
      });
      const comment = await storage.createFeedbackComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ message: "Failed to create comment" });
    }
  });

  app.get('/api/feedback/:feedbackId/comments', demoAuth, async (req: any, res) => {
    try {
      const feedbackId = parseInt(req.params.feedbackId);
      const comments = await storage.getFeedbackComments(feedbackId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}