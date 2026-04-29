import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useDemoStore } from "@/stores/useDemoStore";
import type { DevToggleKey } from "@/types/demo";

const TOGGLES: { key: DevToggleKey; label: string; help: string }[] = [
  { key: "emptyAppointments", label: "Empty appointments today", help: "Show the 'no patients yet' empty state on the schedule." },
  { key: "offlineMode", label: "Offline mode banner", help: "Pretend the clinic just lost internet — show the offline pill." },
  { key: "aiProcessing", label: "AI processing state", help: "Long-running AI processing skeleton for the next consultation." },
  { key: "qrNotScanned", label: "QR not scanned", help: "Hide consumer-app QR scan history on the patient timeline." },
];

export default function DevMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toggles = useDemoStore((s) => s.devToggles);
  const setToggle = useDemoStore((s) => s.setDevToggle);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edge-state toggles</DialogTitle>
          <DialogDescription>
            Hidden dev menu (⌘K) — flip these to demo edge cases on the fly.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {TOGGLES.map((t) => (
            <div key={t.key} className="flex items-start justify-between gap-3 p-3 border border-border/60 rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{t.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.help}</div>
              </div>
              <Switch checked={toggles[t.key]} onCheckedChange={(v) => setToggle(t.key, v)} />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
