import { IStorage } from "./types";
import {
  User,
  Post,
  Comment,
  Like,
  Follow,
  InsertUser,
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private likes: Map<number, Like>;
  private follows: Map<number, Follow>;
  private currentId: { [key: string]: number };
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.follows = new Map();
    this.currentId = {
      users: 1,
      posts: 1,
      comments: 1,
      likes: 1,
      follows: 1,
    };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPost(userId: number, content: string, imageUrl?: string): Promise<Post> {
    const id = this.currentId.posts++;
    const post = {
      id,
      userId,
      content,
      imageUrl,
      createdAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async getFeed(userId: number): Promise<Post[]> {
    const following = Array.from(this.follows.values())
      .filter((follow) => follow.followerId === userId)
      .map((follow) => follow.followingId);
    
    return Array.from(this.posts.values())
      .filter((post) => following.includes(post.userId) || post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async followUser(followerId: number, followingId: number): Promise<Follow> {
    const id = this.currentId.follows++;
    const follow = { id, followerId, followingId };
    this.follows.set(id, follow);
    return follow;
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    const follow = Array.from(this.follows.values()).find(
      (f) => f.followerId === followerId && f.followingId === followingId,
    );
    if (follow) {
      this.follows.delete(follow.id);
    }
  }

  async likePost(userId: number, postId: number): Promise<Like> {
    const id = this.currentId.likes++;
    const like = { id, userId, postId };
    this.likes.set(id, like);
    return like;
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    const like = Array.from(this.likes.values()).find(
      (l) => l.userId === userId && l.postId === postId,
    );
    if (like) {
      this.likes.delete(like.id);
    }
  }

  async addComment(userId: number, postId: number, content: string): Promise<Comment> {
    const id = this.currentId.comments++;
    const comment = {
      id,
      userId,
      postId,
      content,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getPostComments(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPostLikes(postId: number): Promise<Like[]> {
    return Array.from(this.likes.values()).filter((like) => like.postId === postId);
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter((post) => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
