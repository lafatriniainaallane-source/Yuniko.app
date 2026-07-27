import { useState, useEffect, useRef } from "react";
import {
  Switch,
  Route,
  Router as WouterRouter,
  useLocation,
  Redirect,
} from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  useClerk,
  useUser,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";

import SplashScreen from "@/components/SplashScreen";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import CompleteProfile from "@/pages/complete-profile";
import Notifications from "@/pages/notifications";
import Create from "@/pages/create";
import Messages from "@/pages/messages";
import Profile from "@/pages/profile";
import Search from "@/pages/search";
import Chat from "@/pages/chat";
import Story from "@/pages/story";
import AddFriends from "@/pages/add-friends";
import VideoCall from "@/pages/video-call";
import VoiceCall from "@/pages/voice-call";
import PostDetail from "@/pages/post-detail";
import EditProfile from "@/pages/edit-profile";
import Followers from "@/pages/followers";
import Saved from "@/pages/saved";
import Hashtag from "@/pages/hashtag";
import BlockedUsers from "@/pages/blocked-users";
import CallHistory from "@/pages/call-history";
import MessageRequests from "@/pages/message-requests";
import ArchivedChats from "@/pages/archived-chats";
import Help from "@/pages/help";
import Feedback from "@/pages/feedback";
import DeleteAccount from "@/pages/account-delete";
import SettingsPrivacy from "@/pages/settings-privacy";
import SettingsSecurity from "@/pages/settings-security";
import SettingsStorage from "@/pages/settings-storage";
import SettingsAbout from "@/pages/settings-about";
import Settings from "@/pages/settings";
import Live from "@/pages/live";
import NotFound from "@/pages/not-found";

// ─── Clerk setup (copy verbatim per skill instructions) ──────────────────────

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// Empty in dev (intentional), auto-set in prod. Never gate on NODE_ENV.
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

// ─── Yuniko-branded Clerk appearance ─────────────────────────────────────────

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsVariant: "blockButton" as const,
    socialButtonsPlacement: "top" as const,
  },
  variables: {
    colorPrimary: "#FF006E",
    colorForeground: "#FFFFFF",
    colorMutedForeground: "rgba(255,255,255,0.45)",
    colorDanger: "#FF4455",
    colorBackground: "#0D0A18",
    colorInput: "rgba(255,255,255,0.07)",
    colorInputForeground: "#FFFFFF",
    colorNeutral: "rgba(255,61,154,0.25)",
    fontFamily: "inherit",
    borderRadius: "0.875rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "w-[390px] max-w-full overflow-hidden rounded-2xl shadow-[0_0_60px_rgba(255,0,110,0.12)] border border-[rgba(255,61,154,0.18)] bg-[#0D0A18]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-bold text-xl",
    headerSubtitle: "text-white/45",
    socialButtonsBlockButtonText: "text-white/80 font-medium",
    formFieldLabel: "text-white/60 text-sm",
    footerActionLink: "text-[#FF3D9A] font-semibold hover:text-[#FF006E]",
    footerActionText: "text-white/35",
    dividerText: "text-white/25",
    identityPreviewEditButton: "text-[#FF3D9A]",
    formFieldSuccessText: "text-emerald-400",
    alertText: "text-white/80",
    logoBox: "mx-auto",
    logoImage: "rounded-xl",
    socialButtonsBlockButton:
      "border border-white/10 hover:border-[rgba(255,61,154,0.4)] transition-colors",
    formButtonPrimary:
      "bg-gradient-to-r from-[#FF006E] to-[#8B00FF] hover:opacity-90 transition-opacity font-semibold",
    formFieldInput:
      "border-white/10 focus:border-[rgba(255,0,110,0.5)] bg-white/[0.06] text-white",
    footerAction: "border-t border-white/[0.06]",
    dividerLine: "bg-white/10",
    alert: "border border-white/10 bg-white/[0.04]",
    otpCodeFieldInput:
      "border-white/20 bg-white/[0.06] text-white text-center font-bold",
    formFieldRow: "mb-0.5",
    main: "px-6 py-4",
  },
};

// ─── Auth page wrappers ───────────────────────────────────────────────────────

function SignInPage() {
  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

// ─── Route protection ─────────────────────────────────────────────────────────

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

// After sign-in, redirect users who haven't set a username yet
function UsernameGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [location] = useLocation();

  const authPaths = ["/sign-in", "/sign-up", "/complete-profile"];
  const onAuthPath = authPaths.some((p) => location.startsWith(p));

  if (!isLoaded) return null;

  if (user && !user.publicMetadata?.username && !onAuthPath) {
    return <Redirect to="/complete-profile" />;
  }

  return <>{children}</>;
}

// ─── Cache invalidation on user change ───────────────────────────────────────

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: false } },
});

function AnimatedRoutes() {
  const [location] = useLocation();

  return (
    <UsernameGuard>
      <div key={location} className="page-enter w-full min-h-screen">
        <Switch>
          {/* ── Clerk auth routes — paths copied verbatim (/*? required) ── */}
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />

          {/* Legacy redirect */}
          <Route path="/login">{() => <Redirect to="/sign-in" />}</Route>

          {/* Username setup — shown once after sign-up */}
          <Route path="/complete-profile">
            {() => (
              <Protected>
                <CompleteProfile />
              </Protected>
            )}
          </Route>

          {/* Home: landing for guests, feed for signed-in users */}
          <Route path="/">
            {() => (
              <>
                <Show when="signed-in">
                  <Home />
                </Show>
                <Show when="signed-out">
                  <Landing />
                </Show>
              </>
            )}
          </Route>

          {/* ── Protected main tabs ── */}
          <Route path="/notifications">
            {() => (
              <Protected>
                <Notifications />
              </Protected>
            )}
          </Route>
          <Route path="/create">
            {() => (
              <Protected>
                <Create />
              </Protected>
            )}
          </Route>
          <Route path="/messages">
            {() => (
              <Protected>
                <Messages />
              </Protected>
            )}
          </Route>
          <Route path="/profile">
            {() => (
              <Protected>
                <Profile />
              </Protected>
            )}
          </Route>

          {/* ── Settings ── */}
          <Route path="/settings">
            {() => (
              <Protected>
                <Settings />
              </Protected>
            )}
          </Route>
          <Route path="/settings/privacy">
            {() => (
              <Protected>
                <SettingsPrivacy />
              </Protected>
            )}
          </Route>
          <Route path="/settings/security">
            {() => (
              <Protected>
                <SettingsSecurity />
              </Protected>
            )}
          </Route>
          <Route path="/settings/storage">
            {() => (
              <Protected>
                <SettingsStorage />
              </Protected>
            )}
          </Route>
          <Route path="/settings/about">
            {() => (
              <Protected>
                <SettingsAbout />
              </Protected>
            )}
          </Route>
          <Route path="/settings/account">
            {() => (
              <Protected>
                <EditProfile />
              </Protected>
            )}
          </Route>

          {/* ── Profile pages ── */}
          <Route path="/profile/edit">
            {() => (
              <Protected>
                <EditProfile />
              </Protected>
            )}
          </Route>
          <Route path="/user/:userId">
            {(params) => <Profile userId={params.userId} />}
          </Route>
          <Route path="/followers/:userId">
            {() => <Followers mode="followers" />}
          </Route>
          <Route path="/following/:userId">
            {() => <Followers mode="following" />}
          </Route>

          {/* ── Content ── */}
          <Route path="/post/:postId" component={PostDetail} />
          <Route path="/saved">
            {() => (
              <Protected>
                <Saved />
              </Protected>
            )}
          </Route>
          <Route path="/hashtag/:tag" component={Hashtag} />
          <Route path="/search" component={Search} />

          {/* ── Social ── */}
          <Route path="/add-friends">
            {() => (
              <Protected>
                <AddFriends />
              </Protected>
            )}
          </Route>

          {/* ── Messaging ── */}
          <Route path="/chat/:userId">
            {() => (
              <Protected>
                <Chat />
              </Protected>
            )}
          </Route>
          <Route path="/message-requests">
            {() => (
              <Protected>
                <MessageRequests />
              </Protected>
            )}
          </Route>
          <Route path="/archived-chats">
            {() => (
              <Protected>
                <ArchivedChats />
              </Protected>
            )}
          </Route>
          <Route path="/call-history">
            {() => (
              <Protected>
                <CallHistory />
              </Protected>
            )}
          </Route>

          {/* ── Calls ── */}
          <Route path="/video-call">
            {() => (
              <Protected>
                <VideoCall />
              </Protected>
            )}
          </Route>
          <Route path="/video-call/:userId">
            {() => (
              <Protected>
                <VideoCall />
              </Protected>
            )}
          </Route>
          <Route path="/voice-call">
            {() => (
              <Protected>
                <VoiceCall />
              </Protected>
            )}
          </Route>
          <Route path="/voice-call/:userId">
            {() => (
              <Protected>
                <VoiceCall />
              </Protected>
            )}
          </Route>

          {/* ── Stories & Live ── */}
          <Route path="/story/:userId" component={Story} />
          <Route path="/live">
            {() => (
              <Protected>
                <Live />
              </Protected>
            )}
          </Route>

          {/* ── Account ── */}
          <Route path="/blocked-users">
            {() => (
              <Protected>
                <BlockedUsers />
              </Protected>
            )}
          </Route>
          <Route path="/account/delete">
            {() => (
              <Protected>
                <DeleteAccount />
              </Protected>
            )}
          </Route>
          <Route path="/account/verify">
            {() => (
              <Protected>
                <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background flex items-center justify-center px-6">
                  <div className="text-center">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                      style={{
                        background: "linear-gradient(135deg, #FF006E, #8B00FF)",
                        boxShadow: "0 0 40px rgba(255,0,110,0.4)",
                      }}
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h2 className="text-white font-bold text-xl mb-2">
                      Verify Account
                    </h2>
                    <p className="text-white/50 text-sm mb-6 leading-relaxed">
                      Verification helps your followers know your account is
                      authentic.
                    </p>
                    <button
                      className="px-6 py-3 rounded-2xl text-sm font-bold text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #FF006E, #8B00FF)",
                        boxShadow: "0 4px 16px rgba(255,0,110,0.4)",
                      }}
                    >
                      Request Verification
                    </button>
                  </div>
                </div>
              </Protected>
            )}
          </Route>

          {/* ── Support ── */}
          <Route path="/help" component={Help} />
          <Route path="/feedback" component={Feedback} />

          {/* ── Fallback ── */}
          <Route component={NotFound} />
        </Switch>
      </div>
    </UsernameGuard>
  );
}

function Router() {
  return (
    <div className="yuniko-root">
      <AnimatedRoutes />
    </div>
  );
}

// ─── App root ────────────────────────────────────────────────────────────────

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  const [splashDone, setSplashDone] = useState(false);

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your Yuniko account",
          },
        },
        signUp: {
          start: {
            title: "Join Yuniko",
            subtitle: "Create an account and start sharing",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <ThemeProvider>
            {!splashDone && (
              <SplashScreen onDone={() => setSplashDone(true)} />
            )}
            <Router />
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}
