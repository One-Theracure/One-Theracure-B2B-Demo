import React, { useState, useMemo } from "react";
import {
  Clock, User, AlertTriangle, CheckCircle, Package, RotateCcw, CalendarPlus,
  Filter, RefreshCw, Play, Bell, Phone, ChevronDown, Zap, Eye, Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MOCK_TODAYS_APPOINTMENTS, getVisitTypeConfig } from "@/data/schedulingData";
import { SPECIALTY_PACKS, getSpecialtyVisitTypes, getAllDoctors } from "@/data/specialtyPacks";
import type { Appointment, AppointmentStatus } from "@/types/scheduling";
import { STATUS_CONFIG } from "@/types/scheduling";

const CATEGORY_BADGES: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20" },
  returning: { label: "Returning", className: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20" },
  package: { label: "Package", className: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20" },
  "follow-up": { label: "Follow-up", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20" },
};

interface Props {
  onReschedule?: (apt: Appointment) => void;
  onFollowUp?: (apt: Appointment) => void;
  activeSpecialty?: string;
}

export default function DailySchedule({ onReschedule, onFollowUp, activeSpecialty }: Props) {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_TODAYS_APPOINTMENTS);
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSpecialty, setFilterSpecialty] = useState(activeSpecialty || "all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allDoctors = useMemo(() => getAllDoctors(), []);
  const visitTypes = useMemo(() => getSpecialtyVisitTypes(filterSpecialty === "all" ? undefined : filterSpecialty), [filterSpecialty]);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (filterDoctor !== "all" && a.doctorId !== filterDoctor) return false;
      if (filterType !== "all" && a.visitType !== filterType) return false;
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (filterSpecialty !== "all" && a.specialty !== filterSpecialty) return false;
      return true;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, filterDoctor, filterType, filterStatus, filterSpecialty]);

  const stats = useMemo(() => {
    const source = filterSpecialty !== "all" ? appointments.filter(a => a.specialty === filterSpecialty) : appointments;
    return {
      total: source.length,
      consults: source.filter((a) => { const c = getVisitTypeConfig(a.visitType, a.specialty); return c.category === "consult"; }).length,
      procedures: source.filter((a) => { const c = getVisitTypeConfig(a.visitType, a.specialty); return c.category === "procedure" || c.category === "therapy"; }).length,
      completed: source.filter((a) => a.status === "completed").length,
      conflicts: source.filter((a) => a.conflicts.length > 0).length,
    };
  }, [appointments, filterSpecialty]);

  const updateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    toast({ title: `Status → ${STATUS_CONFIG[status].label}` });
  };

  // Sync filter when parent specialty changes
  React.useEffect(() => {
    if (activeSpecialty) setFilterSpecialty(activeSpecialty);
    else setFilterSpecialty("all");
  }, [activeSpecialty]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-2.5">
        {[
          { label: "Total", value: stats.total, color: "text-foreground bg-muted/60 border-border" },
          { label: "Consults", value: stats.consults, color: "text-primary bg-primary/10 border-primary/20" },
          { label: "Procedures", value: stats.procedures, color: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20" },
          { label: "Completed", value: stats.completed, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          { label: "Conflicts", value: stats.conflicts, color: stats.conflicts > 0 ? "text-destructive bg-destructive/10 border-destructive/20" : "text-muted-foreground bg-muted/60 border-border" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl border px-3 py-2.5 text-center", s.color)}>
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-[10px] font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-sm">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/60 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
            <SelectTrigger className="h-7 w-40 rounded-lg text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {SPECIALTY_PACKS.map((sp) => (
                <SelectItem key={sp.id} value={sp.id}>{sp.icon} {sp.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterDoctor} onValueChange={setFilterDoctor}>
            <SelectTrigger className="h-7 w-40 rounded-lg text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {allDoctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-7 w-36 rounded-lg text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {visitTypes.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.icon} {v.shortLabel}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-7 w-32 rounded-lg text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => setAppointments(MOCK_TODAYS_APPOINTMENTS)}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>

        {/* Appointment rows */}
        <div className="divide-y divide-border/30">
          {filtered.map((apt) => {
            const vtConfig = getVisitTypeConfig(apt.visitType, apt.specialty);
            const catBadge = CATEGORY_BADGES[apt.patientCategory];
            const statusConfig = STATUS_CONFIG[apt.status];
            const isExpanded = expandedId === apt.id;
            const hasConflicts = apt.conflicts.length > 0;
            const specialtyPack = SPECIALTY_PACKS.find((sp) => sp.id === apt.specialty);

            return (
              <div key={apt.id} className={cn("transition-colors", hasConflicts && "bg-red-50/30")}>
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
                  {/* Time */}
                  <div className="w-14 flex-shrink-0">
                    <span className="font-mono text-sm font-semibold text-foreground">{apt.time}</span>
                    <div className="text-[10px] text-muted-foreground">{vtConfig.defaultDuration}m</div>
                  </div>

                  {/* Visit type icon */}
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 border", vtConfig.color)}>
                    {vtConfig.icon}
                  </div>

                  {/* Patient info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm truncate">{apt.patientName}</span>
                      <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", catBadge?.className)}>
                        {catBadge?.label}
                      </Badge>
                      {apt.packageSession && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-violet-50 text-violet-700 border-violet-200">
                          📦 {apt.packageSession}
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span>{apt.mrn}</span>
                      <span>·</span>
                      <span>{vtConfig.shortLabel}</span>
                      <span>·</span>
                      <span>{apt.doctorName}</span>
                    </div>
                  </div>

                  {/* Specialty badge */}
                  {specialtyPack && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 flex-shrink-0 bg-muted/50">
                      {specialtyPack.icon} {specialtyPack.label}
                    </Badge>
                  )}

                  {/* Resource & specialty tags */}
                  <div className="flex gap-1 flex-shrink-0 flex-wrap max-w-[180px]">
                    {apt.roomName && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium">{apt.roomName}</span>
                    )}
                    {apt.machineName && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-700 dark:text-orange-300 font-medium">{apt.machineName}</span>
                    )}
                    {apt.assistantName && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-700 dark:text-teal-300 font-medium">{apt.assistantName}</span>
                    )}
                    {apt.tags?.map((tag) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{tag}</span>
                    ))}
                  </div>

                  {/* Conflict indicator */}
                  {hasConflicts && (
                    <div className="flex-shrink-0">
                      <AlertTriangle className={cn("h-4 w-4",
                        apt.conflicts.some((c) => c.severity === "error") ? "text-red-500" : "text-amber-500"
                      )} />
                    </div>
                  )}

                  {/* Status */}
                  <Badge variant="outline" className={cn("text-[10px] flex-shrink-0", statusConfig.color)}>
                    {statusConfig.label}
                  </Badge>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {(apt.status === "booked" || apt.status === "confirmed") && (
                      <button onClick={() => updateStatus(apt.id, "arrived")} title="Mark Arrived"
                        className="w-7 h-7 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {apt.status === "arrived" && (
                      <button onClick={() => updateStatus(apt.id, vtConfig.category === "procedure" || vtConfig.category === "therapy" ? "in-procedure" : "in-consult")} title="Start"
                        className="w-7 h-7 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
                        <Play className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {(apt.status === "in-consult" || apt.status === "in-procedure") && (
                      <button onClick={() => updateStatus(apt.id, "completed")} title="Complete"
                        className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {apt.status !== "completed" && apt.status !== "cancelled" && (
                      <button onClick={() => onReschedule?.(apt)} title="Reschedule"
                        className="w-7 h-7 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {apt.status === "completed" && (
                      <button onClick={() => onFollowUp?.(apt)} title="Book Follow-up"
                        className="w-7 h-7 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                        <CalendarPlus className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button onClick={() => setExpandedId(isExpanded ? null : apt.id)}
                      className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground">
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")} />
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-3 pt-0">
                    <div className="bg-muted/50 rounded-xl p-3 text-xs space-y-2">
                      {apt.notes && <div className="text-muted-foreground"><strong>Notes:</strong> {apt.notes}</div>}
                      <div className="flex gap-4 text-muted-foreground flex-wrap">
                        <span>Billing: <strong className="capitalize text-foreground">{apt.billingType}</strong></span>
                        <span>Duration: <strong className="text-foreground">{vtConfig.defaultDuration}m + {vtConfig.bufferAfter}m buffer</strong></span>
                        <span>Phone: <strong className="text-foreground">{apt.patientPhone}</strong></span>
                        {specialtyPack && <span>Specialty: <strong className="text-foreground">{specialtyPack.label}</strong></span>}
                      </div>
                      {apt.conflicts.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {apt.conflicts.map((c, i) => (
                            <div key={i} className={cn(
                              "flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs",
                              c.severity === "error" ? "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300" :
                              c.severity === "warning" ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300" :
                              "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300"
                            )}>
                              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                              <span>{c.message}</span>
                              {c.suggestion && <span className="text-muted-foreground ml-1">— {c.suggestion}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No appointments match filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
