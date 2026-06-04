import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Send, BadgeCheck, MoreHorizontal, Trash2, Flag } from "lucide-react";
import { posts, getUserById, formatCount } from "@/data/mockData";
import { t } from "@/lib/i18n";
import BottomNav from "@/components/BottomNav";

export default function PostDetail() {
  const [, setLocation] = useLocation();
  const params = useParams<{ postId: string }>();
  const postId = params?.postId ?? "";
  const post = posts.find((p) => p.id === postId) ?? posts[0];
  const user = getUserById(post.userId);

  const [liked, setLiked] = useState(post.isLiked);
  const [saved, setSaved] = useState(post.isSaved);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentText, setCommentText] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const mockComments = [
    { id: "c1", userId: "u1", text: "Absolutely stunning! 😍", timestamp: "2h", likes: 45 },
    { id: "c2", userId: "u3", text: "Where is this place? I need to go!", timestamp: "3h", likes: 23 },
    { id: "c3", userId: "u2", text: "The lighting in this shot is incredible 🎨", timestamp: "5h", likes: 12 },
    { id: "c4", userId: "u5", text: "This made my day ❤️", timestamp: "6h", likes: 8 },
    { id: "c5", userId: "u4", text: "Goals 🌊✨", timestamp: "8h", likes: 34 },
  ];

  if (!user) return null;

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background pb-20">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-4 flex items-center gap-3"
        style={{
          background: "rgba(13,11,20,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
        data-testid="post-detail-header"
      >
        <button onClick={() => setLocation("/")} data-testid="btn-back-post">
          <ArrowLeft size={22} className="text-white/80" />
        </button>
        <h1 className="text-base font-semibold text-white flex-1">Post</h1>
        <button onClick={() => setShowOptions(true)} data-testid="btn-post-detail-options">
          <MoreHorizontal size={22} className="text-white/80" />
        </button>
      </header>

      {/* User row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => setLocation(`/user/${user.id}`)}>
          <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-full object-cover" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <button onClick={() => setLocation(`/user/${user.id}`)}>
              <span className="text-white font-semibold text-sm">{user.displayName}</span>
            </button>
            {user.verified && <BadgeCheck size={14} className="text-blue-400 fill-blue-400" />}
          </div>
          <p className="text-white/50 text-xs">@{user.username} · {post.timestamp} {t("ago")}</p>
        </div>
        <button
          className="px-4 py-1.5 rounded-full text-sm font-semibold text-white"
          style={{
            background: user.isFollowing ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #7C3AED, #4F46E5)",
            border: user.isFollowing ? "1px solid rgba(255,255,255,0.15)" : "none",
          }}
          data-testid="btn-follow-post-detail"
        >
          {user.isFollowing ? t("following") : t("follow")}
        </button>
      </div>

      {/* Post image */}
      <div className="w-full">
        <img src={post.imageUrl} alt={post.caption} className="w-full object-cover" style={{ maxHeight: 500 }} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3">
        <button
          onClick={() => { setLiked((p) => !p); setLikeCount((c) => liked ? c - 1 : c + 1); }}
          className="flex items-center gap-1.5"
          data-testid="btn-like-detail"
        >
          <Heart size={24} className={liked ? "text-red-500 fill-red-500" : "text-white/80"} strokeWidth={1.8} />
          <span className="text-white/80 text-sm">{formatCount(likeCount)}</span>
        </button>
        <button className="flex items-center gap-1.5" data-testid="btn-comment-detail">
          <MessageCircle size={24} className="text-white/80" strokeWidth={1.8} />
          <span className="text-white/80 text-sm">{formatCount(post.comments)}</span>
        </button>
        <button className="flex items-center gap-1.5" data-testid="btn-share-detail">
          <Share2 size={24} className="text-white/80" strokeWidth={1.8} />
          <span className="text-white/80 text-sm">{formatCount(post.shares)}</span>
        </button>
        <div className="flex-1" />
        <button onClick={() => setSaved((p) => !p)} data-testid="btn-save-detail">
          <Bookmark size={24} className={saved ? "text-yellow-400 fill-yellow-400" : "text-white/80"} strokeWidth={1.8} />
        </button>
      </div>

      {/* Caption */}
      <div className="px-4 pb-3">
        <p className="text-white text-sm leading-snug">
          <span className="font-semibold mr-1">{user.displayName}</span>
          {post.caption}
        </p>
        <p className="text-purple-400 text-sm mt-1">{post.hashtags.join(" ")}</p>
      </div>

      {/* Comments */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="px-4 py-3 text-white/50 text-xs font-semibold uppercase tracking-wider">
          {formatCount(post.comments)} {t("comments")}
        </p>
        {mockComments.map((comment) => {
          const cUser = getUserById(comment.userId);
          if (!cUser) return null;
          return (
            <div key={comment.id} className="flex gap-3 px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <button onClick={() => setLocation(`/user/${cUser.id}`)}>
                <img src={cUser.avatar} alt={cUser.displayName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              </button>
              <div className="flex-1">
                <div className="flex items-baseline gap-1.5">
                  <button onClick={() => setLocation(`/user/${cUser.id}`)}>
                    <span className="text-white font-semibold text-sm">{cUser.displayName}</span>
                  </button>
                  <span className="text-white/75 text-sm">{comment.text}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-white/35 text-xs">{comment.timestamp} {t("ago")}</span>
                  <button className="text-white/35 text-xs">{comment.likes} {t("like")}</button>
                  <button className="text-white/35 text-xs">{t("replyTo")}</button>
                </div>
              </div>
              <button data-testid={`comment-like-${comment.id}`}>
                <Heart size={14} className="text-white/40" strokeWidth={1.8} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Comment input */}
      <div
        className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 py-3"
        style={{
          background: "rgba(13,11,20,0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
        data-testid="comment-input-bar"
      >
        <div className="flex items-center gap-2.5">
          <img src="https://picsum.photos/seed/me/200/200" alt="me" className="w-8 h-8 rounded-full object-cover" />
          <div
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t("writeComment")}
              className="flex-1 bg-transparent text-white/80 text-sm outline-none placeholder:text-white/30"
              data-testid="input-comment"
            />
          </div>
          {commentText && (
            <button
              onClick={() => setCommentText("")}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }}
              data-testid="btn-send-comment"
            >
              <Send size={13} className="text-white" />
            </button>
          )}
        </div>
      </div>

      <BottomNav />

      {/* Post options */}
      {showOptions && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setShowOptions(false)} />
          <div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 rounded-t-2xl overflow-hidden"
            style={{ background: "rgba(18,15,30,0.98)", border: "1px solid rgba(139,92,246,0.2)" }}
          >
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-4" />
            {[
              { icon: <Bookmark size={18} />, label: t("savePost") },
              { icon: <Share2 size={18} />, label: t("sharePost") },
              { icon: <Trash2 size={18} className="text-red-400" />, label: <span className="text-red-400">{t("delete")}</span> },
              { icon: <Flag size={18} className="text-red-400" />, label: <span className="text-red-400">{t("report")}</span> },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => setShowOptions(false)}
                className="w-full flex items-center gap-3 px-5 py-4 text-white/85 text-sm font-medium"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                {item.icon} {item.label}
              </button>
            ))}
            <button onClick={() => setShowOptions(false)} className="w-full py-4 text-white/50 text-sm font-medium">{t("cancel")}</button>
          </div>
        </>
      )}
    </div>
  );
}
