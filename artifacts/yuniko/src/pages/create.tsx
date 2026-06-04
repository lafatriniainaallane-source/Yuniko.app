import { useState } from "react";
import { useLocation } from "wouter";
import { X, Image, Video, MapPin, Hash, Globe, Layers, ChevronRight } from "lucide-react";
import { t } from "@/lib/i18n";
import { currentUser } from "@/data/mockData";
import BottomNav from "@/components/BottomNav";

export default function Create() {
  const [, setLocation] = useLocation();
  const [caption, setCaption] = useState("");
  const [isWorldFeed, setIsWorldFeed] = useState(true);
  const [isAddToStory, setIsAddToStory] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [location, setLocationText] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [posted, setPosted] = useState(false);

  const handlePost = () => {
    if (!caption && !selectedMedia) return;
    setPosted(true);
    setTimeout(() => {
      setLocation("/");
    }, 1200);
  };

  if (posted) {
    return (
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)", boxShadow: "0 0 40px rgba(124,58,237,0.5)" }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-white font-semibold text-lg">Posted!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background pb-24">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-4 flex items-center justify-between"
        style={{
          background: "rgba(13,11,20,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
        data-testid="create-header"
      >
        <button onClick={() => setLocation("/")} data-testid="btn-close-create">
          <X size={22} className="text-white/80" />
        </button>
        <h1 className="text-base font-semibold text-white">{t("newPost")}</h1>
        <button
          onClick={handlePost}
          className="px-4 py-1.5 rounded-full text-sm font-semibold text-white"
          style={{
            background: caption || selectedMedia ? "linear-gradient(135deg, #7C3AED, #4F46E5)" : "rgba(255,255,255,0.1)",
            opacity: caption || selectedMedia ? 1 : 0.5,
          }}
          data-testid="btn-post"
        >
          {t("postButton")}
        </button>
      </header>

      <div className="px-4 py-4">
        {/* User row + caption */}
        <div className="flex gap-3 mb-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.displayName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <p className="text-white font-semibold text-sm mb-1">{currentUser.username}</p>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t("addCaption")}
              className="w-full bg-transparent text-white/85 text-sm resize-none outline-none placeholder:text-white/30"
              rows={4}
              data-testid="input-caption"
            />
          </div>
        </div>

        {/* Selected media preview */}
        {selectedMedia && (
          <div className="relative mb-4 rounded-xl overflow-hidden">
            <img src={selectedMedia} alt="Selected" className="w-full rounded-xl" />
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        )}

        {/* Media options */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setSelectedMedia(`https://picsum.photos/seed/${Date.now()}/600/400`)}
            className="flex-1 py-4 rounded-2xl flex flex-col items-center gap-2"
            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}
            data-testid="btn-add-photo"
          >
            <Image size={24} className="text-purple-400" />
            <span className="text-white/70 text-xs font-medium">{t("photo")}</span>
          </button>
          <button
            className="flex-1 py-4 rounded-2xl flex flex-col items-center gap-2"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}
            data-testid="btn-add-video"
          >
            <Video size={24} className="text-indigo-400" />
            <span className="text-white/70 text-xs font-medium">{t("video")}</span>
          </button>
        </div>

        {/* Options */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Location */}
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <MapPin size={18} className="text-pink-400 flex-shrink-0" />
            <input
              value={location}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder={t("location")}
              className="flex-1 bg-transparent text-white/80 text-sm outline-none placeholder:text-white/30"
              data-testid="input-location"
            />
          </div>

          {/* Hashtags */}
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <Hash size={18} className="text-blue-400 flex-shrink-0" />
            <input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder={t("hashtags")}
              className="flex-1 bg-transparent text-white/80 text-sm outline-none placeholder:text-white/30"
              data-testid="input-hashtags"
            />
          </div>

          {/* World Feed toggle */}
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <Globe size={18} className="text-purple-400 flex-shrink-0" />
            <span className="flex-1 text-white/80 text-sm">{t("worldFeed")}</span>
            <Toggle value={isWorldFeed} onChange={setIsWorldFeed} />
          </div>

          {/* Add to Story toggle */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Layers size={18} className="text-indigo-400 flex-shrink-0" />
            <span className="flex-1 text-white/80 text-sm">{t("addToStory")}</span>
            <Toggle value={isAddToStory} onChange={setIsAddToStory} />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-10 h-6 rounded-full transition-all duration-200"
      style={{ background: value ? "linear-gradient(135deg, #7C3AED, #4F46E5)" : "rgba(255,255,255,0.15)" }}
      data-testid="toggle-btn"
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
        style={{ left: value ? "calc(100% - 22px)" : "2px" }}
      />
    </button>
  );
}
