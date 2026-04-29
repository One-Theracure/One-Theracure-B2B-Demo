import { Link } from "react-router-dom";
import { useState } from "react";
import { Search, ChevronRight, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDemoStore } from "@/stores/useDemoStore";

export default function PatientList() {
  const patients = useDemoStore((s) => s.patients);
  const [q, setQ] = useState("");
  const filtered = patients.filter((p) =>
    [p.name, p.mrn, p.chronicConditions.join(" "), p.primarySpecialty].some((s) =>
      s.toLowerCase().includes(q.toLowerCase())
    )
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold font-playfair">Patients</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Longitudinal records · {patients.length} active patients · ABDM-linked records highlighted.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, MRN, or condition…"
          className="pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/patients/${p.id}`}
            className="group flex items-center gap-3 p-4 bg-card border border-border/60 rounded-xl hover:border-violet-300 hover:shadow-md transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow flex-shrink-0">
              {p.name.split(" ").slice(-1)[0].charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold truncate">{p.name}</div>
                {p.consumerAppLinked && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-[9px] font-bold uppercase">
                    <Smartphone className="h-2.5 w-2.5" /> App
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {p.age} · {p.gender} · MRN {p.mrn}
              </div>
              <div className="text-[11px] text-muted-foreground/80 truncate mt-0.5">
                {p.chronicConditions.length ? p.chronicConditions.join(" · ") : "Acute care"}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-600 transition-colors flex-shrink-0" />
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
            No patients match "{q}".
          </div>
        )}
      </div>
    </div>
  );
}
