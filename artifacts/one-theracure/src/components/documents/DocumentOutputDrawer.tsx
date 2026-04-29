import { useState, useCallback, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Patient } from "@/types/patient";
import {
  generateSmartPrescription,
  generateDigitalAVS,
  SmartPrescriptionData,
  DigitalAVSData,
} from "@/services/documentOutputService";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Printer,
  Download,
  Share2,
  QrCode,
  Pill,
  Heart,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Phone,
  Stethoscope,
  ClipboardList,
  FlaskConical,
  ArrowRight,
  Shield,
} from "lucide-react";

interface DocumentOutputDrawerProps {
  open: boolean;
  onClose: () => void;
  patient: Patient | null;
  encounterId: string;
  noteContent: string;
}

const DocumentOutputDrawer = ({
  open,
  onClose,
  patient,
  encounterId,
  noteContent,
}: DocumentOutputDrawerProps) => {
  const [activeDoc, setActiveDoc] = useState<"prescription" | "avs">("prescription");
  const [rxData, setRxData] = useState<SmartPrescriptionData | null>(null);
  const [avsData, setAvsData] = useState<DigitalAVSData | null>(null);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = useCallback(async () => {
    if (!patient) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 600));
    const rx = generateSmartPrescription(patient, encounterId, noteContent);
    const avs = generateDigitalAVS(patient, encounterId, noteContent);
    setRxData(rx);
    setAvsData(avs);
    setGenerating(false);
    toast({ title: "Documents Generated", description: "Prescription & AVS ready for review." });
  }, [patient, encounterId, noteContent, toast]);

  const handlePrint = useCallback(() => {
    window.print();
    toast({ title: "Print dialog opened" });
  }, [toast]);

  const handleDownload = useCallback(() => {
    window.print();
    toast({ title: "Download", description: "Print dialog opened — select 'Save as PDF' to download." });
  }, [toast]);

  const handleShare = useCallback(() => {
    toast({ title: "Coming Soon", description: "WhatsApp share will be available shortly." });
  }, [toast]);

  const hasData = rxData || avsData;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/50 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4.5 w-4.5 text-teal-600" />
            Generate Documents
          </SheetTitle>
          {patient && (
            <p className="text-xs text-muted-foreground">
              {patient.name} · {patient.mrn} · {patient.age} yrs
            </p>
          )}
        </SheetHeader>

        {!hasData ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <Pill className="h-7 w-7 text-teal-500" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                <Heart className="h-7 w-7 text-rose-500" />
              </div>
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-sm font-medium">Smart Prescription & Patient AVS</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Auto-generates clinic-branded prescription and patient-friendly after-visit summary from this encounter's data.
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!patient || generating}
              className="gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-sm"
            >
              {generating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Documents
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <Tabs value={activeDoc} onValueChange={(v) => setActiveDoc(v as "prescription" | "avs")} className="flex-1 flex flex-col min-h-0">
              <TabsList className="mx-5 mt-3 shrink-0">
                <TabsTrigger value="prescription" className="gap-1.5 text-xs">
                  <Pill className="h-3.5 w-3.5" />
                  Prescription
                </TabsTrigger>
                <TabsTrigger value="avs" className="gap-1.5 text-xs">
                  <Heart className="h-3.5 w-3.5" />
                  Patient AVS
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 min-h-0">
                <TabsContent value="prescription" className="px-5 pb-5 mt-0">
                  {rxData && <PrescriptionView data={rxData} />}
                </TabsContent>
                <TabsContent value="avs" className="px-5 pb-5 mt-0">
                  {avsData && <AVSView data={avsData} />}
                </TabsContent>
              </ScrollArea>
            </Tabs>

            {/* Action bar */}
            <div className="border-t border-border/50 px-5 py-3 flex items-center gap-2 shrink-0 bg-muted/20">
              <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5 text-xs">
                <Printer className="h-3.5 w-3.5" />
                Print
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownload} className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
              <Button size="sm" variant="outline" onClick={handleShare} className="gap-1.5 text-xs">
                <Share2 className="h-3.5 w-3.5" />
                Send to Patient
              </Button>
              <div className="ml-auto">
                <Button size="sm" variant="ghost" onClick={onClose} className="text-xs">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

/* ─── Prescription View ─── */

const PrescriptionView = ({ data }: { data: SmartPrescriptionData }) => (
  <div className="space-y-4 pt-4 print:p-8">
    {/* Header */}
    <Card className="border-teal-200/60 bg-gradient-to-br from-teal-50/80 to-emerald-50/40 shadow-none">
      <CardContent className="p-4 space-y-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-teal-900">{data.clinicName}</h3>
            <p className="text-[11px] text-teal-700">{data.clinicAddress}</p>
            <p className="text-[11px] text-teal-700">{data.clinicPhone}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-teal-900">{data.doctorName}</p>
            <p className="text-[10px] text-teal-600">{data.doctorRegistration}</p>
          </div>
        </div>
        <Separator className="bg-teal-200/60" />
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-teal-800">
          <span><strong>Patient:</strong> {data.patientName}</span>
          <span><strong>Age/Gender:</strong> {data.patientAge} yrs / {data.patientGender}</span>
          <span><strong>MRN:</strong> {data.mrn}</span>
          <span><strong>Date:</strong> {new Date(data.generatedAt).toLocaleDateString("en-IN")}</span>
        </div>
      </CardContent>
    </Card>

    {/* Diagnosis */}
    <div>
      <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
        <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
        Diagnosis
      </p>
      <p className="text-sm text-foreground/80">{data.diagnosis}</p>
    </div>

    {/* Rx */}
    <div>
      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
        <Pill className="h-3.5 w-3.5 text-blue-600" />
        Rx — Medications
      </p>
      <div className="space-y-2">
        {data.medications.map((m, i) => (
          <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/30 border border-border/40">
            <span className="text-xs font-bold text-muted-foreground mt-0.5 w-5 shrink-0">{i + 1}.</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{m.name} — {m.dosage}</p>
              <p className="text-xs text-muted-foreground">{m.route} · {m.frequency} · {m.duration}</p>
              {m.instructions && <p className="text-[11px] text-muted-foreground/80 italic mt-0.5">{m.instructions}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Investigations */}
    {data.investigations.length > 0 && (
      <div>
        <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
          <FlaskConical className="h-3.5 w-3.5 text-violet-600" />
          Investigations Advised
        </p>
        <div className="flex flex-wrap gap-1.5">
          {data.investigations.map((inv, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{inv}</Badge>
          ))}
        </div>
      </div>
    )}

    {/* Follow-up & Instructions */}
    <div className="flex gap-3">
      <Card className="flex-1 shadow-none border-border/40">
        <CardContent className="p-3">
          <p className="text-[11px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Follow-up
          </p>
          <p className="text-xs">{data.followUp}</p>
        </CardContent>
      </Card>
      <Card className="flex-1 shadow-none border-border/40">
        <CardContent className="p-3">
          <p className="text-[11px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
            <ClipboardList className="h-3 w-3" /> Instructions
          </p>
          <p className="text-xs">{data.specialInstructions}</p>
        </CardContent>
      </Card>
    </div>

    {/* QR + Footer */}
    <div className="flex items-center justify-between pt-2 border-t border-border/40">
      <div className="flex items-center gap-2 text-muted-foreground">
        <QrCode className="h-8 w-8" />
        <div>
          <p className="text-[10px] font-medium">Scan for digital copy</p>
          <p className="text-[9px] text-muted-foreground/70">Open in One TheraCure Patient App</p>
        </div>
      </div>
      <p className="text-[9px] text-muted-foreground/60 text-right">
        Digital copy powered by One TheraCure
      </p>
    </div>
  </div>
);

/* ─── AVS View ─── */

const AVSView = ({ data }: { data: DigitalAVSData }) => (
  <div className="space-y-4 pt-4 print:p-8">
    {/* Patient-Friendly Header */}
    <Card className="border-rose-200/60 bg-gradient-to-br from-rose-50/80 to-pink-50/40 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="h-4 w-4 text-rose-500" />
          <h3 className="text-sm font-bold text-rose-900">Your Visit Summary</h3>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-0.5 text-xs text-rose-700 mt-1">
          <span>Dear <strong>{data.patientName}</strong></span>
          <span>Visit: {new Date(data.visitDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
          <span>Doctor: {data.doctorName}</span>
        </div>
      </CardContent>
    </Card>

    {/* What We Found */}
    <SectionBlock
      icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
      title="What We Found"
      items={data.whatWeFound}
    />

    {/* What You Should Do */}
    <SectionBlock
      icon={<ArrowRight className="h-3.5 w-3.5 text-blue-500" />}
      title="What You Should Do"
      items={data.whatToDo}
    />

    {/* Medications */}
    <div>
      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
        <Pill className="h-3.5 w-3.5 text-blue-500" />
        Your Medications
      </p>
      <div className="space-y-2">
        {data.medications.map((m, i) => (
          <div key={i} className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100/60">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900">{m.name}</span>
              <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-700 h-4">{m.dose}</Badge>
            </div>
            <p className="text-xs text-blue-700/80 mt-0.5">{m.howToTake}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Tests Advised */}
    {data.testsAdvised.length > 0 && (
      <div>
        <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
          <FlaskConical className="h-3.5 w-3.5 text-violet-500" />
          Tests You May Need
        </p>
        <div className="flex flex-wrap gap-1.5">
          {data.testsAdvised.map((t, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
          ))}
        </div>
      </div>
    )}

    {/* Follow-up */}
    <Card className="shadow-none border-emerald-200/60 bg-emerald-50/40">
      <CardContent className="p-3">
        <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 mb-1">
          <Calendar className="h-3.5 w-3.5" />
          Your Next Appointment
        </p>
        <p className="text-sm font-medium text-emerald-900">
          {new Date(data.followUpDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        <p className="text-xs text-emerald-700/80 mt-0.5">{data.followUpInstructions}</p>
      </CardContent>
    </Card>

    {/* Warning Signs */}
    <div>
      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
        Warning Signs — When to Seek Help
      </p>
      <div className="space-y-2">
        <div className="p-2.5 rounded-xl bg-red-50/60 border border-red-100/60">
          <p className="text-[10px] font-semibold text-red-800 mb-1">🚨 Go to Emergency Room if:</p>
          {data.warningSignsGoER.map((w, i) => (
            <p key={i} className="text-xs text-red-700 flex items-start gap-1.5">
              <span className="text-red-400 mt-0.5">•</span>{w}
            </p>
          ))}
        </div>
        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100/60">
          <p className="text-[10px] font-semibold text-amber-800 mb-1 flex items-center gap-1">
            <Phone className="h-3 w-3" /> Call our clinic if:
          </p>
          {data.warningSignsCallClinic.map((w, i) => (
            <p key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
              <span className="text-amber-400 mt-0.5">•</span>{w}
            </p>
          ))}
        </div>
      </div>
    </div>

    {/* Daily Care */}
    {data.careRoutine.length > 0 && (
      <SectionBlock
        icon={<Shield className="h-3.5 w-3.5 text-teal-500" />}
        title="Daily Care Tips"
        items={data.careRoutine}
      />
    )}

    {/* QR + Footer */}
    <div className="flex items-center justify-between pt-2 border-t border-border/40">
      <div className="flex items-center gap-2 text-muted-foreground">
        <QrCode className="h-8 w-8" />
        <div>
          <p className="text-[10px] font-medium">Scan to save this visit</p>
          <p className="text-[9px] text-muted-foreground/70">Access anytime in One TheraCure App</p>
        </div>
      </div>
      <p className="text-[9px] text-muted-foreground/60 text-right">
        Digital copy powered by One TheraCure
      </p>
    </div>
  </div>
);

/* ─── Shared Section Component ─── */

const SectionBlock = ({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) => (
  <div>
    <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
      {icon}
      {title}
    </p>
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
          <span className="text-muted-foreground mt-0.5">•</span>
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default DocumentOutputDrawer;
