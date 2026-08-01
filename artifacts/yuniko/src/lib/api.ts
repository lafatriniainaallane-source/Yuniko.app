import type { AuthUser } from "@/lib/auth-context";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";
const TOKEN_KEY = "yuniko_token";

export interface FeedAuthor extends AuthUser {
  website?: string | null;
  isPrivate?: boolean;
  twoFactorEnabled?: boolean;
  lastSeenAt?: string | null;
  verified?: boolean;
}

export interface FeedPost {
  id: number;
  authorId: number;
  author: FeedAuthor;
  caption: string;
  media: Array<{ type: "image" | "video"; url: string; width?: number; height?: number; durationMs?: number }>;
  hashtags: string[];
  visibility: "public" | "followers" | "friends" | "private";
  viralScore: number;
  distributionTier: number;
  viewCount: number;
  createdAt: string;
  viewer: { liked: boolean; saved: boolean; shared: boolean; reported: boolean } | null;
}

export interface StoryItem {
  id: number;
  authorId: number;
  author: FeedAuthor;
  mediaUrl: string;
  mediaType: "image" | "video" | "voice";
  caption: string;
  expiresAt: string;
  createdAt: string;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const yunikoApi = {
  feed: (limit = 20) => request<FeedPost[]>(`/feed?limit=${limit}`),
  stories: () => request<StoryItem[]>("/stories"),
  engagePost: (postId: number, body: Partial<{ liked: boolean; saved: boolean; shared: boolean; reported: boolean; watchTimeMs: number; completed: boolean }>) =>
    request(`/posts/${postId}/engagement`, { method: "PATCH", body: JSON.stringify(body) }),
  follow: (userId: number) => request<{ following: boolean }>(`/follow/${userId}`, { method: "POST" }),
};
