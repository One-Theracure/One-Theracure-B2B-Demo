import { useCallback, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Patient } from "@/types/patient";
import {
  generateSmartPrescription,
  type SmartPrescriptionData,
} from "@/services/documentOutputService";
import PrescriptionLetterhead, { RX_PRINT_AREA_ID } from "./PrescriptionLetterhead";

export interface PrintRxButtonProps {
  patient: Patient;
  /** Optional historical visit context — overrides defaults on the generated Rx. */
  visit?: {
    date?: string;
    diagnosis?: string;
    doctor?: string;
    encounterId?: string;
  };
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  iconOnly?: boolean;
  title?: string;
}

/**
 * Reusable "Print Rx" affordance available to every persona (doctor,
 * front-desk, admin, patient timeline). Opens a modal preview of the
 * Rx letterhead and prints via the shared #rx-print-area stylesheet.
 */
const PrintRxButton = ({
  patient,
  visit,
  label = "Print Rx",
  variant = "outline",
  size = "sm",
  className,
  iconOnly = false,
  title,
}: PrintRxButtonProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const rxData = useMemo<SmartPrescriptionData>(() => {
    const base = generateSmartPrescription(
      patient,
      visit?.encounterId ?? `reprint-${patient.id}-${visit?.date ?? "latest"}`,
      "",
    );
    return {
      ...base,
      diagnosis: visit?.diagnosis || base.diagnosis,
      doctorName: visit?.doctor || base.doctorName,
      generatedAt: visit?.date ? new Date(visit.date).toISOString() : base.generatedAt,
    };
  }, [patient, visit?.encounterId, visit?.date, visit?.diagnosis, visit?.doctor]);

  const handlePrint = useCallback(() => {
    window.print();
    toast({
      title: "Print dialog opened",
      description: "Choose your printer or 'Save as PDF'.",
    });
  }, [toast]);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn("gap-1.5", className)}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title={title ?? label}
      >
        <Printer className={cn("h-3.5 w-3.5", !iconOnly && "shrink-0")} />
        {!iconOnly && <span>{label}</span>}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 max-h-[90vh] flex flex-col print:hidden">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/50 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Printer className="h-4 w-4 text-teal-600" />
              Reprint Prescription
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {patient.name} · {patient.mrn}
              {visit?.date && ` · ${new Date(visit.date).toLocaleDateString("en-IN")}`}
            </p>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0 px-5 py-4">
            <div id={RX_PRINT_AREA_ID}>
              <PrescriptionLetterhead data={rxData} />
            </div>
          </ScrollArea>

          <div className="border-t border-border/50 px-5 py-3 flex items-center gap-2 shrink-0 bg-muted/20">
            <Button
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Save as PDF
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="ml-auto text-xs">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrintRxButton;
