import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Patient } from "@/types/patient";
import { Mic, Upload, Link, ShieldCheck, ClipboardList, FileOutput, CalendarClock } from "lucide-react";
import { clinicalOpsService } from "@/services/clinicalOpsService";
import { SPECIALTY_PACKS } from "@/data/specialtyPacks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PatientWorkspaceHeaderProps {
  patient: Patient | null;
  onStartScribing?: () => void;
  onUploadContext?: () => void;
  onConnectEHR?: () => void;
  onOpenClinicalForm?: () => void;
  onGenerateDocuments?: () => void;
  hasFormData?: boolean;
}

const PatientWorkspaceHeader: React.FC<PatientWorkspaceHeaderProps> = ({
  patient,
  onStartScribing,
  onUploadContext,
  onConnectEHR,
  onOpenClinicalForm,
  onGenerateDocuments,
  hasFormData,
}) => {
  const specialtyPack = useMemo(() => 
    patient ? SPECIALTY_PACKS.find(p => p.label.toLowerCase() === patient.specialty?.toLowerCase()) : undefined,
    [patient?.specialty]
  );

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-14 border-b border-border/50 bg-muted/20 px-4">
        <p className="text-sm text-muted-foreground">Select a patient to begin</p>
      </div>
    );
  }

  const dobDisplay = `${patient.age} yrs, ${patient.gender}`;
  const encounterNumber = `ENC-${patient.id.replace("P", "")}`;
  const latestVerification = clinicalOpsService.getLatestVerification(patient.id);
  const isVerified = latestVerification?.status === "verified";

  return (
    <div className="flex flex-wrap items-center justify-between min-h-14 border-b border-border/50 bg-background px-4 py-2 gap-x-4 gap-y-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
        <span className="font-semibold text-base truncate max-w-[180px]">{patient.name}</span>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Badge variant="secondary" className="shrink-0 text-xs font-medium px-1.5 py-0 h-5">
            {patient.mrn}
          </Badge>
          <span className="text-xs text-muted-foreground shrink-0">{dobDisplay}</span>
          <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">{encounterNumber}</span>
          {isVerified && (
            <Badge className="shrink-0 gap-1 text-xs px-1.5 py-0 h-5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/10">
              <ShieldCheck className="h-2.5 w-2.5" />
              Verified
            </Badge>
          )}
          {specialtyPack && (
            <Badge variant="outline" className={`shrink-0 gap-1 text-xs px-1.5 py-0 h-5 ${specialtyPack.color}`}>
              <span className="text-[10px]">{specialtyPack.icon}</span>
              {specialtyPack.label}
            </Badge>
          )}
          {specialtyPack && specialtyPack.followUpRules.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <button className="shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-1">
                  <CalendarClock className="h-3 w-3" />
                  <span className="hidden sm:inline">F/U Rules</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <p className="text-xs font-semibold mb-2 text-foreground">Follow-up Intervals — {specialtyPack.label}</p>
                <ul className="space-y-1.5">
                  {specialtyPack.followUpRules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="shrink-0 font-medium text-muted-foreground w-8 text-right">{rule.intervalDays}d</span>
                      <span className="text-foreground">{rule.reason}</span>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenClinicalForm}
          className="h-8 gap-1.5 text-xs relative"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Clinical Form</span>
          {hasFormData && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
          )}
        </Button>
        <Button
          size="sm"
          className="h-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm gap-1.5 text-xs"
          onClick={onStartScribing}
        >
          <Mic className="h-3.5 w-3.5" />
          <span>Scribe</span>
        </Button>
        <Button size="sm" variant="outline" onClick={onGenerateDocuments} className="h-8 gap-1.5 text-xs border-teal-500/30 text-teal-700 dark:text-teal-400 hover:bg-teal-500/10 hover:text-teal-800 dark:hover:text-teal-300">
          <FileOutput className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Documents</span>
        </Button>
        <Button size="sm" variant="outline" onClick={onUploadContext} className="h-8 gap-1.5 text-xs">
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Upload</span>
        </Button>
        <Button size="sm" variant="outline" onClick={onConnectEHR} className="h-8 gap-1.5 text-xs">
          <Link className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Connect EHR</span>
        </Button>
      </div>
    </div>
  );
};

export default PatientWorkspaceHeader;
