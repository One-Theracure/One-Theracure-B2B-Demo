import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UnifiedAnalyticsSection from "@/components/dashboard/UnifiedAnalyticsSection";
import { mockPatients } from "@/data/mockPatients";
import { usePatientSelection } from "@/hooks/usePatientSelection";

/**
 * /insights — longitudinal patient analytics.
 *
 * Previously the only path to longitudinal trends was buried inside the CDS
 * "Pre-Visit Tools" page. Surfacing it as a top-level route gives clinicians
 * the ability to spot population-level patterns without first opening a
 * specific patient's chart.
 *
 * Reuses existing analytics components — does not introduce new charts.
 */
const InsightsPage = () => {
  const { selectedPatientId, setSelectedPatient } = usePatientSelection();

  const focusedPatient = useMemo(
    () => mockPatients.find((p) => p.id === selectedPatientId) ?? null,
    [selectedPatientId],
  );

  return (
    <div className="space-y-6">
      <div className="bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl p-5 sm:p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-playfair bg-gradient-to-r from-violet-700 to-fuchsia-700 dark:from-violet-300 dark:to-fuchsia-300 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-violet-600" />
              Insights
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Longitudinal patient and clinic-wide analytics.
              {focusedPatient && ` Filtered to ${focusedPatient.name}.`}
            </p>
          </div>
          <div className="w-full sm:w-72">
            <Select
              value={selectedPatientId ?? "all"}
              onValueChange={(v) => setSelectedPatient(v === "all" ? null : v)}
            >
              <SelectTrigger className="h-9 rounded-xl">
                <SelectValue placeholder="All patients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All patients (clinic view)</SelectItem>
                {mockPatients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} · {p.mrn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <UnifiedAnalyticsSection />
    </div>
  );
};

export default InsightsPage;
