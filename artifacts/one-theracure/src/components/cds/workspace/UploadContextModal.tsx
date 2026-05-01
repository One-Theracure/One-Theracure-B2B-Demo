import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  FileText,
  ClipboardPaste,
  AlertCircle,
  Pill,
  Activity,
  Beaker,
  ImageIcon,
  Calendar,
  Stethoscope,
  HeartPulse,
  CheckCircle2,
} from "lucide-react";
import { ExtractedEntity, EvidencePointer } from "@/types/document";
import {
  createDocumentReference,
  extractEntities,
  createEvidencePointers,
  saveDocument,
} from "@/services/documentProcessor";
import { EntityCategory } from "@/types/document";

interface UploadContextModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
  onEntitiesExtracted?: (entities: ExtractedEntity[], pointers: EvidencePointer[]) => void;
}

const CATEGORY_ICONS: Record<EntityCategory, React.ReactNode> = {
  problem: <Stethoscope className="h-3 w-3" />,
  medication: <Pill className="h-3 w-3" />,
  allergy: <AlertCircle className="h-3 w-3" />,
  lab: <Beaker className="h-3 w-3" />,
  imaging: <ImageIcon className="h-3 w-3" />,
  procedure: <Activity className="h-3 w-3" />,
  vital: <HeartPulse className="h-3 w-3" />,
  date: <Calendar className="h-3 w-3" />,
};

const CATEGORY_COLORS: Record<EntityCategory, string> = {
  problem: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
  medication: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  allergy: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  lab: "bg-brand-soft text-brand-trust border-brand-trust/20",
  imaging: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
  procedure: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
  vital: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
  date: "bg-muted text-foreground border-border",
};

const UploadContextModal: React.FC<UploadContextModalProps> = ({
  open,
  onOpenChange,
  patientId,
  patientName,
  onEntitiesExtracted,
}) => {
  const [step, setStep] = useState<"input" | "results">("input");
  const [title, setTitle] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [entities, setEntities] = useState<ExtractedEntity[]>([]);
  const [pointers, setPointers] = useState<EvidencePointer[]>([]);

  const handleExtract = useCallback(() => {
    if (!pastedText.trim()) return;

    const docTitle = title.trim() || `Document - ${new Date().toLocaleDateString()}`;
    const doc = createDocumentReference(patientId, docTitle, pastedText, "paste");
    saveDocument(doc);

    const extracted = extractEntities(doc);
    const evidencePointers = createEvidencePointers(extracted, doc);

    setEntities(extracted);
    setPointers(evidencePointers);
    setStep("results");
  }, [pastedText, title, patientId]);

  const handleConfirm = useCallback(() => {
    onEntitiesExtracted?.(entities, pointers);
    onOpenChange(false);
    setStep("input");
    setTitle("");
    setPastedText("");
    setEntities([]);
    setPointers([]);
  }, [entities, pointers, onEntitiesExtracted, onOpenChange]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setStep("input");
    setTitle("");
    setPastedText("");
    setEntities([]);
    setPointers([]);
  }, [onOpenChange]);

  const groupedEntities = entities.reduce<Record<string, ExtractedEntity[]>>((acc, e) => {
    if (!acc[e.category]) acc[e.category] = [];
    acc[e.category].push(e);
    return acc;
  }, {});

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setPastedText(text);
        if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
      };
      reader.readAsText(file);
    }
  }, [title]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Upload Patient Context
          </DialogTitle>
          <DialogDescription>
            Add clinical context for {patientName}. Paste text from referral letters, lab reports, or discharge summaries.
          </DialogDescription>
        </DialogHeader>

        {step === "input" ? (
          <>
            <div className="space-y-4 flex-1">
              <div>
                <label className="text-sm font-medium mb-1 block">Document Title</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g., Referral Letter from Dr. Smith"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <ClipboardPaste className="h-4 w-4" />
                    Paste Clinical Text
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".txt,text/plain"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <span className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Upload .txt file
                    </span>
                  </label>
                </div>
                <Textarea
                  placeholder="Paste referral letter, lab report, discharge summary, or any clinical text here..."
                  className="min-h-[200px] font-mono text-sm"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {pastedText.length} characters
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleExtract}
                disabled={!pastedText.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Extract Entities
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex-1 min-h-0">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">
                  {entities.length} entities extracted
                </span>
              </div>

              <ScrollArea className="h-[350px] pr-2">
                {Object.entries(groupedEntities).map(([category, items]) => (
                  <div key={category} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      {CATEGORY_ICONS[category as EntityCategory]}
                      <span className="text-sm font-semibold capitalize">{category}s</span>
                      <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((entity) => (
                        <span
                          key={entity.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${CATEGORY_COLORS[entity.category]}`}
                        >
                          {CATEGORY_ICONS[entity.category]}
                          {entity.normalizedText}
                          <span className="opacity-60">
                            {Math.round(entity.confidence * 100)}%
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {entities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No clinical entities detected in the provided text.</p>
                    <p className="text-xs mt-1">Try pasting a referral letter or lab report.</p>
                  </div>
                )}
              </ScrollArea>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("input")}>
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Confirm & Save
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UploadContextModal;
