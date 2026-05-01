import { Brain, MessageSquare, GitBranch, ClipboardList, FileText, Mic, Settings2, BarChart2, MessageCircle, Pill, BookOpen, Sparkles, Stethoscope } from "lucide-react";

export type CDSSubPage =
  | "workspace"
  | "consult"
  | "ddx"
  | "assessment-plan"
  | "summarize"
  | "chart-chat"
  | "med-assist"
  | "patient-instructions"
  | "notes"
  | "scribe"
  | "templates";

interface CDSSubNavProps {
  active: CDSSubPage;
  onChange: (page: CDSSubPage) => void;
}

interface NavItem {
  value: CDSSubPage;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

interface NavGroup {
  header?: string;
  headerIcon?: React.ElementType;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    items: [
      { value: "workspace", label: "Encounter", icon: Brain, roles: ["doctor", "nurse", "admin"] },
    ],
  },
  {
    header: "AI CDSS",
    headerIcon: Sparkles,
    items: [
      { value: "consult", label: "Ask Questions", icon: MessageSquare, roles: ["doctor", "nurse", "admin"] },
      { value: "ddx", label: "Differential Dx", icon: GitBranch, roles: ["doctor", "admin"] },
      { value: "assessment-plan", label: "Assessment & Plan", icon: ClipboardList, roles: ["doctor", "admin"] },
      { value: "summarize", label: "Pre-Visit Tools", icon: BarChart2, roles: ["doctor", "nurse", "admin"] },
      { value: "notes", label: "Clinical Notes", icon: FileText, roles: ["doctor", "admin"] },
    ],
  },
  {
    header: "AI Scribe",
    headerIcon: Stethoscope,
    items: [
      { value: "scribe", label: "Ambient Scribe", icon: Mic, roles: ["doctor", "nurse", "admin"] },
      { value: "chart-chat", label: "Chart Chat", icon: MessageCircle, roles: ["doctor", "nurse", "admin"] },
      { value: "med-assist", label: "Med Assist", icon: Pill, roles: ["doctor", "admin"] },
      { value: "patient-instructions", label: "Patient Instructions", icon: BookOpen, roles: ["doctor", "nurse", "admin"] },
      { value: "templates", label: "Templates", icon: Settings2, roles: ["doctor", "admin"] },
    ],
  },
];

const CDSSubNav = ({ active, onChange }: CDSSubNavProps) => {
  return (
    <div className="flex overflow-x-auto gap-0.5 p-1 bg-background/80 border border-border rounded-xl shadow-sm items-center">
      {groups.map((group, gi) => {
        const HeaderIcon = group.headerIcon;
        return (
          <div key={gi} className="flex items-center gap-0.5 flex-shrink-0">
            {gi > 0 && (
              <div className="w-px h-6 bg-border mx-1 flex-shrink-0" />
            )}
            {group.header && (
              <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 select-none flex-shrink-0">
                {HeaderIcon && <HeaderIcon className="h-3 w-3" />}
                <span className="hidden lg:inline">{group.header}</span>
              </span>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => onChange(item.value)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium font-inter transition-all duration-200 ${
                    isActive
                      ? "bg-brand-trust text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default CDSSubNav;
