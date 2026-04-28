import React, { useEffect, useMemo, useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { Search, LayoutDashboard, Users, FilePlus2, Settings, MonitorSmartphone, Brain } from "lucide-react";
import { mockPatients } from "@/data/mockPatients";

const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Global hotkey + external open event
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("command:open", onOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("command:open", onOpen as EventListener);
    };
  }, []);

  // Phase 3: navigate by real route path instead of legacy tab IDs.
  // The previous implementation dispatched `command:navigate` with tab
  // strings like "dashboard" / "cds-scribe", which Index.tsx interpreted.
  // Index.tsx is gone; AppShell now treats the detail as a route path,
  // so passing legacy tab IDs would route to invalid paths.
  const goPath = (path: string) => {
    navigate(path);
    setOpen(false);
  };
  const startVisit = () => {
    // Dedicated event so any host (AppShell, future kiosk shells) can open
    // the patient picker without depending on URL semantics.
    window.dispatchEvent(new CustomEvent("command:start-visit"));
    setOpen(false);
  };

  const patients = useMemo(() => mockPatients || [], []);
  const filteredPatients = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return patients.slice(0, 8);
    return patients.filter((p: any) => `${p.name} ${p.id}`.toLowerCase().includes(q)).slice(0, 10);
  }, [patients, query]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search or jump… (Ctrl/Cmd K)" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => goPath("/today")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Go to Today</span>
          </CommandItem>
          <CommandItem onSelect={() => goPath("/frontdesk")}>
            <Users className="mr-2 h-4 w-4" />
            <span>Open Patient Queue</span>
          </CommandItem>
          <CommandItem onSelect={startVisit}>
            <FilePlus2 className="mr-2 h-4 w-4" />
            <span>Start New Visit</span>
          </CommandItem>
          <CommandItem onSelect={() => goPath("/insights")}>
            <Brain className="mr-2 h-4 w-4" />
            <span>Open Insights</span>
          </CommandItem>
          <CommandItem onSelect={() => goPath("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Open Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Patients">
          {filteredPatients.map((p: any) => (
            <CommandItem key={p.id} onSelect={() => goPath(`/patients/${p.id}`)}>
              <Search className="mr-2 h-4 w-4" />
              <span>{p.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
