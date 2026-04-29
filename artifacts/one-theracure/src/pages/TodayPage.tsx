import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Calendar, ClipboardCheck, ArrowRight, Plus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { encountersService, type Encounter } from "@/services/encountersService";
import { mockPatients } from "@/data/mockPatients";
import { eventBus } from "@/services/eventBus";
import { logger } from "@/lib/logger";

const patientById = (id: string) => mockPatients.find((p) => p.id === id);

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });

/**
 * TodayPage — the doctor's landing surface.
 *
 * Sections:
 *   1. "Now Seeing" — most recent active encounter (top of mind).
 *   2. Doctor's Queue — active encounters routed from front-desk.
 *   3. Due Follow-ups — patients with chronic conditions (mock-derived).
 *   4. Outstanding Sign-offs — completed-but-unsigned encounters.
 *
 * All encounter data comes from `encountersService.list()`. The page
 * subscribes to the `queue.sent-to-doctor` event so a front-desk handoff
 * shows up immediately without a manual refresh.
 */
const TodayPage = () => {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await encountersService.list();
      setEncounters(rows);
    } catch (err) {
      logger.error("today.list failed", err);
      setError("Could not load your schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const unsub = eventBus.on("queue.sent-to-doctor", () => {
      void load();
    });
    return unsub;
  }, []);

  const active = useMemo(
    () => encounters.filter((e) => e.status === "active" || e.status === "draft"),
    [encounters],
  );
  const nowSeeing = active[0] ?? null;
  const queue = active.slice(1);
  const outstandingSignoffs = useMemo(
    () => encounters.filter((e) => e.status === "completed"),
    [encounters],
  );
  const dueFollowUps = useMemo(
    () =>
      mockPatients
        .filter((p) => (p.chronicConditions?.length ?? 0) > 0)
        .slice(0, 4),
    [],
  );

  return (
    <div className="space-y-6">
      {/* Page hero */}
      <div className="bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl p-5 sm:p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-playfair bg-gradient-to-r from-primary to-violet-700 dark:to-violet-300 bg-clip-text text-transparent">
              Today
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => window.dispatchEvent(new Event("command:start-visit"))}
            className="gap-2 bg-gradient-to-r from-primary to-violet-700 text-white shadow-md"
          >
            <Plus className="h-4 w-4" /> Start Visit
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 flex items-start gap-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <Button size="sm" variant="ghost" onClick={() => void load()}>Retry</Button>
        </div>
      )}

      {/* Now Seeing */}
      <section aria-labelledby="now-seeing-heading">
        <h2 id="now-seeing-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Now Seeing
        </h2>
        {loading ? (
          <SkeletonCard />
        ) : nowSeeing ? (
          <NowSeeingCard encounter={nowSeeing} />
        ) : (
          <EmptyCard
            icon={<Activity className="h-5 w-5" />}
            title="No active encounter"
            body="Start a visit or wait for the front desk to send you a patient."
          />
        )}
      </section>

      {/* Two-column: Queue + Sign-offs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section aria-labelledby="queue-heading">
          <h2 id="queue-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Your Queue ({queue.length})
          </h2>
          <div className="space-y-2">
            {loading ? (
              <SkeletonCard />
            ) : queue.length === 0 ? (
              <EmptyCard
                icon={<Calendar className="h-5 w-5" />}
                title="Queue is clear"
                body="Front-desk handoffs land here automatically."
              />
            ) : (
              queue.map((e) => <EncounterRow key={e.id} encounter={e} />)
            )}
          </div>
        </section>

        <section aria-labelledby="signoffs-heading">
          <h2 id="signoffs-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Outstanding Sign-offs ({outstandingSignoffs.length})
          </h2>
          <div className="space-y-2">
            {loading ? (
              <SkeletonCard />
            ) : outstandingSignoffs.length === 0 ? (
              <EmptyCard
                icon={<ClipboardCheck className="h-5 w-5" />}
                title="All caught up"
                body="No notes waiting for your signature."
              />
            ) : (
              outstandingSignoffs.map((e) => (
                <EncounterRow key={e.id} encounter={e} variant="signoff" />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Due Follow-ups */}
      <section aria-labelledby="followups-heading">
        <h2 id="followups-heading" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Due Follow-ups
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {dueFollowUps.map((p) => (
            <Link
              key={p.id}
              to={`/patients/${p.id}`}
              className="block rounded-xl border border-border/60 bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.mrn} · {p.age}y</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 truncate">
                {p.chronicConditions?.[0]}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

const NowSeeingCard = ({ encounter }: { encounter: Encounter }) => {
  const patient = patientById(encounter.patientId);
  return (
    <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-violet-500/5 p-5 shadow-sm">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-primary text-primary-foreground">Now Seeing</Badge>
            <Badge variant="outline" className="capitalize">{encounter.visitType}</Badge>
          </div>
          <h3 className="text-lg font-bold text-foreground truncate">
            {patient?.name ?? "Patient"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {patient ? `${patient.mrn} · ${patient.age}y ${patient.gender}` : encounter.patientId}
            {encounter.startedAt && ` · started ${formatTime(encounter.startedAt)}`}
          </p>
          {encounter.chiefComplaint && (
            <p className="text-sm text-foreground/80 mt-2">{encounter.chiefComplaint}</p>
          )}
        </div>
        <Button asChild>
          <Link to={`/encounters/${encounter.id}`} className="gap-1.5">
            Open <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

const EncounterRow = ({
  encounter,
  variant = "queue",
}: {
  encounter: Encounter;
  variant?: "queue" | "signoff";
}) => {
  const patient = patientById(encounter.patientId);
  return (
    <Link
      to={`/encounters/${encounter.id}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 hover:border-primary/40 hover:bg-muted/30 transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{patient?.name ?? encounter.patientId}</p>
          <Badge variant="outline" className="text-[10px] capitalize">{encounter.status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {patient?.mrn ?? "—"} · {variant === "signoff" ? "needs sign-off" : encounter.visitType}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
};

const EmptyCard = ({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) => (
  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 flex items-start gap-3">
    <div className="text-muted-foreground/60">{icon}</div>
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="rounded-xl border border-border/60 bg-card p-5 flex items-center gap-3 text-sm text-muted-foreground">
    <Loader2 className="h-4 w-4 animate-spin" /> Loading…
  </div>
);

export default TodayPage;
