import { useState, useEffect } from "react";
import { History, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getVersions,
  restoreVersion,
  type DocumentVersion,
} from "@/services/versionHistory";

interface VersionHistoryPanelProps {
  documentId: string;
  open: boolean;
  onClose: () => void;
  onRestore: (content: string) => void;
}

const sourceLabels: Record<DocumentVersion["source"], string> = {
  autosave: "Autosave",
  manual: "Manual",
  "ai-generated": "AI Generated",
  restore: "Restored",
};

const sourceColors: Record<DocumentVersion["source"], string> = {
  autosave: "bg-primary/10 text-primary",
  manual: "bg-muted text-muted-foreground",
  "ai-generated": "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  restore: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

const VersionHistoryPanel = ({
  documentId,
  open,
  onClose,
  onRestore,
}: VersionHistoryPanelProps) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [preview, setPreview] = useState<DocumentVersion | null>(null);

  useEffect(() => {
    if (open) {
      setVersions(getVersions(documentId));
      setPreview(null);
    }
  }, [open, documentId]);

  const handleRestore = (versionId: string) => {
    const restored = restoreVersion(documentId, versionId);
    if (restored) {
      onRestore(restored.contentMarkdown);
      setVersions(getVersions(documentId));
    }
  };

  if (!open) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-card border-l border-border shadow-xl z-20 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <History className="h-4 w-4" />
          Version History
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {versions.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No versions saved yet.
          </div>
        )}

        <div className="divide-y divide-border">
          {versions.map((v) => (
            <div
              key={v.id}
              className={`px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                preview?.id === v.id ? "bg-primary/5" : ""
              }`}
              onClick={() => setPreview(v)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">
                  v{v.version}
                </span>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 ${sourceColors[v.source]}`}
                >
                  {sourceLabels[v.source]}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(v.savedAt).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {v.contentMarkdown.slice(0, 120)}
                {v.contentMarkdown.length > 120 ? "..." : ""}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {preview && (
        <div className="border-t border-border px-4 py-3 space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Preview v{preview.version}
          </div>
          <div className="text-xs text-foreground bg-muted rounded p-2 max-h-32 overflow-y-auto whitespace-pre-wrap font-mono">
            {preview.contentMarkdown.slice(0, 500)}
            {preview.contentMarkdown.length > 500 ? "\n..." : ""}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={() => handleRestore(preview.id)}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Restore this version
          </Button>
        </div>
      )}
    </div>
  );
};

export default VersionHistoryPanel;
