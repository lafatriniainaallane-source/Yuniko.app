import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { notifications, getUserById } from "@/data/mockData";
import { t } from "@/lib/i18n";
import BottomNav from "@/components/BottomNav";
import { Heart, MessageCircle, UserPlus, Reply, AtSign, Tag } from "lucide-react";

export default function Notifications() {
  const [, setLocation] = useLocation();
  const [items, setItems] = useState(notifications);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const unreadCount = items.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "like": return <Heart size={16} className="text-red-400 fill-red-400" />;
      case "comment": return <MessageCircle size={16} className="text-blue-400" />;
      case "follow": return <UserPlus size={16} className="text-purple-400" />;
      case "story_reply": return <Reply size={16} className="text-green-400" />;
      case "mention": return <AtSign size={16} className="text-yellow-400" />;
      case "tag": return <Tag size={16} className="text-orange-400" />;
      default: return <Heart size={16} className="text-purple-400" />;
    }
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background pb-20">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-4 flex items-center justify-between"
        style={{
          background: "rgba(13,11,20,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
        data-testid="notifications-header"
      >
        <h1 className="text-lg font-bold text-white">{t("notifications")}</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-purple-400 text-sm font-medium"
            data-testid="btn-mark-all-read"
          >
            Mark all read
          </button>
        )}
      </header>

      <div className="px-4 py-2" data-testid="notifications-list">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Heart size={48} className="text-white/20" />
            <p className="text-white/40 text-sm">{t("noNotifications")}</p>
          </div>
        ) : (
          items.map((notif) => {
            const user = getUserById(notif.userId);
            if (!user) return null;
            return (
              <button
                key={notif.id}
                onClick={() => {
                  if (notif.postId) setLocation(`/post/${notif.postId}`);
                  else setLocation(`/user/${notif.userId}`);
                }}
                className="w-full flex items-center gap-3 py-3 text-left"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                data-testid={`notif-${notif.id}`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-11 h-11 rounded-full object-cover"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/user/${user.id}`);
                    }}
                  />
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(13,11,20,0.9)", border: "1.5px solid rgba(255,255,255,0.1)" }}
                  >
                    {getIcon(notif.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm leading-snug">
                    <span className="font-semibold">{user.displayName}</span>{" "}
                    {notif.text}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">{notif.timestamp} {t("ago")}</p>
                </div>
                {!notif.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 flex-shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
