import { useState } from "react";
import { useLocation } from "wouter";
import { Heart, MessageCircle, Share2, Bookmark, BadgeCheck, MoreHorizontal } from "lucide-react";
import { Post, getUserById, formatCount } from "@/data/mockData";
import { t } from "@/lib/i18n";

interface PostCardProps {
  post: Post;
  onOptions?: () => void;
}

export default function PostCard({ post, onOptions }: PostCardProps) {
  const [, setLocation] = useLocation();
  const user = getUserById(post.userId);
  const [liked, setLiked] = useState(post.isLiked);
  const [saved, setSaved] = useState(post.isSaved);
  const [likeCount, setLikeCount] = useState(post.likes);

  if (!user) return null;

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <div
      className="relative w-full"
      style={{ height: "calc(100dvh - 64px)", minHeight: 500 }}
      data-testid={`post-card-${post.id}`}
    >
      {/* Background image */}
      <img
        src={post.imageUrl}
        alt={post.caption}
        className="absolute inset-0 w-full h-full object-cover"
        onClick={() => setLocation(`/post/${post.id}`)}
      />

      {/* Gradient overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 20%)",
          pointerEvents: "none",
        }}
      />

      {/* More options button (top right of post) */}
      {onOptions && (
        <button
          className="absolute top-4 right-4 p-2 rounded-full"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={onOptions}
          data-testid="post-options-btn"
        >
          <MoreHorizontal size={18} className="text-white" />
        </button>
      )}

      {/* Right action buttons */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
        <ActionBtn
          icon={
            <Heart
              size={26}
              className={liked ? "text-red-500 fill-red-500" : "text-white"}
              strokeWidth={1.8}
            />
          }
          label={formatCount(likeCount)}
          onClick={handleLike}
          testId="btn-like"
        />
        <ActionBtn
          icon={<MessageCircle size={26} className="text-white" strokeWidth={1.8} />}
          label={formatCount(post.comments)}
          onClick={() => setLocation(`/post/${post.id}`)}
          testId="btn-comment"
        />
        <ActionBtn
          icon={<Share2 size={26} className="text-white" strokeWidth={1.8} />}
          label={formatCount(post.shares)}
          onClick={() => {}}
          testId="btn-share"
        />
        <ActionBtn
          icon={
            <Bookmark
              size={26}
              className={saved ? "text-yellow-400 fill-yellow-400" : "text-white"}
              strokeWidth={1.8}
            />
          }
          label={formatCount(post.saves)}
          onClick={() => setSaved((prev) => !prev)}
          testId="btn-save"
        />
      </div>

      {/* Bottom user info */}
      <div className="absolute bottom-4 left-3 right-20">
        <div className="flex items-center gap-2.5 mb-2">
          <button
            onClick={() => setLocation(`/user/${user.id}`)}
            className="flex-shrink-0"
            data-testid={`post-avatar-${user.id}`}
          >
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-10 h-10 rounded-full object-cover"
              style={{
                border: "2px solid transparent",
                backgroundClip: "padding-box",
                boxShadow: "0 0 0 2px rgba(139,92,246,0.7)",
              }}
            />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLocation(`/user/${user.id}`)}
                className="font-semibold text-white text-sm"
                data-testid={`post-username-${user.id}`}
              >
                {user.displayName}
              </button>
              {user.verified && (
                <BadgeCheck size={14} className="text-blue-400 fill-blue-400" />
              )}
              {post.location && (
                <span className="text-white/60 text-xs ml-1">
                  {user.flag} {post.location}
                </span>
              )}
              {!post.location && (
                <span className="text-white/60 text-xs ml-1">{user.flag}</span>
              )}
            </div>
          </div>
          {!user.isFollowing && (
            <button
              className="px-4 py-1.5 rounded-full text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                boxShadow: "0 2px 12px rgba(124,58,237,0.4)",
              }}
              data-testid="btn-follow-post"
            >
              {t("follow")}
            </button>
          )}
        </div>
        <p className="text-white text-sm font-medium leading-snug line-clamp-2">
          {post.caption}
        </p>
        <p className="text-purple-400 text-sm mt-0.5">
          {post.hashtags.join(" ")}
        </p>
      </div>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1"
      data-testid={testId}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
      >
        {icon}
      </div>
      <span className="text-white text-xs font-medium">{label}</span>
    </button>
  );
}
