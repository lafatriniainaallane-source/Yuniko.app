import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Edit, UserPlus, Archive, Phone } from "lucide-react";
import { conversations, getUserById } from "@/data/mockData";
import BottomNav from "@/components/BottomNav";
import { t } from "@/lib/i18n";

export default function Messages() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");

  const filtered = conversations.filter((c) => {
    const user = getUserById(c.userId);
    return user?.displayName.toLowerCase().includes(query.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(query.toLowerCase());
  });

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
        data-testid="messages-header"
      >
        <h1 className="text-lg font-bold text-white">{t("messages")}</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/message-requests")} data-testid="btn-message-requests">
            <UserPlus size={20} className="text-white/70" strokeWidth={1.8} />
          </button>
          <button onClick={() => setLocation("/archived-chats")} data-testid="btn-archived">
            <Archive size={20} className="text-white/70" strokeWidth={1.8} />
          </button>
          <button onClick={() => setLocation("/call-history")} data-testid="btn-call-history">
            <Phone size={20} className="text-white/70" strokeWidth={1.8} />
          </button>
          <button data-testid="btn-new-message">
            <Edit size={20} className="text-white/70" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 py-3">
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Search size={16} className="text-white/40 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchUsers")}
            className="flex-1 bg-transparent text-white/80 text-sm outline-none placeholder:text-white/30"
            data-testid="input-search-messages"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div data-testid="conversations-list">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-white/40 text-sm">{t("noMessages")}</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const user = getUserById(conv.userId);
            if (!user) return null;
            return (
              <button
                key={conv.id}
                onClick={() => setLocation(`/chat/${conv.userId}`)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                data-testid={`conversation-${conv.id}`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conv.isOnline && (
                    <div
                      className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-green-400"
                      style={{ border: "2px solid #0D0B14" }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-sm ${conv.unread > 0 ? "text-white" : "text-white/80"}`}>
                      {user.displayName}
                    </span>
                    <span className="text-white/40 text-xs flex-shrink-0 ml-2">{conv.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-sm truncate ${conv.unread > 0 ? "text-white/80 font-medium" : "text-white/40"}`}>
                      {conv.lastMessage}
                    </p>
                    {conv.unread > 0 && (
                      <span
                        className="ml-2 min-w-[20px] h-5 px-1 rounded-full bg-purple-500 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0"
                      >
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
