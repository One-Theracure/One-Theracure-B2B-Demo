import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Activity,
  Pill,
  FlaskConical,
  HeartPulse,
  ScanLine,
  Scissors,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Network,
} from "lucide-react";
import { getPatientGraph, initializeGraphFromPatient } from "@/services/patientGraph";
import { Patient } from "@/types/patient";
import { PatientGraph } from "@/types/longitudinal";

interface CareGraphPanelProps {
  patient: Patient;
  onInsertToNote?: (text: string) => void;
}

const ProvenanceBadge = ({ label }: { label: string }) => (
  <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full whitespace-nowrap">
    {label}
  </span>
);

const InsertButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="ghost"
    size="sm"
    className="h-5 w-5 p-0 text-violet-500 hover:text-violet-700 hover:bg-violet-500/10 shrink-0"
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    title="Insert into note"
  >
    <Plus className="h-3 w-3" />
  </Button>
);

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const Section = ({ title, icon, count, defaultOpen = false, children }: SectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  if (count === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 px-1 rounded-lg hover:bg-muted/40 transition-colors text-left">
        {open ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
        {icon}
        <span className="text-xs font-medium flex-1">{title}</span>
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{count}</Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-5 space-y-1 mt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
};

const CareGraphPanel = ({ patient, onInsertToNote }: CareGraphPanelProps) => {
  const [open, setOpen] = useState(false);

  const graph: PatientGraph = useMemo(() => {
    const g = getPatientGraph(patient.id);
    if (g.problems.length === 0 && g.vitals.length === 0) {
      return initializeGraphFromPatient(patient);
    }
    return g;
  }, [patient.id]);

  const activeProblems = graph.problems.filter((p) => p.status === "active" || p.status === "chronic");
  const activeMeds = graph.medications.filter((m) => m.active);
  const recentLabs = [...graph.labs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const recentVitals = [...graph.vitals].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const insert = (text: string) => onInsertToNote?.(text);

  const totalItems = activeProblems.length + activeMeds.length + recentLabs.length + recentVitals.length + graph.allergies.length + graph.imaging.length + graph.procedures.length;

  return (
    <Card className="border-border/50 shadow-none mt-3">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer py-3 px-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-violet-600" />
              <CardTitle className="text-xs flex-1">Care Graph</CardTitle>
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">{totalItems} items</Badge>
              {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="px-4 pb-3 pt-0 space-y-2">
            {/* Active Problems */}
            <Section title="Active Problems" icon={<Activity className="h-3.5 w-3.5 text-rose-500" />} count={activeProblems.length} defaultOpen={activeProblems.length > 0}>
              {activeProblems.map((p) => (
                <div key={p.id} className="flex items-start gap-1.5 py-1 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {p.icd10 && <Badge variant="outline" className="text-[9px] h-3.5 px-1">{p.icd10}</Badge>}
                      <ProvenanceBadge label={`Since ${formatDate(p.onsetDate)}`} />
                    </div>
                  </div>
                  <InsertButton onClick={() => insert(`- **${p.name}**${p.icd10 ? ` [${p.icd10}]` : ""} (since ${formatDate(p.onsetDate)})\n`)} />
                </div>
              ))}
            </Section>

            {/* Allergies */}
            {graph.allergies.length > 0 && (
              <Section title="Allergies" icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />} count={graph.allergies.length}>
                {graph.allergies.map((a, i) => (
                  <div key={i} className="flex items-center gap-1.5 py-1 group">
                    <p className="text-xs flex-1 truncate">⚠️ {a}</p>
                    <InsertButton onClick={() => insert(`- ⚠️ Allergy: **${a}**\n`)} />
                  </div>
                ))}
              </Section>
            )}

            {/* Active Medications */}
            <Section title="Medications" icon={<Pill className="h-3.5 w-3.5 text-blue-500" />} count={activeMeds.length}>
              {activeMeds.map((m) => (
                <div key={m.id} className="flex items-start gap-1.5 py-1 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{m.name} {m.dose}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{m.route} · {m.frequency}</span>
                      <ProvenanceBadge label={`Started ${formatDate(m.startDate)}`} />
                    </div>
                  </div>
                  <InsertButton onClick={() => insert(`- **${m.name}** ${m.dose} ${m.route} ${m.frequency}\n`)} />
                </div>
              ))}
            </Section>

            {/* Recent Labs */}
            <Section title="Recent Labs" icon={<FlaskConical className="h-3.5 w-3.5 text-emerald-500" />} count={recentLabs.length} defaultOpen={recentLabs.some((l) => l.abnormal)}>
              {recentLabs.map((l) => (
                <div key={l.id} className="flex items-start gap-1.5 py-1 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium truncate">{l.test}: {l.value} {l.unit}</p>
                      {l.abnormal && <Badge variant="destructive" className="text-[9px] h-3.5 px-1">Abnormal</Badge>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">Ref: {l.referenceRange}</span>
                      <ProvenanceBadge label={`Lab Report, ${formatDate(l.date)}`} />
                    </div>
                  </div>
                  <InsertButton onClick={() => insert(`- ${l.test}: **${l.value} ${l.unit}** (ref: ${l.referenceRange})${l.abnormal ? " ⚠️" : ""} — ${formatDate(l.date)}\n`)} />
                </div>
              ))}
            </Section>

            {/* Recent Vitals */}
            <Section title="Recent Vitals" icon={<HeartPulse className="h-3.5 w-3.5 text-pink-500" />} count={recentVitals.length}>
              {recentVitals.map((v, i) => {
                const prev = recentVitals[i + 1];
                const trend = prev ? (v.value > prev.value ? "up" : v.value < prev.value ? "down" : null) : null;
                return (
                  <div key={v.id} className="flex items-center gap-1.5 py-1 group">
                    <div className="flex-1 min-w-0 flex items-center gap-1.5">
                      <p className="text-xs font-medium">{v.type.toUpperCase()}: {v.value} {v.unit}</p>
                      {trend === "up" && <TrendingUp className="h-3 w-3 text-rose-400" />}
                      {trend === "down" && <TrendingDown className="h-3 w-3 text-blue-400" />}
                      <ProvenanceBadge label={formatDate(v.date)} />
                    </div>
                    <InsertButton onClick={() => insert(`- ${v.type.toUpperCase()}: **${v.value} ${v.unit}** (${formatDate(v.date)})\n`)} />
                  </div>
                );
              })}
            </Section>

            {/* Imaging */}
            <Section title="Imaging" icon={<ScanLine className="h-3.5 w-3.5 text-indigo-500" />} count={graph.imaging.length}>
              {graph.imaging.map((img) => (
                <div key={img.id} className="flex items-start gap-1.5 py-1 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{img.type}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{img.impression}</p>
                    <ProvenanceBadge label={`Imaging, ${formatDate(img.date)}`} />
                  </div>
                  <InsertButton onClick={() => insert(`- **${img.type}** (${formatDate(img.date)}): ${img.impression}\n`)} />
                </div>
              ))}
            </Section>

            {/* Procedures */}
            <Section title="Procedures" icon={<Scissors className="h-3.5 w-3.5 text-teal-500" />} count={graph.procedures.length}>
              {graph.procedures.map((proc) => (
                <div key={proc.id} className="flex items-start gap-1.5 py-1 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{proc.name}</p>
                    <ProvenanceBadge label={`Procedure, ${formatDate(proc.date)}`} />
                  </div>
                  <InsertButton onClick={() => insert(`- **${proc.name}** (${formatDate(proc.date)})${proc.notes ? `: ${proc.notes}` : ""}\n`)} />
                </div>
              ))}
            </Section>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CareGraphPanel;
