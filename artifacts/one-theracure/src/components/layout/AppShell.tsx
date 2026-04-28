import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import DemoWalkthrough from "@/components/demo/DemoWalkthrough";
import StartVisitDialog from "@/components/encounter/StartVisitDialog";
import { useAuth, type CurrentUser } from "@/contexts/SecurityContext";
import { DEMO_MODE } from "@/lib/demoMode";

const ACCESSIBILITY_KEY = "app_accessibility";

/**
 * AppShell — single chrome (header + demo walkthrough + start-visit dialog)
 * around the routed content. Replaces the old tab-based Index.tsx so that
 * URL is the single source of truth for "what page am I on".
 *
 * Identity is read from `useAuth()` (SecurityContext), NOT directly from
 * Clerk. SecurityContext is the only file that knows whether we're in
 * demo or real auth mode — everything else just consumes the unified
 * shape. That's what lets the demo branch run without ClerkProvider in
 * the tree.
 */
const AppShell = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [showStartVisit, setShowStartVisit] = useState(false);
  const [accessible, setAccessible] = useState(() => {
    try { return localStorage.getItem(ACCESSIBILITY_KEY) === "true"; } catch { return false; }
  });

  // Profile-edit overrides (display only — backing identity is owned by
  // SecurityContext / Clerk and not mutated here).
  const [overrides, setOverrides] = useState<Partial<CurrentUser>>({});
  const displayUser: CurrentUser = { ...currentUser, ...overrides };

  useEffect(() => {
    try { localStorage.setItem(ACCESSIBILITY_KEY, String(accessible)); } catch {
      /* localStorage unavailable (private mode etc.) — accessibility resets per session */
    }
  }, [accessible]);

  const handleProfileUpdate = (u: CurrentUser) => setOverrides(u);

  const handleSignOut = async () => {
    if (DEMO_MODE) {
      toast.info("Demo mode — sign-out is disabled. Refresh to reset the demo.");
      return;
    }
    const next = await signOut();
    if (next) navigate(next);
  };

  // Command palette + demo walkthrough drive navigation by dispatching
  // `command:navigate` with a route path string. `command:start-visit` opens
  // the patient picker → create encounter dialog.
  useEffect(() => {
    const onNavigate = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === "string" && detail.length > 0) navigate(detail);
    };
    const onStartVisit = () => setShowStartVisit(true);
    window.addEventListener("command:navigate", onNavigate as EventListener);
    window.addEventListener("command:start-visit", onStartVisit);
    return () => {
      window.removeEventListener("command:navigate", onNavigate as EventListener);
      window.removeEventListener("command:start-visit", onStartVisit);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.05),transparent)]" />
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10">
        <Header
          currentUser={displayUser}
          onProfileUpdate={handleProfileUpdate}
          accessible={accessible}
          onAccessibilityToggle={setAccessible}
          onStartDemo={() => setShowWalkthrough(true)}
          onStartVisit={() => setShowStartVisit(true)}
          onSignOut={handleSignOut}
        />

        <main
          id="main-content"
          className={`container max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 ${accessible ? "app-accessible" : ""}`}
        >
          <Outlet />
        </main>

        <DemoWalkthrough
          isOpen={showWalkthrough}
          onClose={() => setShowWalkthrough(false)}
          // The walkthrough used to call setActiveTab; now it dispatches
          // command:navigate via path so it works with the router.
          onNavigate={(target) => {
            const map: Record<string, string> = {
              dashboard: "/today",
              frontdesk: "/frontdesk",
              "cds-scribe": "/today",
              settings: "/settings",
            };
            navigate(map[target] ?? "/today");
          }}
        />

        <StartVisitDialog
          open={showStartVisit}
          onOpenChange={setShowStartVisit}
        />
      </div>
    </div>
  );
};

export default AppShell;
