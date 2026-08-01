import { relations } from "drizzle-orm";
import { boolean, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const mediaTypeEnum = pgEnum("media_type", ["image", "video", "voice"]);
export const postVisibilityEnum = pgEnum("post_visibility", ["public", "followers", "friends", "private"]);
export const notificationTypeEnum = pgEnum("notification_type", ["like", "comment", "share", "follow", "friend_request", "message", "story"]);
export const messageTypeEnum = pgEnum("message_type", ["text", "image", "video", "voice"]);

export const followsTable = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  followingId: integer("following_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({ uniqueFollow: uniqueIndex("follows_unique_idx").on(table.followerId, table.followingId) }));

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  caption: text("caption").default("").notNull(),
  media: jsonb("media").$type<Array<{ type: "image" | "video"; url: string; width?: number; height?: number; durationMs?: number }>>().default([]).notNull(),
  hashtags: jsonb("hashtags").$type<string[]>().default([]).notNull(),
  visibility: postVisibilityEnum("visibility").default("public").notNull(),
  countrySeed: jsonb("country_seed").$type<string[]>().default([]).notNull(),
  viralScore: integer("viral_score").default(0).notNull(),
  distributionTier: integer("distribution_tier").default(0).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const postEngagementsTable = pgTable("post_engagements", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => postsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  liked: boolean("liked").default(false).notNull(),
  saved: boolean("saved").default(false).notNull(),
  shared: boolean("shared").default(false).notNull(),
  reported: boolean("reported").default(false).notNull(),
  watchTimeMs: integer("watch_time_ms").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({ uniqueEngagement: uniqueIndex("post_engagements_unique_idx").on(table.postId, table.userId) }));

export const commentsTable = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => postsTable.id, { onDelete: "cascade" }),
  authorId: integer("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const storiesTable = pgTable("stories", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  mediaUrl: text("media_url").notNull(),
  mediaType: mediaTypeEnum("media_type").notNull(),
  caption: text("caption").default("").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationsTable = pgTable("conversations", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversationParticipantsTable = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversationsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  lastReadAt: timestamp("last_read_at"),
  isTyping: boolean("is_typing").default(false).notNull(),
}, (table) => ({ uniqueParticipant: uniqueIndex("conversation_participants_unique_idx").on(table.conversationId, table.userId) }));

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversationsTable.id, { onDelete: "cascade" }),
  senderId: integer("sender_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  type: messageTypeEnum("type").default("text").notNull(),
  body: text("body").default("").notNull(),
  mediaUrl: text("media_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  actorId: integer("actor_id").references(() => usersTable.id, { onDelete: "set null" }),
  type: notificationTypeEnum("type").notNull(),
  entityId: integer("entity_id"),
  body: text("body").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
