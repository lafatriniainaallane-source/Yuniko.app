import { useLocation } from "wouter";
import logoSrc from "@assets/file_000000003524724399ff06d3685a22e6_1780640550687.png";

const GRADIENT = "linear-gradient(135deg, #FF006E 0%, #8B00FF 100%)";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-end px-6 pt-20 pb-12">
        {/* Glow blobs */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,0,110,0.16) 0%, rgba(139,0,255,0.12) 55%, transparent 100%)",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,0,110,0.18) 0%, transparent 70%)",
            filter: "blur(48px)",
          }}
        />

        <div className="relative flex flex-col items-center">
          {/* Logo */}
          <div
            className="w-24 h-24 rounded-[28px] flex items-center justify-center mb-5"
            style={{
              background: GRADIENT,
              boxShadow:
                "0 0 60px rgba(255,0,110,0.45), 0 12px 40px rgba(0,0,0,0.5)",
            }}
          >
            <img
              src={logoSrc}
              alt="Yuniko"
              className="w-16 h-16 object-contain"
            />
          </div>

          {/* Wordmark */}
          <h1 className="text-4xl font-black tracking-tight mb-2">
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
          <p className="text-white/45 text-sm text-center leading-relaxed max-w-[260px]">
            Share moments, discover creators,
            <br />
            and connect with your world.
          </p>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="px-6 mb-10">
        {[
          { icon: "✨", text: "Share photos & videos with your followers" },
          { icon: "🔴", text: "Go live and broadcast to the world" },
          { icon: "💬", text: "DM friends and join conversations" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-3 mb-3">
            <span className="text-lg w-7 text-center">{icon}</span>
            <span className="text-white/50 text-sm">{text}</span>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="px-6 pb-12 flex flex-col gap-3 mt-auto">
        <button
          onClick={() => setLocation("/sign-up")}
          className="w-full py-4 rounded-2xl text-white font-bold text-[15px] tracking-wide"
          style={{
            background: GRADIENT,
            boxShadow: "0 4px 24px rgba(255,0,110,0.4)",
          }}
        >
          Create account
        </button>

        <button
          onClick={() => setLocation("/sign-in")}
          className="w-full py-4 rounded-2xl text-white/80 font-semibold text-[15px]"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          Log in
        </button>

        <p className="text-center text-white/25 text-xs mt-2 px-4 leading-relaxed">
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
