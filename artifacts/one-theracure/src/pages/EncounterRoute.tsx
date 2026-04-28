import { useEffect, useMemo, useState } from "react";
import { Outlet, Link, useParams } from "react-router-dom";
import { Loader2, AlertCircle, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { encountersService, type Encounter } from "@/services/encountersService";
import { mockPatients } from "@/data/mockPatients";
import { EncounterProvider } from "@/contexts/EncounterContext";
import EncounterSubNav from "@/components/encounter/EncounterSubNav";
import { logger } from "@/lib/logger";
import type { Patient } from "@/types/patient";

/**
 * EncounterRoute — `/encounters/:id` shell.
 *
 * Responsibilities:
 *   1. Load the encounter from the API by URL `id` (single source of truth).
 *   2. Resolve the patient (mockPatients today; switching to real Patient API
 *      is Task #11).
 *   3. Provide an `EncounterProvider` for descendants that need active
 *      encounter context without prop-drilling.
 *   4. Render header (patient summary), sub-nav, and the routed `Outlet`
 *      for note / cds / orders / timeline children.
 *
 * If the encounter is not found (deleted, wrong org/clinic), the user sees
 * a friendly not-found state with a back link — never a blank screen.
 */
const EncounterRoute = () => {
  const { id } = useParams<{ id: string }>();
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const patient = useMemo<Patient | null>(() => {
    if (!encounter) return null;
    return mockPatients.find((p) => p.id === encounter.patientId) ?? null;
  }, [encounter]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    encountersService
      .get(id)
      .then((enc) => {
        if (cancelled) return;
        setEncounter(enc);
      })
      .catch((err) => {
        logger.error("encounterRoute.get failed", err);
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load encounter");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading encounter…
      </div>
    );
  }

  if (error || !encounter) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
        <div>
          <p className="text-sm font-medium text-destructive">Encounter unavailable</p>
          <p className="text-xs text-muted-foreground mt-1">
            {error ?? "This encounter may have been deleted or belongs to another clinic."}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/today" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Today</Link>
        </Button>
      </div>
    );
  }

  return (
    <EncounterProvider initial={encounter}>
      <div className="space-y-4">
        {/* Encounter header */}
        <div className="bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm p-4 sm:p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-foreground truncate">
                    {patient?.name ?? encounter.patientId}
                  </h1>
                  <Badge variant="outline" className="capitalize">{encounter.status}</Badge>
                  <Badge variant="outline" className="capitalize">{encounter.visitType}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {patient ? `${patient.mrn} · ${patient.age}y ${patient.gender}` : encounter.patientId}
                  {encounter.providerName && ` · with ${encounter.providerName}`}
                </p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link to="/today"><ArrowLeft className="h-4 w-4" /> Today</Link>
            </Button>
          </div>
        </div>

        <EncounterSubNav encounterId={encounter.id} />

        {/* Outlet renders the active sub-tab (note | cds | orders | timeline) */}
        <Outlet context={{ encounter, patient }} />
      </div>
    </EncounterProvider>
  );
};

export default EncounterRoute;
