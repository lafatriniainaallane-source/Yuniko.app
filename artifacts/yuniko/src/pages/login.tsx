import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { t } from "@/lib/i18n";
import { api, persistSession } from "@/lib/api";
import logoSrc from "@assets/file_000000003524724399ff06d3685a22e6_1780640550687.png";

const GRADIENT = "linear-gradient(135deg, #FF006E 0%, #8B00FF 100%)";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    const result = mode === "signin"
      ? await api.login(email, password)
      : await api.signup({ email: email.includes("@") ? email : undefined, phoneNumber: phoneNumber || undefined, username: username || name.toLowerCase().replace(/[^a-z0-9_]/g, "_"), displayName: name, password });
    persistSession(result.token);
    setLoading(false);
    setLocation("/");
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background flex flex-col">
      {/* Hero area */}
      <div
        className="relative flex flex-col items-center justify-end px-6 pt-16 pb-10"
        style={{ minHeight: 280 }}
      >
        {/* Background gradient blob */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(255,0,110,0.18) 0%, rgba(139,0,255,0.14) 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,0,110,0.2) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Logo */}
        <div className="relative flex flex-col items-center">
          <div
            className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-4"
            style={{
              background: GRADIENT,
              boxShadow: "0 0 50px rgba(255,0,110,0.45), 0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <img src={logoSrc} alt="Yuniko" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">
            <span
              style={{
                background: GRADIENT,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Yuniko
            </span>
          </h1>
          <p className="text-white/50 text-sm text-center">Share your world with everyone</p>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 px-6 pb-8">
        {/* Mode toggle */}
        <div
          className="flex p-1 rounded-2xl mb-6"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <button
            onClick={() => setMode("signin")}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: mode === "signin" ? GRADIENT : "transparent",
              color: mode === "signin" ? "white" : "rgba(255,255,255,0.5)",
              boxShadow: mode === "signin" ? "0 2px 10px rgba(255,0,110,0.3)" : "none",
            }}
          >
            {t("signIn")}
          </button>
          <button
            onClick={() => setMode("signup")}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: mode === "signup" ? GRADIENT : "transparent",
              color: mode === "signup" ? "white" : "rgba(255,255,255,0.5)",
              boxShadow: mode === "signup" ? "0 2px 10px rgba(255,0,110,0.3)" : "none",
            }}
          >
            {t("signUp")}
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3 mb-4">
          {mode === "signup" && (
            <>
            <div
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Sparkles size={18} className="text-white/40 flex-shrink-0" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("displayName")}
                className="flex-1 bg-transparent text-white/90 text-sm outline-none placeholder:text-white/30"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Sparkles size={18} className="text-white/40 flex-shrink-0" />
              <input value={username} onChange={(e) => setUsername(e.target.value)} onBlur={() => username && void api.usernameAvailable(username)} placeholder="Username" className="flex-1 bg-transparent text-white/90 text-sm outline-none placeholder:text-white/30" />
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Mail size={18} className="text-white/40 flex-shrink-0" />
              <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone number" className="flex-1 bg-transparent text-white/90 text-sm outline-none placeholder:text-white/30" />
            </div>
            </>
          )}

          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Mail size={18} className="text-white/40 flex-shrink-0" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailOrUsername")}
              className="flex-1 bg-transparent text-white/90 text-sm outline-none placeholder:text-white/30"
            />
          </div>

          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Lock size={18} className="text-white/40 flex-shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("password")}
              className="flex-1 bg-transparent text-white/90 text-sm outline-none placeholder:text-white/30"
            />
            <button onClick={() => setShowPassword((p) => !p)}>
              {showPassword ? (
                <EyeOff size={16} className="text-white/40" />
              ) : (
                <Eye size={16} className="text-white/40" />
              )}
            </button>
          </div>
        </div>

        {mode === "signin" && (
          <div className="text-right mb-5">
            <button className="text-sm" style={{ color: "#FF3D9A" }}>
              {t("forgotPassword")}
            </button>
          </div>
        )}

        {/* Primary CTA */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 mb-5"
          style={{
            background: GRADIENT,
            boxShadow: "0 4px 20px rgba(255,0,110,0.4)",
            opacity: loading ? 0.8 : 1,
          }}
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <>
              {mode === "signin" ? t("signIn") : t("signUp")}
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span className="text-white/30 text-xs">{t("orContinueWith")}</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Social logins */}
        <div className="flex gap-3 mb-8">
          {[
            {
              label: "Google",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              ),
            },
            {
              label: "Apple",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              ),
            },
          ].map(({ label, icon }) => (
            <button
              key={label}
              onClick={async () => { const result = await api.social(label.toLowerCase() as "google" | "apple"); persistSession(result.token); setLocation("/"); }}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {icon}
              <span className="text-white/80 text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
