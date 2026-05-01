import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  QrCode,
  Pill,
  Calendar,
  Stethoscope,
  ClipboardList,
  FlaskConical,
} from "lucide-react";
import type { SmartPrescriptionData } from "@/services/documentOutputService";

export const RX_PRINT_AREA_ID = "rx-print-area";

interface PrescriptionLetterheadProps {
  data: SmartPrescriptionData;
}

const PrescriptionLetterhead = ({ data }: PrescriptionLetterheadProps) => (
  <div className="space-y-4 print:p-8">
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

    <div>
      <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
        <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
        Diagnosis
      </p>
      <p className="text-sm text-foreground/80">{data.diagnosis}</p>
    </div>

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

export default PrescriptionLetterhead;
