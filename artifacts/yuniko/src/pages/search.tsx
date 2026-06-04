import { useState } from "react";
import { useLocation } from "wouter";
import { Search, TrendingUp, Hash, Users, X } from "lucide-react";
import { users, posts } from "@/data/mockData";
import { t } from "@/lib/i18n";
import { formatCount } from "@/data/mockData";
import BottomNav from "@/components/BottomNav";

const TRENDING_HASHTAGS = [
  { tag: "sunset", posts: 2400000 },
  { tag: "travel", posts: 18900000 },
  { tag: "art", posts: 9300000 },
  { tag: "photography", posts: 45000000 },
  { tag: "fashion", posts: 12000000 },
  { tag: "nature", posts: 34000000 },
  { tag: "food", posts: 67000000 },
  { tag: "music", posts: 28000000 },
];

type Tab = "forYou" | "people" | "hashtags";

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("forYou");

  const filteredUsers = query
    ? users.filter(
        (u) =>
          u.displayName.toLowerCase().includes(query.toLowerCase()) ||
          u.username.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredHashtags = query
    ? TRENDING_HASHTAGS.filter((h) => h.tag.toLowerCase().includes(query.toLowerCase()))
    : [];

  const tabs: { id: Tab; label: string }[] = [
    { id: "forYou", label: t("forYou") },
    { id: "people", label: t("people") },
    { id: "hashtags", label: t("hashtag") },
  ];

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background pb-20">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-3"
        style={{
          background: "rgba(13,11,20,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
        data-testid="search-header"
      >
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Search size={16} className="text-white/40 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchUsers")}
            className="flex-1 bg-transparent text-white/85 text-sm outline-none placeholder:text-white/30"
            autoFocus
            data-testid="input-search"
          />
          {query && (
            <button onClick={() => setQuery("")} data-testid="btn-clear-search">
              <X size={14} className="text-white/40" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex mt-3 gap-1">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: tab === tabItem.id ? "linear-gradient(135deg, #7C3AED, #4F46E5)" : "rgba(255,255,255,0.06)",
                color: tab === tabItem.id ? "white" : "rgba(255,255,255,0.5)",
              }}
              data-testid={`search-tab-${tabItem.id}`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>
      </header>

      {/* Search results */}
      {query ? (
        <div>
          {/* People results */}
          {(tab === "forYou" || tab === "people") && filteredUsers.length > 0 && (
            <div>
              <p className="px-4 pt-4 pb-2 text-white/50 text-xs font-semibold uppercase tracking-wider">{t("people")}</p>
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setLocation(`/user/${user.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  data-testid={`search-user-${user.id}`}
                >
                  <img src={user.avatar} alt={user.displayName} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{user.displayName}</p>
                    <p className="text-white/50 text-xs">@{user.username} · {formatCount(user.followers)} {t("followers")}</p>
                  </div>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold text-white"
                    style={{ background: user.isFollowing ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #7C3AED, #4F46E5)" }}
                  >
                    {user.isFollowing ? t("following") : t("follow")}
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* Hashtag results */}
          {(tab === "forYou" || tab === "hashtags") && filteredHashtags.length > 0 && (
            <div>
              <p className="px-4 pt-4 pb-2 text-white/50 text-xs font-semibold uppercase tracking-wider">{t("hashtag")}</p>
              {filteredHashtags.map((h) => (
                <button
                  key={h.tag}
                  onClick={() => setLocation(`/hashtag/${h.tag}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  data-testid={`search-hashtag-${h.tag}`}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.3))", border: "1px solid rgba(139,92,246,0.3)" }}
                  >
                    <Hash size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">#{h.tag}</p>
                    <p className="text-white/50 text-xs">{formatCount(h.posts)} posts</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {filteredUsers.length === 0 && filteredHashtags.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Search size={40} className="text-white/20" />
              <p className="text-white/40 text-sm">{t("noResults")}</p>
            </div>
          )}
        </div>
      ) : (
        /* Default discover content */
        <div>
          {/* Trending hashtags */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-purple-400" />
              <h2 className="text-white font-semibold text-sm">{t("trending")}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_HASHTAGS.map((h) => (
                <button
                  key={h.tag}
                  onClick={() => setLocation(`/hashtag/${h.tag}`)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", color: "#A78BFA" }}
                  data-testid={`trending-${h.tag}`}
                >
                  #{h.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Trending creators */}
          <div className="px-4 mt-4 mb-3">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-purple-400" />
              <h2 className="text-white font-semibold text-sm">Trending Creators</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {users.slice(0, 6).map((user) => (
                <button
                  key={user.id}
                  onClick={() => setLocation(`/user/${user.id}`)}
                  className="flex flex-col items-center gap-2 flex-shrink-0"
                  style={{ minWidth: 72 }}
                  data-testid={`trending-creator-${user.id}`}
                >
                  <div
                    className="w-16 h-16 rounded-full p-[2px]"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #4F46E5)" }}
                  >
                    <img src={user.avatar} alt={user.displayName} className="w-full h-full rounded-full object-cover" style={{ border: "2px solid #0D0B14" }} />
                  </div>
                  <span className="text-white/75 text-[11px] text-center truncate max-w-[64px]">{user.displayName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid discover */}
          <div className="px-0.5">
            <p className="px-4 py-2 text-white font-semibold text-sm">{t("discover")}</p>
            <div className="grid grid-cols-3 gap-0.5">
              {posts.map((post, i) => (
                <button
                  key={post.id}
                  onClick={() => setLocation(`/post/${post.id}`)}
                  className={`overflow-hidden ${i % 5 === 0 ? "col-span-2 row-span-2" : ""}`}
                  style={{ aspectRatio: i % 5 === 0 ? undefined : "1", height: i % 5 === 0 ? 200 : undefined }}
                  data-testid={`discover-post-${post.id}`}
                >
                  <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
