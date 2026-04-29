import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink } from "lucide-react";
import { useDemoStore } from "@/stores/useDemoStore";
import { clinic } from "@/data/seed/clinic";
import { cn } from "@/lib/utils";

export default function AdminSettings() {
  const integrations = useDemoStore((s) => s.integrations);
  const personas = ["Dr. Priya Sharma · Consultant Physician", "Dr. Rahul Desai · Cardiologist (visiting Wed)", "Dr. Neha Kulkarni · Dermatologist (visiting Sat)"];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold font-playfair">Clinic settings</h1>
        <p className="text-sm text-muted-foreground">Operational toggles, doctor roster, integration partners.</p>
      </div>

      <section className="bg-card border border-border/60 rounded-2xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Clinic profile</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Field label="Name" value={clinic.name} />
          <Field label="Phone" value={clinic.phone} />
          <Field label="Address" value={clinic.address} className="sm:col-span-2" />
          <Field label="MMC registration" value={clinic.registration} />
          <Field label="Tagline" value={clinic.tagline} />
        </div>
      </section>

      <section className="bg-card border border-border/60 rounded-2xl p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Doctor roster</h2>
          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs"><Plus className="h-3 w-3" /> Invite doctor</Button>
        </div>
        <ul className="mt-3 space-y-2">
          {personas.map((p, i) => (
            <li key={i} className="flex items-center gap-3 p-3 border border-border/40 rounded-xl bg-muted/20">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{p.split(" ")[1][0]}</div>
              <div className="text-sm flex-1">{p}</div>
              <span className="text-[10px] uppercase font-bold text-emerald-700">Active</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-card border border-border/60 rounded-2xl p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Integrations</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Toggle partners on/off · request new connections.</p>
          </div>
          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs"><Plus className="h-3 w-3" /> Browse marketplace</Button>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {integrations.map((i) => (
            <div key={i.id} className="flex items-center gap-3 p-3 border border-border/40 rounded-xl">
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
                i.status === "connected" ? "bg-gradient-to-br from-blue-500 to-violet-600" : "bg-slate-300 text-slate-700"
              )}>{i.logoLetter}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{i.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{i.category}</div>
              </div>
              {i.status === "available" ? (
                <Button size="sm" variant="ghost" className="h-7 text-[11px] gap-1 text-violet-600">Connect <ExternalLink className="h-3 w-3" /></Button>
              ) : (
                <Switch defaultChecked={i.status === "connected"} />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card border border-border/60 rounded-2xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Compliance</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Compliance label="ABDM consent flow" status="Configured" />
          <Compliance label="DISHA / DPDP audit log" status="Enabled" />
          <Compliance label="Doctor signature" status="Digital · NMC-verified" />
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("p-3 rounded-lg bg-muted/20 border border-border/40", className)}>
      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">{label}</div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}
function Compliance({ label, status }: { label: string; status: string }) {
  return (
    <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
      <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wide">{label}</div>
      <div className="text-sm font-semibold mt-0.5 text-emerald-900 dark:text-emerald-200">✓ {status}</div>
    </div>
  );
}
