export interface ApiUser { id: string; username: string; displayName: string; avatarUrl?: string; bio?: string; verified?: boolean; countryCode?: string; isFollowing?: boolean }
export interface ApiPost { id: string; author: ApiUser; caption: string; isSponsored?: boolean; sponsorCta?: string; media: { type: "photo" | "video" | "image"; url: string; thumbnailUrl?: string }[]; hashtags: string[]; counts: { views: number; likes: number; comments: number; shares: number; saves: number }; viewerState: { liked: boolean; saved: boolean }; createdAt: string; distribution?: { stage: string; countries: string[] } }

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("yuniko.session");
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}), ...init?.headers } });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
export const api = {
  login: (identifier: string, password: string) => request<{ user: ApiUser; token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }) }),
  signup: (payload: { email?: string; phoneNumber?: string; username: string; displayName: string; password: string }) => request<{ user: ApiUser; token: string }>("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  social: (provider: "google" | "apple") => request<{ user: ApiUser; token: string }>("/auth/social", { method: "POST", body: JSON.stringify({ provider }) }),
  usernameAvailable: (username: string) => request<{ available: boolean }>(`/auth/username/${encodeURIComponent(username)}`),
  forgotPassword: (identifier: string) => request<{ ok: true }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ identifier }) }),
  feed: (cursor?: string) => request<{ items: ApiPost[]; nextCursor: string }>(`/feed${cursor ? `?cursor=${cursor}` : ""}`),
  postAction: (postId: string, action: "like" | "save" | "share" | "report") => request<ApiPost>(`/posts/${postId}/${action}`, { method: "POST" }),
  trackPost: (postId: string, metrics: unknown) => request(`/posts/${postId}/events`, { method: "POST", body: JSON.stringify({ metrics }) }),
  stories: () => request<{ items: unknown[] }>("/stories"),
};
export function persistSession(token: string) { localStorage.setItem("yuniko.session", token); }
