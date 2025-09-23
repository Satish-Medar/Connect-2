import { 
  users, 
  issues, 
  validations, 
  comments, 
  achievements, 
  notifications,
  type User, 
  type InsertUser,
  type Issue,
  type InsertIssue,
  type IssueWithReporter,
  type IssueWithDetails,
  type InsertValidation,
  type InsertComment,
  type Achievement,
  type Notification
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, sql, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: string, points: number): Promise<void>;
  getLeaderboard(limit?: number): Promise<User[]>;
  
  // Issue operations
  createIssue(issue: InsertIssue): Promise<Issue>;
  getIssue(id: string): Promise<IssueWithDetails | undefined>;
  getIssues(filters?: {
    category?: string;
    status?: string;
    priority?: string;
    reporterId?: string;
    limit?: number;
    offset?: number;
  }): Promise<IssueWithReporter[]>;
  updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | undefined>;
  getIssuesNearLocation(lat: number, lng: number, radiusKm: number): Promise<IssueWithReporter[]>;
  
  // Validation operations
  createValidation(validation: InsertValidation): Promise<void>;
  getValidationsForIssue(issueId: string): Promise<any[]>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<void>;
  getCommentsForIssue(issueId: string): Promise<any[]>;
  
  // Achievement operations
  createAchievement(userId: string, type: string, title: string, description: string, iconName: string): Promise<void>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
  
  // Notification operations
  createNotification(userId: string, title: string, message: string, type: string, issueId?: string): Promise<void>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationRead(notificationId: string): Promise<void>;
  
  // Analytics
  getIssueStats(): Promise<{
    total: number;
    active: number;
    inProgress: number;
    resolved: number;
    avgResponseTime: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserPoints(userId: string, points: number): Promise<void> {
    await db
      .update(users)
      .set({ points: sql`${users.points} + ${points}` })
      .where(eq(users.id, userId));
  }

  async getLeaderboard(limit = 10): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.points))
      .limit(limit);
  }

  async createIssue(issue: InsertIssue): Promise<Issue> {
    const [newIssue] = await db
      .insert(issues)
      .values(issue)
      .returning();
    return newIssue;
  }

  async getIssue(id: string): Promise<IssueWithDetails | undefined> {
    const [issue] = await db
      .select()
      .from(issues)
      .where(eq(issues.id, id));
    
    if (!issue) return undefined;

    const [reporter] = await db
      .select()
      .from(users)
      .where(eq(users.id, issue.reporterId));

    const assignedUser = issue.assignedTo 
      ? await db.select().from(users).where(eq(users.id, issue.assignedTo)).then(r => r[0])
      : undefined;

    const issueValidations = await db
      .select()
      .from(validations)
      .leftJoin(users, eq(validations.userId, users.id))
      .where(eq(validations.issueId, id));

    const issueComments = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.issueId, id))
      .orderBy(asc(comments.createdAt));

    return {
      ...issue,
      reporter,
      assignedUser,
      validations: issueValidations.map(v => ({ ...v.validations!, user: v.users! })),
      comments: issueComments.map(c => ({ ...c.comments!, user: c.users! }))
    };
  }

  async getIssues(filters: {
    category?: string;
    status?: string;
    priority?: string;
    reporterId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<IssueWithReporter[]> {
    let query = db
      .select()
      .from(issues)
      .leftJoin(users, eq(issues.reporterId, users.id));

    const conditions = [];
    
    if (filters.category) {
      conditions.push(eq(issues.category, filters.category));
    }
    if (filters.status) {
      conditions.push(eq(issues.status, filters.status));
    }
    if (filters.priority) {
      conditions.push(eq(issues.priority, filters.priority));
    }
    if (filters.reporterId) {
      conditions.push(eq(issues.reporterId, filters.reporterId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(issues.createdAt));

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const results = await query;
    
    return results.map(result => ({
      ...result.issues!,
      reporter: result.users!
    }));
  }

  async updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | undefined> {
    const [updated] = await db
      .update(issues)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(issues.id, id))
      .returning();
    return updated;
  }

  async getIssuesNearLocation(lat: number, lng: number, radiusKm: number): Promise<IssueWithReporter[]> {
    // Simple bounding box calculation for proximity
    const latDelta = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    const results = await db
      .select()
      .from(issues)
      .leftJoin(users, eq(issues.reporterId, users.id))
      .where(
        and(
          sql`${issues.latitude} BETWEEN ${lat - latDelta} AND ${lat + latDelta}`,
          sql`${issues.longitude} BETWEEN ${lng - lngDelta} AND ${lng + lngDelta}`
        )
      );

    return results.map(result => ({
      ...result.issues!,
      reporter: result.users!
    }));
  }

  async createValidation(validation: InsertValidation): Promise<void> {
    await db.insert(validations).values(validation);
    
    // Update validation count
    await db
      .update(issues)
      .set({ validationCount: sql`${issues.validationCount} + 1` })
      .where(eq(issues.id, validation.issueId));
  }

  async getValidationsForIssue(issueId: string): Promise<any[]> {
    return await db
      .select()
      .from(validations)
      .leftJoin(users, eq(validations.userId, users.id))
      .where(eq(validations.issueId, issueId));
  }

  async createComment(comment: InsertComment): Promise<void> {
    await db.insert(comments).values(comment);
    
    // Update comment count
    await db
      .update(issues)
      .set({ commentCount: sql`${issues.commentCount} + 1` })
      .where(eq(issues.id, comment.issueId));
  }

  async getCommentsForIssue(issueId: string): Promise<any[]> {
    return await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.issueId, issueId))
      .orderBy(asc(comments.createdAt));
  }

  async createAchievement(userId: string, type: string, title: string, description: string, iconName: string): Promise<void> {
    await db.insert(achievements).values({
      userId,
      type,
      title,
      description,
      iconName
    });
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt));
  }

  async createNotification(userId: string, title: string, message: string, type: string, issueId?: string): Promise<void> {
    await db.insert(notifications).values({
      userId,
      title,
      message,
      type,
      issueId
    });
  }

  async getUserNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId));

    if (unreadOnly) {
      query = query.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    }

    return await query.orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  async getIssueStats(): Promise<{
    total: number;
    active: number;
    inProgress: number;
    resolved: number;
    avgResponseTime: number;
  }> {
    const [totalResult] = await db.select({ count: count() }).from(issues);
    const [activeResult] = await db.select({ count: count() }).from(issues).where(eq(issues.status, 'submitted'));
    const [inProgressResult] = await db.select({ count: count() }).from(issues).where(eq(issues.status, 'in_progress'));
    const [resolvedResult] = await db.select({ count: count() }).from(issues).where(eq(issues.status, 'resolved'));

    // Calculate average response time (simplified)
    const avgResponseTime = 2.4; // days - would need more complex query for actual calculation

    return {
      total: totalResult.count,
      active: activeResult.count,
      inProgress: inProgressResult.count,
      resolved: resolvedResult.count,
      avgResponseTime
    };
  }
}

export const storage = new DatabaseStorage();
