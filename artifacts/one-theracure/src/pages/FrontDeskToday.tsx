import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Users, QrCode, Phone, Sparkles, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoStore } from "@/stores/useDemoStore";
import { cn } from "@/lib/utils";

export default function FrontDeskToday() {
  const appointments = useDemoStore((s) => s.appointments);
  const updateStatus = useDemoStore((s) => s.updateAppointmentStatus);
  const empty = useDemoStore((s) => s.devToggles.emptyAppointments);
  const list = empty ? [] : appointments;

  const checkedIn = list.filter((a) => a.status === "checked-in" || a.status === "in-progress").length;
  const completed = list.filter((a) => a.status === "completed").length;
  const waiting = list.filter((a) => a.status === "scheduled").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold font-playfair">Today's queue</h1>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · Sunrise Medical Center</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Users} color="blue" label="Booked" value={list.length} />
        <Stat icon={Clock} color="amber" label="Waiting" value={waiting} />
        <Stat icon={Sparkles} color="violet" label="In room" value={checkedIn} />
        <Stat icon={CheckCircle2} color="emerald" label="Done" value={completed} />
      </div>

      <div className="space-y-2">
        {list.map((a) => (
          <motion.div
            key={a.id}
            layout
            className="bg-card border border-border/60 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="text-center w-14 flex-shrink-0">
              <div className="text-base font-bold tabular-nums">{a.time}</div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">{a.type}</div>
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/patients/${a.patientId}`} className="text-sm font-semibold hover:text-violet-600">{a.patientName}</Link>
              <div className="text-xs text-muted-foreground">{a.reason}</div>
            </div>
            <span className={cn(
              "text-[10px] uppercase font-bold px-2 py-1 rounded-md",
              a.status === "scheduled" && "bg-muted text-muted-foreground",
              a.status === "checked-in" && "bg-blue-100 text-blue-800",
              a.status === "in-progress" && "bg-violet-100 text-violet-800",
              a.status === "completed" && "bg-emerald-100 text-emerald-800",
            )}>{a.status.replace("-", " ")}</span>
            {a.status === "scheduled" && (
              <Button size="sm" onClick={() => updateStatus(a.id, "checked-in")} className="h-8 gap-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
                <QrCode className="h-3 w-3" /> Check in
              </Button>
            )}
            {a.status === "checked-in" && (
              <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "in-progress")} className="h-8 gap-1 text-xs">
                Send to room
              </Button>
            )}
          </motion.div>
        ))}
        {list.length === 0 && (
          <div className="border-2 border-dashed border-border/60 rounded-2xl p-12 text-center">
            <Phone className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-base font-semibold">No bookings yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Walk-ins will appear once you check them in.</p>
          </div>
        )}
      </div>
    </div>
  );
}

type StatColor = "blue" | "amber" | "violet" | "emerald";
function Stat({ icon: Icon, color, label, value }: { icon: LucideIcon; color: StatColor; label: string; value: number }) {
  const cls: Record<StatColor, string> = {
    blue: "from-blue-500 to-blue-600",
    amber: "from-amber-500 to-amber-600",
    violet: "from-violet-500 to-violet-600",
    emerald: "from-emerald-500 to-emerald-600",
  };
  return (
    <div className="bg-card border border-border/60 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cls[color]} flex items-center justify-center text-white shadow`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">{label}</div>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
      </div>
    </div>
  );
}
