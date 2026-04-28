import React, { useState, useMemo } from "react";
import { Phone, Check, RotateCcw, Play, Bell, UserCheck, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OperationalQueueItem, QueueStatus, QUEUE_STATUS_LABELS, QUEUE_STATUS_COLORS } from "@/types/queue";
import { mockPatients } from "@/data/mockPatients";
import { SPECIALTY_PACKS } from "@/data/specialtyPacks";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const SPECIALTIES_FOR_QUEUE = ["Dermatology", "Dentistry", "General Practice", "Cardiology", "Pediatrics"];

function generateMockQueue(): OperationalQueueItem[] {
  const now = new Date();
  const statuses: QueueStatus[] = ["arrived", "booked", "waiting-verification", "in-consult", "completed", "reschedule-requested", "no-show"];
  const doctors = [
    { name: "Dr. Priya Sharma", specialty: "Dermatology" },
    { name: "Dr. Nisha Patel", specialty: "Dentistry" },
    { name: "Dr. Ramesh Iyer", specialty: "General Practice" },
    { name: "Dr. Vikram Rao", specialty: "Cardiology" },
    { name: "Dr. Ananya Krishnan", specialty: "Pediatrics" },
  ];
  const visitTypes = ["New Consult", "Follow-up", "Procedure", "Report Review", "Vaccine Visit"];

  return mockPatients.map((p, i) => {
    const t = new Date(now);
    t.setMinutes(t.getMinutes() - i * 20 + i * 7);
    const doc = doctors[i % doctors.length];
    return {
      id: `q-${p.id}`,
      clinicId: "default",
      patientId: p.id,
      patientName: p.name,
      patientPhone: p.phone || "+91 98765 43210",
      mrn: p.mrn,
      doctorId: `dr-${i + 1}`,
      doctorName: doc.name,
      visitType: visitTypes[i % visitTypes.length],
      scheduledTime: t.toTimeString().slice(0, 5),
      status: statuses[i % statuses.length],
      priority: i === 0 ? "urgent" : i === 1 ? "high" : "normal",
      verificationStatus: i === 0 ? "verified" : i === 1 ? "partial" : i === 2 ? "pending" : "not-started",
      followUpOverdue: (p.chronicConditions || []).length > 0 && i % 2 === 0,
      waitMinutes: Math.max(0, 45 - i * 8),
      notes: "",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  });
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/20",
  high: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/20",
  normal: "bg-muted text-muted-foreground border-border",
  low: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

const VERIFY_COLORS: Record<string, string> = {
  verified: "text-emerald-600",
  partial: "text-amber-600",
  pending: "text-blue-600",
  "not-started": "text-muted-foreground",
};

export default function OperationalQueueView() {
  const { toast } = useToast();
  const [queue, setQueue] = useState<OperationalQueueItem[]>(generateMockQueue());
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [filterStatus, setFilterStatus] = useState<QueueStatus | "all">("all");
  const [filterVisitType, setFilterVisitType] = useState("all");

  const filtered = useMemo(() => {
    return queue.filter((item) => {
      if (filterDoctor !== "all" && item.doctorName !== filterDoctor) return false;
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (filterVisitType !== "all" && item.visitType !== filterVisitType) return false;
      return true;
    });
  }, [queue, filterDoctor, filterStatus, filterVisitType]);

  const updateStatus = (id: string, status: QueueStatus) => {
    setQueue((prev) => prev.map((q) => q.id === id ? { ...q, status, updatedAt: new Date().toISOString() } : q));
    toast({ title: `Status updated to "${QUEUE_STATUS_LABELS[status]}"` });
  };

  const stats = {
    waiting: queue.filter((q) => q.status === "waiting-verification" || q.status === "booked").length,
    arrived: queue.filter((q) => q.status === "arrived").length,
    inConsult: queue.filter((q) => q.status === "in-consult").length,
    completed: queue.filter((q) => q.status === "completed").length,
  };

  const uniqueDoctors = Array.from(new Set(queue.map((q) => q.doctorName)));
  const uniqueVisitTypes = Array.from(new Set(queue.map((q) => q.visitType)));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Waiting/Booked", value: stats.waiting, color: "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20" },
          { label: "Arrived", value: stats.arrived, color: "text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 border-cyan-500/20" },
          { label: "In Consult", value: stats.inConsult, color: "text-violet-700 dark:text-violet-300 bg-violet-500/10 border-violet-500/20" },
          { label: "Completed", value: stats.completed, color: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-2xl border px-4 py-3 text-center", s.color)}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border/80 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/60 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-foreground">Filters:</span>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as QueueStatus | "all")}>
            <SelectTrigger className="h-8 w-40 rounded-lg text-xs"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(Object.entries(QUEUE_STATUS_LABELS) as [QueueStatus, string][]).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterDoctor} onValueChange={setFilterDoctor}>
            <SelectTrigger className="h-8 w-40 rounded-lg text-xs"><SelectValue placeholder="All Doctors" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {uniqueDoctors.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterVisitType} onValueChange={setFilterVisitType}>
            <SelectTrigger className="h-8 w-36 rounded-lg text-xs"><SelectValue placeholder="Visit Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueVisitTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => setQueue(generateMockQueue())}
            className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                {["Patient", "Doctor", "Time", "Visit Type", "Status", "Priority", "Verified", "Wait", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{item.patientName}</div>
                    <div className="text-xs text-muted-foreground">{item.mrn}</div>
                    {item.followUpOverdue && (
                      <span className="text-xs text-red-600 font-medium">⚠ Follow-up overdue</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{item.doctorName}</td>
                  <td className="px-4 py-3 text-muted-foreground text-sm font-mono">{item.scheduledTime}</td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{item.visitType}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("text-xs capitalize", QUEUE_STATUS_COLORS[item.status])}>
                      {QUEUE_STATUS_LABELS[item.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("text-xs capitalize", PRIORITY_COLORS[item.priority])}>
                      {item.priority}
                    </Badge>
                  </td>
                  <td className={cn("px-4 py-3 text-xs font-medium capitalize", VERIFY_COLORS[item.verificationStatus])}>
                    {item.verificationStatus.replace("-", " ")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">
                    {item.waitMinutes > 0 ? `${item.waitMinutes}m` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {item.status !== "arrived" && item.status !== "in-consult" && item.status !== "completed" && (
                        <button
                          onClick={() => updateStatus(item.id, "arrived")}
                          title="Mark Arrived"
                          className="w-7 h-7 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {item.status === "arrived" && (
                        <button
                          onClick={() => updateStatus(item.id, "in-consult")}
                          title="Start Encounter"
                          className="w-7 h-7 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 transition-colors"
                        >
                          <Play className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {item.status !== "completed" && item.status !== "no-show" && (
                        <button
                          onClick={() => updateStatus(item.id, "reschedule-requested")}
                          title="Reschedule"
                          className="w-7 h-7 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 transition-colors"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        title="Send Reminder"
                        onClick={() => toast({ title: `Reminder sent to ${item.patientName}` })}
                        className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors"
                      >
                        <Bell className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Call Patient"
                        className="w-7 h-7 rounded-lg bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 transition-colors"
                        onClick={() => toast({ title: `Calling ${item.patientPhone}` })}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No patients match the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
