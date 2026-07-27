import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { AtSign, CheckCircle2, XCircle, Loader2, LogOut } from "lucide-react";
import logoSrc from "@assets/file_000000003524724399ff06d3685a22e6_1780640550687.png";

const GRADIENT = "linear-gradient(135deg, #FF006E 0%, #8B00FF 100%)";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type CheckState = "idle" | "checking" | "available" | "taken" | "invalid";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function CompleteProfile() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();

  const [username, setUsername] = useState("");
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [checkMessage, setCheckMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // If user already has a username, skip this page
  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.username) {
      setLocation("/");
    }
  }, [isLoaded, user, setLocation]);

  const debouncedUsername = useDebounce(username.trim().toLowerCase(), 450);

  // Real-time availability check
  const checkAvailability = useCallback(async (name: string) => {
    if (!name) {
      setCheckState("idle");
      setCheckMessage("");
      return;
    }

    if (!/^[a-z0-9_]{3,20}$/.test(name)) {
      setCheckState("invalid");
      setCheckMessage(
        name.length < 3
          ? "At least 3 characters required"
          : name.length > 20
          ? "Maximum 20 characters"
          : "Only lowercase letters, numbers, and underscores",
      );
      return;
    }

    setCheckState("checking");
    try {
      const res = await fetch(
        `${BASE}/api/users/check-username?username=${encodeURIComponent(name)}`,
      );
      const data = await res.json();
      setCheckState(data.available ? "available" : "taken");
      setCheckMessage(data.message ?? "");
    } catch {
      setCheckState("idle");
      setCheckMessage("");
    }
  }, []);

  useEffect(() => {
    checkAvailability(debouncedUsername);
  }, [debouncedUsername, checkAvailability]);

  const handleSubmit = async () => {
    if (checkState !== "available" || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${BASE}/api/users/set-username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: debouncedUsername }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to set username. Try again.");
        setSubmitting(false);
        return;
      }

      // Reload Clerk user so publicMetadata is fresh, then go home
      await user?.reload();
      setLocation("/");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const statusIcon = () => {
    if (checkState === "checking")
      return <Loader2 size={18} className="animate-spin text-white/40" />;
    if (checkState === "available")
      return <CheckCircle2 size={18} className="text-emerald-400" />;
    if (checkState === "taken" || checkState === "invalid")
      return <XCircle size={18} className="text-red-400" />;
    return null;
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background flex flex-col px-6">
      {/* Sign-out escape hatch */}
      <div className="flex justify-end pt-5">
        <button
          onClick={() => signOut({ redirectUrl: BASE || "/" })}
          className="flex items-center gap-1.5 text-white/30 text-xs hover:text-white/50 transition-colors"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center pt-8 pb-10">
        <div
          className="w-20 h-20 rounded-[22px] flex items-center justify-center mb-5"
          style={{
            background: GRADIENT,
            boxShadow: "0 0 50px rgba(255,0,110,0.4), 0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <img src={logoSrc} alt="Yuniko" className="w-14 h-14 object-contain" />
        </div>
        <h1 className="text-2xl font-black text-white mb-1">Choose your username</h1>
        <p className="text-white/40 text-sm text-center">
          This is how people find and tag you on Yuniko.
        </p>
      </div>

      {/* Username input */}
      <div className="mb-3">
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-0 h-14 transition-all"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${
              checkState === "available"
                ? "rgba(52,211,153,0.5)"
                : checkState === "taken" || checkState === "invalid"
                ? "rgba(248,113,113,0.5)"
                : "rgba(255,61,154,0.2)"
            }`,
          }}
        >
          <AtSign size={16} className="text-white/30 shrink-0" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="your_username"
            maxLength={20}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-white placeholder:text-white/25 text-[15px] font-medium outline-none"
          />
          <div className="shrink-0">{statusIcon()}</div>
        </div>
      </div>

      {/* Status message */}
      <div className="h-5 mb-6 px-1">
        {checkMessage && (
          <p
            className={`text-xs font-medium ${
              checkState === "available"
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {checkMessage}
          </p>
        )}
      </div>

      {/* Rules */}
      <div
        className="rounded-xl px-4 py-3 mb-8"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-white/35 text-xs leading-relaxed">
          Usernames are 3–20 characters and can only contain lowercase letters,
          numbers, and underscores. Choose wisely — your username is your identity on Yuniko.
        </p>
      </div>

      {/* Submit */}
      {error && (
        <p className="text-red-400 text-xs text-center mb-4">{error}</p>
      )}
      <button
        onClick={handleSubmit}
        disabled={checkState !== "available" || submitting}
        className="w-full h-14 rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all"
        style={{
          background:
            checkState === "available" && !submitting
              ? GRADIENT
              : "rgba(255,255,255,0.07)",
          boxShadow:
            checkState === "available" && !submitting
              ? "0 4px 24px rgba(255,0,110,0.35)"
              : "none",
          color:
            checkState === "available" && !submitting
              ? "white"
              : "rgba(255,255,255,0.3)",
          cursor:
            checkState === "available" && !submitting
              ? "pointer"
              : "not-allowed",
        }}
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Saving…
          </>
        ) : (
          "Continue"
        )}
      </button>
    </div>
  );
}
