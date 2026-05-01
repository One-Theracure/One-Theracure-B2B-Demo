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

  const goToTab = (tab: string) => {
    // We're already on "/"; dispatch to Index to switch tabs
    navigate("/");
    window.dispatchEvent(new CustomEvent("command:navigate", { detail: tab }));
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
          <CommandItem onSelect={() => goToTab("dashboard")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Go to Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => goToTab("frontdesk")}>
            <Users className="mr-2 h-4 w-4" />
            <span>Open Patient Queue</span>
          </CommandItem>
          <CommandItem onSelect={() => goToTab("cds-scribe")}>
            <FilePlus2 className="mr-2 h-4 w-4" />
            <span>Start New Visit</span>
          </CommandItem>
          <CommandItem onSelect={() => goToTab("cds-scribe")}>
            <Brain className="mr-2 h-4 w-4" />
            <span>Open AI Clinical</span>
          </CommandItem>
          <CommandItem onSelect={() => goToTab("settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Open Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Patients">
          {filteredPatients.map((p: any) => (
            <CommandItem key={p.id} onSelect={() => goToTab("frontdesk")}>
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
