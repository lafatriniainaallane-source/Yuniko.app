import { useLocation, Link } from "wouter";
import { Home, Bell, Plus, MessageCircle, User } from "lucide-react";
import { t } from "@/lib/i18n";

export default function BottomNav() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
      style={{
        background: "rgba(13,11,20,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(139,92,246,0.18)",
      }}
      data-testid="bottom-nav"
    >
      <div className="flex items-center justify-around h-16 px-2">
        <Link href="/">
          <button
            data-testid="nav-home"
            className="flex flex-col items-center gap-0.5 min-w-[44px] py-1 relative"
          >
            <Home
              size={22}
              className={isActive("/") ? "text-purple-400" : "text-white/50"}
              strokeWidth={isActive("/") ? 2.2 : 1.7}
            />
            <span
              className={`text-[10px] font-medium ${isActive("/") ? "text-purple-400" : "text-white/40"}`}
            >
              {t("home")}
            </span>
            {isActive("/") && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500" />
            )}
          </button>
        </Link>

        <Link href="/notifications">
          <button
            data-testid="nav-notifications"
            className="flex flex-col items-center gap-0.5 min-w-[44px] py-1 relative"
          >
            <Bell
              size={22}
              className={isActive("/notifications") ? "text-purple-400" : "text-white/50"}
              strokeWidth={isActive("/notifications") ? 2.2 : 1.7}
            />
            <span
              className={`text-[10px] font-medium ${isActive("/notifications") ? "text-purple-400" : "text-white/40"}`}
            >
              {t("notifications")}
            </span>
            {isActive("/notifications") && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500" />
            )}
          </button>
        </Link>

        <Link href="/create">
          <button
            data-testid="nav-create"
            className="flex items-center justify-center w-12 h-12 rounded-full relative"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
              boxShadow: "0 0 20px rgba(124,58,237,0.5)",
            }}
          >
            <Plus size={24} className="text-white" strokeWidth={2.5} />
          </button>
        </Link>

        <Link href="/messages">
          <button
            data-testid="nav-messages"
            className="flex flex-col items-center gap-0.5 min-w-[44px] py-1 relative"
          >
            <div className="relative">
              <MessageCircle
                size={22}
                className={isActive("/messages") ? "text-purple-400" : "text-white/50"}
                strokeWidth={isActive("/messages") ? 2.2 : 1.7}
              />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-white text-[9px] flex items-center justify-center font-bold">
                3
              </span>
            </div>
            <span
              className={`text-[10px] font-medium ${isActive("/messages") ? "text-purple-400" : "text-white/40"}`}
            >
              {t("messages")}
            </span>
            {isActive("/messages") && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500" />
            )}
          </button>
        </Link>

        <Link href="/profile">
          <button
            data-testid="nav-profile"
            className="flex flex-col items-center gap-0.5 min-w-[44px] py-1 relative"
          >
            <User
              size={22}
              className={isActive("/profile") ? "text-purple-400" : "text-white/50"}
              strokeWidth={isActive("/profile") ? 2.2 : 1.7}
            />
            <span
              className={`text-[10px] font-medium ${isActive("/profile") ? "text-purple-400" : "text-white/40"}`}
            >
              {t("profile")}
            </span>
            {isActive("/profile") && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500" />
            )}
          </button>
        </Link>
      </div>
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
