import React, { useState } from "react";
import { Calendar, Sparkles, Clock, User, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { clinicalOpsService } from "@/services/clinicalOpsService";
import { AppointmentSuggestion } from "@/types/communication";
import { mockPatients } from "@/data/mockPatients";
import { triggerCommunication } from "@/services/communicationService";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const VISIT_TYPES = ["Consultation", "Follow-up", "Check-up", "Procedure", "Telehealth"];
const REASON_LABELS: Record<AppointmentSuggestion["reason"], string> = {
  "earliest-available": "Earliest Available",
  "preferred-doctor": "Preferred Doctor",
  "follow-up-due": "Follow-up Due",
  "preferred-time": "Preferred Time",
};
const REASON_COLORS: Record<AppointmentSuggestion["reason"], string> = {
  "earliest-available": "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  "preferred-doctor": "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  "follow-up-due": "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  "preferred-time": "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
};

export default function AppointmentCopilot() {
  const { toast } = useToast();
  const [patientId, setPatientId] = useState("");
  const [visitType, setVisitType] = useState("Follow-up");
  const [preferredDoctor, setPreferredDoctor] = useState("");
  const [suggestions, setSuggestions] = useState<AppointmentSuggestion[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const doctors = clinicalOpsService.getDoctors();

  const handleGetSuggestions = async () => {
    if (!patientId) return;
    setLoading(true);
    setConfirmed(false);
    setSelectedSlot(null);
    await new Promise((r) => setTimeout(r, 700));
    const slots = clinicalOpsService.suggestAppointmentSlots(patientId, visitType, preferredDoctor || undefined);
    setSuggestions(slots.slice(0, 6));
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    const patient = mockPatients.find((p) => p.id === patientId);
    if (!patient) return;

    triggerCommunication(
      "appointment-booked",
      "whatsapp",
      patientId,
      {
        patientName: patient.name,
        doctorName: selectedSlot.doctorName,
        date: selectedSlot.date,
        time: selectedSlot.time,
      }
    );
    setConfirmed(true);
    toast({
      title: "Appointment Confirmed",
      description: `${patient.name} booked with ${selectedSlot.doctorName} on ${selectedSlot.date} at ${selectedSlot.time}. Reminder sent.`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 bg-card rounded-2xl border border-border/80 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Appointment Copilot</h3>
            <p className="text-xs text-muted-foreground">AI-powered slot suggestion with conflict detection</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Patient</label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Select patient..." />
              </SelectTrigger>
              <SelectContent>
                {mockPatients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Visit Type</label>
            <Select value={visitType} onValueChange={setVisitType}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIT_TYPES.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Preferred Doctor (optional)</label>
            <Select value={preferredDoctor} onValueChange={setPreferredDoctor}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Any available doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any available doctor</SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name} – {d.specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGetSuggestions}
            disabled={!patientId || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl"
          >
            {loading ? "Finding Best Slots..." : "Get Slot Suggestions"}
          </Button>

          <div className="bg-muted border border-border rounded-xl px-3 py-2.5 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Rules applied:</p>
            <p>• Doctor availability & clinic hours (9 AM – 8 PM)</p>
            <p>• Visit duration: Follow-up 15 min, Consultation 20 min</p>
            <p>• Conflict detection before suggestion</p>
            <p>• Staff confirmation required before final save</p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 bg-card rounded-2xl border border-border/80 shadow-sm p-6">
        <h3 className="font-semibold text-foreground mb-4">
          {suggestions.length > 0 ? "Suggested Slots" : "Slot suggestions will appear here"}
        </h3>

        {suggestions.length === 0 && !loading && (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Select a patient and click "Get Slot Suggestions"</p>
          </div>
        )}

        <div className="space-y-2.5">
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSelectedSlot(s); setConfirmed(false); }}
              className={cn(
                "w-full text-left px-4 py-3.5 rounded-xl border transition-all",
                selectedSlot?.id === s.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-border/80 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">{s.date}</span>
                      <span className="text-muted-foreground text-sm">at {s.time}</span>
                      <span className="text-xs text-muted-foreground/60">({s.duration} min)</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{s.doctorName}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={cn("text-xs", REASON_COLORS[s.reason])}>
                    {REASON_LABELS[s.reason]}
                  </Badge>
                  {s.conflictFree && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Clear
                    </span>
                  )}
                  <span className="text-xs font-semibold text-primary">{s.score}%</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedSlot && !confirmed && (
          <div className="mt-5 border-t border-border pt-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5 mb-4">
              <div className="flex items-center gap-2 text-amber-800 font-medium text-sm mb-1">
                <AlertCircle className="h-4 w-4" />
                Staff Confirmation Required
              </div>
              <p className="text-xs text-amber-700">
                Book <strong>{selectedSlot.doctorName}</strong> on <strong>{selectedSlot.date}</strong> at <strong>{selectedSlot.time}</strong> for <strong>{visitType}</strong>?
                A WhatsApp reminder will be sent automatically.
              </p>
            </div>
            <Button onClick={handleConfirm} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2">
              <CheckCircle className="h-4 w-4" />
              Confirm Appointment & Send Reminder
            </Button>
          </div>
        )}

        {confirmed && (
          <div className="mt-5 border-t border-border pt-5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-emerald-800">Appointment Confirmed</p>
              <p className="text-xs text-emerald-600 mt-1">
                {selectedSlot.doctorName} · {selectedSlot.date} · {selectedSlot.time}
              </p>
              <p className="text-xs text-emerald-500 mt-1">WhatsApp reminder queued</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
