import React from "react";
import { Badge } from "@/components/ui/badge";
import { getAllResources, getSpecialtyResources } from "@/data/specialtyPacks";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, string> = {
  room: "🏥",
  machine: "⚙️",
  staff: "👩‍⚕️",
  chair: "🪑",
  device: "📡",
};

interface Props {
  activeSpecialty?: string;
}

export default function ResourceStatusBar({ activeSpecialty }: Props) {
  const resources = activeSpecialty ? getSpecialtyResources(activeSpecialty) : getAllResources();

  if (resources.length === 0) return null;

  const types = Array.from(new Set(resources.map((r) => r.type)));

  return (
    <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Resource Status</h4>
      <div className={cn("grid gap-3", types.length <= 2 ? "grid-cols-2" : "grid-cols-3")}>
        {types.map((type) => (
          <div key={type} className="space-y-1.5">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
              {TYPE_ICONS[type] || "📋"} {type}s
            </div>
            {resources.filter((r) => r.type === type).map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-foreground/80 truncate">{r.name}</span>
                <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0",
                  r.available
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-600 border-red-200"
                )}>
                  {r.available ? "Free" : r.nextAvailable ? `→ ${r.nextAvailable}` : "Busy"}
                </Badge>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
