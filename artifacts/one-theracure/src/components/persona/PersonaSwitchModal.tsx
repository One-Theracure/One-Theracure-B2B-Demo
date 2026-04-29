import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDemo } from "@/contexts/DemoContext";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function PersonaSwitchModal({ open, onOpenChange }: Props) {
  const { personas, switchPersona, currentPersona } = useDemo();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Switch persona</DialogTitle>
          <DialogDescription>
            Instantly hop between Doctor, Admin, and Front Desk experiences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 mt-2">
          {personas.map((p) => {
            const active = p.id === currentPersona?.id;
            return (
              <button
                key={p.id}
                onClick={() => { switchPersona(p.id); onOpenChange(false); }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  active
                    ? "border-violet-400 bg-violet-50 dark:bg-violet-950/40 shadow-sm"
                    : "border-border/60 hover:border-violet-300 hover:bg-accent"
                }`}
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${p.avatarColor} flex items-center justify-center text-white font-bold shadow-sm`}>
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.role}</div>
                </div>
                {active && <span className="text-[10px] uppercase font-bold tracking-wide text-violet-600">Current</span>}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
