import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserPlus, Loader2, Stethoscope } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockPatients } from "@/data/mockPatients";
import { encountersService } from "@/services/encountersService";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import type { Patient } from "@/types/patient";

interface StartVisitDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/**
 * StartVisitDialog — the persistent "Start Visit" entry-point.
 *
 * What it does:
 *   1. Searches the patient list (mockPatients today; will be the real
 *      Patient API once Task #11 lands).
 *   2. On select, calls `encountersService.create({ patientId, ... })`.
 *      Provider identity is set server-side from the Clerk session.
 *   3. Navigates to `/encounters/:id` so the URL becomes the source of
 *      truth for the active encounter.
 *
 * Healthcare safety: we do NOT post providerId / providerName / orgId from
 * the client. Those fields are stamped server-side; trying to forge them
 * here would fail validation.
 */
const StartVisitDialog = ({ open, onOpenChange }: StartVisitDialogProps) => {
  const [search, setSearch] = useState("");
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const filtered = useMemo<Patient[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mockPatients.slice(0, 8);
    return mockPatients
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.mrn.toLowerCase().includes(q) ||
          p.phone?.includes(q),
      )
      .slice(0, 12);
  }, [search]);

  const handleStart = async (patient: Patient) => {
    if (creatingFor) return;
    setCreatingFor(patient.id);
    try {
      const enc = await encountersService.create({
        patientId: patient.id,
        status: "active",
        visitType: "consult",
      });
      onOpenChange(false);
      setSearch("");
      navigate(`/encounters/${enc.id}/note?patientId=${patient.id}`);
    } catch (err) {
      logger.error("startVisit.create failed", err);
      toast({
        title: "Could not start visit",
        description: "Please try again. If it keeps failing, check your connection.",
        variant: "destructive",
      });
    } finally {
      setCreatingFor(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Start a Visit
          </DialogTitle>
          <DialogDescription>
            Pick a patient to open a new encounter. The visit is timestamped
            and attributed to you automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search by name, MRN, or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search patients"
            />
          </div>

          <div className="max-h-80 overflow-y-auto -mx-2 px-2 space-y-1.5">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <UserPlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                No patients match.{" "}
                <button
                  className="text-primary underline"
                  onClick={() => {
                    onOpenChange(false);
                    navigate("/patients");
                  }}
                >
                  Register a new patient
                </button>
                .
              </div>
            ) : (
              filtered.map((p) => {
                const isCreating = creatingFor === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleStart(p)}
                    disabled={!!creatingFor}
                    className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-colors disabled:opacity-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.mrn} · {p.age}y {p.gender}
                        {p.chronicConditions?.length ? ` · ${p.chronicConditions[0]}` : ""}
                      </p>
                    </div>
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Button size="sm" variant="default" className="pointer-events-none h-8">
                        Start
                      </Button>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartVisitDialog;
