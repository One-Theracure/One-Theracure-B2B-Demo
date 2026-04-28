import { Suspense, lazy, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import LoadingScreen from "@/components/common/LoadingScreen";
import CommandPalette from "@/components/CommandPalette";
import SkipNav from "@/components/common/SkipNav";

const AppShell = lazy(() => import("./components/layout/AppShell"));
const TodayPage = lazy(() => import("./pages/TodayPage"));
const PatientsPage = lazy(() => import("./pages/PatientsPage"));
const PatientDetailPage = lazy(() => import("./pages/PatientDetailPage"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const FrontDeskPage = lazy(() => import("./pages/FrontDeskPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const EncounterRoute = lazy(() => import("./pages/EncounterRoute"));
const EncounterNoteSurface = lazy(() => import("./pages/EncounterNoteSurface"));
const CdsGroupView = lazy(() => import("./components/encounter/CdsGroupView"));
const OrdersGroupView = lazy(() => import("./components/encounter/OrdersGroupView"));
const TimelineGroupView = lazy(() => import("./components/encounter/TimelineGroupView"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

/**
 * Single ProtectedRoute wrapper for the whole authenticated app. Putting
 * authorization at the layout boundary (instead of every leaf) means we
 * cannot accidentally ship a public new page — the default state for new
 * routes is "auth required".
 */
const Shell = () => (
  <ProtectedRoute requiredPermission="read_patients">
    <AppShell />
  </ProtectedRoute>
);

const App = () => {
  if (!clerkPubKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Missing VITE_CLERK_PUBLISHABLE_KEY</p>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl || undefined}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <SecurityProvider>
              <TooltipProvider>
                <SkipNav />
                <Toaster />
                <Sonner />
                <BrowserRouter basename={basePath || "/"}>
                  <CommandPalette />
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingScreen />}>
                      <Routes>
                        {/* Auth routes (public) */}
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/sign-in/*" element={<SignInPage />} />
                        <Route path="/sign-up/*" element={<SignUpPage />} />

                        {/* Authenticated app — single AppShell, nested children */}
                        <Route element={<Shell />}>
                          <Route index element={<Navigate to="/today" replace />} />
                          <Route path="/today" element={<TodayPage />} />
                          <Route path="/patients" element={<PatientsPage />} />
                          <Route path="/patients/:id" element={<PatientDetailPage />} />

                          {/* Encounter — :id is the single source of truth.
                              Sub-tabs follow the Phase 3 spec naming:
                                note              — documentation surface (note/scribe/summarize)
                                decision-support  — consult / DDx / A&P / chart-chat
                                patient-outputs   — instructions / med-assist / templates (AVS in Phase 6)
                                timeline          — audit-backed timeline
                              The bare /encounters/:id redirects to the explicit
                              /note path so deep-links and bookmarks always
                              land on a stable sub-route. */}
                          <Route path="/encounters/:id" element={<EncounterRoute />}>
                            <Route index element={<Navigate to="note" replace />} />
                            <Route path="note" element={<EncounterNoteSurface />} />
                            <Route path="decision-support" element={<CdsGroupView />} />
                            <Route path="patient-outputs" element={<OrdersGroupView />} />
                            <Route path="timeline" element={<TimelineGroupView />} />
                          </Route>

                          <Route path="/insights" element={<InsightsPage />} />
                          <Route path="/frontdesk" element={<FrontDeskPage />} />

                          {/* Top-level /audit is an alias for /settings/audit
                              so it can be linked or bookmarked directly. */}
                          <Route path="/audit" element={<Navigate to="/settings/audit" replace />} />

                          {/* Settings — view selection is in the URL */}
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/settings/:view" element={<SettingsPage />} />
                        </Route>

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </BrowserRouter>
              </TooltipProvider>
            </SecurityProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default App;
