import { useLocation } from "wouter";
import { getUserById } from "@/data/mockData";
import { Plus } from "lucide-react";
import { t } from "@/lib/i18n";

interface StoryAvatarProps {
  userId: string;
  isOwn?: boolean;
  viewed?: boolean;
  label?: string;
}

export default function StoryAvatar({ userId, isOwn = false, viewed = false, label }: StoryAvatarProps) {
  const [, setLocation] = useLocation();
  const user = isOwn ? null : getUserById(userId);

  const handleClick = () => {
    if (isOwn) {
      setLocation("/create");
    } else {
      setLocation(`/story/${userId}`);
    }
  };

  const displayName = isOwn ? t("yourStory") : (label ?? user?.displayName ?? "");
  const avatarUrl = isOwn ? "https://picsum.photos/seed/me/200/200" : (user?.avatar ?? "");

  return (
    <button
      data-testid={`story-avatar-${userId}`}
      onClick={handleClick}
      className="flex flex-col items-center gap-1.5 flex-shrink-0"
      style={{ minWidth: 72 }}
    >
      <div className="relative">
        <div
          className="w-[62px] h-[62px] rounded-full p-[2.5px]"
          style={
            isOwn
              ? { background: "rgba(139,92,246,0.25)", border: "2px dashed rgba(139,92,246,0.5)" }
              : viewed
              ? { background: "rgba(255,255,255,0.15)" }
              : {
                  background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #4F46E5 100%)",
                  boxShadow: "0 0 12px rgba(139,92,246,0.4)",
                }
          }
        >
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full rounded-full object-cover"
            style={{ border: "2px solid #0D0B14" }}
          />
        </div>
        {isOwn && (
          <div
            className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)", border: "2px solid #0D0B14" }}
          >
            <Plus size={10} className="text-white" strokeWidth={3} />
          </div>
        )}
        {!isOwn && user?.isOnline && (
          <div
            className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-green-400"
            style={{ border: "2px solid #0D0B14" }}
          />
        )}
      </div>
      <span className="text-white/75 text-[11px] font-medium leading-tight text-center truncate max-w-[68px]">
        {displayName}
      </span>
    </button>
  );
}
