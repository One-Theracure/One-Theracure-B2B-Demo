import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Smartphone, Sparkles, Check, QrCode, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDemoStore } from "@/stores/useDemoStore";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { clinic } from "@/data/seed/clinic";

const SAMPLE = {
  name: "Mr. Karan Mehta",
  phone: "+91 98221 47710",
  age: "39",
  gender: "Male" as const,
  abdmId: "12-3456-7891-0099",
};

export default function FrontDeskRegistry() {
  const patients = useDemoStore((s) => s.patients);
  const registerPatient = useDemoStore((s) => s.registerPatient);
  const addAppointment = useDemoStore((s) => s.addAppointment);
  const [form, setForm] = useState({ name: "", phone: "", age: "", abdmId: "" });
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [registeredId, setRegisteredId] = useState<string | null>(null);

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => {
      setForm({ name: SAMPLE.name, phone: SAMPLE.phone, age: SAMPLE.age, abdmId: SAMPLE.abdmId });
      setImporting(false);
      setImported(true);
    }, 1400);
  };

  const handleRegister = () => {
    if (!form.name || !form.phone) return;
    const id = `P${String(patients.length + 1).padStart(3, "0")}`;
    registerPatient({
      id,
      name: form.name,
      age: Number(form.age) || 35,
      gender: SAMPLE.gender,
      mrn: `SMC-2026-${String(patients.length + 1).padStart(4, "0")}`,
      phone: form.phone,
      allergies: [],
      chronicConditions: [],
      abdmId: form.abdmId || undefined,
      primarySpecialty: "qr-handoff",
      status: "New",
      consumerAppLinked: !!form.abdmId,
      qrScanCount: 0,
      visits: [],
    });
    // Drop the new patient straight into today's queue as a walk-in
    // so reception can hand them off and Today's Schedule reflects it instantly.
    const now = new Date();
    const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    addAppointment({
      id: `APT-WI-${Date.now()}`,
      patientId: id,
      patientName: form.name,
      time,
      reason: "Walk-in registration · QR handoff",
      status: "checked-in",
      type: "walk-in",
      doctor: clinic.doctorName,
    });
    setRegisteredId(id);
    setForm({ name: "", phone: "", age: "", abdmId: "" });
    setImported(false);
  };

  const recent = patients.slice(0, 6);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold font-playfair">Patient registry</h1>
        <p className="text-sm text-muted-foreground">QR walk-in or manual registration. ABDM-linked patients import their entire history in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-7 bg-card border border-border/60 rounded-2xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">QR walk-in · One TheraCure app</h2>
          <div className="mt-3 flex flex-col md:flex-row gap-4 items-center">
            <div className={cn(
              "w-32 h-32 rounded-xl flex items-center justify-center transition-all",
              imported ? "bg-emerald-50 border-2 border-emerald-300" : "bg-gradient-to-br from-violet-50 to-blue-50 border-2 border-dashed border-violet-300"
            )}>
              {importing ? (
                <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
              ) : imported ? (
                <Check className="h-12 w-12 text-emerald-600" />
              ) : (
                <QrCode className="h-16 w-16 text-violet-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-relaxed">
                Patients open the One TheraCure app, tap <strong>Check in</strong>, and show their QR. Their full chart, allergies, and consent state import via ABDM in <strong>under 5 seconds</strong>.
              </p>
              <Button onClick={handleImport} disabled={importing || imported} className="mt-3 gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
                <Sparkles className="h-3.5 w-3.5" />
                {imported ? "QR scanned · history loaded" : importing ? "Loading from ABDM…" : "Simulate QR scan"}
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-5 bg-card border border-border/60 rounded-2xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><UserPlus className="h-3 w-3" /> Manual registration</h2>
          <div className="mt-3 space-y-3">
            <div>
              <Label className="text-xs">Full name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mr. Karan Mehta" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 …" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Age</Label>
                <Input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="39" className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">ABHA ID (optional)</Label>
              <Input value={form.abdmId} onChange={(e) => setForm({ ...form, abdmId: e.target.value })} placeholder="12-3456-7891-XXXX" className="mt-1" />
            </div>
            <Button onClick={handleRegister} disabled={!form.name || !form.phone} className="w-full gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
              <Check className="h-3.5 w-3.5" /> Register & add to today's queue
            </Button>
          </div>
        </motion.div>
      </div>

      {registeredId && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 text-sm text-emerald-900 dark:text-emerald-100"
        >
          <Check className="h-4 w-4 text-emerald-600" />
          <span><strong>Registered.</strong> Walk-in slot created for now in Today's Schedule.</span>
          <Button asChild size="sm" variant="outline" className="ml-auto h-7 text-xs gap-1 border-emerald-300 text-emerald-800 hover:bg-emerald-100">
            <Link to="/frontdesk"><Calendar className="h-3 w-3" /> View today's queue</Link>
          </Button>
        </motion.div>
      )}

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">Recent patients</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recent.map((p) => (
            <Link key={p.id} to={`/patients/${p.id}`} className="flex items-center gap-3 p-3 bg-card border border-border/60 rounded-xl hover:border-violet-300 transition-all">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{p.name.split(" ").slice(-1)[0][0]}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{p.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">MRN {p.mrn}</div>
              </div>
              {p.consumerAppLinked && <Smartphone className="h-3 w-3 text-emerald-600 flex-shrink-0" />}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
