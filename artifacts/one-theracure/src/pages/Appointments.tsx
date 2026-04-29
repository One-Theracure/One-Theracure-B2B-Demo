import { Link } from "react-router-dom";
import { Mic, Clock, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoStore } from "@/stores/useDemoStore";
import { cn } from "@/lib/utils";

export default function Appointments() {
  const appointments = useDemoStore((s) => s.appointments);
  const empty = useDemoStore((s) => s.devToggles.emptyAppointments);
  const list = empty ? [] : appointments;

  if (list.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold font-playfair">Today's schedule</h1>
          <p className="text-sm text-muted-foreground">No patients booked yet.</p>
        </div>
        <div className="border-2 border-dashed border-border/60 rounded-2xl p-12 text-center">
          <Clock className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-semibold">Quiet day at the clinic</h3>
          <p className="text-sm text-muted-foreground mt-1">Walk-ins will appear here as Front Desk checks them in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold font-playfair">Today's schedule</h1>
          <p className="text-sm text-muted-foreground">{list.length} patients · {list.filter(a => a.status === "completed").length} completed</p>
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
      </div>

      <div className="space-y-2">
        {list.map((a) => (
          <Link
            key={a.id}
            to={`/consultation/${a.patientId}`}
            className="flex items-center gap-4 p-4 bg-card border border-border/60 rounded-xl hover:border-violet-300 hover:shadow-md transition-all group"
          >
            <div className="text-center w-14 flex-shrink-0">
              <div className="text-lg font-bold tabular-nums">{a.time}</div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">{a.type}</div>
            </div>
            <div className="w-px self-stretch bg-border/60" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{a.patientName}</div>
              <div className="text-xs text-muted-foreground truncate">{a.reason}</div>
            </div>
            <span className={cn(
              "text-[10px] uppercase font-bold px-2 py-1 rounded-md",
              a.status === "scheduled" && "bg-muted text-muted-foreground",
              a.status === "checked-in" && "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
              a.status === "in-progress" && "bg-violet-100 text-violet-800",
              a.status === "completed" && "bg-emerald-100 text-emerald-800",
              a.status === "no-show" && "bg-red-100 text-red-800",
            )}>
              {a.status === "completed" ? <span className="inline-flex items-center gap-1"><Check className="h-3 w-3" /> Done</span>
                : a.status === "no-show" ? <span className="inline-flex items-center gap-1"><AlertCircle className="h-3 w-3" /> No show</span>
                : a.status.replace("-", " ")}
            </span>
            <Button size="sm" variant="ghost" className="h-9 gap-1 text-violet-600 group-hover:bg-violet-50">
              <Mic className="h-3.5 w-3.5" /> Open
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
