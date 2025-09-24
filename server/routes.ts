import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireRole } from "./auth";
import { analyzeIssueImage, detectDuplicateIssue, findSimilarIssues, normalizeLocation } from "./gemini";
import multer from "multer";
import sharp from "sharp";
import { insertIssueSchema, insertValidationSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// WebSocket clients for real-time updates
const wsClients = new Set<WebSocket>();

function broadcastUpdate(data: any) {
  const message = JSON.stringify(data);
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // File upload endpoint
  app.post("/api/upload", requireAuth, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Process image with Sharp
      const processedImage = await sharp(req.file.buffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Convert to base64 for AI analysis
      const base64Image = processedImage.toString('base64');
      
      // Analyze with AI
      const analysis = await analyzeIssueImage(base64Image, req.body.description);

      // Store processed image (in a real app, save to cloud storage)
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;

      res.json({
        imageUrl,
        analysis
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      res.status(500).json({ message: "Image processing failed" });
    }
  });

  // Issue endpoints
  app.post("/api/issues", requireAuth, async (req, res) => {
    try {
      const issueData = insertIssueSchema.parse({
        ...req.body,
        reporterId: req.user!.id
      });

      // Check for similar issues nearby and return them for user decision
      if (issueData.latitude && issueData.longitude) {
        const normalizedLocation = normalizeLocation(issueData.address || "");
        
        // Search with larger radius for better detection
        const nearbyIssues = await storage.getIssuesNearLocation(
          parseFloat(issueData.latitude),
          parseFloat(issueData.longitude),
          0.5 // 500m radius for better coverage
        );

        if (nearbyIssues.length > 0) {
          const similarityCheck = await findSimilarIssues(
            {
              title: issueData.title,
              description: issueData.description || "",
              category: issueData.category,
              location: normalizedLocation,
              imageUrl: issueData.imageUrl
            },
            nearbyIssues.map(i => ({
              id: i.id,
              title: i.title,
              description: i.description || "",
              category: i.category,
              location: normalizeLocation(i.address || ""),
              imageUrl: i.imageUrl,
              reportedBy: i.reporter?.username || "Anonymous",
              createdAt: i.createdAt,
              validationCount: i.validationCount,
              status: i.status
            }))
          );

          // If we find similar issues with medium to high confidence, return them
          if (similarityCheck.similarIssues && similarityCheck.similarIssues.length > 0) {
            return res.status(200).json({
              type: "similar_issues_found",
              message: "Similar issues found in your area",
              similarIssues: similarityCheck.similarIssues,
              submittedIssue: issueData,
              canProceedAnyway: true
            });
          }
        }
      }

      const issue = await storage.createIssue(issueData);
      
      // Award points for reporting
      await storage.updateUserPoints(req.user!.id, 10);
      
      // Check for achievements
      const userIssues = await storage.getIssues({ reporterId: req.user!.id });
      if (userIssues.length === 1) {
        await storage.createAchievement(
          req.user!.id,
          "first_reporter",
          "First Reporter",
          "Submitted your first civic issue report",
          "fas fa-camera-retro"
        );
      }

      // Broadcast real-time update
      broadcastUpdate({
        type: "new_issue",
        issue: { ...issue, reporter: req.user }
      });

      res.status(201).json(issue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid issue data", errors: error.errors });
      }
      console.error("Create issue failed:", error);
      res.status(500).json({ message: "Failed to create issue" });
    }
  });

  app.get("/api/issues", async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        reporterId: req.query.reporterId as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const issues = await storage.getIssues(filters);
      res.json(issues);
    } catch (error) {
      console.error("Get issues failed:", error);
      res.status(500).json({ message: "Failed to fetch issues" });
    }
  });

  app.get("/api/issues/:id", async (req, res) => {
    try {
      const issue = await storage.getIssue(req.params.id);
      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      res.json(issue);
    } catch (error) {
      console.error("Get issue failed:", error);
      res.status(500).json({ message: "Failed to fetch issue" });
    }
  });

  // Upvote an issue
  app.post("/api/issues/:id/upvote", requireAuth, async (req, res) => {
    try {
      const issueId = req.params.id;
      const userId = req.user!.id;

      // Check if issue exists
      const issue = await storage.getIssue(issueId);
      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }

      // Create a validation (upvote) for this issue
      await storage.createValidation({
        issueId,
        userId,
        isValid: true,
        note: "Upvoted via similar issues dialog"
      });

      // Award points to the user for validating
      await storage.updateUserPoints(userId, 2);

      // Update the issue's validation count
      const updatedIssue = await storage.updateIssue(issueId, {
        validationCount: (issue.validationCount || 0) + 1
      });

      res.json({ 
        message: "Issue upvoted successfully",
        validationCount: updatedIssue?.validationCount || 0
      });
    } catch (error) {
      console.error("Upvote issue failed:", error);
      res.status(500).json({ message: "Failed to upvote issue" });
    }
  });

  app.patch("/api/issues/:id", requireRole(["admin", "staff"]), async (req, res) => {
    try {
      const updates = req.body;
      const issue = await storage.updateIssue(req.params.id, updates);
      
      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }

      // Create notification for status updates
      if (updates.status) {
        await storage.createNotification(
          issue.reporterId,
          "Issue Status Updated",
          `Your report "${issue.title}" status changed to ${updates.status}`,
          "status_update",
          issue.id
        );
      }

      // Broadcast real-time update
      broadcastUpdate({
        type: "issue_updated",
        issue
      });

      res.json(issue);
    } catch (error) {
      console.error("Update issue failed:", error);
      res.status(500).json({ message: "Failed to update issue" });
    }
  });

  app.get("/api/issues/near/:lat/:lng", async (req, res) => {
    try {
      const lat = parseFloat(req.params.lat);
      const lng = parseFloat(req.params.lng);
      const radius = req.query.radius ? parseFloat(req.query.radius as string) : 5; // 5km default

      const issues = await storage.getIssuesNearLocation(lat, lng, radius);
      res.json(issues);
    } catch (error) {
      console.error("Get nearby issues failed:", error);
      res.status(500).json({ message: "Failed to fetch nearby issues" });
    }
  });

  // Validation endpoints
  app.post("/api/issues/:id/validate", requireAuth, async (req, res) => {
    try {
      const validation = insertValidationSchema.parse({
        issueId: req.params.id,
        userId: req.user!.id,
        ...req.body
      });

      await storage.createValidation(validation);
      
      // Award points for validation
      await storage.updateUserPoints(req.user!.id, 5);

      res.status(201).json({ message: "Validation recorded" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid validation data", errors: error.errors });
      }
      console.error("Create validation failed:", error);
      res.status(500).json({ message: "Failed to create validation" });
    }
  });

  // Comment endpoints
  app.post("/api/issues/:id/comments", requireAuth, async (req, res) => {
    try {
      const comment = insertCommentSchema.parse({
        issueId: req.params.id,
        userId: req.user!.id,
        isOfficial: req.user!.role === "admin" || req.user!.role === "staff",
        ...req.body
      });

      await storage.createComment(comment);
      res.status(201).json({ message: "Comment added" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      console.error("Create comment failed:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // User endpoints
  app.get("/api/users/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard(10);
      res.json(leaderboard);
    } catch (error) {
      console.error("Get leaderboard failed:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/users/:id/achievements", async (req, res) => {
    try {
      const achievements = await storage.getUserAchievements(req.params.id);
      res.json(achievements);
    } catch (error) {
      console.error("Get achievements failed:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Notification endpoints
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const unreadOnly = req.query.unread === "true";
      const notifications = await storage.getUserNotifications(req.user!.id, unreadOnly);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications failed:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark notification read failed:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Admin/Analytics endpoints
  app.get("/api/admin/stats", requireRole(["admin", "staff"]), async (req, res) => {
    try {
      const stats = await storage.getIssueStats();
      res.json(stats);
    } catch (error) {
      console.error("Get stats failed:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    wsClients.add(ws);
    console.log('WebSocket client connected');

    ws.on('close', () => {
      wsClients.delete(ws);
      console.log('WebSocket client disconnected');
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connection established' }));
  });

  return httpServer;
}
