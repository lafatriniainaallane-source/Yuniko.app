import { Router } from "express";
import { and, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { commentsTable, followsTable, notificationsTable, postEngagementsTable, postsTable, storiesTable, usersTable } from "@workspace/db/schema";
import { authMiddleware } from "../middlewares/auth";

const socialRouter = Router();
socialRouter.use(authMiddleware);

const tags = (caption = "") => [...new Set((caption.match(/#[\p{L}\p{N}_]+/gu) ?? []).map((t) => t.toLowerCase()))];
const viralScore = (m: { likes: number; comments: number; shares: number; saves: number; completions: number; reports: number; watchTimeMs: number }) =>
  Math.max(0, m.likes * 8 + m.comments * 12 + m.shares * 18 + m.saves * 14 + m.completions * 10 + Math.floor(m.watchTimeMs / 1000) - m.reports * 60);
const tierFor = (score: number) => score >= 2000 ? 5 : score >= 900 ? 4 : score >= 350 ? 3 : score >= 120 ? 2 : score >= 35 ? 1 : 0;

socialRouter.get("/feed", async (req, res) => {
  const userId = (req as any).userId as number;
  const limit = Math.min(Number(req.query["limit"] ?? 20), 50);
  const rows = await db.select({ post: postsTable, author: usersTable }).from(postsTable).innerJoin(usersTable, eq(postsTable.authorId, usersTable.id)).where(eq(postsTable.visibility, "public")).orderBy(desc(postsTable.distributionTier), desc(postsTable.viralScore), desc(postsTable.createdAt)).limit(limit);
  const ids = rows.map((r) => r.post.id);
  const engagementRows = ids.length ? await db.select().from(postEngagementsTable).where(and(eq(postEngagementsTable.userId, userId), inArray(postEngagementsTable.postId, ids))) : [];
  const state = new Map(engagementRows.map((e) => [e.postId, e]));
  res.json(rows.map(({ post, author }) => ({ ...post, author: publicUser(author), viewer: state.get(post.id) ?? null })));
});

socialRouter.post("/posts", async (req, res) => {
  const userId = (req as any).userId as number;
  const { caption = "", media = [], visibility = "public" } = req.body as any;
  if (!Array.isArray(media) || media.length === 0) {
    res.status(400).json({ error: "At least one image or video is required" });
    return;
  }
  const [post] = await db.insert(postsTable).values({ authorId: userId, caption, media, visibility, hashtags: tags(caption), countrySeed: ["BR", "US", "NG", "IN", "JP", "FR"] }).returning();
  res.status(201).json(post);
});

socialRouter.patch("/posts/:id/engagement", async (req, res) => {
  const userId = (req as any).userId as number;
  const postId = Number(req.params["id"]);
  const { liked, saved, shared, reported, watchTimeMs = 0, completed = false } = req.body as any;
  const existing = await db.select().from(postEngagementsTable).where(and(eq(postEngagementsTable.postId, postId), eq(postEngagementsTable.userId, userId))).limit(1);
  const values = { liked: !!liked, saved: !!saved, shared: !!shared, reported: !!reported, watchTimeMs: Number(watchTimeMs), completed: !!completed, updatedAt: new Date() };
  const [engagement] = existing.length
    ? await db.update(postEngagementsTable).set(values).where(eq(postEngagementsTable.id, existing[0].id)).returning()
    : await db.insert(postEngagementsTable).values({ postId, userId, ...values }).returning();
  const metrics = await db.select({ likes: sql<number>`count(*) filter (where liked)`, comments: sql<number>`(select count(*) from comments where post_id = ${postId})`, shares: sql<number>`count(*) filter (where shared)`, saves: sql<number>`count(*) filter (where saved)`, reports: sql<number>`count(*) filter (where reported)`, completions: sql<number>`count(*) filter (where completed)`, watchTimeMs: sql<number>`coalesce(sum(watch_time_ms),0)` }).from(postEngagementsTable).where(eq(postEngagementsTable.postId, postId));
  const score = viralScore(metrics[0] as any);
  await db.update(postsTable).set({ viralScore: score, distributionTier: tierFor(score), updatedAt: new Date() }).where(eq(postsTable.id, postId));
  res.json(engagement);
});

socialRouter.get("/posts/:id/comments", async (req, res) => {
  const postId = Number(req.params["id"]);
  const rows = await db.select({ comment: commentsTable, author: usersTable }).from(commentsTable).innerJoin(usersTable, eq(commentsTable.authorId, usersTable.id)).where(eq(commentsTable.postId, postId)).orderBy(desc(commentsTable.createdAt)).limit(100);
  res.json(rows.map((r) => ({ ...r.comment, author: publicUser(r.author) })));
});

socialRouter.post("/posts/:id/comments", async (req, res) => {
  const userId = (req as any).userId as number;
  const postId = Number(req.params["id"]);
  const body = String(req.body?.body ?? "").trim();
  if (!body) {
    res.status(400).json({ error: "Comment is required" });
    return;
  }
  const [comment] = await db.insert(commentsTable).values({ postId, authorId: userId, body }).returning();
  res.status(201).json(comment);
});

socialRouter.get("/stories", async (_req, res) => {
  const rows = await db.select({ story: storiesTable, author: usersTable }).from(storiesTable).innerJoin(usersTable, eq(storiesTable.authorId, usersTable.id)).where(gt(storiesTable.expiresAt, new Date())).orderBy(desc(storiesTable.createdAt)).limit(80);
  res.json(rows.map((r) => ({ ...r.story, author: publicUser(r.author) })));
});

socialRouter.post("/follow/:id", async (req, res) => {
  const followerId = (req as any).userId as number;
  const followingId = Number(req.params["id"]);
  if (followerId === followingId) {
    res.status(400).json({ error: "Cannot follow yourself" });
    return;
  }
  await db.insert(followsTable).values({ followerId, followingId }).onConflictDoNothing();
  await db.insert(notificationsTable).values({ userId: followingId, actorId: followerId, type: "follow", body: "started following you" });
  res.json({ following: true });
});

socialRouter.get("/notifications", async (req, res) => {
  const userId = (req as any).userId as number;
  const rows = await db.select({ notification: notificationsTable, actor: usersTable }).from(notificationsTable).leftJoin(usersTable, eq(notificationsTable.actorId, usersTable.id)).where(eq(notificationsTable.userId, userId)).orderBy(desc(notificationsTable.createdAt)).limit(100);
  res.json(rows.map((r) => ({ ...r.notification, actor: r.actor ? publicUser(r.actor) : null })));
});

function publicUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

export default socialRouter;
