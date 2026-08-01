import { Router } from "express";
import { and, desc, eq, gt, or, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { notificationsTable, postsTable, relationshipsTable, storiesTable, usersTable } from "@workspace/db/schema";
import { authMiddleware } from "../middlewares/auth";

const socialRouter = Router();
const requireUser = authMiddleware;
const safe = (res: any, err: unknown) => {
  if (!process.env["DATABASE_URL"]) return res.status(503).json({ error: "Database not configured" });
  console.error(err);
  return res.status(500).json({ error: "Server error" });
};
const countries = ["MA", "FR", "US", "BR", "IN", "JP", "NG", "DE", "MX", "ID", "KR", "ZA"];
const audienceFor = (stage: number) => countries.slice(0, Math.min(countries.length, 3 + stage * 3));

socialRouter.get("/feed", requireUser, async (req, res) => {
  try {
    const rows = await db.select().from(postsTable).orderBy(desc(postsTable.viralStage), desc(postsTable.createdAt)).limit(40);
    return res.json(rows.map((p: typeof postsTable.$inferSelect) => ({ ...p, distributionCountries: audienceFor(p.viralStage) })));
  } catch (err) { return safe(res, err); }
});

socialRouter.post("/posts", requireUser, async (req, res) => {
  const userId = (req as any).userId as number;
  const { caption = "", media = [], visibility = "world" } = req.body as any;
  if (!caption.trim() && (!Array.isArray(media) || media.length === 0)) return res.status(400).json({ error: "Caption or media is required" });
  try {
    const [post] = await db.insert(postsTable).values({ authorId: userId, caption: caption.trim(), media, visibility, countrySeed: countries[Math.floor(Math.random() * countries.length)] }).returning();
    return res.status(201).json({ ...post, distributionCountries: audienceFor(0) });
  } catch (err) { return safe(res, err); }
});

socialRouter.post("/posts/:id/engagement", requireUser, async (req, res) => {
  const id = Number(req.params.id);
  const { action, watchTimeMs = 0, completed = false } = req.body as any;
  const deltas: Record<string, any> = { views: sql`${postsTable.views} + 1` };
  if (action === "like") deltas.likes = sql`${postsTable.likes} + 1`;
  if (action === "comment") deltas.comments = sql`${postsTable.comments} + 1`;
  if (action === "share") deltas.shares = sql`${postsTable.shares} + 1`;
  if (action === "save") deltas.saves = sql`${postsTable.saves} + 1`;
  if (action === "report") deltas.reports = sql`${postsTable.reports} + 1`;
  try {
    const [current] = await db.select().from(postsTable).where(eq(postsTable.id, id)).limit(1);
    if (!current) return res.status(404).json({ error: "Post not found" });
    const score = current.likes * 4 + current.comments * 7 + current.shares * 10 + current.saves * 6 + (completed ? 8 : 0) + Math.min(10, Math.floor(watchTimeMs / 1000)) - current.reports * 20;
    if (score > (current.viralStage + 1) * 25) deltas.viralStage = sql`${postsTable.viralStage} + 1`;
    const [post] = await db.update(postsTable).set(deltas).where(eq(postsTable.id, id)).returning();
    return res.json({ ...post, distributionCountries: audienceFor(post.viralStage) });
  } catch (err) { return safe(res, err); }
});

socialRouter.delete("/posts/:id", requireUser, async (req, res) => {
  const userId = (req as any).userId as number;
  try { await db.delete(postsTable).where(and(eq(postsTable.id, Number(req.params.id)), eq(postsTable.authorId, userId))); return res.json({ success: true }); }
  catch (err) { return safe(res, err); }
});

socialRouter.get("/stories", requireUser, async (_req, res) => {
  try { return res.json(await db.select().from(storiesTable).where(gt(storiesTable.expiresAt, new Date())).orderBy(desc(storiesTable.createdAt)).limit(50)); }
  catch (err) { return safe(res, err); }
});

socialRouter.post("/stories", requireUser, async (req, res) => {
  const userId = (req as any).userId as number;
  const { mediaUrl, mediaType = "image", caption = "" } = req.body as any;
  if (!mediaUrl) return res.status(400).json({ error: "Story media is required" });
  try { const [story] = await db.insert(storiesTable).values({ authorId: userId, mediaUrl, mediaType, caption, expiresAt: new Date(Date.now() + 86400000) }).returning(); return res.status(201).json(story); }
  catch (err) { return safe(res, err); }
});

socialRouter.get("/notifications", requireUser, async (req, res) => {
  try { return res.json(await db.select().from(notificationsTable).where(eq(notificationsTable.userId, (req as any).userId)).orderBy(desc(notificationsTable.createdAt)).limit(50)); }
  catch (err) { return safe(res, err); }
});

socialRouter.post("/follow/:userId", requireUser, async (req, res) => {
  const followerId = (req as any).userId as number; const followingId = Number(req.params.userId);
  if (followerId === followingId) return res.status(400).json({ error: "Cannot follow yourself" });
  try { await db.insert(relationshipsTable).values({ followerId, followingId }).onConflictDoNothing(); return res.json({ success: true }); }
  catch (err) { return safe(res, err); }
});

export default socialRouter;
