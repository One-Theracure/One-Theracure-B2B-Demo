
import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from "@clerk/react";
import Header from "@/components/layout/Header";
import TabNavigation from "@/components/layout/TabNavigation";
import Dashboard from "@/components/Dashboard";
import SettingsContent from "@/components/settings/SettingsContent";
import CDSLayout from "@/components/cds/CDSLayout";
import FrontDeskLayout from "@/components/frontdesk/FrontDeskLayout";
import DemoWalkthrough from "@/components/demo/DemoWalkthrough";

const ACCESSIBILITY_KEY = "app_accessibility";

interface CurrentUser {
  name: string;
  role: string;
  id: string;
  email?: string;
}

const Index = () => {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [accessible, setAccessible] = useState(() => {
    try { return localStorage.getItem(ACCESSIBILITY_KEY) === "true"; } catch { return false; }
  });

  const baseUser: CurrentUser = useMemo(() => {
    // Phase 1: role + clinic come from Clerk publicMetadata when available;
    // Phase 2 will replace this with proper Clerk Organizations + custom roles.
    const meta = (user?.publicMetadata ?? {}) as Record<string, unknown>;
    const fallbackName =
      user?.fullName ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.primaryEmailAddress?.emailAddress ||
      "Doctor";
    return {
      name: fallbackName,
      role: typeof meta.role === "string" ? meta.role : "Doctor",
      id: user?.id ?? "guest",
      email: user?.primaryEmailAddress?.emailAddress,
    };
  }, [user]);

  const [currentUser, setCurrentUser] = useState<CurrentUser>(baseUser);
  const [profileData, setProfileData] = useState({
    name: baseUser.name,
    role: baseUser.role,
    email: baseUser.email ?? "",
    phone: "",
    specialty: "General Medicine",
    clinicName: "",
    clinicAddress: "",
    about: "",
  });

  // When Clerk hydrates the user, sync local state once. Subsequent edits via
  // ProfileEditModal own the local copy; we don't overwrite them on re-render.
  useEffect(() => {
    if (!isLoaded) return;
    setCurrentUser((prev) => (prev.id === "guest" ? baseUser : prev));
    setProfileData((prev) =>
      prev.name === "" || prev.name === "Doctor"
        ? {
            ...prev,
            name: baseUser.name,
            role: baseUser.role,
            email: baseUser.email ?? prev.email,
          }
        : prev,
    );
  }, [isLoaded, baseUser]);

  useEffect(() => {
    try { localStorage.setItem(ACCESSIBILITY_KEY, String(accessible)); } catch {}
  }, [accessible]);

  // Header bubbles up the small HeaderUser shape; we keep the broader
  // profileData (specialty, clinic, etc.) untouched here. ProfileEditModal is
  // the only surface that edits those richer fields and it owns its own copy.
  const handleProfileUpdate = (updated: { name: string; role: string; id: string; email?: string }) => {
    setCurrentUser({
      name: updated.name,
      role: updated.role,
      id: currentUser.id,
      email: updated.email,
    });
    setProfileData((prev) => ({
      ...prev,
      name: updated.name,
      role: updated.role,
      email: updated.email ?? prev.email,
    }));
  };
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setActiveTab(detail);
    };
    window.addEventListener("command:navigate", handler as EventListener);
    return () => window.removeEventListener("command:navigate", handler as EventListener);
  }, []);

  const renderTabContent = () => {
    const content = (() => {
      switch (activeTab) {
        case "dashboard": return <Dashboard />;
        case "cds-scribe": return <CDSLayout />;
        case "frontdesk": return <FrontDeskLayout />;
        case "settings": return <SettingsContent />;
        default: return <Dashboard />;
      }
    })();

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Premium background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.05),transparent)]"></div>
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <Header 
          currentUser={currentUser} 
          onProfileUpdate={handleProfileUpdate}
          accessible={accessible}
          onAccessibilityToggle={setAccessible}
          onStartDemo={() => setShowWalkthrough(true)}
        />
        
        <main id="main-content" className={`container max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 ${accessible ? "app-accessible" : ""}`}>
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          
          <div className="relative">
            {renderTabContent()}
          </div>
        </main>

        <DemoWalkthrough
          isOpen={showWalkthrough}
          onClose={() => setShowWalkthrough(false)}
          onNavigate={setActiveTab}
        />
      </div>
    </div>
  );
};

export default Index;
