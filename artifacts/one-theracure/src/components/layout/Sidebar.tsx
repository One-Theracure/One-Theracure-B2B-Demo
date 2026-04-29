import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Users, Stethoscope, FileText, BellRing,
  BarChart3, Settings, ClipboardList, ShieldCheck, Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/contexts/DemoContext";
import { useDemoStore } from "@/stores/useDemoStore";

type IconKey =
  | "dashboard" | "appointments" | "patients" | "consultation"
  | "prescriptions" | "followups" | "analytics" | "settings"
  | "registry" | "verification" | "today";

const ICON: Record<IconKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  appointments: Calendar,
  patients: Users,
  consultation: Stethoscope,
  prescriptions: FileText,
  followups: BellRing,
  analytics: BarChart3,
  settings: Settings,
  registry: ClipboardList,
  verification: ShieldCheck,
  today: Calendar,
};

interface NavItem {
  key: string;
  label: string;
  to: string;
  icon: IconKey;
  badge?: () => number | undefined;
}

function doctorNav(badges: { todayApts: number; followUps: number }): NavItem[] {
  return [
    { key: "dashboard", label: "Dashboard", to: "/dashboard", icon: "dashboard" },
    { key: "appointments", label: "Appointments", to: "/appointments", icon: "appointments", badge: () => badges.todayApts },
    { key: "patients", label: "Patients", to: "/patients", icon: "patients" },
    { key: "consultation", label: "AI Consultation", to: "/consultation/P001", icon: "consultation" },
    { key: "prescriptions", label: "Prescriptions", to: "/prescriptions", icon: "prescriptions" },
    { key: "followups", label: "Follow-Ups", to: "/follow-ups", icon: "followups", badge: () => badges.followUps },
    { key: "settings", label: "Settings", to: "/settings", icon: "settings" },
  ];
}

function adminNav(): NavItem[] {
  return [
    { key: "dashboard", label: "Dashboard", to: "/admin", icon: "dashboard" },
    { key: "patients", label: "Patients", to: "/patients", icon: "patients" },
    { key: "analytics", label: "Analytics", to: "/admin/analytics", icon: "analytics" },
    { key: "settings", label: "Settings", to: "/admin/settings", icon: "settings" },
  ];
}

function frontDeskNav(badges: { todayApts: number }): NavItem[] {
  return [
    { key: "today", label: "Today", to: "/frontdesk", icon: "today", badge: () => badges.todayApts },
    { key: "appointments", label: "Appointments", to: "/frontdesk/appointments", icon: "appointments" },
    { key: "registry", label: "Patient Registry", to: "/frontdesk/registry", icon: "registry" },
    { key: "verification", label: "Verification", to: "/frontdesk/verification", icon: "verification" },
  ];
}

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { currentPersona } = useDemo();
  const location = useLocation();
  const appointments = useDemoStore((s) => s.appointments);
  const followUps = useDemoStore((s) => s.followUps);
  const emptyAppts = useDemoStore((s) => s.devToggles.emptyAppointments);

  if (!currentPersona) return null;

  const todayApts = emptyAppts ? 0 : appointments.filter((a) => a.status !== "completed" && a.status !== "no-show").length;
  const overdueFollowUps = followUps.filter((f) => f.status !== "sent").length;

  const items: NavItem[] = (() => {
    switch (currentPersona.id) {
      case "doctor": return doctorNav({ todayApts, followUps: overdueFollowUps });
      case "admin": return adminNav();
      case "frontdesk": return frontDeskNav({ todayApts });
    }
  })();

  return (
    <aside
      className={cn(
        "h-full flex-shrink-0 border-r border-border/60 bg-card/70 backdrop-blur-xl transition-all duration-200",
        collapsed ? "w-[68px]" : "w-[220px]"
      )}
    >
      <div className="flex h-14 items-center gap-2 px-4 border-b border-border/60">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-sm">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-sm font-bold font-playfair bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              One TheraCure
            </div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">{currentPersona.role}</div>
          </div>
        )}
      </div>

      <nav className="p-2 space-y-1">
        {items.map((item) => {
          const Icon = ICON[item.icon];
          const isActive = location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to + "/")) ||
            (item.key === "patients" && location.pathname.startsWith("/patients"));
          const badge = item.badge?.();
          return (
            <Link
              key={item.key}
              to={item.to}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all relative",
                isActive
                  ? "bg-gradient-to-r from-blue-600/10 to-violet-600/10 text-foreground shadow-inner"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-violet-600")} />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!!badge && !collapsed && (
                <span className={cn(
                  "ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold tabular-nums",
                  item.key === "followups" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                )}>
                  {badge}
                </span>
              )}
              {!!badge && collapsed && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
