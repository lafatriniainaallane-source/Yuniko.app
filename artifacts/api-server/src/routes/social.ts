import { Router } from "express";
import crypto from "node:crypto";
import { initialSeedCountries, nextDistribution, type EngagementMetrics } from "../services/viral-algorithm";

const router = Router();
const now = () => new Date().toISOString();
const users = new Map<string, any>();
const posts = new Map<string, any>();
const sessions = new Map<string, string>();

const seedUser = { id: "me", username: "yuniko_creator", displayName: "Yuniko Creator", avatarUrl: "", bio: "Building a worldwide creative community.", countryCode: "US", verified: true };
users.set(seedUser.id, seedUser);
posts.set("p1", { id: "p1", author: seedUser, caption: "Welcome to the World Feed — every creator starts globally.", media: [{ type: "photo", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80" }], hashtags: ["#Yuniko", "#WorldFeed"], counts: { views: 12450, likes: 1830, comments: 94, shares: 221, saves: 410 }, viewerState: { liked: false, saved: false }, createdAt: now(), distribution: { stage: "regional", countries: initialSeedCountries("US") } });

function issueSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  sessions.set(token, userId);
  return token;
}

router.get("/auth/username/:username", (req, res) => {
  const wanted = req.params.username.toLowerCase();
  res.json({ username: req.params.username, available: ![...users.values()].some((u) => u.username.toLowerCase() === wanted) });
});

router.post("/auth/signup", (req, res): void => {
  const { email, phoneNumber, username, displayName } = req.body ?? {};
  if (!username || !displayName || (!email && !phoneNumber)) { res.status(400).json({ error: "email_or_phone_required" }); return; }
  const id = crypto.randomUUID();
  const user = { id, email, phoneNumber, username, displayName, avatarUrl: "", bio: "", countryCode: req.header("cf-ipcountry") ?? "US", verified: false };
  users.set(id, user);
  res.status(201).json({ user, token: issueSession(id) });
});

router.post("/auth/login", (req, res) => {
  const { identifier } = req.body ?? {};
  const user = [...users.values()].find((u) => u.email === identifier || u.phoneNumber === identifier || u.username === identifier) ?? seedUser;
  res.json({ user, token: issueSession(user.id) });
});

router.post("/auth/social", (req, res) => res.json({ user: seedUser, token: issueSession(seedUser.id), provider: req.body?.provider ?? "unknown" }));
router.post("/auth/forgot-password", (_req, res) => res.json({ ok: true }));
router.get("/me", (_req, res) => res.json(seedUser));
router.patch("/me", (req, res) => { Object.assign(seedUser, req.body, { updatedAt: now() }); users.set(seedUser.id, seedUser); res.json(seedUser); });

router.get("/feed", (req, res) => {
  const cursor = String(req.query.cursor ?? "0");
  res.json({ items: [...posts.values()], nextCursor: String(Number(cursor) + posts.size), generatedAt: now() });
});

router.post("/posts", (req, res) => {
  const id = crypto.randomUUID();
  const post = { id, author: seedUser, caption: req.body?.caption ?? "", media: req.body?.media ?? [], hashtags: req.body?.hashtags ?? [], counts: { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 }, viewerState: { liked: false, saved: false }, createdAt: now(), distribution: { stage: "seed", countries: initialSeedCountries(seedUser.countryCode) } };
  posts.set(id, post);
  res.status(201).json(post);
});

router.post("/posts/:id/events", (req, res): void => {
  const metrics: EngagementMetrics = req.body?.metrics ?? { impressions: 1, watchTimeMs: 0, averageDurationMs: 1, completions: 0, likes: 0, comments: 0, shares: 0, saves: 0, follows: 0, reports: 0 };
  const post = posts.get(req.params.id);
  if (!post) { res.status(404).json({ error: "post_not_found" }); return; }
  post.distribution = nextDistribution(metrics, post.distribution.stage, post.author.countryCode);
  res.json({ distribution: post.distribution });
});

router.post("/posts/:id/:action", (req, res): void => {
  const post = posts.get(req.params.id);
  if (!post) { res.status(404).json({ error: "post_not_found" }); return; }
  if (!["like", "save", "share", "report"].includes(req.params.action)) { res.status(400).json({ error: "invalid_action" }); return; }
  const key = req.params.action === "like" ? "likes" : req.params.action === "save" ? "saves" : req.params.action === "share" ? "shares" : "reports";
  post.counts[key] = (post.counts[key] ?? 0) + 1;
  res.json(post);
});

router.get("/stories", (_req, res) => res.json({ items: [], expiresAfterHours: 24 }));
router.get("/notifications", (_req, res) => res.json({ items: [] }));
router.get("/messages", (_req, res) => res.json({ conversations: [] }));
router.post("/messages/:conversationId", (req, res) => res.status(201).json({ id: crypto.randomUUID(), ...req.body, createdAt: now(), readAt: null }));
router.get("/settings", (_req, res) => res.json({ darkMode: true, language: "en", twoFactor: false, activeDevices: [] }));

export default router;
