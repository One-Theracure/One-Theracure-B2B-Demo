import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import LoadingScreen from "@/components/common/LoadingScreen";
import SkipNav from "@/components/common/SkipNav";
import { DemoProvider } from "@/contexts/DemoContext";
import PersonaGate from "@/components/layout/PersonaGate";
import AppLayout from "@/components/layout/AppLayout";

const PersonaPicker = lazy(() => import("./pages/PersonaPicker"));
const DoctorDashboard = lazy(() => import("./pages/DoctorDashboard"));
const PatientList = lazy(() => import("./pages/PatientList"));
const PatientTimeline = lazy(() => import("./pages/PatientTimeline"));
const Consultation = lazy(() => import("./pages/Consultation"));
const Prescriptions = lazy(() => import("./pages/Prescriptions"));
const FollowUps = lazy(() => import("./pages/FollowUps"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const FrontDeskToday = lazy(() => import("./pages/FrontDeskToday"));
const FrontDeskAppointments = lazy(() => import("./pages/FrontDeskAppointments"));
const FrontDeskRegistry = lazy(() => import("./pages/FrontDeskRegistry"));
const FrontDeskVerification = lazy(() => import("./pages/FrontDeskVerification"));
const NotFound = lazy(() => import("./pages/not-found"));

const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <PersonaGate>
      <AppLayout>{children}</AppLayout>
    </PersonaGate>
  );
}

function DoctorOnly({ children }: { children: React.ReactNode }) {
  return (
    <PersonaGate allow={["doctor"]}>
      <AppLayout>{children}</AppLayout>
    </PersonaGate>
  );
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  return (
    <PersonaGate allow={["admin"]}>
      <AppLayout>{children}</AppLayout>
    </PersonaGate>
  );
}

function FrontDeskOnly({ children }: { children: React.ReactNode }) {
  return (
    <PersonaGate allow={["frontdesk"]}>
      <AppLayout>{children}</AppLayout>
    </PersonaGate>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <SkipNav />
        <Toaster />
        <Sonner />
        <BrowserRouter basename={basePath || "/"}>
          <DemoProvider>
            <ErrorBoundary>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/persona" replace />} />
                  <Route path="/persona" element={<PersonaPicker />} />

                  {/* Doctor */}
                  <Route path="/dashboard" element={<DoctorOnly><DoctorDashboard /></DoctorOnly>} />
                  <Route path="/appointments" element={<DoctorOnly><Appointments /></DoctorOnly>} />
                  <Route path="/patients" element={<Shell><PatientList /></Shell>} />
                  <Route path="/patients/:id" element={<Shell><PatientTimeline /></Shell>} />
                  <Route path="/consultation/:patientId" element={<DoctorOnly><Consultation /></DoctorOnly>} />
                  <Route path="/prescriptions" element={<DoctorOnly><Prescriptions /></DoctorOnly>} />
                  <Route path="/follow-ups" element={<DoctorOnly><FollowUps /></DoctorOnly>} />
                  <Route path="/settings" element={<DoctorOnly><Settings /></DoctorOnly>} />

                  {/* Admin */}
                  <Route path="/admin" element={<AdminOnly><AdminDashboard /></AdminOnly>} />
                  <Route path="/admin/analytics" element={<AdminOnly><AdminAnalytics /></AdminOnly>} />
                  <Route path="/admin/settings" element={<AdminOnly><AdminSettings /></AdminOnly>} />

                  {/* Front Desk */}
                  <Route path="/frontdesk" element={<FrontDeskOnly><FrontDeskToday /></FrontDeskOnly>} />
                  <Route path="/frontdesk/appointments" element={<FrontDeskOnly><FrontDeskAppointments /></FrontDeskOnly>} />
                  <Route path="/frontdesk/registry" element={<FrontDeskOnly><FrontDeskRegistry /></FrontDeskOnly>} />
                  <Route path="/frontdesk/verification" element={<FrontDeskOnly><FrontDeskVerification /></FrontDeskOnly>} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </DemoProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
}
