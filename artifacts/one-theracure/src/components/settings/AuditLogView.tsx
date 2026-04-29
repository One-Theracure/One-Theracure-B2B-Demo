import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { auditService, type AuditEvent, type QueryFilters } from "@/services/auditService";
import { logger } from "@/lib/logger";

/**
 * Settings → Audit Logs view.
 *
 * Append-only history is sourced from `GET /api/audit`. The server enforces
 * org/clinic scope from the Clerk session — this component never sends a
 * tenant id and trusts the response set fully.
 *
 * Filtering is intentionally client-driven for the date range (the API
 * accepts ISO `from`/`to`) and for `patientId` / `encounterId` / `userId`.
 * We post the filters to the API (not just filter in memory) because the
 * audit table can grow into millions of rows over a clinic's lifetime.
 *
 * This component must be wrapped in a `<RequireRole roles={["owner","auditor"]}>`
 * by the parent — we do not assume permission, but we also do not duplicate
 * the gate here.
 */

interface FilterState {
  patientId: string;
  encounterId: string;
  userId: string;
  action: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: FilterState = {
  patientId: "",
  encounterId: "",
  userId: "",
  action: "",
  from: "",
  to: "",
};

const DEFAULT_LIMIT = 100;

function toQuery(f: FilterState): QueryFilters {
  const q: QueryFilters = { limit: DEFAULT_LIMIT };
  if (f.patientId.trim()) q.patientId = f.patientId.trim();
  if (f.encounterId.trim()) q.encounterId = f.encounterId.trim();
  if (f.userId.trim()) q.userId = f.userId.trim();
  if (f.action.trim()) q.action = f.action.trim();
  // Date inputs are `YYYY-MM-DD`; widen to ISO at the day boundaries so the
  // user's mental model ("show me April 12th") matches what the API filters.
  if (f.from.trim()) q.from = new Date(`${f.from}T00:00:00.000Z`).toISOString();
  if (f.to.trim()) q.to = new Date(`${f.to}T23:59:59.999Z`).toISOString();
  return q;
}

const AuditLogView = () => {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  const load = useMemo(
    () => async (f: FilterState) => {
      setIsLoading(true);
      setError(null);
      try {
        const rows = await auditService.query(toQuery(f));
        setEvents(rows);
      } catch (err) {
        logger.error("audit.query failed", err);
        setError(err instanceof Error ? err.message : "Failed to load audit log.");
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void load(EMPTY_FILTERS);
    auditService
      .count()
      .then(setCount)
      .catch((err) => logger.warn("audit.count failed", err));
  }, [load]);

  const update = (key: keyof FilterState, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold font-playfair">Audit Logs</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Append-only record of all clinical and administrative actions. Filter by patient, encounter, user, or date range.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          {count != null ? `${count.toLocaleString("en-IN")} total events` : "Loading…"}
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="audit-patient" className="text-xs">Patient ID</Label>
              <Input id="audit-patient" value={filters.patientId} onChange={(e) => update("patientId", e.target.value)} placeholder="pat-..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-encounter" className="text-xs">Encounter ID</Label>
              <Input id="audit-encounter" value={filters.encounterId} onChange={(e) => update("encounterId", e.target.value)} placeholder="enc-..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-user" className="text-xs">User ID</Label>
              <Input id="audit-user" value={filters.userId} onChange={(e) => update("userId", e.target.value)} placeholder="user_..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-action" className="text-xs">Action</Label>
              <Input id="audit-action" value={filters.action} onChange={(e) => update("action", e.target.value)} placeholder="cds.generate" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-from" className="text-xs">From</Label>
              <Input id="audit-from" type="date" value={filters.from} onChange={(e) => update("from", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-to" className="text-xs">To</Label>
              <Input id="audit-to" type="date" value={filters.to} onChange={(e) => update("to", e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button size="sm" onClick={() => void load(filters)} disabled={isLoading} className="gap-1.5">
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Apply filters
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setFilters(EMPTY_FILTERS); void load(EMPTY_FILTERS); }} disabled={isLoading}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            Events {events.length > 0 ? `(showing ${events.length})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-sm text-destructive py-4">{error}</div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading audit events…
            </div>
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No audit events match the current filters.
            </p>
          ) : (
            <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs">{event.action}</Badge>
                      <span className="text-xs text-muted-foreground">{event.entityType}</span>
                      {event.entityId && (
                        <span className="text-xs text-muted-foreground font-mono">#{event.entityId}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>by <span className="font-mono">{event.userId}</span></span>
                    {event.patientId && <span>patient <span className="font-mono">{event.patientId}</span></span>}
                    {event.encounterId && <span>encounter <span className="font-mono">{event.encounterId}</span></span>}
                  </div>
                  {event.payload && Object.keys(event.payload).length > 0 && (
                    <pre className="text-[11px] bg-muted/50 rounded px-2 py-1.5 mt-1.5 overflow-x-auto whitespace-pre-wrap break-words">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogView;
