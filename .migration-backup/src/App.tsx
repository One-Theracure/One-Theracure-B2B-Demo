import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import LoadingScreen from "@/components/common/LoadingScreen";
import CommandPalette from "@/components/CommandPalette";
import SkipNav from "@/components/common/SkipNav";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <SecurityProvider>
          <TooltipProvider>
            <SkipNav />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <CommandPalette />
              <ErrorBoundary>
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute requiredPermission="read_patients">
                          <Index />
                        </ProtectedRoute>
                      }
                    />
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
);

export default App;
