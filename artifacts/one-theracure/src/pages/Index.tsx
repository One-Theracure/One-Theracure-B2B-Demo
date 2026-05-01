
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/layout/Header";
import TabNavigation from "@/components/layout/TabNavigation";
import Dashboard from "@/components/Dashboard";
import SettingsContent from "@/components/settings/SettingsContent";
import CDSLayout from "@/components/cds/CDSLayout";
import FrontDeskLayout from "@/components/frontdesk/FrontDeskLayout";
import DemoWalkthrough from "@/components/demo/DemoWalkthrough";

const ACCESSIBILITY_KEY = "app_accessibility";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [accessible, setAccessible] = useState(() => {
    try { return localStorage.getItem(ACCESSIBILITY_KEY) === "true"; } catch { return false; }
  });
  const [currentUser, setCurrentUser] = useState({
    name: "Dr. Ramakant Deshpande",
    role: "Consultant",
    id: "user123"
  });
  const [profileData, setProfileData] = useState({
    name: "Dr. Ramakant Deshpande",
    role: "Consultant",
    email: "dr.ramakant@clinic.com",
    phone: "+91 98765 43210",
    specialty: "General Medicine",
    clinicName: "OneThera Cure Medical Center",
    clinicAddress: "123 Healthcare Plaza, Medical District, Mumbai, Maharashtra 400001",
    about: "Experienced physician with 15+ years in general medicine and preventive care, specializing in comprehensive patient care and clinical documentation."
  });

  useEffect(() => {
    try { localStorage.setItem(ACCESSIBILITY_KEY, String(accessible)); } catch {}
  }, [accessible]);

  const handleProfileUpdate = (updatedProfile: any) => {
    setCurrentUser({
      name: updatedProfile.name,
      role: updatedProfile.role,
      id: currentUser.id
    });
    setProfileData(updatedProfile);
  };
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setActiveTab(detail);
    };
    window.addEventListener("command:navigate", handler as EventListener);
    return () => window.removeEventListener("command:navigate", handler as EventListener);
  }, []);

  // Allow any component (e.g. dashboard QuickActions) to start the guided tour.
  useEffect(() => {
    const handler = () => setShowWalkthrough(true);
    window.addEventListener("demo:start-tour", handler);
    return () => window.removeEventListener("demo:start-tour", handler);
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
