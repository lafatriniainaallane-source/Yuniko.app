import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useSignIn, useClerk } from "@clerk/react";
import {
  Eye, EyeOff, AtSign, Lock, ChevronLeft,
  Camera, Check, X, Loader2,
} from "lucide-react";
import logoSrc from "@assets/file_000000003524724399ff06d3685a22e6_1780640550687.png";

const GRADIENT = "linear-gradient(135deg, #FF006E 0%, #8B00FF 100%)";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const COUNTRIES = [
  "Afghanistan","Afrique du Sud","Albanie","Algérie","Allemagne","Angola","Arabie saoudite",
  "Argentine","Australie","Autriche","Azerbaïdjan","Belgique","Bénin","Brésil","Burkina Faso",
  "Cameroun","Canada","Chili","Chine","Colombie","Congo","Côte d'Ivoire","Danemark","Égypte",
  "Émirats arabes unis","Espagne","États-Unis","Éthiopie","France","Ghana","Grèce","Guatemala",
  "Guinée","Haïti","Hongrie","Inde","Indonésie","Irak","Iran","Italie","Jamaïque","Japon",
  "Jordanie","Kenya","Liban","Libye","Madagascar","Mali","Maroc","Mauritanie","Mexique",
  "Mozambique","Niger","Nigeria","Norvège","Pays-Bas","Pérou","Philippines","Pologne","Portugal",
  "Qatar","République démocratique du Congo","Roumanie","Royaume-Uni","Russie","Rwanda",
  "Sénégal","Sierra Leone","Somalie","Soudan","Suède","Suisse","Tanzanie","Tchad","Togo",
  "Tunisie","Turquie","Uganda","Ukraine","Venezuela","Vietnam","Yémen","Zimbabwe",
].sort((a, b) => a.localeCompare(b, "fr"));

/** Redimensionne et recadre une image en carré 400×400, renvoie base64 */
async function toBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const size = 400;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

type Step = 0 | 1 | 2;
type CheckState = "idle" | "checking" | "ok" | "taken" | "invalid";

function useDebounce<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const update = useCallback(
    (newVal: T) => {
      clearTimeout(t.current);
      t.current = setTimeout(() => setV(newVal), ms);
    },
    [ms],
  );
  return [v, update] as const;
}

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { signIn, fetchStatus } = useSignIn();
  const { setActive } = useClerk();

  // ── Step state ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>(0);
  const [animDir, setAnimDir] = useState<"fwd" | "back">("fwd");

  function goTo(s: Step, dir: "fwd" | "back" = "fwd") {
    setAnimDir(dir);
    setStep(s);
  }

  // ── Step 1: nom + mot de passe ──────────────────────────────────────────
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [nameCheck, setNameCheck] = useState<CheckState>("idle");
  const [nameMsg, setNameMsg] = useState("");

  const [debouncedName, setDebouncedName] = useDebounce("", 450) as [string, (v: string) => void];

  const handleNameChange = (raw: string) => {
    const val = raw.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 20);
    setName(val);
    setNameCheck("idle");
    setNameMsg("");
    setDebouncedName(val);
  };

  // Real-time check triggered by debounce update
  const lastChecked = useRef("");
  const checkName = useCallback(async (n: string) => {
    if (lastChecked.current === n) return;
    lastChecked.current = n;
    if (!n) { setNameCheck("idle"); setNameMsg(""); return; }
    if (n.length < 3) { setNameCheck("invalid"); setNameMsg("Min. 3 caractères"); return; }
    setNameCheck("checking");
    try {
      const r = await fetch(`${BASE}/api/users/check-username?username=${encodeURIComponent(n)}`);
      const d = await r.json();
      setNameCheck(d.available ? "ok" : "taken");
      setNameMsg(d.message ?? "");
    } catch {
      setNameCheck("idle");
    }
  }, []);

  // Trigger check when debounced name changes
  if (debouncedName && debouncedName !== lastChecked.current) {
    checkName(debouncedName);
  }

  // ── Step 2: pays + âge ──────────────────────────────────────────────────
  const [country, setCountry] = useState("");
  const [age, setAge] = useState("");

  // ── Step 3: photo ────────────────────────────────────────────────────────
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    const url = URL.createObjectURL(f);
    setPhotoPreview(url);
  };

  // ── Submission ───────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (skipPhoto = false) => {
    if (fetchStatus === "fetching" || submitting) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      let photoBase64: string | undefined;
      if (!skipPhoto && photoFile) {
        photoBase64 = await toBase64(photoFile);
      }

      const res = await fetch(`${BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, country, age: parseInt(age), photoBase64 }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "Erreur lors de la création du compte");
        setSubmitting(false);
        return;
      }

      // Connexion automatique via le token
      await signIn!.create({ strategy: "ticket", ticket: data.signInToken });
      await setActive({ session: signIn!.createdSessionId });
      setLocation("/");
    } catch (e: unknown) {
      console.error(e);
      setSubmitError("Une erreur s'est produite. Réessayez.");
      setSubmitting(false);
    }
  };

  // ── Validation helpers ───────────────────────────────────────────────────
  const step1Ok = nameCheck === "ok" && password.length >= 8;
  const step2Ok = country !== "" && age !== "" && parseInt(age) >= 13;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-6">
        {step > 0 ? (
          <button
            onClick={() => goTo((step - 1) as Step, "back")}
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <ChevronLeft size={20} className="text-white/70" />
          </button>
        ) : (
          <div className="w-9" />
        )}

        {/* Indicateur d'étapes */}
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? 28 : 8,
                background: i <= step ? GRADIENT : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setLocation("/sign-in")}
          className="text-xs font-medium text-white/40 hover:text-white/60 transition-colors"
        >
          Connexion
        </button>
      </div>

      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div
          className="w-16 h-16 rounded-[18px] flex items-center justify-center"
          style={{
            background: GRADIENT,
            boxShadow: "0 0 40px rgba(255,0,110,0.4)",
          }}
        >
          <img src={logoSrc} alt="Yuniko" className="w-11 h-11 object-contain" />
        </div>
      </div>

      {/* Contenu par étape */}
      <div
        key={step}
        className="flex-1 px-6 pb-10"
        style={{ animation: `stepIn 220ms cubic-bezier(0.25,0.46,0.45,0.94) both` }}
      >
        {step === 0 && (
          <>
            <h1 className="text-2xl font-black text-white mb-1">Créer un compte</h1>
            <p className="text-white/40 text-sm mb-8">Choisissez votre nom et mot de passe</p>

            {/* Champ nom */}
            <div className="mb-2">
              <div
                className="flex items-center gap-2 h-14 rounded-2xl px-4 transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${
                    nameCheck === "ok"
                      ? "rgba(52,211,153,0.5)"
                      : nameCheck === "taken" || nameCheck === "invalid"
                      ? "rgba(248,113,113,0.5)"
                      : "rgba(255,61,154,0.2)"
                  }`,
                }}
              >
                <AtSign size={16} className="text-white/30 shrink-0" />
                <input
                  type="text"
                  placeholder="votre_nom"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  maxLength={20}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent text-white placeholder:text-white/25 text-[15px] font-medium outline-none"
                />
                <div className="shrink-0 w-5 flex justify-center">
                  {nameCheck === "checking" && <Loader2 size={16} className="animate-spin text-white/30" />}
                  {nameCheck === "ok" && <Check size={16} className="text-emerald-400" />}
                  {(nameCheck === "taken" || nameCheck === "invalid") && <X size={16} className="text-red-400" />}
                </div>
              </div>
              <p className={`text-xs mt-1.5 px-1 h-4 ${nameCheck === "ok" ? "text-emerald-400" : "text-red-400"}`}>
                {nameMsg}
              </p>
            </div>

            {/* Champ mot de passe */}
            <div className="mb-8">
              <div
                className="flex items-center gap-2 h-14 rounded-2xl px-4"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,61,154,0.2)",
                }}
              >
                <Lock size={16} className="text-white/30 shrink-0" />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Mot de passe (min. 8 caractères)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder:text-white/25 text-[15px] outline-none"
                />
                <button onClick={() => setShowPwd(!showPwd)} className="text-white/30 hover:text-white/60 transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={() => goTo(1, "fwd")}
              disabled={!step1Ok}
              className="w-full h-14 rounded-2xl font-bold text-[15px] text-white transition-all"
              style={{
                background: step1Ok ? GRADIENT : "rgba(255,255,255,0.07)",
                boxShadow: step1Ok ? "0 4px 20px rgba(255,0,110,0.35)" : "none",
                color: step1Ok ? "white" : "rgba(255,255,255,0.25)",
                cursor: step1Ok ? "pointer" : "not-allowed",
              }}
            >
              Continuer
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-2xl font-black text-white mb-1">Votre profil</h1>
            <p className="text-white/40 text-sm mb-8">Quelques infos pour personnaliser votre expérience</p>

            {/* Pays */}
            <div className="mb-4">
              <label className="block text-white/50 text-xs font-medium mb-1.5 px-1">Pays</label>
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,61,154,0.2)",
                }}
              >
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-14 px-4 bg-transparent text-white text-[15px] outline-none appearance-none cursor-pointer"
                  style={{ color: country ? "white" : "rgba(255,255,255,0.25)" }}
                >
                  <option value="" disabled style={{ color: "#999", background: "#1a1025" }}>
                    Sélectionnez votre pays
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} style={{ color: "white", background: "#1a1025" }}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Âge */}
            <div className="mb-10">
              <label className="block text-white/50 text-xs font-medium mb-1.5 px-1">Âge</label>
              <div
                className="flex items-center h-14 rounded-2xl px-4"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,61,154,0.2)",
                }}
              >
                <input
                  type="number"
                  placeholder="Votre âge"
                  value={age}
                  min={13}
                  max={120}
                  onChange={(e) => setAge(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder:text-white/25 text-[15px] outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => goTo(2, "fwd")}
              disabled={!step2Ok}
              className="w-full h-14 rounded-2xl font-bold text-[15px] text-white transition-all"
              style={{
                background: step2Ok ? GRADIENT : "rgba(255,255,255,0.07)",
                boxShadow: step2Ok ? "0 4px 20px rgba(255,0,110,0.35)" : "none",
                color: step2Ok ? "white" : "rgba(255,255,255,0.25)",
                cursor: step2Ok ? "pointer" : "not-allowed",
              }}
            >
              Continuer
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-black text-white mb-1">Photo de profil</h1>
            <p className="text-white/40 text-sm mb-10">Mettez un visage sur votre compte</p>

            {/* Avatar upload */}
            <div className="flex justify-center mb-10">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative group"
              >
                <div
                  className="w-36 h-36 rounded-full overflow-hidden flex items-center justify-center transition-all"
                  style={{
                    background: photoPreview ? "transparent" : "rgba(255,255,255,0.07)",
                    border: `2px solid ${photoPreview ? "rgba(255,0,110,0.6)" : "rgba(255,61,154,0.2)"}`,
                    boxShadow: photoPreview ? "0 0 30px rgba(255,0,110,0.3)" : "none",
                  }}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={36} className="text-white/20" />
                  )}
                </div>
                {/* Overlay au survol */}
                <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.4)" }}>
                  <Camera size={28} className="text-white" />
                </div>
                {/* Badge modification */}
                {photoPreview && (
                  <div
                    className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: GRADIENT, boxShadow: "0 2px 8px rgba(255,0,110,0.4)" }}
                  >
                    <Camera size={15} className="text-white" />
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />
            </div>

            <p className="text-center text-white/30 text-xs mb-10">
              Appuyez pour choisir une photo depuis votre galerie
            </p>

            {submitError && (
              <p className="text-red-400 text-sm text-center mb-4">{submitError}</p>
            )}

            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="w-full h-14 rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-2 mb-4 transition-all"
              style={{
                background: GRADIENT,
                boxShadow: "0 4px 20px rgba(255,0,110,0.35)",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Création du compte…</>
              ) : (
                "Créer mon compte"
              )}
            </button>

            <button
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="w-full text-center text-white/35 text-sm py-2 hover:text-white/55 transition-colors"
            >
              Ignorer pour l'instant →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
