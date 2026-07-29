import { useState } from "react";
import { useLocation } from "wouter";
import { useSignIn, useClerk } from "@clerk/react";
import { AtSign, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import logoSrc from "@assets/file_000000003524724399ff06d3685a22e6_1780640550687.png";

const GRADIENT = "linear-gradient(135deg, #FF006E 0%, #8B00FF 100%)";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignInPage() {
  const [, setLocation] = useLocation();
  const { signIn, fetchStatus } = useSignIn();
  const { setActive } = useClerk();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (fetchStatus === "fetching" || loading || !name || !password) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Identifiants incorrects");
        setLoading(false);
        return;
      }

      await signIn!.create({ strategy: "ticket", ticket: data.signInToken });
      await setActive({ session: signIn!.createdSessionId });
      setLocation("/");
    } catch {
      setError("Une erreur s'est produite. Réessayez.");
      setLoading(false);
    }
  };

  const canSubmit = name.length >= 3 && password.length >= 8;

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background flex flex-col">
      {/* Blob de fond */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255,0,110,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col flex-1 px-6 pt-20 pb-12">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div
            className="w-20 h-20 rounded-[22px] flex items-center justify-center mb-5"
            style={{
              background: GRADIENT,
              boxShadow: "0 0 50px rgba(255,0,110,0.4), 0 8px 30px rgba(0,0,0,0.4)",
            }}
          >
            <img src={logoSrc} alt="Yuniko" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Bon retour !</h1>
          <p className="text-white/40 text-sm">Connectez-vous à votre compte Yuniko</p>
        </div>

        {/* Champ nom */}
        <div className="mb-3">
          <div
            className="flex items-center gap-2 h-14 rounded-2xl px-4 transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,61,154,0.2)",
            }}
          >
            <AtSign size={16} className="text-white/30 shrink-0" />
            <input
              type="text"
              placeholder="Votre nom"
              value={name}
              onChange={(e) =>
                setName(e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 20))
              }
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="flex-1 bg-transparent text-white placeholder:text-white/25 text-[15px] font-medium outline-none"
            />
          </div>
        </div>

        {/* Mot de passe */}
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
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="flex-1 bg-transparent text-white placeholder:text-white/25 text-[15px] outline-none"
            />
            <button
              onClick={() => setShowPwd(!showPwd)}
              className="text-white/30 hover:text-white/60 transition-colors"
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <p className="text-red-400 text-sm text-center mb-4 font-medium">{error}</p>
        )}

        {/* Bouton */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="w-full h-14 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 mb-6 transition-all"
          style={{
            background: canSubmit && !loading ? GRADIENT : "rgba(255,255,255,0.07)",
            boxShadow: canSubmit && !loading ? "0 4px 20px rgba(255,0,110,0.35)" : "none",
            color: canSubmit && !loading ? "white" : "rgba(255,255,255,0.25)",
            cursor: canSubmit && !loading ? "pointer" : "not-allowed",
          }}
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Connexion…</>
          ) : (
            "Se connecter"
          )}
        </button>

        {/* Lien inscription */}
        <p className="text-center text-white/35 text-sm">
          Pas encore de compte ?{" "}
          <button
            onClick={() => setLocation("/sign-up")}
            className="font-semibold"
            style={{ color: "#FF3D9A" }}
          >
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
}
