import React, { useState, useMemo } from "react";
import {
  Search, Plus, Calendar, Clock, User, AlertTriangle, CheckCircle, Package,
  RotateCcw, Zap, ChevronRight, X, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { mockPatients } from "@/data/mockPatients";
import {
  DERMA_VISIT_TYPES, DERMA_DOCTORS, CLINIC_RESOURCES,
  MOCK_PATIENT_PACKAGES, getFollowUpSuggestions, detectConflicts, getVisitTypeConfig,
} from "@/data/dermaSchedulingData";
import type {
  DermaVisitType, PatientCategory, ResourceConflict, FollowUpSuggestion, PatientPackage,
} from "@/types/dermaScheduling";

interface Props {
  onBooked?: () => void;
  prefillPatientId?: string;
  prefillVisitType?: DermaVisitType;
  isReschedule?: boolean;
  rescheduleFromId?: string;
}

export default function DermaBookingForm({ onBooked, prefillPatientId, prefillVisitType, isReschedule }: Props) {
  const { toast } = useToast();

  // Step tracking
  const [step, setStep] = useState<"patient" | "type" | "slot" | "confirm">(prefillPatientId ? "type" : "patient");

  // Form state
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(prefillPatientId || "");
  const [visitType, setVisitType] = useState<DermaVisitType | "">(prefillVisitType || "");
  const [doctorId, setDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [roomId, setRoomId] = useState("");
  const [machineId, setMachineId] = useState("");
  const [assistantId, setAssistantId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Derived
  const patient = mockPatients.find((p) => p.id === selectedPatientId);
  const visitConfig = visitType ? getVisitTypeConfig(visitType) : null;
  const patientPackages = selectedPatientId ? (MOCK_PATIENT_PACKAGES[selectedPatientId] || []) : [];
  const followUpSuggestions = selectedPatientId ? getFollowUpSuggestions(selectedPatientId) : [];
  const isReturning = patient && patient.totalVisits > 1;
  const patientCategory: PatientCategory = patientPackages.length > 0 ? "package" : followUpSuggestions.length > 0 ? "follow-up" : isReturning ? "returning" : "new";

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return mockPatients.slice(0, 5);
    const q = patientSearch.toLowerCase();
    return mockPatients.filter(
      (p) => p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q) || p.phone.includes(q)
    ).slice(0, 8);
  }, [patientSearch]);

  const rooms = CLINIC_RESOURCES.filter((r) => r.type === "room");
  const machines = CLINIC_RESOURCES.filter((r) => r.type === "machine");
  const staff = CLINIC_RESOURCES.filter((r) => r.type === "staff");

  const doctor = DERMA_DOCTORS.find((d) => d.id === doctorId);
  const availableSlots = doctor?.availableSlots || [];

  const conflicts = useMemo(() => {
    if (!doctorId || !selectedDate || !selectedTime || !visitConfig) return [];
    return detectConflicts(
      doctorId,
      format(selectedDate, "yyyy-MM-dd"),
      selectedTime,
      visitConfig.defaultDuration,
      roomId || undefined,
      machineId || undefined
    );
  }, [doctorId, selectedDate, selectedTime, roomId, machineId, visitConfig]);

  const hasBlockingConflict = conflicts.some((c) => c.severity === "error");

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    setStep("type");
  };

  const handleSelectType = (type: DermaVisitType) => {
    setVisitType(type);
    const config = getVisitTypeConfig(type);
    // Auto-select room/machine/staff defaults for procedures
    if (config.requiresRoom) {
      const freeRoom = rooms.find((r) => r.available && (type === "laser-session" ? r.category === "laser-room" : r.category === "procedure-room"));
      if (freeRoom) setRoomId(freeRoom.id);
    }
    if (config.requiresMachine) {
      const freeMachine = machines.find((r) => r.available && r.category === "laser");
      if (freeMachine) setMachineId(freeMachine.id);
    }
    if (config.requiresAssistant) {
      const freeStaff = staff.find((r) => r.available);
      if (freeStaff) setAssistantId(freeStaff.id);
    }
    setStep("slot");
  };

  const handleBook = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    toast({
      title: isReschedule ? "Appointment Rescheduled" : "Appointment Booked",
      description: `${patient?.name} — ${visitConfig?.label} with ${doctor?.name} on ${selectedDate ? format(selectedDate, "dd MMM") : ""} at ${selectedTime}`,
    });
    setSubmitting(false);
    onBooked?.();
    // Reset
    setStep("patient");
    setSelectedPatientId("");
    setVisitType("");
    setDoctorId("");
    setSelectedTime("");
    setNotes("");
  };

  return (
    <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Plus className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{isReschedule ? "Reschedule Appointment" : "Book Appointment"}</h3>
            <p className="text-xs text-muted-foreground">Dermatology-optimized booking flow</p>
          </div>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-1 text-xs">
          {(["patient", "type", "slot", "confirm"] as const).map((s, i) => (
            <React.Fragment key={s}>
              <span className={cn(
                "px-2 py-1 rounded-md font-medium capitalize",
                step === s ? "bg-primary/10 text-primary" : "text-muted-foreground/50"
              )}>
                {s}
              </span>
              {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground/30" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="p-5">
        {/* ──── STEP 1: Patient Search ──── */}
        {step === "patient" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, MRN, or phone..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="pl-10 h-11 rounded-xl"
                autoFocus
              />
            </div>
            <div className="space-y-1.5 max-h-[340px] overflow-y-auto">
              {filteredPatients.map((p) => {
                const pkgs = MOCK_PATIENT_PACKAGES[p.id] || [];
                const cat: PatientCategory = pkgs.length > 0 ? "package" : p.totalVisits > 1 ? "returning" : "new";
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPatient(p.id)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-blue-400 hover:bg-blue-500/10 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold flex-shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground text-sm truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.mrn} · {p.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className={cn("text-[10px]",
                        cat === "package" ? "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20" :
                        cat === "returning" ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20" :
                        "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                      )}>
                        {cat === "package" ? "📦 Package" : cat === "returning" ? "🔄 Returning" : "🆕 New"}
                      </Badge>
                      {p.lastVisit && (
                        <span className="text-[10px] text-muted-foreground">Last: {p.lastVisit}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <Button variant="outline" className="w-full rounded-xl text-sm gap-2" onClick={() => { setSelectedPatientId(""); setStep("type"); }}>
              <Plus className="h-3.5 w-3.5" /> New Patient (Walk-in)
            </Button>
          </div>
        )}

        {/* ──── STEP 2: Visit Type Selection ──── */}
        {step === "type" && (
          <div className="space-y-4">
            {/* Patient context banner */}
            {patient && (
              <div className="bg-muted/50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-medium text-foreground text-sm">{patient.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{patient.mrn}</span>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px]",
                    patientCategory === "package" ? "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30" :
                    patientCategory === "returning" ? "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30" :
                    patientCategory === "follow-up" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30" :
                    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
                  )}>
                    {patientCategory}
                  </Badge>
                </div>
                <button onClick={() => { setSelectedPatientId(""); setStep("patient"); }} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Follow-up suggestions */}
            {followUpSuggestions.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-2">
                  <RotateCcw className="h-3.5 w-3.5" /> Follow-up Recommended
                </div>
                {followUpSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectType(s.visitType)}
                    className="w-full text-left bg-card border border-amber-500/30 rounded-lg px-3 py-2 mb-1.5 last:mb-0 hover:border-amber-500/50 transition-colors"
                  >
                    <div className="text-sm font-medium text-foreground">{s.reason}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Last: {s.lastVisitDate} · Suggested: {s.suggestedDate} · {s.intervalDays} days
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Package info */}
            {patientPackages.length > 0 && (
              <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400 text-xs font-semibold mb-2">
                  <Package className="h-3.5 w-3.5" /> Active Packages
                </div>
                {patientPackages.map((pkg) => (
                  <div key={pkg.id} className="bg-card border border-violet-500/30 rounded-lg px-3 py-2 mb-1.5 last:mb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{pkg.name}</span>
                      <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30">
                        {pkg.completedSessions}/{pkg.totalSessions} done
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {pkg.remainingSessions} remaining · Expires: {pkg.expiresAt}
                      {pkg.nextDueDate && ` · Next due: ${pkg.nextDueDate}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Visit type grid */}
            <div className="grid grid-cols-2 gap-2">
              {DERMA_VISIT_TYPES.map((vt) => (
                <button
                  key={vt.id}
                  onClick={() => handleSelectType(vt.id)}
                  className={cn(
                    "text-left px-3.5 py-3 rounded-xl border transition-all hover:shadow-sm",
                    visitType === vt.id ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border hover:border-border/80"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{vt.icon}</span>
                    <span className="font-medium text-sm text-foreground">{vt.label}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{vt.defaultDuration} min · {vt.description}</div>
                  <div className="flex gap-1 mt-1.5">
                    {vt.requiresRoom && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400">Room</span>}
                    {vt.requiresMachine && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400">Machine</span>}
                    {vt.requiresAssistant && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400">Staff</span>}
                  </div>
                </button>
              ))}
            </div>

            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setStep("patient")}>
              ← Back to patient search
            </Button>
          </div>
        )}

        {/* ──── STEP 3: Slot & Resources ──── */}
        {step === "slot" && visitConfig && (
          <div className="space-y-4">
            {/* Context bar */}
            <div className="flex items-center gap-2 flex-wrap">
              {patient && (
                <Badge variant="outline" className="text-xs bg-muted/50">{patient.name}</Badge>
              )}
              <Badge variant="outline" className={cn("text-xs", visitConfig.color)}>
                {visitConfig.icon} {visitConfig.label}
              </Badge>
              <Badge variant="outline" className="text-xs bg-muted/50">{visitConfig.defaultDuration} min</Badge>
              {visitConfig.bufferAfter > 0 && (
                <Badge variant="outline" className="text-xs bg-muted/50">+{visitConfig.bufferAfter}m buffer</Badge>
              )}
            </div>

            {/* Doctor */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Doctor</label>
              <Select value={doctorId} onValueChange={setDoctorId}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  {DERMA_DOCTORS.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name} — {d.specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left rounded-xl h-10", !selectedDate && "text-muted-foreground")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="single" selected={selectedDate} onSelect={setSelectedDate}
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="p-3 pointer-events-auto" initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Time Slot</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Pick time" /></SelectTrigger>
                  <SelectContent>
                    {availableSlots.length === 0 && (
                      <SelectItem value="" disabled>Select a doctor first</SelectItem>
                    )}
                    {availableSlots.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resource fields — only shown when needed */}
            {(visitConfig.requiresRoom || visitConfig.requiresMachine || visitConfig.requiresAssistant) && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                  <Zap className="h-3.5 w-3.5" /> Resource Requirements
                </div>
                {visitConfig.requiresRoom && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Room</label>
                    <Select value={roomId} onValueChange={setRoomId}>
                      <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue placeholder="Select room" /></SelectTrigger>
                      <SelectContent>
                        {rooms.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} {!r.available ? `(busy${r.nextAvailable ? ` → ${r.nextAvailable}` : ""})` : "✓"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {visitConfig.requiresMachine && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Machine / Device</label>
                    <Select value={machineId} onValueChange={setMachineId}>
                      <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue placeholder="Select machine" /></SelectTrigger>
                      <SelectContent>
                        {machines.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} {!r.available ? `(unavailable${r.nextAvailable ? ` → ${r.nextAvailable}` : ""})` : "✓"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {visitConfig.requiresAssistant && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Assistant / Nurse</label>
                    <Select value={assistantId} onValueChange={setAssistantId}>
                      <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue placeholder="Select staff" /></SelectTrigger>
                      <SelectContent>
                        {staff.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} {!r.available ? `(busy${r.nextAvailable ? ` → ${r.nextAvailable}` : ""})` : "✓"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Conflicts */}
            {conflicts.length > 0 && (
              <div className="space-y-1.5">
                {conflicts.map((c, i) => (
                  <div key={i} className={cn(
                    "flex items-start gap-2 px-3 py-2 rounded-lg text-xs border",
                    c.severity === "error" ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400" :
                    c.severity === "warning" ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400" :
                    "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400"
                  )}>
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{c.message}</span>
                      {c.suggestion && <span className="text-muted-foreground ml-1">— {c.suggestion}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Notes (optional)</label>
              <Textarea
                value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Quick note for the doctor..."
                className="rounded-xl resize-none" rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setStep("type")}>
                ← Visit type
              </Button>
              <Button
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white gap-2"
                disabled={!doctorId || !selectedTime || !selectedDate || hasBlockingConflict || submitting}
                onClick={() => setStep("confirm")}
              >
                Review & Confirm <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ──── STEP 4: Confirm ──── */}
        {step === "confirm" && visitConfig && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient</span>
                <span className="font-medium text-foreground">{patient?.name || "Walk-in"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visit Type</span>
                <span className="font-medium">{visitConfig.icon} {visitConfig.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor</span>
                <span className="font-medium">{doctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time</span>
                <span className="font-medium">{selectedDate ? format(selectedDate, "dd MMM yyyy") : ""} at {selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{visitConfig.defaultDuration} min + {visitConfig.bufferAfter}m buffer</span>
              </div>
              {roomId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room</span>
                  <span className="font-medium">{CLINIC_RESOURCES.find((r) => r.id === roomId)?.name}</span>
                </div>
              )}
              {machineId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Machine</span>
                  <span className="font-medium">{CLINIC_RESOURCES.find((r) => r.id === machineId)?.name}</span>
                </div>
              )}
              {assistantId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assistant</span>
                  <span className="font-medium">{CLINIC_RESOURCES.find((r) => r.id === assistantId)?.name}</span>
                </div>
              )}
              {patientPackages.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package</span>
                  <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30">
                    {patientPackages[0].completedSessions + 1}/{patientPackages[0].totalSessions} session
                  </Badge>
                </div>
              )}
              {notes && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notes</span>
                  <span className="text-foreground/70 text-right max-w-[200px] truncate">{notes}</span>
                </div>
              )}
            </div>

            {conflicts.filter((c) => c.severity === "warning").length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                Warnings present — confirm with judgment
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setStep("slot")}>
                ← Edit
              </Button>
              <Button
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white gap-2"
                onClick={handleBook}
                disabled={submitting}
              >
                <CheckCircle className="h-4 w-4" />
                {submitting ? "Booking..." : isReschedule ? "Confirm Reschedule" : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
