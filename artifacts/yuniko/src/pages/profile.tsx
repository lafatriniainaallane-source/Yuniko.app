import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Settings, Grid3X3, BookmarkIcon, BarChart2, BadgeCheck, Link2, MapPin, MoreHorizontal, UserPlus, MessageCircle, Phone, Video } from "lucide-react";
import { currentUser, users, getUserById, getPostsByUser } from "@/data/mockData";
import { t } from "@/lib/i18n";
import { formatCount } from "@/data/mockData";
import BottomNav from "@/components/BottomNav";

interface ProfilePageProps {
  userId?: string;
}

export default function Profile({ userId }: ProfilePageProps) {
  const [, setLocation] = useLocation();
  const params = useParams<{ userId: string }>();
  const targetId = userId || params?.userId || "me";
  const isOwn = targetId === "me" || targetId === currentUser.id;

  const user = isOwn ? currentUser : getUserById(targetId);
  const [following, setFollowing] = useState(user?.isFollowing ?? false);
  const [tab, setTab] = useState<"grid" | "saved" | "analytics">("grid");
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);

  if (!user) {
    return (
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background flex items-center justify-center">
        <p className="text-white/50">User not found</p>
      </div>
    );
  }

  const userPosts = getPostsByUser(user.id);

  const statItems = [
    { label: t("posts"), value: formatCount(user.posts) },
    { label: t("followers"), value: formatCount(user.followers), onClick: () => setLocation(`/followers/${user.id}`) },
    { label: t("following"), value: formatCount(user.following), onClick: () => setLocation(`/following/${user.id}`) },
  ];

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
        data-testid="profile-header"
      >
        {!isOwn ? (
          <button onClick={() => setLocation("/")} data-testid="btn-back-profile">
            <ArrowLeft size={22} className="text-white/80" />
          </button>
        ) : (
          <div className="w-6" />
        )}
        <span className="font-semibold text-white text-base">
          {user.username}
          {user.verified && (
            <BadgeCheck size={16} className="inline ml-1 text-blue-400 fill-blue-400" />
          )}
        </span>
        {isOwn ? (
          <button onClick={() => setLocation("/settings")} data-testid="btn-settings">
            <Settings size={22} className="text-white/80" strokeWidth={1.8} />
          </button>
        ) : (
          <button data-testid="btn-more-profile">
            <MoreHorizontal size={22} className="text-white/80" />
          </button>
        )}
      </header>

      {/* Cover photo */}
      <div className="relative h-32 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 overflow-hidden">
        <img
          src={user.coverPhoto}
          alt="Cover"
          className="w-full h-full object-cover opacity-70"
        />
        {isOwn && (
          <button
            onClick={() => setLocation("/profile/edit")}
            className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg text-xs font-medium text-white/80"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            data-testid="btn-edit-cover"
          >
            {t("editCoverPhoto")}
          </button>
        )}
      </div>

      {/* Avatar + action buttons */}
      <div className="px-4 relative">
        <div className="flex items-end justify-between -mt-8 mb-3">
          <button
            onClick={() => setShowPhotoViewer(true)}
            className="relative"
            data-testid="btn-profile-photo"
          >
            <div
              className="w-[72px] h-[72px] rounded-full p-[2.5px]"
              style={{ background: "linear-gradient(135deg, #8B5CF6, #4F46E5)", boxShadow: "0 0 16px rgba(139,92,246,0.5)" }}
            >
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-full h-full rounded-full object-cover"
                style={{ border: "2.5px solid #0D0B14" }}
              />
            </div>
            {user.isOnline && (
              <div
                className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-400"
                style={{ border: "2px solid #0D0B14" }}
              />
            )}
          </button>

          {isOwn ? (
            <button
              onClick={() => setLocation("/profile/edit")}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
              data-testid="btn-edit-profile"
            >
              {t("editProfile")}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setFollowing((prev) => !prev)}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
                style={{
                  background: following ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #7C3AED, #4F46E5)",
                  border: following ? "1px solid rgba(255,255,255,0.15)" : "none",
                  boxShadow: following ? "none" : "0 2px 12px rgba(124,58,237,0.4)",
                }}
                data-testid="btn-follow-profile"
              >
                {following ? t("following") : t("follow")}
              </button>
              <button
                onClick={() => setLocation(`/chat/${user.id}`)}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                data-testid="btn-message-user"
              >
                <MessageCircle size={16} className="text-white/80" />
              </button>
              <button
                onClick={() => setLocation("/voice-call")}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                data-testid="btn-voice-call-user"
              >
                <Phone size={16} className="text-white/80" />
              </button>
            </div>
          )}
        </div>

        {/* Name & bio */}
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-0.5">
            <h2 className="font-bold text-white text-base">{user.displayName}</h2>
            {user.verified && <BadgeCheck size={15} className="text-blue-400 fill-blue-400" />}
          </div>
          <p className="text-white/50 text-sm mb-1">@{user.username}</p>
          {user.bio && <p className="text-white/80 text-sm leading-snug mb-2">{user.bio}</p>}
          <div className="flex items-center gap-1 text-white/50 text-sm">
            <MapPin size={13} />
            <span>{user.location}</span>
          </div>
        </div>

        {/* Stats */}
        <div
          className="flex rounded-2xl mb-4 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {statItems.map((stat, i) => (
            <button
              key={stat.label}
              onClick={stat.onClick}
              className="flex-1 py-3 flex flex-col items-center gap-0.5"
              style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none" }}
              data-testid={`stat-${stat.label.toLowerCase()}`}
            >
              <span className="text-white font-bold text-lg leading-tight">{stat.value}</span>
              <span className="text-white/45 text-xs">{stat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex px-4 mb-1"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        {[
          { id: "grid", icon: Grid3X3 },
          { id: "saved", icon: BookmarkIcon },
          ...(isOwn ? [{ id: "analytics", icon: BarChart2 }] : []),
        ].map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id as typeof tab)}
            className="flex-1 py-3 flex items-center justify-center"
            style={{ borderBottom: tab === tabItem.id ? "2px solid #8B5CF6" : "2px solid transparent" }}
            data-testid={`tab-${tabItem.id}`}
          >
            <tabItem.icon
              size={20}
              className={tab === tabItem.id ? "text-purple-400" : "text-white/40"}
              strokeWidth={1.8}
            />
          </button>
        ))}
      </div>

      {/* Post grid */}
      {tab === "grid" && (
        <div className="grid grid-cols-3 gap-0.5 px-0.5">
          {userPosts.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center py-16 gap-3">
              <Grid3X3 size={40} className="text-white/20" />
              <p className="text-white/40 text-sm">{t("noPosts")}</p>
            </div>
          ) : (
            userPosts.map((post) => (
              <button
                key={post.id}
                onClick={() => setLocation(`/post/${post.id}`)}
                className="aspect-square overflow-hidden"
                data-testid={`grid-post-${post.id}`}
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover"
                />
              </button>
            ))
          )}
          {/* Fill with sample posts if none */}
          {userPosts.length === 0 && Array.from({ length: 6 }).map((_, i) => (
            <button
              key={`sample-${i}`}
              onClick={() => setLocation(`/post/sample-${i}`)}
              className="aspect-square overflow-hidden"
            >
              <img
                src={`https://picsum.photos/seed/profile_${user.id}_${i}/200/200`}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {tab === "saved" && (
        <div className="grid grid-cols-3 gap-0.5 px-0.5">
          {[0,1,2,3,4,5].map((i) => (
            <button key={i} onClick={() => setLocation("/saved")} className="aspect-square overflow-hidden">
              <img src={`https://picsum.photos/seed/saved_${i}/200/200`} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {tab === "analytics" && (
        <div className="px-4 py-4 flex flex-col gap-4">
          {[
            { label: "Profile Views", value: "2,840", change: "+12%" },
            { label: "Post Impressions", value: "45,200", change: "+8%" },
            { label: "Reach", value: "18,600", change: "+23%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">{stat.label}</span>
                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
              </div>
              <p className="text-white font-bold text-2xl mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <BottomNav />

      {/* Photo viewer */}
      {showPhotoViewer && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setShowPhotoViewer(false)}
          >
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-72 h-72 rounded-full object-cover"
              style={{ boxShadow: "0 0 60px rgba(139,92,246,0.5)" }}
            />
            <button
              onClick={() => setShowPhotoViewer(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              data-testid="btn-close-photo-viewer"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
