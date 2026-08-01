import type { AuthUser } from "./auth-context";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

type ApiOptions = RequestInit & { token?: string | null };

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data as T;
}

export interface MediaItem { type: "image" | "video"; url: string; alt?: string }
export interface FeedPost {
  id: number;
  authorId: number;
  caption: string;
  media: MediaItem[];
  visibility: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reports: number;
  viralStage: number;
  distributionCountries: string[];
  createdAt: string;
}
export interface StoryItem { id: number; authorId: number; mediaUrl: string; mediaType: string; caption: string; expiresAt: string; createdAt: string }

export const api = {
  feed: (token: string) => apiFetch<FeedPost[]>("/feed", { token }),
  createPost: (token: string, payload: { caption: string; media: MediaItem[]; visibility: string }) =>
    apiFetch<FeedPost>("/posts", { method: "POST", token, body: JSON.stringify(payload) }),
  createStory: (token: string, payload: { mediaUrl: string; mediaType?: string; caption?: string }) =>
    apiFetch<StoryItem>("/stories", { method: "POST", token, body: JSON.stringify(payload) }),
  stories: (token: string) => apiFetch<StoryItem[]>("/stories", { token }),
  engage: (token: string, postId: number, payload: { action?: string; watchTimeMs?: number; completed?: boolean }) =>
    apiFetch<FeedPost>(`/posts/${postId}/engagement`, { method: "POST", token, body: JSON.stringify(payload) }),
  updateMe: (token: string) => apiFetch<AuthUser>("/auth/me", { token }),
};
