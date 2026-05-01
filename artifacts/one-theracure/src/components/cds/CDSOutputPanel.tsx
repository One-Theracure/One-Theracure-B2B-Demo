import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Copy, CheckCircle, Edit3, Save, BookOpen, ClipboardCheck, ChevronDown, ChevronUp, Hash } from "lucide-react";
import { CDSOutput, CDSCitation, ICD10Suggestion } from "@/types/cds";
import { generateICD10Suggestions } from "@/services/mockAI";
import { useToast } from "@/hooks/use-toast";
import { useCDSAuditLog } from "@/hooks/useCDSAuditLog";

interface CDSOutputPanelProps {
  output: CDSOutput;
  onFinalize: (id: string) => void;
  onUpdate: (id: string, newContent: string) => void;
}

const CitationChip = ({ c }: { c: CDSCitation }) => (
  <div className="flex items-start gap-2 p-2 bg-primary/5 border border-primary/10 rounded-lg text-sm">
    <span className="font-bold text-primary flex-shrink-0">[{c.id}]</span>
    <div className="min-w-0">
      <p className="font-medium text-foreground leading-snug">{c.title}</p>
      <p className="text-muted-foreground">{c.authors} — {c.journal} {c.year}</p>
      <div className="flex gap-1 mt-1 flex-wrap">
        <Badge variant="outline" className="text-sm px-1.5 py-0">{c.type}</Badge>
        {c.impact === "high" && <Badge className="text-sm px-1.5 py-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">High Impact</Badge>}
      </div>
    </div>
  </div>
);

const CDSOutputPanel = ({ output, onFinalize, onUpdate }: CDSOutputPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(output.contentMarkdown);
  const [copied, setCopied] = useState(false);
  const [icdCodes, setIcdCodes] = useState<ICD10Suggestion[]>([]);
  const [icdExpanded, setIcdExpanded] = useState(false);
  const [icdLoading, setIcdLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();
  const { logCopy, logFinalize, logEdit } = useCDSAuditLog();

  useEffect(() => {
    let cancelled = false;
    setIcdLoading(true);
    generateICD10Suggestions(output.contentMarkdown).then((codes) => {
      if (!cancelled) {
        setIcdCodes(codes);
        setIcdLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setIcdLoading(false);
    });
    return () => { cancelled = true; };
  }, [output.contentMarkdown]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output.contentMarkdown);
    setCopied(true);
    logCopy(output.mode);
    toast({ title: "Copied", description: "Output copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    onUpdate(output.id, editContent);
    logEdit(output.mode);
    setIsEditing(false);
    toast({ title: "Saved", description: "Your edits have been saved." });
  };

  const handleFinalize = () => {
    onFinalize(output.id);
    logFinalize(output.mode, output.id);
    toast({ title: "Finalised", description: "Output marked as final." });
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({ title: `Copied ${code}` });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const contentLines = output.contentMarkdown.split("\n");

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3 bg-accent/30 rounded-t-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold font-inter">Generated Output</CardTitle>
            <Badge variant={output.status === "final" ? "default" : "secondary"} className="text-sm">
              {output.status === "final" ? "Final" : "Draft"}
            </Badge>
            <Badge variant="outline" className="text-sm">v{output.version}</Badge>
          </div>
          <div className="flex gap-2">
            {output.status !== "final" && (
              <>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)} className="h-8 text-sm gap-1">
                  <Edit3 className="h-3.5 w-3.5" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleFinalize} className="h-8 text-sm gap-1 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10">
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  Finalise
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={handleCopy} className="h-8 text-sm gap-1">
              {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-inter">
          Generated {new Date(output.createdAt).toLocaleString("en-IN")}
        </p>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={20}
              className="font-mono text-sm resize-y"
            />
            <Button size="sm" onClick={handleSaveEdit} className="gap-1">
              <Save className="h-3 w-3" />
              Save Edits
            </Button>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            {contentLines.map((line, i) => {
              if (line.startsWith("## ")) return <h2 key={i} className="text-base font-bold font-playfair text-foreground mt-4 mb-2">{line.slice(3)}</h2>;
              if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold text-foreground mt-3 mb-1">{line.slice(4)}</h3>;
              if (line.startsWith("#### ")) return <h4 key={i} className="text-sm font-medium text-muted-foreground mt-2 mb-1">{line.slice(5)}</h4>;
              if (line.startsWith("- ")) return <li key={i} className="text-sm text-foreground ml-4 list-disc">{line.slice(2)}</li>;
              if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="text-sm font-semibold text-foreground mt-2">{line.slice(2, -2)}</p>;
              if (line.startsWith("> ")) return <blockquote key={i} className="border-l-2 border-primary/30 pl-3 text-sm text-muted-foreground italic my-2">{line.slice(2)}</blockquote>;
              if (line === "---") return <hr key={i} className="border-border my-3" />;
              if (line.trim() === "") return <div key={i} className="h-1" />;
              return <p key={i} className="text-sm text-foreground leading-relaxed">{line}</p>;
            })}
          </div>
        )}

        {output.citations.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              References
            </div>
            <div className="space-y-1.5">
              {output.citations.map((c) => (
                <CitationChip key={c.id} c={c} />
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border pt-3">
          <button
            onClick={() => setIcdExpanded(!icdExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <Hash className="h-4 w-4" />
            ICD-10 Code Suggestions
            {icdCodes.length > 0 && <Badge variant="secondary" className="text-sm">{icdCodes.length}</Badge>}
            {icdExpanded ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
          </button>
          {icdExpanded && (
            <div className="mt-2 space-y-2">
              {icdLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <div className="h-3 w-3 border border-primary/30 border-t-primary rounded-full animate-spin" />
                  Loading ICD-10 suggestions...
                </div>
              ) : icdCodes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No ICD-10 suggestions available for this content.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {icdCodes.map((icd) => (
                    <div
                      key={icd.code}
                      className="flex items-center gap-2 px-3 py-2 bg-accent border border-border rounded-lg group"
                    >
                      <span className="text-sm font-bold text-primary">{icd.code}</span>
                      <span className="text-sm text-foreground">{icd.description}</span>
                      <Badge variant="outline" className="text-sm px-1.5 py-0 text-muted-foreground">{icd.confidence}%</Badge>
                      <button
                        onClick={() => handleCopyCode(icd.code)}
                        className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === icd.code ? (
                          <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CDSOutputPanel;
