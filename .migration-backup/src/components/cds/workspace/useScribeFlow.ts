import { useCallback, useState } from "react";
import { eventBus } from "@/services/eventBus";
import { generateCDSContent } from "@/services/mockAI";
import type { CDSInputs, CDSMode, CDSOutput } from "@/types/cds";
import type { Patient } from "@/types/patient";
import type { TimelineEntry } from "./EncounterTimeline";

const MODE_TITLES: Partial<Record<CDSMode, string>> = {
  ddx: "Differential Diagnosis",
  "assessment-plan": "Assessment & Plan",
  "note-hp": "History & Physical",
  "note-progress": "Progress Note",
  "note-discharge-summary": "Discharge Summary",
  "note-discharge-instructions": "Discharge Instructions",
  "note-patient-handout": "Patient Handout",
  consult: "Clinical Q&A",
  "chart-chat": "Chart Response",
};

interface UseScribeFlowArgs {
  selectedPatient: Patient | null;
  currentEncounterId: string;
  patientInputs: CDSInputs;
  addDocumentTab: (output: CDSOutput, title: string) => void;
  appendTimelineEntry: (entry: TimelineEntry) => void;
  toast: (opts: { title: string; description?: string; variant?: "default" | "destructive" }) => void;
}

/**
 * Owns the ambient-scribe slice of EncounterWorkspace state and handlers.
 * Extracted to keep EncounterWorkspace closer to a layout shell and to make
 * the scribe flow testable in isolation.
 */
export function useScribeFlow({
  selectedPatient,
  currentEncounterId,
  patientInputs,
  addDocumentTab,
  appendTimelineEntry,
  toast,
}: UseScribeFlowArgs) {
  const [scribingModalOpen, setScribingModalOpen] = useState(false);
  const [scribeCompleteModalOpen, setScribeCompleteModalOpen] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");

  const handleStartScribing = useCallback(() => setScribingModalOpen(true), []);

  const handleScribeComplete = useCallback(
    (transcript: string) => {
      setLastTranscript(transcript);
      setScribingModalOpen(false);
      appendTimelineEntry({
        id: `tl-scribe-${Date.now()}`,
        type: "scribe",
        title: "Scribing Session",
        timestamp: new Date().toISOString(),
        status: "completed",
      });
      if (selectedPatient?.id && currentEncounterId) {
        eventBus.emit("transcript.created", {
          patientId: selectedPatient.id,
          encounterId: currentEncounterId,
          payload: { length: transcript.length },
        });
      }
      if (transcript.trim()) setScribeCompleteModalOpen(true);
    },
    [selectedPatient, currentEncounterId, appendTimelineEntry],
  );

  const handleScribeDraft = useCallback(
    async (mode: CDSMode, additionalContext: string) => {
      const title = MODE_TITLES[mode] || mode;
      try {
        const output = await generateCDSContent(
          mode,
          {
            ...patientInputs,
            chiefComplaint: additionalContext || "From ambient transcript",
            hpi: lastTranscript.slice(0, 800),
          },
          false,
          true,
          `scribe-draft-${Date.now()}`,
        );
        addDocumentTab(output, title);
        toast({ title: `${title} Ready`, description: "Document added to editor." });
      } catch {
        toast({ title: "Error", variant: "destructive" });
      }
    },
    [patientInputs, lastTranscript, addDocumentTab, toast],
  );

  return {
    scribingModalOpen,
    setScribingModalOpen,
    scribeCompleteModalOpen,
    setScribeCompleteModalOpen,
    lastTranscript,
    handleStartScribing,
    handleScribeComplete,
    handleScribeDraft,
  };
}
