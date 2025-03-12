import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Posts
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const validation = insertPostSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    const post = await storage.createPost(
      req.user!.id,
      validation.data.content,
      validation.data.imageUrl,
    );
    res.status(201).json(post);
  });

  app.get("/api/feed", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const posts = await storage.getFeed(req.user!.id);
    res.json(posts);
  });

  // Follows
  app.post("/api/follow/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = parseInt(req.params.userId);
    await storage.followUser(req.user!.id, userId);
    res.sendStatus(200);
  });

  app.delete("/api/follow/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = parseInt(req.params.userId);
    await storage.unfollowUser(req.user!.id, userId);
    res.sendStatus(200);
  });

  // Likes
  app.post("/api/posts/:postId/like", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const postId = parseInt(req.params.postId);
    const like = await storage.likePost(req.user!.id, postId);
    res.status(201).json(like);
  });

  app.delete("/api/posts/:postId/like", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const postId = parseInt(req.params.postId);
    await storage.unlikePost(req.user!.id, postId);
    res.sendStatus(200);
  });

  // Comments
  app.post("/api/posts/:postId/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const validation = insertCommentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation.error);
    }

    const postId = parseInt(req.params.postId);
    const comment = await storage.addComment(
      req.user!.id,
      postId,
      validation.data.content,
    );
    res.status(201).json(comment);
  });

  app.get("/api/posts/:postId/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const postId = parseInt(req.params.postId);
    const comments = await storage.getPostComments(postId);
    res.json(comments);
  });

  app.get("/api/posts/:postId/likes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const postId = parseInt(req.params.postId);
    const likes = await storage.getPostLikes(postId);
    res.json(likes);
  });

  app.get("/api/users/:userId/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = parseInt(req.params.userId);
    const posts = await storage.getUserPosts(userId);
    res.json(posts);
  });

  app.get("/api/users/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = parseInt(req.params.userId);
    const user = await storage.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't expose password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.get("/api/users/:userId/following", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = parseInt(req.params.userId);
    const followingId = parseInt(req.params.userId);
    const isFollowing = await storage.isFollowing(req.user!.id, followingId);
    res.json(isFollowing);
  });

  app.put("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { displayName, bio, avatarUrl } = req.body;
    const updatedUser = await storage.updateUserProfile(
      req.user!.id,
      { displayName, bio, avatarUrl }
    );
    
    // Update session
    req.login(updatedUser, (err) => {
      if (err) return res.status(500).json({ message: "Failed to update session" });
      
      // Don't expose password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
