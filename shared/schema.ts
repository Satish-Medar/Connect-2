import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("citizen"), // citizen, admin, staff
  points: integer("points").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const issues = pgTable("issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // pothole, lighting, garbage, signage, etc.
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("submitted"), // submitted, acknowledged, in_progress, resolved, closed
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  address: text("address"),
  imageUrl: text("image_url"),
  audioUrl: text("audio_url"),
  aiAnalysis: jsonb("ai_analysis"), // AI classification results
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }),
  severityScore: integer("severity_score").default(0), // 0-100
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  assignedTo: varchar("assigned_to").references(() => users.id),
  departmentRouted: text("department_routed"), // public_works, sanitation, utilities, etc.
  validationCount: integer("validation_count").default(0),
  commentCount: integer("comment_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const validations = pgTable("validations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  issueId: varchar("issue_id").notNull().references(() => issues.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  isValid: boolean("is_valid").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  issueId: varchar("issue_id").notNull().references(() => issues.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isOfficial: boolean("is_official").default(false), // from municipal staff
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // first_reporter, hot_streak, quality_guard, city_hero
  title: text("title").notNull(),
  description: text("description"),
  iconName: text("icon_name"),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  issueId: varchar("issue_id").references(() => issues.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // status_update, validation, comment, achievement
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  issues: many(issues),
  validations: many(validations),
  comments: many(comments),
  achievements: many(achievements),
  notifications: many(notifications),
}));

export const issuesRelations = relations(issues, ({ one, many }) => ({
  reporter: one(users, {
    fields: [issues.reporterId],
    references: [users.id],
  }),
  assignedUser: one(users, {
    fields: [issues.assignedTo],
    references: [users.id],
  }),
  validations: many(validations),
  comments: many(comments),
  notifications: many(notifications),
}));

export const validationsRelations = relations(validations, ({ one }) => ({
  issue: one(issues, {
    fields: [validations.issueId],
    references: [issues.id],
  }),
  user: one(users, {
    fields: [validations.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  issue: one(issues, {
    fields: [comments.issueId],
    references: [issues.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
});

export const insertIssueSchema = createInsertSchema(issues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  validationCount: true,
  commentCount: true,
});

export const insertValidationSchema = createInsertSchema(validations).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issues.$inferSelect;
export type IssueWithReporter = Issue & { reporter: User };
export type IssueWithDetails = Issue & { 
  reporter: User;
  assignedUser?: User;
  validations: (typeof validations.$inferSelect & { user: User })[];
  comments: (typeof comments.$inferSelect & { user: User })[];
};
export type InsertValidation = z.infer<typeof insertValidationSchema>;
export type Validation = typeof validations.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
