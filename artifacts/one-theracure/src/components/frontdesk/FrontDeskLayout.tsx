import React, { useState } from "react";
import { ListChecks, UserCheck, Calendar, BarChart2, MonitorSmartphone, TrendingUp, Clock, Users, CheckCircle2, Plus, Zap, Stethoscope, ClipboardList } from "lucide-react";
import OperationalQueueView from "./OperationalQueueView";
import PatientVerificationPanel from "./PatientVerificationPanel";
import BookingForm from "./BookingForm";
import DailySchedule from "./DailySchedule";
import ResourceStatusBar from "./ResourceStatusBar";
import { SPECIALTY_PACKS } from "@/data/specialtyPacks";
import PatientList from "@/components/PatientList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Appointment } from "@/types/scheduling";

type FDTab = "schedule" | "book" | "queue" | "verify" | "analytics" | "patients";

const TABS: { id: FDTab; label: string; icon: React.ElementType; color: string }[] = [
  { id: "schedule", label: "Today's Schedule", icon: Calendar, color: "from-blue-600 to-indigo-600" },
  { id: "book", label: "Book Appointment", icon: Plus, color: "from-emerald-600 to-teal-600" },
  { id: "patients", label: "Patient Registry", icon: ClipboardList, color: "from-sky-600 to-blue-600" },
  { id: "queue", label: "Patient Queue", icon: ListChecks, color: "from-violet-600 to-purple-600" },
  { id: "verify", label: "Verification", icon: UserCheck, color: "from-teal-600 to-cyan-600" },
  { id: "analytics", label: "Daily Analytics", icon: BarChart2, color: "from-orange-500 to-amber-500" },
];

export default function FrontDeskLayout() {
  const [activeTab, setActiveTab] = useState<FDTab>("schedule");
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [followUpApt, setFollowUpApt] = useState<Appointment | null>(null);
  const [activeSpecialty, setActiveSpecialty] = useState<string>("");

  const handleReschedule = (apt: Appointment) => {
    setRescheduleApt(apt);
    setActiveTab("book");
  };

  const handleFollowUp = (apt: Appointment) => {
    setFollowUpApt(apt);
    setActiveTab("book");
  };

  const handleBooked = () => {
    setRescheduleApt(null);
    setFollowUpApt(null);
    setActiveTab("schedule");
  };

  const activePack = SPECIALTY_PACKS.find((p) => p.id === activeSpecialty);

  return (
    <div className="space-y-6">
      <div className="bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold font-playfair bg-gradient-to-r from-violet-900 to-purple-900 dark:from-violet-300 dark:to-purple-300 bg-clip-text text-transparent mb-1">
              Front Desk Ops
            </h2>
            <p className="text-muted-foreground text-sm">
              Scheduling, queue management, and patient verification
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Specialty context selector */}
            <Select value={activeSpecialty || "all"} onValueChange={(v) => setActiveSpecialty(v === "all" ? "" : v)}>
              <SelectTrigger className="h-9 w-[200px] rounded-xl text-xs border-border">
                <Stethoscope className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {SPECIALTY_PACKS.map((sp) => (
                  <SelectItem key={sp.id} value={sp.id}>
                    {sp.icon} {sp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border border-border rounded-xl px-3 py-2">
              <MonitorSmartphone className="h-3.5 w-3.5" />
              Front Desk Staff View
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 mt-5 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                    : "text-muted-foreground hover:bg-muted border border-border"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {activeTab === "schedule" && (
          <div className="space-y-4">
            <ResourceStatusBar activeSpecialty={activeSpecialty} />
            <DailySchedule
              onReschedule={handleReschedule}
              onFollowUp={handleFollowUp}
              activeSpecialty={activeSpecialty || undefined}
            />
          </div>
        )}
        {activeTab === "book" && (
          <div className="max-w-2xl">
            <BookingForm
              onBooked={handleBooked}
              prefillPatientId={rescheduleApt?.patientId || followUpApt?.patientId}
              prefillVisitType={followUpApt ? "follow-up" : rescheduleApt?.visitType}
              prefillSpecialty={rescheduleApt?.specialty || followUpApt?.specialty}
              isReschedule={!!rescheduleApt}
              activeSpecialty={activeSpecialty}
            />
          </div>
        )}
        {activeTab === "queue" && <OperationalQueueView />}
        {activeTab === "patients" && <PatientList />}
        {activeTab === "verify" && <PatientVerificationPanel />}
        {activeTab === "analytics" && <FrontDeskAnalytics />}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function FrontDeskAnalytics() {
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="space-y-5">
      <div className="bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Daily Ops Summary</h3>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
          <span className="text-xs text-muted-foreground bg-muted/50 border border-border px-3 py-1.5 rounded-lg">Mock data</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Booked Today" value="32" sub="+5 vs yesterday" color="from-violet-500 to-purple-600" />
          <StatCard icon={CheckCircle2} label="Completed" value="21" sub="66% completion rate" color="from-emerald-500 to-teal-600" />
          <StatCard icon={Clock} label="Avg Wait" value="18 min" sub="Target: ≤20 min" color="from-amber-500 to-orange-500" />
          <StatCard icon={TrendingUp} label="Follow-ups Due" value="8" sub="Across specialties" color="from-blue-500 to-indigo-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-card/90 rounded-2xl border border-border/50 shadow-sm p-5">
          <h4 className="text-sm font-semibold text-foreground mb-3">Appointment Status Breakdown</h4>
          {[
            { label: "Completed", value: 21, pct: 66, color: "bg-emerald-500" },
            { label: "In Consult / Procedure", value: 4, pct: 12, color: "bg-blue-500" },
            { label: "Waiting / Arrived", value: 3, pct: 10, color: "bg-amber-500" },
            { label: "No-Show", value: 2, pct: 6, color: "bg-red-400" },
            { label: "Booked", value: 2, pct: 6, color: "bg-muted-foreground" },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3 mb-2.5">
              <span className="text-xs text-muted-foreground w-40 shrink-0">{row.label}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${row.color} rounded-full transition-all`} style={{ width: `${row.pct}%` }} />
              </div>
              <span className="text-xs font-medium text-foreground w-6 text-right">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-card/90 rounded-2xl border border-border/50 shadow-sm p-5">
          <h4 className="text-sm font-semibold text-foreground mb-3">Specialty Distribution</h4>
          {[
            { label: "Dermatology", value: 10, pct: 31, color: "bg-violet-500" },
            { label: "Dentistry", value: 6, pct: 19, color: "bg-sky-500" },
            { label: "General Practice", value: 5, pct: 16, color: "bg-blue-500" },
            { label: "Cardiology", value: 4, pct: 12, color: "bg-red-400" },
            { label: "Pediatrics", value: 4, pct: 12, color: "bg-pink-400" },
            { label: "Others", value: 3, pct: 10, color: "bg-muted-foreground" },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3 mb-2.5">
              <span className="text-xs text-muted-foreground w-40 shrink-0">{row.label}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${row.color} rounded-full transition-all`} style={{ width: `${row.pct}%` }} />
              </div>
              <span className="text-xs font-medium text-foreground w-6 text-right">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
