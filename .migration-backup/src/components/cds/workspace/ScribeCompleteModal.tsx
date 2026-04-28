import { useState } from "react";
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
import { FileText, Sparkles } from "lucide-react";
import { CDSMode } from "@/types/cds";

interface DraftOption {
  mode: CDSMode;
  label: string;
}

const DRAFT_OPTIONS: DraftOption[] = [
  { mode: "ddx", label: "DDx" },
  { mode: "assessment-plan", label: "A&P" },
  { mode: "note-hp", label: "H&P" },
  { mode: "note-progress", label: "Progress Note" },
  { mode: "note-discharge-summary", label: "DC Summary" },
  { mode: "note-discharge-instructions", label: "DC Instructions" },
  { mode: "note-patient-handout", label: "Patient Handout" },
  { mode: "consult", label: "Clinic Note" },
];

interface ScribeCompleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transcript: string;
  onDraft: (mode: CDSMode, additionalContext: string) => void;
}

const ScribeCompleteModal = ({
  open,
  onOpenChange,
  transcript,
  onDraft,
}: ScribeCompleteModalProps) => {
  const [selectedMode, setSelectedMode] = useState<CDSMode | null>(null);
  const [additionalContext, setAdditionalContext] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);

  const handleDraft = async () => {
    if (!selectedMode) return;
    setIsDrafting(true);
    try {
      await onDraft(selectedMode, additionalContext);
    } finally {
      setIsDrafting(false);
      setSelectedMode(null);
      setAdditionalContext("");
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setSelectedMode(null);
    setAdditionalContext("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-playfair">
            <Sparkles className="h-5 w-5 text-violet-500" />
            Ambient Scribing Session Complete
          </DialogTitle>
          <DialogDescription>
            Use transcript to draft a:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {DRAFT_OPTIONS.map((option) => (
              <Badge
                key={option.mode}
                variant={selectedMode === option.mode ? "default" : "outline"}
                className={`cursor-pointer text-sm px-3 py-1.5 transition-colors ${
                  selectedMode === option.mode
                    ? "bg-violet-600 text-white hover:bg-violet-700"
                    : "hover:bg-violet-500/10 hover:border-violet-300"
                }`}
                onClick={() => setSelectedMode(option.mode)}
              >
                {option.label}
              </Badge>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Additional context (optional)
            </label>
            <Textarea
              placeholder="Add any additional context, instructions, or notes for the AI..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          {transcript && (
            <div className="max-h-32 overflow-y-auto border border-border rounded-lg p-3 bg-muted/50">
              <p className="text-xs font-medium text-muted-foreground mb-1">Transcript preview:</p>
              <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-4">
                {transcript.slice(0, 500)}
                {transcript.length > 500 ? "..." : ""}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button
            onClick={handleDraft}
            disabled={!selectedMode || isDrafting}
            className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {isDrafting ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Drafting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate Draft
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScribeCompleteModal;
