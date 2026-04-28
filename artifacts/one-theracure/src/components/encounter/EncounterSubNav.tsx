import { NavLink } from "react-router-dom";
import { FileText, Brain, ClipboardList, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { encounterId: string }

const TABS = [
  { to: "", label: "Note", icon: FileText, end: true },
  { to: "cds", label: "Decision Support", icon: Brain, end: false },
  { to: "orders", label: "Orders & Outputs", icon: ClipboardList, end: false },
  { to: "timeline", label: "Timeline", icon: Clock, end: false },
] as const;

/**
 * Sub-navigation inside an encounter. The 4 tabs map to the route children of
 * `/encounters/:id`. Active state is derived from the URL via NavLink — no
 * local state, no synchronization bugs.
 */
const EncounterSubNav = ({ encounterId }: Props) => (
  <nav
    aria-label="Encounter sections"
    className="flex overflow-x-auto gap-1 p-1 bg-background/80 border border-border rounded-xl shadow-sm"
  >
    {TABS.map(({ to, label, icon: Icon, end }) => (
      <NavLink
        key={label}
        to={to ? `/encounters/${encounterId}/${to}` : `/encounters/${encounterId}`}
        end={end}
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
