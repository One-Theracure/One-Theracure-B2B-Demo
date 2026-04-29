import { useDemo } from "@/contexts/DemoContext";
import { clinic } from "@/data/seed/clinic";

export default function Settings() {
  const { currentPersona } = useDemo();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold font-playfair">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border/60 rounded-2xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Your profile</h2>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Name" value={currentPersona?.name ?? "—"} />
            <Row label="Role" value={currentPersona?.role ?? "—"} />
            <Row label="Credentials" value={currentPersona?.credentials ?? "—"} />
            <Row label="NMC registration" value={clinic.doctorRegistration} />
          </div>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Clinic</h2>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Clinic" value={clinic.name} />
            <Row label="Address" value={clinic.address} />
            <Row label="Phone" value={clinic.phone} />
            <Row label="Reg." value={clinic.registration} />
          </div>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-5 lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">AI preferences</h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <Pref label="Default AVS language" value="English + patient choice" />
            <Pref label="Auto-approve threshold" value="High confidence only" />
            <Pref label="Red-flag escalation" value="Toast + chart pin" />
            <Pref label="Voice mode" value="Always-on ambient" />
            <Pref label="Default lab partner" value="Thyrocare" />
            <Pref label="Default pharmacy" value="1mg (in-app)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium text-right">{value}</div>
    </div>
  );
}
function Pref({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg border border-border/40 bg-muted/20">
      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">{label}</div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}
