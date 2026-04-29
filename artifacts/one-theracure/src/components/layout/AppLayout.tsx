import { useEffect, useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DemoTour from "@/components/tour/DemoTour";
import DevMenu from "@/components/common/DevMenu";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showDev, setShowDev] = useState(false);

  // Auto-collapse sidebar on tablet width
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 1024) setCollapsed(true);
      else setCollapsed(false);
    };
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Cmd+K dev menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowDev((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onToggleSidebar={() => setCollapsed((c) => !c)} onStartTour={() => setShowTour(true)} />
      <div className="flex flex-1 min-h-0">
        <Sidebar collapsed={collapsed} />
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
      <DemoTour open={showTour} onClose={() => setShowTour(false)} />
      <DevMenu open={showDev} onClose={() => setShowDev(false)} />
    </div>
  );
}
