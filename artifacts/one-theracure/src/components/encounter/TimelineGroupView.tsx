import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { auditService, type AuditEvent } from "@/services/auditService";
import { logger } from "@/lib/logger";

const ACTION_LABEL: Record<string, string> = {
  "encounter.create": "Encounter started",
  "encounter.update": "Encounter updated",
  "encounter.sign": "Encounter signed",
  "cds.generate": "AI generated content",
  "cds.finalize": "AI output finalized",
  "cds.copy": "Content copied",
  "cds.insert": "Content inserted into note",
  "cds.edit": "Content edited",
  "document.uploaded": "Document uploaded",
  "note.drafted": "Note drafted",
};

/**
 * Timeline — server-backed view of every audited action against this
 * encounter. Sourced from `/api/audit?encounterId=:id` so it reflects
 * the immutable audit record, not local UI state.
 */
const TimelineGroupView = () => {
  const { id: encounterId } = useParams<{ id: string }>();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!encounterId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    auditService
      .query({ encounterId, limit: 100 })
      .then((rows) => {
        if (cancelled) return;
        setEvents(rows);
      })
      .catch((err) => {
        logger.error("timeline.audit.query failed", err);
        if (!cancelled) setError("Could not load timeline.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [encounterId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading timeline…
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 flex items-center gap-3 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        No timeline activity yet for this encounter.
      </div>
    );
  }

  return (
    <ol className="relative border-l border-border/60 ml-3 space-y-4 py-2">
      {events.map((e) => (
        <li key={e.id} className="ml-6">
          <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
          <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              {ACTION_LABEL[e.action] ?? e.action}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(e.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              {e.userId && ` · by ${e.userId}`}
            </p>
            {e.payload && Object.keys(e.payload).length > 0 && (
              <pre className="mt-2 text-[11px] text-muted-foreground bg-muted/30 rounded p-2 overflow-x-auto">
                {JSON.stringify(e.payload, null, 2)}
              </pre>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
};

export default TimelineGroupView;
