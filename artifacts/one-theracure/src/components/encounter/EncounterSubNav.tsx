import { NavLink } from "react-router-dom";
import { FileText, Brain, ClipboardList, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { encounterId: string }

const TABS = [
  { to: "note", label: "Note", icon: FileText },
  { to: "decision-support", label: "Decision Support", icon: Brain },
  { to: "patient-outputs", label: "Orders & Outputs", icon: ClipboardList },
  { to: "timeline", label: "Timeline", icon: Clock },
] as const;

/**
 * Sub-navigation inside an encounter. The 4 tabs map to the route children of
 * `/encounters/:id`. Every tab is an explicit named segment (no empty `to`)
 * so deep-links are stable. Active state is derived from the URL via NavLink
 * — no local state, no synchronization bugs.
 */
const EncounterSubNav = ({ encounterId }: Props) => (
  <nav
    aria-label="Encounter sections"
    className="flex overflow-x-auto gap-1 p-1 bg-background/80 border border-border rounded-xl shadow-sm"
  >
    {TABS.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={label}
        to={`/encounters/${encounterId}/${to}`}
        className={({ isActive }) =>
          cn(
            "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all",
            isActive
              ? "bg-gradient-to-r from-primary to-violet-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/70",
          )
        }
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
);

export default EncounterSubNav;
