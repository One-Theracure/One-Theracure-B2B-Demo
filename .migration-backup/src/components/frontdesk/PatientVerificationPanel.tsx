import React, { useState } from "react";
import { Shield, CheckCircle, AlertTriangle, XCircle, Search, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clinicalOpsService } from "@/services/clinicalOpsService";
import { PatientVerificationAttempt, VerificationMethod, VERIFICATION_RULES } from "@/types/verification";
import { mockPatients } from "@/data/mockPatients";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  "verified": { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", label: "Verified" },
  "partial": { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Partial Match" },
  "manual-review": { icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50 border-orange-200", label: "Manual Review Required" },
  "failed": { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200", label: "Verification Failed" },
};

export default function PatientVerificationPanel() {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [method, setMethod] = useState<VerificationMethod>("mrn");
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<PatientVerificationAttempt | null>(null);
  const [history, setHistory] = useState<PatientVerificationAttempt[]>([]);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!selectedPatientId || !inputValue.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const attempt = clinicalOpsService.verifyPatient(selectedPatientId, method, inputValue);
    setResult(attempt);
    setHistory(clinicalOpsService.getVerificationHistory(selectedPatientId));
    setLoading(false);
    setInputValue("");
  };

  const loadHistory = (patientId: string) => {
    setSelectedPatientId(patientId);
    setResult(null);
    setHistory(clinicalOpsService.getVerificationHistory(patientId));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Patient Verification</h3>
            <p className="text-xs text-muted-foreground">Verify identity before check-in or appointment confirmation</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Select Patient</label>
            <Select value={selectedPatientId} onValueChange={loadHistory}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Choose patient..." />
              </SelectTrigger>
              <SelectContent>
                {mockPatients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.mrn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Verification Method</label>
            <Select value={method} onValueChange={(v) => setMethod(v as VerificationMethod)}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VERIFICATION_RULES.map((r) => (
                  <SelectItem key={r.id} value={r.method}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {VERIFICATION_RULES.find((r) => r.method === method)?.label} Input
            </label>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              placeholder={
                method === "phone" ? "Enter last 6 digits of phone" :
                method === "dob" ? "DD/MM/YYYY" :
                method === "mrn" ? "Enter MRN exactly" :
                "Enter 14-digit ABHA ID"
              }
              className="h-10 rounded-xl"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
            <strong>Note:</strong> Identity records are never auto-overwritten. Manual review is required for partial matches.
          </div>

          <Button
            onClick={handleVerify}
            disabled={!selectedPatientId || !inputValue.trim() || loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
          >
            {loading ? "Verifying..." : "Run Verification"}
          </Button>
        </div>

        {result && (
          <div className={cn("mt-5 rounded-xl border px-4 py-4", STATUS_CONFIG[result.status].bg)}>
            <div className="flex items-center gap-2 mb-2">
              {React.createElement(STATUS_CONFIG[result.status].icon, {
                className: cn("h-5 w-5", STATUS_CONFIG[result.status].color)
              })}
              <span className={cn("font-semibold text-sm", STATUS_CONFIG[result.status].color)}>
                {STATUS_CONFIG[result.status].label}
              </span>
              <Badge variant="outline" className="ml-auto text-xs">
                {result.confidenceScore}% confidence
              </Badge>
            </div>
            {result.matchedFields.length > 0 && (
              <p className="text-xs text-foreground">Matched: {result.matchedFields.join(", ")}</p>
            )}
            {result.notes && (
              <p className="text-xs text-muted-foreground mt-1">{result.notes}</p>
            )}
            <p className="text-xs text-muted-foreground/60 mt-2">Attempt ID: {result.id}</p>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Verification History</h3>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {selectedPatientId ? "No verification history for this patient." : "Select a patient to view history."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {history.map((h) => {
              const cfg = STATUS_CONFIG[h.status];
              const Icon = cfg.icon;
              return (
                <div key={h.id} className="flex items-start gap-3 px-3 py-3 rounded-xl bg-muted/50 border border-border">
                  <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", cfg.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("text-sm font-medium", cfg.color)}>{cfg.label}</span>
                      <span className="text-xs text-muted-foreground">{h.confidenceScore}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">Via {h.method}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      {new Date(h.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
