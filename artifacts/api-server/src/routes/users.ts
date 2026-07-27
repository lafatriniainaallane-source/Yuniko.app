import { Router, type IRouter } from "express";
import { getAuth, clerkClient } from "@clerk/express";

const router: IRouter = Router();

/** Validate username format: 3–20 chars, lowercase letters/numbers/underscores */
function isValidUsername(username: string): boolean {
  return /^[a-z0-9_]{3,20}$/.test(username);
}

/**
 * GET /users/check-username?username=xyz
 * Returns { available: boolean, message: string }
 */
router.get("/check-username", async (req, res) => {
  const username = ((req.query.username as string) || "").toLowerCase().trim();

  if (!username) {
    return res.status(400).json({ available: false, message: "Username is required" });
  }

  if (!isValidUsername(username)) {
    return res.status(400).json({
      available: false,
      message: "3–20 characters: lowercase letters, numbers, and underscores only",
    });
  }

  // Reserved usernames
  const reserved = new Set([
    "admin", "yuniko", "support", "help", "root", "api", "www", "mail",
    "me", "home", "explore", "login", "signup", "settings", "about",
  ]);
  if (reserved.has(username)) {
    return res.json({ available: false, message: "This username is reserved" });
  }

  try {
    // Check Clerk user metadata for an existing claim
    const { data: users } = await clerkClient.users.getUserList({ limit: 500 });
    const taken = users.some(
      (u) => (u.publicMetadata as Record<string, unknown>)?.username === username,
    );
    return res.json({
      available: !taken,
      message: taken ? "Username is already taken" : "Username is available!",
    });
  } catch {
    return res.status(500).json({ available: false, message: "Error checking username availability" });
  }
});

/**
 * POST /users/set-username
 * Body: { username: string }
 * Requires authentication. Sets publicMetadata.username on the Clerk user.
 */
router.post("/set-username", async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const username = ((req.body.username as string) || "").toLowerCase().trim();

  if (!isValidUsername(username)) {
    return res.status(400).json({
      error: "3–20 characters: lowercase letters, numbers, and underscores only",
    });
  }

  const reserved = new Set([
    "admin", "yuniko", "support", "help", "root", "api", "www", "mail",
    "me", "home", "explore", "login", "signup", "settings", "about",
  ]);
  if (reserved.has(username)) {
    return res.status(400).json({ error: "This username is reserved" });
  }

  try {
    const { data: users } = await clerkClient.users.getUserList({ limit: 500 });
    const taken = users.some(
      (u) =>
        u.id !== auth.userId &&
        (u.publicMetadata as Record<string, unknown>)?.username === username,
    );

    if (taken) {
      return res.status(409).json({ error: "Username already taken" });
    }

    await clerkClient.users.updateUserMetadata(auth.userId, {
      publicMetadata: { username },
    });

    return res.json({ success: true, username });
  } catch {
    return res.status(500).json({ error: "Failed to set username" });
  }
});

export default router;
