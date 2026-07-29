import { Router, type IRouter } from "express";
import { clerkClient } from "@clerk/express";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

/** Génère un email interne invisible à l'utilisateur */
function internalEmail(username: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${username}_${suffix}@ynk.internal`;
}

/**
 * POST /auth/signup
 * Body: { name, password, country, age, photoBase64? }
 * Crée le compte Clerk (pas de vérification email), stocke le hash bcrypt,
 * renvoie un sign-in token prêt à l'emploi.
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, password, country, age, photoBase64 } = req.body as {
      name: string;
      password: string;
      country: string;
      age: number;
      photoBase64?: string;
    };

    const username = (name ?? "")
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20);

    if (username.length < 3) {
      return res.status(400).json({ error: "Nom trop court (min. 3 caractères)" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Mot de passe trop court (min. 8 caractères)" });
    }
    if (!country) {
      return res.status(400).json({ error: "Pays requis" });
    }
    const ageNum = parseInt(String(age));
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      return res.status(400).json({ error: "Âge invalide (13–120)" });
    }

    // Vérifier unicité du nom
    const { data: existing } = await clerkClient.users.getUserList({ limit: 500 });
    const taken = existing.some(
      (u) => (u.publicMetadata as Record<string, unknown>)?.username === username,
    );
    if (taken) {
      return res.status(409).json({ error: "Ce nom est déjà pris" });
    }

    // Hacher le mot de passe (stocké côté serveur uniquement)
    const hash = await bcrypt.hash(password, 10);
    const email = internalEmail(username);

    // Créer l'utilisateur Clerk
    const user = await clerkClient.users.createUser({
      emailAddress: [email],
      firstName: name.trim(),
      publicMetadata: {
        username,
        displayName: name.trim(),
        country,
        age: ageNum,
      },
      privateMetadata: { hash },
      skipPasswordChecks: true,
    });

    // Upload de la photo de profil (facultatif)
    if (photoBase64) {
      try {
        const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const blob = new Blob([buffer], { type: "image/jpeg" });
        await clerkClient.users.updateUserProfileImage(user.id, { file: blob });
      } catch (photoErr) {
        // Non bloquant
        console.error("Photo upload failed:", photoErr);
      }
    }

    // Créer un sign-in token (valable 5 min)
    const tokenData = await clerkClient.signInTokens.createSignInToken({
      userId: user.id,
      expiresInSeconds: 300,
    });

    return res.json({ signInToken: tokenData.token });
  } catch (err: unknown) {
    console.error("Signup error:", err);
    const clerkErr = (err as { errors?: { longMessage?: string }[] })?.errors?.[0];
    return res.status(500).json({
      error: clerkErr?.longMessage ?? "Erreur lors de la création du compte",
    });
  }
});

/**
 * POST /auth/signin
 * Body: { name, password }
 * Vérifie le hash bcrypt côté serveur, renvoie un sign-in token.
 */
router.post("/signin", async (req, res) => {
  try {
    const { name, password } = req.body as { name: string; password: string };
    const username = (name ?? "").toLowerCase().replace(/\s+/g, "_").trim();

    if (!username || !password) {
      return res.status(400).json({ error: "Nom et mot de passe requis" });
    }

    const { data: users } = await clerkClient.users.getUserList({ limit: 500 });
    const found = users.find(
      (u) => (u.publicMetadata as Record<string, unknown>)?.username === username,
    );

    if (!found) {
      return res.status(401).json({ error: "Nom ou mot de passe incorrect" });
    }

    const hash = (found.privateMetadata as Record<string, unknown>)?.hash as string | undefined;
    if (!hash) {
      return res.status(401).json({ error: "Nom ou mot de passe incorrect" });
    }

    const valid = await bcrypt.compare(password, hash);
    if (!valid) {
      return res.status(401).json({ error: "Nom ou mot de passe incorrect" });
    }

    const tokenData = await clerkClient.signInTokens.createSignInToken({
      userId: found.id,
      expiresInSeconds: 300,
    });

    return res.json({ signInToken: tokenData.token });
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({ error: "Erreur de connexion" });
  }
});

export default router;
