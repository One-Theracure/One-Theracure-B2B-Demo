import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Search, ChevronLeft } from "lucide-react";
import { mockPatients } from "@/data/mockPatients";
import { Patient } from "@/types/patient";
import { cn } from "@/lib/utils";

interface WorkspaceSidebarProps {
  selectedPatientId?: string;
  onPatientSelect: (patient: Patient) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  selectedPatientId,
  onPatientSelect,
  collapsed = false,
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return mockPatients;
    const q = searchQuery.toLowerCase();
    return mockPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Collapsed icon rail mode
  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-3 gap-2 h-full bg-card border-r border-border/60">
        <button
          onClick={onToggleCollapse}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Expand patient list"
        >
          <Users className="h-4.5 w-4.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="border-r border-border/60 bg-card flex flex-col h-full w-full">
      <div className="p-3 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Patients
        </h3>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Collapse patient list"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 pb-3 space-y-0.5">
          {filteredPatients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => onPatientSelect(patient)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                selectedPatientId === patient.id
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "hover:bg-muted text-foreground"
              )}
            >
              <div className="font-medium text-sm truncate">{patient.name}</div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-muted-foreground">{patient.mrn}</span>
                <span className="text-xs text-muted-foreground">{patient.lastVisit}</span>
              </div>
            </button>
          ))}
          {filteredPatients.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No patients found
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
