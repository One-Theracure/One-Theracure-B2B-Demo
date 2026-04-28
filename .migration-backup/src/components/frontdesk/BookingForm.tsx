import React, { useState, useMemo, useCallback } from "react";
import {
  Search, Plus, Calendar, Clock, User, AlertTriangle, CheckCircle, Package,
  RotateCcw, Zap, ChevronRight, X, ArrowRight, Stethoscope
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
  SPECIALTY_PACKS, getSpecialtyVisitTypes, getSpecialtyDoctors, getSpecialtyResources, UNIVERSAL_VISIT_TYPES,
} from "@/data/specialtyPacks";
import { getVisitTypeConfig, getFollowUpSuggestions, detectConflicts, MOCK_PATIENT_PACKAGES } from "@/data/schedulingData";
import type { PatientCategory, VisitTypeConfig } from "@/types/scheduling";

interface Props {
  onBooked?: () => void;
  prefillPatientId?: string;
  prefillVisitType?: string;
  prefillSpecialty?: string;
  isReschedule?: boolean;
  activeSpecialty?: string;
}

export default function BookingForm({ onBooked, prefillPatientId, prefillVisitType, isReschedule, activeSpecialty, prefillSpecialty }: Props) {
  const { toast } = useToast();

  const [step, setStep] = useState<"patient" | "type" | "slot" | "confirm">(prefillPatientId ? "type" : "patient");
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(prefillPatientId || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState(prefillSpecialty || activeSpecialty || "");
  const [visitType, setVisitType] = useState(prefillVisitType || "");
  const [doctorId, setDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [roomId, setRoomId] = useState("");
  const [machineId, setMachineId] = useState("");
  const [assistantId, setAssistantId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const MAX_VISIBLE_SPECIALTIES = 6;

  const patient = mockPatients.find((p) => p.id === selectedPatientId);
  const visitConfig = visitType ? getVisitTypeConfig(visitType, selectedSpecialty) : null;
  const patientPackages = selectedPatientId ? (MOCK_PATIENT_PACKAGES[selectedPatientId] || []) : [];
  const followUpSuggestions = selectedPatientId ? getFollowUpSuggestions(selectedPatientId, selectedSpecialty) : [];
  const isReturning = patient && patient.totalVisits > 1;
  const patientCategory: PatientCategory = patientPackages.length > 0 ? "package" : followUpSuggestions.length > 0 ? "follow-up" : isReturning ? "returning" : "new";

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return mockPatients.slice(0, 5);
    const q = patientSearch.toLowerCase();
    return mockPatients.filter(
      (p) => p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q) || p.phone.includes(q)
    ).slice(0, 8);
  }, [patientSearch]);

  const availableVisitTypes = useMemo(() => getSpecialtyVisitTypes(selectedSpecialty), [selectedSpecialty]);
  const availableDoctors = useMemo(() => getSpecialtyDoctors(selectedSpecialty), [selectedSpecialty]);
  const resources = useMemo(() => getSpecialtyResources(selectedSpecialty), [selectedSpecialty]);

  const rooms = resources.filter((r) => r.type === "room" || r.type === "chair");
  const machines = resources.filter((r) => r.type === "machine" || r.type === "device");
  const staff = resources.filter((r) => r.type === "staff");

  const doctor = availableDoctors.find((d) => d.id === doctorId);
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

  const handleSelectType = (type: string) => {
    setVisitType(type);
    const config = getVisitTypeConfig(type, selectedSpecialty);
    if (config.requiresRoom) {
      const freeRoom = rooms.find((r) => r.available);
      if (freeRoom) setRoomId(freeRoom.id);
    }
    if (config.requiresMachine) {
      const freeMachine = machines.find((r) => r.available);
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
    const specialtyLabel = SPECIALTY_PACKS.find((p) => p.id === selectedSpecialty)?.label || "General";
    toast({
      title: isReschedule ? "Appointment Rescheduled" : "Appointment Booked",
      description: `${patient?.name || "Walk-in"} — ${visitConfig?.label} with ${doctor?.name} on ${selectedDate ? format(selectedDate, "dd MMM") : ""} at ${selectedTime} (${specialtyLabel})`,
    });
    setSubmitting(false);
    onBooked?.();
    setStep("patient");
    setSelectedPatientId("");
    setVisitType("");
    setDoctorId("");
    setSelectedTime("");
    setNotes("");
  };

  const specialtyPack = SPECIALTY_PACKS.find((p) => p.id === selectedSpecialty);

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
            <p className="text-xs text-muted-foreground">
              {specialtyPack ? `${specialtyPack.icon} ${specialtyPack.label}` : "Universal booking flow"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {(["patient", "type", "slot", "confirm"] as const).map((s, i) => (
            <React.Fragment key={s}>
              <span className={cn(
                "px-2 py-1 rounded-md font-medium capitalize",
                step === s ? "bg-primary/10 text-primary" : "text-muted-foreground"
              )}>
                {s}
              </span>
              {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
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
                    className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-between gap-3"
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
                        cat === "package" ? "bg-violet-50 text-violet-700 border-violet-200" :
                        cat === "returning" ? "bg-teal-50 text-teal-700 border-teal-200" :
                        "bg-blue-50 text-blue-700 border-blue-200"
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

        {/* ──── STEP 2: Specialty + Visit Type ──── */}
        {step === "type" && (
          <div className="space-y-4">
            {/* Patient context */}
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
                    patientCategory === "package" ? "bg-violet-50 text-violet-700 border-violet-200" :
                    patientCategory === "returning" ? "bg-teal-50 text-teal-700 border-teal-200" :
                    patientCategory === "follow-up" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-blue-50 text-blue-700 border-blue-200"
                  )}>
                    {patientCategory}
                  </Badge>
                </div>
                <button onClick={() => { setSelectedPatientId(""); setStep("patient"); }} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Specialty selector */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" /> Specialty
              </label>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedSpecialty("")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    !selectedSpecialty ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  All
                </button>
                {(showAllSpecialties ? SPECIALTY_PACKS : SPECIALTY_PACKS.slice(0, MAX_VISIBLE_SPECIALTIES)).map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => setSelectedSpecialty(sp.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      selectedSpecialty === sp.id
                        ? `bg-gradient-to-r ${sp.color} text-white border-transparent`
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {sp.icon} {sp.label}
                  </button>
                ))}
                {SPECIALTY_PACKS.length > MAX_VISIBLE_SPECIALTIES && (
                  <button
                    onClick={() => setShowAllSpecialties(!showAllSpecialties)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                  >
                    {showAllSpecialties ? "Show less" : `+${SPECIALTY_PACKS.length - MAX_VISIBLE_SPECIALTIES} more`}
                  </button>
                )}
              </div>
            </div>

            {/* Follow-up suggestions */}
            {followUpSuggestions.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold mb-2">
                  <RotateCcw className="h-3.5 w-3.5" /> Follow-up Recommended
                </div>
                {followUpSuggestions.slice(0, 3).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectType(s.visitType)}
                    className="w-full text-left bg-card border border-amber-200 rounded-lg px-3 py-2 mb-1.5 last:mb-0 hover:border-amber-400 transition-colors"
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
              <div className="bg-violet-50/70 border border-violet-200 rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-violet-800 text-xs font-semibold mb-2">
                  <Package className="h-3.5 w-3.5" /> Active Packages
                </div>
                {patientPackages.map((pkg) => (
                  <div key={pkg.id} className="bg-card border border-violet-200 rounded-lg px-3 py-2 mb-1.5 last:mb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{pkg.name}</span>
                      <Badge variant="outline" className="text-[10px] bg-violet-50 text-violet-700 border-violet-200">
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
              {availableVisitTypes.map((vt) => (
                <button
                  key={vt.id}
                  onClick={() => handleSelectType(vt.id)}
                  className={cn(
                    "text-left px-3.5 py-3 rounded-xl border transition-all hover:shadow-sm",
                    visitType === vt.id ? "border-primary/60 bg-primary/5 shadow-sm" : "border-border hover:border-border/80"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{vt.icon}</span>
                    <span className="font-medium text-sm text-foreground">{vt.label}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{vt.defaultDuration} min · {vt.description}</div>
                  <div className="flex gap-1 mt-1.5">
                    {vt.requiresRoom && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">Room</span>}
                    {vt.requiresMachine && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">Device</span>}
                    {vt.requiresAssistant && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">Staff</span>}
                    {vt.specialty && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{SPECIALTY_PACKS.find(s => s.id === vt.specialty)?.icon}</span>}
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
            <div className="flex items-center gap-2 flex-wrap">
              {patient && (
                <Badge variant="outline" className="text-xs bg-muted/50">{patient.name}</Badge>
              )}
              {specialtyPack && (
                <Badge variant="outline" className="text-xs bg-muted/50">{specialtyPack.icon} {specialtyPack.label}</Badge>
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
                  {availableDoctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name} — {d.subSpecialty || d.specialty}</SelectItem>
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

            {/* Resource fields — dynamic */}
            {(visitConfig.requiresRoom || visitConfig.requiresMachine || visitConfig.requiresAssistant) && (rooms.length > 0 || machines.length > 0 || staff.length > 0) && (
              <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
                  <Zap className="h-3.5 w-3.5" /> Resource Requirements
                </div>
                {visitConfig.requiresRoom && rooms.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Room / Chair</label>
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
                {visitConfig.requiresMachine && machines.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Machine / Device</label>
                    <Select value={machineId} onValueChange={setMachineId}>
                      <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue placeholder="Select device" /></SelectTrigger>
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
                {visitConfig.requiresAssistant && staff.length > 0 && (
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
                    c.severity === "error" ? "bg-red-50 border-red-200 text-red-700" :
                    c.severity === "warning" ? "bg-amber-50 border-amber-200 text-amber-700" :
                    "bg-blue-50 border-blue-200 text-blue-700"
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
              {specialtyPack && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Specialty</span>
                  <span className="font-medium">{specialtyPack.icon} {specialtyPack.label}</span>
                </div>
              )}
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
                  <span className="font-medium">{resources.find((r) => r.id === roomId)?.name}</span>
                </div>
              )}
              {machineId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Device</span>
                  <span className="font-medium">{resources.find((r) => r.id === machineId)?.name}</span>
                </div>
              )}
              {assistantId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assistant</span>
                  <span className="font-medium">{resources.find((r) => r.id === assistantId)?.name}</span>
                </div>
              )}
              {notes && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notes</span>
                  <span className="text-foreground text-right max-w-[200px] truncate">{notes}</span>
                </div>
              )}
            </div>

            {conflicts.filter((c) => c.severity === "warning").length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 flex items-center gap-2">
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
