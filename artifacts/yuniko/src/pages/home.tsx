import { useState } from "react";
import { useLocation } from "wouter";
import { Search, UserPlus, Globe, ChevronDown, MoreHorizontal, Bookmark, Share2, Flag, EyeOff } from "lucide-react";
import { stories, posts } from "@/data/mockData";
import StoryAvatar from "@/components/StoryAvatar";
import PostCard from "@/components/PostCard";
import BottomNav from "@/components/BottomNav";
import { t } from "@/lib/i18n";

export default function Home() {
  const [, setLocation] = useLocation();
  const [optionsPostId, setOptionsPostId] = useState<string | null>(null);
  const [worldFeedOpen, setWorldFeedOpen] = useState(false);

  return (
    <div className="relative w-full max-w-[430px] mx-auto min-h-screen bg-background">
      {/* Fixed Header */}
      <header
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 px-4 py-3 flex items-center justify-between"
        style={{
          background: "rgba(13,11,20,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(139,92,246,0.1)",
        }}
        data-testid="home-header"
      >
        {/* Yuniko Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          data-testid="logo-yuniko"
        >
          <span
            className="text-2xl font-black tracking-tight"
            style={{
              background: "linear-gradient(90deg, #A78BFA 0%, #818CF8 50%, #60A5FA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Yuniko
          </span>
        </button>

        {/* World Feed Button */}
        <button
          onClick={() => setWorldFeedOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(139,92,246,0.35)",
            boxShadow: "0 0 12px rgba(139,92,246,0.15)",
          }}
          data-testid="btn-world-feed"
        >
          <Globe size={14} className="text-purple-400" />
          <span className="text-white/90 text-sm font-medium">{t("worldFeed")}</span>
          <ChevronDown size={12} className="text-white/60" />
        </button>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/search")} data-testid="btn-search">
            <Search size={22} className="text-white/80" strokeWidth={1.8} />
          </button>
          <button onClick={() => setLocation("/add-friends")} data-testid="btn-add-friends">
            <UserPlus size={22} className="text-white/80" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* World Feed dropdown */}
      {worldFeedOpen && (
        <div
          className="fixed top-16 left-1/2 -translate-x-1/2 w-48 rounded-xl z-50 overflow-hidden"
          style={{
            background: "rgba(20,17,35,0.98)",
            border: "1px solid rgba(139,92,246,0.3)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {["World Feed", "Friends Feed", "Following"].map((item) => (
            <button
              key={item}
              onClick={() => setWorldFeedOpen(false)}
              className="w-full px-4 py-3 text-left text-white/85 text-sm hover:bg-purple-500/15 flex items-center gap-2"
            >
              <Globe size={14} className="text-purple-400" />
              {item}
            </button>
          ))}
        </div>
      )}
      {worldFeedOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setWorldFeedOpen(false)} />
      )}

      {/* Main feed content */}
      <div className="pt-14 pb-20">
        {/* Stories section */}
        <div
          className="pt-3 pb-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="flex items-center gap-4 overflow-x-auto px-4 no-scrollbar"
            style={{ WebkitOverflowScrolling: "touch" }}
            data-testid="stories-row"
          >
            {/* Your Story first */}
            <StoryAvatar userId="me" isOwn={true} />
            {/* Other stories */}
            {stories.map((story) => (
              <StoryAvatar
                key={story.id}
                userId={story.userId}
                viewed={story.viewed}
              />
            ))}
          </div>
        </div>

        {/* Posts feed */}
        <div data-testid="posts-feed">
          {posts.map((post) => (
            <div key={post.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <PostCard
                post={post}
                onOptions={() => setOptionsPostId(post.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <BottomNav />

      {/* Post options sheet */}
      {optionsPostId && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60"
            onClick={() => setOptionsPostId(null)}
          />
          <div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 rounded-t-2xl overflow-hidden"
            style={{
              background: "rgba(18,15,30,0.98)",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-4" />
            {[
              { icon: <Bookmark size={18} />, label: t("savePost") },
              { icon: <Share2 size={18} />, label: t("sharePost") },
              { icon: <EyeOff size={18} />, label: t("hide") },
              { icon: <Flag size={18} className="text-red-400" />, label: <span className="text-red-400">{t("report")}</span> },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => setOptionsPostId(null)}
                className="w-full flex items-center gap-3 px-5 py-4 text-white/85 text-sm font-medium"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button
              onClick={() => setOptionsPostId(null)}
              className="w-full py-4 text-white/50 text-sm font-medium"
            >
              {t("cancel")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
