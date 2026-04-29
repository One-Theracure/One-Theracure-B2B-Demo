import { useMemo, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { analytics12Months, type AnalyticsRow } from "@/data/seed/analytics-derived";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";

const DOCTORS = [
  { id: "all", label: "Clinic-wide", factor: 1 },
  { id: "priya", label: "Dr. Priya Sharma · Internal Med", factor: 0.42 },
  { id: "rahul", label: "Dr. Rahul Desai · Cardiology", factor: 0.31 },
  { id: "neha", label: "Dr. Neha Kulkarni · Dermatology", factor: 0.27 },
] as const;

export default function AdminAnalytics() {
  const [doctorId, setDoctorId] = useState<(typeof DOCTORS)[number]["id"]>("all");
  const factor = DOCTORS.find((d) => d.id === doctorId)?.factor ?? 1;

  const data: AnalyticsRow[] = useMemo(
    () =>
      analytics12Months.map((m) => ({
        ...m,
        opdVolume: Math.round(m.opdVolume * factor),
        docMinutesSaved: Math.round(m.docMinutesSaved * factor),
        appScans: Math.round(m.appScans * factor),
      })),
    [factor]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-playfair">Analytics · last 12 months</h1>
          <p className="text-sm text-muted-foreground">
            All charts are demo-staged. Toggle between clinic-wide totals and an individual doctor.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">View</span>
          <Select value={doctorId} onValueChange={(v) => setDoctorId(v as typeof doctorId)}>
            <SelectTrigger className="h-9 w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCTORS.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {doctorId !== "all" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-900/40 text-xs text-violet-900 dark:text-violet-200">
          <Sparkles className="h-3 w-3" />
          Showing {DOCTORS.find((d) => d.id === doctorId)?.label} only — toggle back to <strong>Clinic-wide</strong> for the full panel.
        </div>
      )}

      <Tabs defaultValue="opd" className="w-full">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="opd">OPD volume</TabsTrigger>
          <TabsTrigger value="time">Doctor time saved</TabsTrigger>
          <TabsTrigger value="recovery">Follow-up recovery</TabsTrigger>
          <TabsTrigger value="app">App engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="opd" className="mt-4">
          <Card title="Monthly OPD volume" subtitle="New + follow-up + walk-in patients">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="opdVolume" stroke="url(#g1)" strokeWidth={3} dot={{ r: 3, fill: "#7c3aed" }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="mt-4">
          <Card title="Doctor documentation minutes saved" subtitle="Powered by ambient AI scribe">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="docMinutesSaved" fill="#B7791F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="recovery" className="mt-4">
          <Card title="Follow-up recovery rate" subtitle="% of overdue patients who returned within 30 days">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="followUpRecovery" name="Recovery %" stroke="#10b981" strokeWidth={3} />
                <Line type="monotone" dataKey="retention" name="Retention %" stroke="#7c3aed" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="app" className="mt-4">
          <Card title="Patient app scans" subtitle="One TheraCure consumer app activity">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="appScans" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5">
      <div className="mb-3">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
