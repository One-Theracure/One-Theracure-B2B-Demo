import { useState, useCallback, useEffect, useRef } from "react";
import { X, AlertTriangle, History, Save, Tag, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAutosave } from "@/hooks/useAutosave";
import { saveVersion, getVersions } from "@/services/versionHistory";
import VersionHistoryPanel from "./VersionHistoryPanel";
import ProvenanceTag, { type ProvenanceSource } from "./ProvenanceTag";

export interface DocumentTab {
  id: string;
  title: string;
  contentMarkdown: string;
  createdAt: string;
  closable: boolean;
  provenance?: ProvenanceSource;
}

interface ClinicalDocumentEditorProps {
  tabs: DocumentTab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onContentChange: (tabId: string, content: string) => void;
  onReviewCodes?: () => void;
}

const ClinicalDocumentEditor = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onContentChange,
  onReviewCodes,
}: ClinicalDocumentEditorProps) => {
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const [versionPanelOpen, setVersionPanelOpen] = useState(false);
  const [editedTabs, setEditedTabs] = useState<Set<string>>(new Set());
  const [disclaimerOpen, setDisclaimerOpen] = useState(true);
  const lastSavedContentRef = useRef<string>("");

  const autosaveData = activeTab
    ? { id: activeTab.id, content: activeTab.contentMarkdown }
    : null;

  const { status: autosaveStatus, lastSavedAt } = useAutosave(
    `doc-${activeTabId}`,
    autosaveData,
    2000
  );

  useEffect(() => {
    if (
      autosaveStatus === "saved" &&
      activeTab &&
      activeTab.contentMarkdown !== lastSavedContentRef.current &&
      activeTab.contentMarkdown.trim().length > 0
    ) {
      lastSavedContentRef.current = activeTab.contentMarkdown;
      saveVersion(activeTab.id, activeTab.contentMarkdown, "autosave");
    }
  }, [autosaveStatus, activeTab]);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (activeTab) {
        onContentChange(activeTab.id, e.target.value);
        setEditedTabs((prev) => new Set(prev).add(activeTab.id));
      }
    },
    [activeTab, onContentChange]
  );

  const handleManualSave = useCallback(() => {
    if (activeTab && activeTab.contentMarkdown.trim().length > 0) {
      saveVersion(activeTab.id, activeTab.contentMarkdown, "manual");
      lastSavedContentRef.current = activeTab.contentMarkdown;
    }
  }, [activeTab]);

  const handleRestore = useCallback(
    (content: string) => {
      if (activeTab) {
        onContentChange(activeTab.id, content);
        lastSavedContentRef.current = content;
      }
    },
    [activeTab, onContentChange]
  );

  const currentProvenance: ProvenanceSource = activeTab
    ? editedTabs.has(activeTab.id)
      ? "clinician-edited"
      : activeTab.provenance || "ai-generated"
    : "ai-generated";

  const autosaveLabel =
    autosaveStatus === "saving"
      ? "Saving..."
      : autosaveStatus === "saved" && lastSavedAt
        ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`
        : autosaveStatus === "error"
          ? "Save error"
          : "";

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border/60 overflow-hidden relative shadow-sm">
      <div className="flex items-center border-b border-border/60 bg-muted/40 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              tab.id === activeTabId
                ? "border-teal-500 text-teal-700 dark:text-teal-400 bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <span className="truncate max-w-[180px]">{tab.title}</span>
            {tab.closable && (
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="ml-1.5 p-0.5 rounded hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 px-3 py-2 border-b border-border/50 bg-muted/20 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={handleManualSave}
          title="Save version"
        >
          <Save className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Save</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => setVersionPanelOpen(true)}
          title="Version history"
        >
          <History className="h-3.5 w-3.5" />
          {activeTab && getVersions(activeTab.id).length > 0 && (
            <span className="text-[10px] text-muted-foreground/70">
              {getVersions(activeTab.id).length}
            </span>
          )}
        </Button>

        {onReviewCodes && (
          <>
            <div className="w-px h-4 bg-border mx-0.5" />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1.5 text-brand-trust hover:text-brand-navy dark:hover:text-brand-trust hover:bg-brand-soft"
              onClick={onReviewCodes}
              title="Review coding suggestions"
            >
              <Tag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Review Codes</span>
            </Button>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          {activeTab && <ProvenanceTag source={currentProvenance} />}
          {autosaveLabel && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1",
                  autosaveStatus === "error"
                   ? "text-red-600 bg-red-500/10"
                   : autosaveStatus === "saving"
                     ? "text-amber-600 bg-amber-500/10"
                     : "text-emerald-600 bg-emerald-500/10"
              )}
            >
              {autosaveStatus === "saved" && "✓ "}
              {autosaveLabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab && (
          <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 overflow-hidden shrink-0">
              <button
                onClick={() => setDisclaimerOpen((o) => !o)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-amber-700 dark:text-amber-400 text-xs hover:bg-amber-500/15 transition-colors"
              >
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                <span className="flex-1 text-left font-medium">AI CDSS Draft — for clinician review only</span>
                {disclaimerOpen ? <ChevronUp className="h-3 w-3 text-amber-500" /> : <ChevronDown className="h-3 w-3 text-amber-500" />}
              </button>
              {disclaimerOpen && (
                <div className="px-4 pb-3 text-xs text-amber-700 dark:text-amber-400 border-t border-amber-500/20 pt-2 leading-relaxed">
                  Not a diagnosis. Verify against current guidelines and full patient context before any clinical decisions. Never auto-place orders.
                </div>
              )}
            </div>

            <textarea
              value={activeTab.contentMarkdown}
              onChange={handleContentChange}
              className="flex-1 w-full p-4 text-sm leading-relaxed font-mono bg-background border border-border/80 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 min-h-0"
              placeholder="Document content will appear here..."
            />
          </div>
        )}

        {!activeTab && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <FileText className="h-8 w-8 opacity-30" />
            <p className="text-sm">Generate a document from the AI assistant</p>
          </div>
        )}
      </div>

      {activeTab && (
        <VersionHistoryPanel
          documentId={activeTab.id}
          open={versionPanelOpen}
          onClose={() => setVersionPanelOpen(false)}
          onRestore={handleRestore}
        />
      )}
    </div>
  );
};

export default ClinicalDocumentEditor;
