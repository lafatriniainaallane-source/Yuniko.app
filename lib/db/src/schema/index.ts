import { relations, sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const mediaTypeEnum = pgEnum("media_type", ["photo", "video", "image", "voice"]);
export const postVisibilityEnum = pgEnum("post_visibility", ["public", "followers", "friends", "private"]);
export const notificationTypeEnum = pgEnum("notification_type", ["like", "comment", "share", "follow", "friend_request", "message", "story"]);
export const messageTypeEnum = pgEnum("message_type", ["text", "image", "video", "voice"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email"),
  phoneNumber: text("phone_number"),
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url"),
  bio: text("bio").default("").notNull(),
  countryCode: text("country_code"),
  locale: text("locale").default("en").notNull(),
  verified: boolean("verified").default(false).notNull(),
  privateAccount: boolean("private_account").default(false).notNull(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  ...timestamps,
}, (table) => ({
  usernameIdx: uniqueIndex("users_username_idx").on(sql`lower(${table.username})`),
  emailIdx: uniqueIndex("users_email_idx").on(sql`lower(${table.email})`),
  phoneIdx: uniqueIndex("users_phone_idx").on(table.phoneNumber),
}));

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  tokenHash: text("token_hash").notNull(),
  deviceName: text("device_name"),
  ipAddress: text("ip_address"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  ...timestamps,
}, (table) => ({ tokenIdx: uniqueIndex("sessions_token_hash_idx").on(table.tokenHash), userIdx: index("sessions_user_idx").on(table.userId) }));

export const follows = pgTable("follows", {
  followerId: uuid("follower_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  followingId: uuid("following_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ pk: uniqueIndex("follows_pair_idx").on(table.followerId, table.followingId) }));

export const friendships = pgTable("friendships", {
  requesterId: uuid("requester_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  addresseeId: uuid("addressee_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ pk: uniqueIndex("friendships_pair_idx").on(table.requesterId, table.addresseeId) }));

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  caption: text("caption").default("").notNull(),
  visibility: postVisibilityEnum("visibility").default("public").notNull(),
  countrySeed: text("country_seed").array().default(sql`ARRAY[]::text[]`).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  shareCount: integer("share_count").default(0).notNull(),
  saveCount: integer("save_count").default(0).notNull(),
  reportCount: integer("report_count").default(0).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  ...timestamps,
}, (table) => ({ authorIdx: index("posts_author_idx").on(table.authorId), createdIdx: index("posts_created_idx").on(table.createdAt) }));

export const postMedia = pgTable("post_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  type: mediaTypeEnum("type").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  width: integer("width"),
  height: integer("height"),
  durationMs: integer("duration_ms"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const postEvents = pgTable("post_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  countryCode: text("country_code"),
  watchTimeMs: integer("watch_time_ms").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  liked: boolean("liked").default(false).notNull(),
  commented: boolean("commented").default(false).notNull(),
  shared: boolean("shared").default(false).notNull(),
  saved: boolean("saved").default(false).notNull(),
  followedAuthor: boolean("followed_author").default(false).notNull(),
  reported: boolean("reported").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const comments = pgTable("comments", { id: uuid("id").defaultRandom().primaryKey(), postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(), authorId: uuid("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(), body: text("body").notNull(), deletedAt: timestamp("deleted_at", { withTimezone: true }), ...timestamps });
export const stories = pgTable("stories", { id: uuid("id").defaultRandom().primaryKey(), authorId: uuid("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(), mediaUrl: text("media_url").notNull(), mediaType: mediaTypeEnum("media_type").notNull(), expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull() });
export const conversations = pgTable("conversations", { id: uuid("id").defaultRandom().primaryKey(), ...timestamps });
export const conversationMembers = pgTable("conversation_members", { conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(), userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(), lastReadAt: timestamp("last_read_at", { withTimezone: true }), typingUntil: timestamp("typing_until", { withTimezone: true }) }, (table) => ({ pk: uniqueIndex("conversation_members_idx").on(table.conversationId, table.userId) }));
export const messages = pgTable("messages", { id: uuid("id").defaultRandom().primaryKey(), conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(), senderId: uuid("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(), type: messageTypeEnum("type").default("text").notNull(), body: text("body"), mediaUrl: text("media_url"), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(), deletedAt: timestamp("deleted_at", { withTimezone: true }) });
export const notifications = pgTable("notifications", { id: uuid("id").defaultRandom().primaryKey(), recipientId: uuid("recipient_id").references(() => users.id, { onDelete: "cascade" }).notNull(), actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }), type: notificationTypeEnum("type").notNull(), entityId: uuid("entity_id"), body: text("body").notNull(), readAt: timestamp("read_at", { withTimezone: true }), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull() });
export const userSafety = pgTable("user_safety", { id: uuid("id").defaultRandom().primaryKey(), blockerId: uuid("blocker_id").references(() => users.id, { onDelete: "cascade" }).notNull(), blockedId: uuid("blocked_id").references(() => users.id, { onDelete: "cascade" }).notNull(), reason: text("reason"), createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull() });

export const userRelations = relations(users, ({ many }) => ({ posts: many(posts), stories: many(stories) }));
export const postRelations = relations(posts, ({ one, many }) => ({ author: one(users, { fields: [posts.authorId], references: [users.id] }), media: many(postMedia), comments: many(comments) }));

export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
