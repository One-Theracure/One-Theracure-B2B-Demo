import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import PatientWorkspaceHeader from "./PatientWorkspaceHeader";
import ClinicalChat from "./ClinicalChat";
import ClinicalDocumentEditor, { DocumentTab } from "./ClinicalDocumentEditor";
import { EncounterTimeline, TimelineEntry } from "./EncounterTimeline";
import ScribingModal from "./ScribingModal";
import ScribeCompleteModal from "./ScribeCompleteModal";
import UploadContextModal from "./UploadContextModal";
import ConnectEHRModal from "./ConnectEHRModal";

import ClinicalFormDrawer from "./ClinicalFormDrawer";
import DocumentOutputDrawer from "@/components/documents/DocumentOutputDrawer";
import { Patient } from "@/types/patient";
import { CDSInputs, CDSOutput } from "@/types/cds";
import { ExtractedEntity, EvidencePointer } from "@/types/document";
import { eventBus } from "@/services/eventBus";
import { encountersService } from "@/services/encountersService";
import { logger } from "@/lib/logger";
import { initializeGraphFromPatient } from "@/services/patientGraph";
import { useToast } from "@/hooks/use-toast";
import { useVisitForm } from "@/hooks/useVisitForm";
import { Activity, Clock, Sparkles, Users, MessageSquare, FileText, Eye } from "lucide-react";
import { CodingReviewDrawer } from "@/components/coding/CodingReviewDrawer";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { useWorkspaceLayout } from "@/hooks/useWorkspaceLayout";
import { cn } from "@/lib/utils";
import { useScribeFlow } from "./useScribeFlow";
import { RightPanelContent, type RightPanelView } from "./RightPanelContent";

type MobilePanel = "patients" | "chat" | "editor" | "insights";
type CentralTab = "note" | "assistant" | "documents";


const OVERVIEW_TAB: DocumentTab = {
  id: "encounter-overview",
  title: "Encounter Overview",
  contentMarkdown: "Select a patient and use the AI assistant or quick actions to generate clinical documents.\n\nGenerated documents will appear as new tabs in this editor.\n\nYou can freely edit any AI-generated content before finalizing.",
  createdAt: new Date().toISOString(),
  closable: false,
  provenance: "clinician-edited",
};

const CENTRAL_TABS: { id: CentralTab; label: string; icon: React.ElementType }[] = [
  { id: "note", label: "Note", icon: FileText },
  { id: "assistant", label: "Assistant", icon: Sparkles },
  { id: "documents", label: "Files", icon: Eye },
];

interface EncounterWorkspaceProps {
  /**
   * When provided (e.g. from the `/encounters/:id` route), the workspace
   * skips the picker-driven create call and uses this id directly. The sidebar
   * still allows switching patients, which will trigger a new encounter.
   */
  initialEncounterId?: string;
  /** Patient to pre-select. Pairs with `initialEncounterId`. */
  initialPatient?: Patient | null;
}

const EncounterWorkspace = ({
  initialEncounterId,
  initialPatient = null,
}: EncounterWorkspaceProps = {}) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient);
  const [documentTabs, setDocumentTabs] = useState<DocumentTab[]>([OVERVIEW_TAB]);
  const [activeTabId, setActiveTabId] = useState("encounter-overview");
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  // scribe state lives in useScribeFlow (see below)

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [ehrModalOpen, setEhrModalOpen] = useState(false);
  
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>("timeline");
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("patients");
  const [codingDrawerOpen, setCodingDrawerOpen] = useState(false);
  const [currentEncounterId, setCurrentEncounterId] = useState(initialEncounterId ?? "");
  const [clinicalFormOpen, setClinicalFormOpen] = useState(false);
  const [docOutputOpen, setDocOutputOpen] = useState(false);
  const [centralTab, setCentralTab] = useState<CentralTab>("note");

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const { formData, handleInputChange, handleVitalSignChange, handleMedicationsChange } = useVisitForm();

  const { toast } = useToast();
  const { sizes, saveSizes, layoutKey } = useWorkspaceLayout();

  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  const toggleLeft = useCallback(() => {
    if (leftCollapsed) leftPanelRef.current?.expand();
    else leftPanelRef.current?.collapse();
  }, [leftCollapsed]);

  const toggleRight = useCallback(() => {
    if (rightCollapsed) rightPanelRef.current?.expand();
    else rightPanelRef.current?.collapse();
  }, [rightCollapsed]);

  const deriveChiefComplaint = (p: Patient): string => {
    if (p.chronicConditions?.length) return `Follow-up for ${p.chronicConditions[0]}`;
    return "Routine follow-up visit";
  };

  const deriveHpi = (p: Patient): string => {
    const parts: string[] = [];
    parts.push(`${p.age}-year-old ${p.gender} presenting for ${deriveChiefComplaint(p).toLowerCase()}.`);
    if (p.chronicConditions?.length) parts.push(`Known history of ${p.chronicConditions.join(", ")}.`);
    if (p.allergies?.length) parts.push(`Allergies: ${p.allergies.join(", ")}.`);
    return parts.join(" ");
  };

  const patientInputs: CDSInputs = useMemo(() => {
    if (!selectedPatient) return { chiefComplaint: "", hpi: "" };
    return {
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      age: selectedPatient.age.toString(),
      gender: selectedPatient.gender,
      chiefComplaint: formData.chiefComplaint || deriveChiefComplaint(selectedPatient),
      hpi: formData.historyOfPresentIllness || deriveHpi(selectedPatient),
      allergies: formData.allergies || selectedPatient.allergies?.join(", ") || "",
      pmh: formData.pastMedicalHistory || selectedPatient.chronicConditions?.join(", ") || "",
      meds: formData.currentMedications || "",
    };
  }, [selectedPatient, formData.chiefComplaint, formData.historyOfPresentIllness, formData.allergies, formData.pastMedicalHistory, formData.currentMedications]);

  const hasFormData = !!(formData.chiefComplaint || formData.historyOfPresentIllness || formData.vitalSigns.bp || formData.vitalSigns.pulse);

  const addDocumentTab = useCallback((output: CDSOutput, title: string) => {
    const newTab: DocumentTab = {
      id: output.id,
      title,
      contentMarkdown: output.contentMarkdown,
      createdAt: output.createdAt,
      closable: true,
      provenance: "ai-generated",
    };
    setDocumentTabs((prev) => [...prev, newTab]);
    setActiveTabId(output.id);
    setCentralTab("note"); // Switch to note tab to show the new document
    setTimelineEntries((prev) => [
      { id: `tl-${output.id}`, type: "document", title, timestamp: output.createdAt, status: "draft" },
      ...prev,
    ]);
    if (selectedPatient?.id && currentEncounterId) {
      eventBus.emit("note.drafted", {
        patientId: selectedPatient.id,
        encounterId: currentEncounterId,
        payload: { mode: output.mode, title, documentId: output.id },
      });
    }
  }, [currentEncounterId, selectedPatient]);

  const navigate = useNavigate();

  // Refs let `handlePatientSelect` keep a stable identity (empty deps) while
  // still reading the latest values for dedupe guards. Using stale closure
  // values here would cause duplicate encounter creates — a clinical safety
  // bug, since two encounters for the same visit fragment the chart.
  const selectedPatientRef = useRef(selectedPatient);
  const currentEncounterIdRef = useRef(currentEncounterId);
  const initialEncounterIdRef = useRef(initialEncounterId);
  const inFlightCreateForPatientRef = useRef<string | null>(null);
  useEffect(() => { selectedPatientRef.current = selectedPatient; }, [selectedPatient]);
  useEffect(() => { currentEncounterIdRef.current = currentEncounterId; }, [currentEncounterId]);
  useEffect(() => { initialEncounterIdRef.current = initialEncounterId; }, [initialEncounterId]);

  const handlePatientSelect = useCallback((patient: Patient) => {
    // Dedupe #1: same patient already selected and an encounter is loaded —
    // re-clicking (or the route's pre-select) must not spawn a duplicate.
    if (selectedPatientRef.current?.id === patient.id && currentEncounterIdRef.current) {
      return;
    }
    // Dedupe #2: a create for this patient is already in flight (rapid
    // double-click / re-render race).
    if (inFlightCreateForPatientRef.current === patient.id) {
      return;
    }
    inFlightCreateForPatientRef.current = patient.id;

    // URL-driven mode (rendered inside `/encounters/:id`): switching patient
    // means switching encounters. We DO NOT mutate local state here — instead
    // we create the encounter and navigate so the route remounts with the new
    // id. Mutating local state would desynchronize the URL/header/timeline
    // (which key off the URL :id) from the note workspace, risking charting
    // against the wrong encounter.
    if (initialEncounterIdRef.current) {
      encountersService
        .create({
          patientId: patient.id,
          status: "active",
          visitType: "follow-up",
        })
        .then((encounter) => {
          eventBus.emit("encounter.created", {
            patientId: patient.id,
            encounterId: encounter.id,
            payload: { patientName: patient.name },
          });
          navigate(`/encounters/${encounter.id}/note?patientId=${patient.id}`);
        })
        .catch((err) => {
          logger.error("encounter.create failed", err);
        })
        .finally(() => {
          inFlightCreateForPatientRef.current = null;
        });
      return;
    }

    // Legacy embedded mode (no route id provided). Behavior preserved.
    setSelectedPatient(patient);
    initializeGraphFromPatient(patient);
    // Server-backed encounter create. Provider identity (id + name) is set
    // SERVER-SIDE from the Clerk session — we never claim to be a different
    // doctor from the client. UI updates optimistically with a temp id and
    // swaps to the persisted id when the request resolves.
    const tempId = `enc-temp-${Date.now()}`;
    setCurrentEncounterId(tempId);
    encountersService
      .create({
        patientId: patient.id,
        status: "active",
        visitType: "follow-up",
      })
      .then((encounter) => {
        setCurrentEncounterId(encounter.id);
        eventBus.emit("encounter.created", {
          patientId: patient.id,
          encounterId: encounter.id,
          payload: { patientName: patient.name },
        });
      })
      .catch((err) => {
        logger.error("encounter.create failed", err);
      })
      .finally(() => {
        inFlightCreateForPatientRef.current = null;
      });
    const overviewContent = `# ${patient.name}\n**MRN:** ${patient.mrn}  |  **Age:** ${patient.age}  |  **Gender:** ${patient.gender}\n\n## Active Conditions\n${patient.chronicConditions?.map((c) => `- ${c}`).join("\n") || "None on file"}\n\n## Allergies\n${patient.allergies?.map((a) => `- ${a}`).join("\n") || "NKDA"}\n\n## Recent Visits\n${patient.recentVisits?.map((v) => `- **${v.date}** — ${v.diagnosis} (Dr. ${v.doctor})`).join("\n") || "No recent visits"}\n\n---\n*Use the AI assistant or quick actions to generate clinical documents for this patient.*`;
    setDocumentTabs([{ ...OVERVIEW_TAB, contentMarkdown: overviewContent, createdAt: new Date().toISOString() }]);
    setActiveTabId("encounter-overview");
    setTimelineEntries([]);
    // Auto-collapse sidebar after selection on smaller screens
    if (window.innerWidth < 1280) {
      leftPanelRef.current?.collapse();
    }
    setMobilePanel("editor");
  }, []);

  const handleTabClose = useCallback((tabId: string) => {
    setDocumentTabs((prev) => prev.filter((t) => t.id !== tabId));
    if (activeTabId === tabId) setActiveTabId("encounter-overview");
  }, [activeTabId]);

  const handleContentChange = useCallback((tabId: string, content: string) => {
    setDocumentTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, contentMarkdown: content } : t)));
  }, []);

  const appendTimelineEntry = useCallback((entry: TimelineEntry) => {
    setTimelineEntries((prev) => [entry, ...prev]);
  }, []);

  // Scribe flow extracted to its own hook for testability and to keep this
  // file focused on layout composition.
  const scribe = useScribeFlow({
    selectedPatient,
    currentEncounterId,
    patientInputs,
    addDocumentTab,
    appendTimelineEntry,
    toast,
  });


  const handleTimelineSelect = useCallback((entry: TimelineEntry) => {
    const matchingTab = documentTabs.find((t) => t.title === entry.title);
    if (matchingTab) {
      setActiveTabId(matchingTab.id);
      setCentralTab("note");
    }
  }, [documentTabs]);

  const handleUploadContext = useCallback(() => {
    if (!selectedPatient) { toast({ title: "Select a patient first" }); return; }
    setUploadModalOpen(true);
  }, [selectedPatient, toast]);

  const handleEntitiesExtracted = useCallback((entities: ExtractedEntity[], _pointers: EvidencePointer[]) => {
    if (entities.length === 0) return;
    const grouped: Record<string, string[]> = {};
    entities.forEach((e) => {
      if (!grouped[e.category]) grouped[e.category] = [];
      grouped[e.category].push(e.normalizedText);
    });
    const content = `# Extracted Clinical Entities\n\n${Object.entries(grouped).map(([cat, items]) => `## ${cat.charAt(0).toUpperCase() + cat.slice(1)}s\n${items.map((i) => `- ${i}`).join("\n")}`).join("\n\n")}`;
    const newTab: DocumentTab = {
      id: `upload-entities-${Date.now()}`,
      title: "Uploaded Context",
      contentMarkdown: content,
      createdAt: new Date().toISOString(),
      closable: true,
      provenance: "uploaded-doc",
    };
    setDocumentTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setCentralTab("note");
    setTimelineEntries((prev) => [
      { id: `tl-upload-${Date.now()}`, type: "upload", title: "Patient Context Uploaded", timestamp: new Date().toISOString(), status: "completed" },
      ...prev,
    ]);
    if (selectedPatient?.id && currentEncounterId) {
      eventBus.emit("document.uploaded", { patientId: selectedPatient.id, encounterId: currentEncounterId, payload: { entityCount: entities.length } });
    }
    toast({ title: "Context Uploaded", description: `${entities.length} entities extracted.` });
  }, [toast, selectedPatient, currentEncounterId]);

  const handleInsertToNote = useCallback((text: string) => {
    setDocumentTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, contentMarkdown: t.contentMarkdown + "\n" + text, provenance: "clinician-edited" as const } : t
      )
    );
    setCentralTab("note");
    toast({ title: "Inserted into note", description: "Content added to active document." });
  }, [activeTabId, toast]);

  const mobileTabs = [
    { id: "patients" as const, label: "Patients", icon: Users },
    { id: "chat" as const, label: "Chat", icon: MessageSquare },
    { id: "editor" as const, label: "Editor", icon: FileText },
    { id: "insights" as const, label: "Insights", icon: Sparkles },
  ];

  const rightPanel = (
    <RightPanelContent
      rightPanelView={rightPanelView}
      setRightPanelView={setRightPanelView}
      timelineEntries={timelineEntries}
      selectedPatient={selectedPatient}
      currentEncounterId={currentEncounterId}
      formData={formData}
      onTimelineSelect={handleTimelineSelect}
      onInsertToNote={handleInsertToNote}
    />
  );


  // Uploaded documents list for "Documents" central tab
  const uploadedDocs = timelineEntries.filter(e => e.type === "upload" || e.type === "document");

  return (
    <div
      className="flex flex-col bg-background rounded-2xl border border-border/60 shadow-lg overflow-hidden"
      style={{ height: "calc(100vh - 220px)", minHeight: "560px", maxHeight: "calc(100vh - 160px)" }}
    >
      <PatientWorkspaceHeader
        patient={selectedPatient}
        onStartScribing={scribe.handleStartScribing}
        onUploadContext={handleUploadContext}
        onConnectEHR={() => setEhrModalOpen(true)}
        onOpenClinicalForm={() => setClinicalFormOpen(true)}
        onGenerateDocuments={() => setDocOutputOpen(true)}
        hasFormData={hasFormData}
      />

      {/* Desktop: Resizable 3-panel layout */}
      <div className="flex-1 min-h-0 hidden md:flex">
        <ResizablePanelGroup
          key={layoutKey}
          direction="horizontal"
          className="h-full"
          onLayout={(s) => saveSizes(s as number[])}
        >
          {/* Panel 1: Collapsible Patient sidebar */}
          <ResizablePanel
            ref={leftPanelRef}
            defaultSize={sizes[0]}
            minSize={14}
            maxSize={28}
            collapsible
            collapsedSize={3}
            onCollapse={() => setLeftCollapsed(true)}
            onExpand={() => setLeftCollapsed(false)}
          >
            <WorkspaceSidebar
              selectedPatientId={selectedPatient?.id}
              onPatientSelect={handlePatientSelect}
              collapsed={leftCollapsed}
              onToggleCollapse={toggleLeft}
            />
          </ResizablePanel>

          {/* Handle 1 — toggles sidebar */}
          <ResizableHandle
            collapseDirection="left"
            isCollapsed={leftCollapsed}
            onToggle={toggleLeft}
          />

          {/* Panel 2: Central workspace with tabs (Note / Assistant / Documents) */}
          <ResizablePanel defaultSize={sizes[1]} minSize={35}>
            <div className="flex flex-col h-full">
              {/* Central tab bar */}
              <div className="flex items-center border-b border-border/60 bg-muted/30 shrink-0 px-1">
                {CENTRAL_TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setCentralTab(id)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                      centralTab === id
                        ? "text-primary border-primary bg-background/80"
                        : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Central tab content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {centralTab === "note" && (
                  <div className="h-full p-2">
                    <ClinicalDocumentEditor
                      tabs={documentTabs}
                      activeTabId={activeTabId}
                      onTabSelect={setActiveTabId}
                      onTabClose={handleTabClose}
                      onContentChange={handleContentChange}
                      onReviewCodes={() => setCodingDrawerOpen(true)}
                    />
                  </div>
                )}
                {centralTab === "assistant" && (
                  <ClinicalChat
                    patientInputs={patientInputs}
                    onDocumentGenerated={addDocumentTab}
                    onUploadContext={handleUploadContext}
                  />
                )}
                {centralTab === "documents" && (
                  <div className="h-full overflow-y-auto p-4">
                    {uploadedDocs.length > 0 ? (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Generated & Uploaded Documents</h3>
                        {uploadedDocs.map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => {
                              const matchingTab = documentTabs.find((t) => t.title === doc.title);
                              if (matchingTab) {
                                setActiveTabId(matchingTab.id);
                                setCentralTab("note");
                              }
                            }}
                            className="w-full text-left px-4 py-3 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {new Date(doc.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                                  <span className="ml-2 capitalize text-muted-foreground/70">{doc.status}</span>
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">No documents yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1 max-w-[240px]">
                          Use the AI Assistant to generate notes, or upload patient context to see documents here.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          {/* Handle 2 — toggles right panel */}
          <ResizableHandle
            collapseDirection="right"
            isCollapsed={rightCollapsed}
            onToggle={toggleRight}
          />

          {/* Panel 3: Timeline / Care Path / Insights */}
          <ResizablePanel
            ref={rightPanelRef}
            defaultSize={sizes[2]}
            minSize={14}
            collapsible
            collapsedSize={0}
            onCollapse={() => setRightCollapsed(true)}
            onExpand={() => setRightCollapsed(false)}
          >
            {rightPanel}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile: Tabbed single-panel layout */}
      <div className="flex-1 min-h-0 flex flex-col md:hidden">
        <div className="flex border-b border-border/60 bg-background shrink-0">
          {mobileTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMobilePanel(id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors border-b-2",
                mobilePanel === id
                  ? "text-primary border-primary bg-primary/10"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {mobilePanel === "patients" && (
            <WorkspaceSidebar
              selectedPatientId={selectedPatient?.id}
              onPatientSelect={(p) => { handlePatientSelect(p); setMobilePanel("editor"); }}
            />
          )}
          {mobilePanel === "chat" && (
            <ClinicalChat
              patientInputs={patientInputs}
              onDocumentGenerated={(output, title) => { addDocumentTab(output, title); setMobilePanel("editor"); }}
              onUploadContext={handleUploadContext}
            />
          )}
          {mobilePanel === "editor" && (
            <div className="h-full p-2">
              <ClinicalDocumentEditor
                tabs={documentTabs}
                activeTabId={activeTabId}
                onTabSelect={setActiveTabId}
                onTabClose={handleTabClose}
                onContentChange={handleContentChange}
                onReviewCodes={() => setCodingDrawerOpen(true)}
              />
            </div>
          )}
          {mobilePanel === "insights" && rightPanel}
        </div>
      </div>

      {/* Modals */}
      <ScribingModal
        open={scribe.scribingModalOpen}
        onOpenChange={scribe.setScribingModalOpen}
        patientId={selectedPatient?.id}
        encounterId={currentEncounterId || undefined}
        onComplete={scribe.handleScribeComplete}
      />
      <ScribeCompleteModal
        open={scribe.scribeCompleteModalOpen}
        onOpenChange={scribe.setScribeCompleteModalOpen}
        transcript={scribe.lastTranscript}
        onDraft={scribe.handleScribeDraft}
      />
      <CodingReviewDrawer
        open={codingDrawerOpen}
        onOpenChange={setCodingDrawerOpen}
        noteContent={documentTabs.find((t) => t.id === activeTabId)?.contentMarkdown ?? ""}
        patientId={selectedPatient?.id ?? ""}
        encounterId={currentEncounterId}
      />
      {selectedPatient && (
        <>
          <UploadContextModal
            open={uploadModalOpen}
            onOpenChange={setUploadModalOpen}
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
            onEntitiesExtracted={handleEntitiesExtracted}
          />
          
        </>
      )}
      <ConnectEHRModal open={ehrModalOpen} onOpenChange={setEhrModalOpen} />

      <ClinicalFormDrawer
        open={clinicalFormOpen}
        onClose={() => setClinicalFormOpen(false)}
        formData={formData}
        onInputChange={handleInputChange}
        onVitalSignChange={handleVitalSignChange}
        onMedicationsChange={handleMedicationsChange}
      />

      <DocumentOutputDrawer
        open={docOutputOpen}
        onClose={() => setDocOutputOpen(false)}
        patient={selectedPatient}
        encounterId={currentEncounterId}
        noteContent={documentTabs.find((t) => t.id === activeTabId)?.contentMarkdown ?? ""}
      />
    </div>
  );
};

export default EncounterWorkspace;
