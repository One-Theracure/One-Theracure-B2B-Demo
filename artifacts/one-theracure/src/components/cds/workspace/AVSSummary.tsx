import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Patient } from '@/types/patient';
import { AVSSummary as AVSType } from '@/types/carePath';
import { generateAVS } from '@/services/avsGenerator';
import { useToast } from '@/hooks/use-toast';
import {
  FileText, Printer, CheckCircle2, AlertTriangle,
  Pill, ListChecks, Heart,
} from 'lucide-react';

interface AVSSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  encounterId: string;
  diagnosis?: string;
}

const AVSSummaryComponent = ({ open, onOpenChange, patient, encounterId, diagnosis }: AVSSummaryProps) => {
  const [avs, setAvs] = useState<AVSType | null>(null);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!patient) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = generateAVS(patient, encounterId, diagnosis || 'General visit');
    setAvs(result);
    setGenerating(false);
    toast({ title: 'After-Visit Summary Generated' });
  };

  const handlePrint = () => {
    window.print();
    toast({ title: 'Print dialog opened' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-display-sm text-brand-navy">
            <Heart className="h-5 w-5 text-rose-500 dark:text-rose-400" />
            After-Visit Summary (AVS)
          </DialogTitle>
        </DialogHeader>

        {!avs ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-rose-500 dark:text-rose-400" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Generate a patient-friendly after-visit summary with medications, next steps, and warning signs.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={!patient || generating}
              className="gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
            >
              {generating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate AVS
                </>
              )}
            </Button>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-5 py-2 print:p-8">
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4">
                <h3 className="text-base font-semibold text-foreground mb-1">
                  Visit Summary for {patient?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Date: {new Date(avs.generatedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm text-muted-foreground">Provider: {avs.providerName}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  Key Findings
                </h4>
                <ul className="space-y-1.5">
                  {avs.keyFindings.map((f, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-emerald-500 dark:text-emerald-400 mt-1">•</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <Pill className="h-4 w-4 text-primary" />
                  Your Medications
                </h4>
                <div className="space-y-2">
                  {avs.medications.map((m, i) => (
                    <div key={i} className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{m.name}</span>
                        <Badge variant="outline" className="text-xs border-primary/20 text-primary">{m.dose}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{m.instructions}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <ListChecks className="h-4 w-4 text-brand-trust" />
                  Next Steps
                </h4>
                <div className="space-y-1.5">
                  {avs.nextSteps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-border" readOnly checked={s.completed} />
                      <span className="text-foreground">{s.task}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        by {new Date(s.dueDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  Warning Signs to Watch
                </h4>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 space-y-1.5">
                  {avs.warningSignsToWatch.map((w, i) => (
                    <p key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-amber-500 dark:text-amber-400 font-bold mt-0">⚠</span>
                      {w}
                    </p>
                  ))}
                </div>
              </div>

              <div className="bg-muted border border-border rounded-lg p-4">
                <p className="text-sm text-foreground whitespace-pre-line">{avs.patientFriendlyNotes}</p>
              </div>

              <div className="text-center text-xs text-muted-foreground py-2">
                Follow-up appointment: {new Date(avs.followUpDate).toLocaleDateString('en-IN')} | Clinic: One TheraCure
              </div>
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { setAvs(null); onOpenChange(false); }}>
            Close
          </Button>
          {avs && (
            <Button onClick={handlePrint} className="gap-1.5">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AVSSummaryComponent;
