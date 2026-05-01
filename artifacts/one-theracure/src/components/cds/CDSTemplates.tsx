import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CDSTemplate, CDSMode } from "@/types/cds";
import { useToast } from "@/hooks/use-toast";
import { useCDSAuditLog } from "@/hooks/useCDSAuditLog";
import { PlusCircle, Trash2, Edit3, Eye, Save, X, Settings2 } from "lucide-react";

const STORAGE_KEY = "cds_templates";

const MODE_LABELS: Record<CDSMode, string> = {
  consult: "Ask Questions", ddx: "Differential Dx", "assessment-plan": "Assessment & Plan",
  summarize: "Chart Summary", "chart-chat": "Chart Chat", "med-assist": "Med Assist",
  "patient-instructions": "Patient Instructions", "previsit-summary": "Pre-Visit Summary",
  "conditions-advisor": "Conditions Advisor", "hospital-stay-summary": "Hospital Stay Summary",
  "note-hp": "H&P Note", "note-progress": "Progress Note",
  "note-discharge-summary": "Discharge Summary", "note-discharge-instructions": "Discharge Instructions",
  "note-patient-handout": "Patient Handout", "note-referral": "Referral Letter",
};

const DEFAULT_TEMPLATES: CDSTemplate[] = [
  {
    id: "tpl-001", clinicId: "clinic-001", userId: "user123",
    type: "note-hp", name: "Standard H&P (OneThera Default)",
    body: `Chief Complaint: {{chiefComplaint}}

HPI:
{{hpi}}

PMH: {{pmh}}
Medications: {{medications}}
Allergies: {{allergies}}

Vitals: {{vitals}}

Exam:
[Clinician to complete]

Assessment & Plan:
[To be generated]`,
    isDefault: true, updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-002", clinicId: "clinic-001",
    type: "note-progress", name: "Standard Progress Note",
    body: `Interval: {{hpi}}

Vitals: {{vitals}}
Exam: [To complete]
Labs: {{labs}}

A&P:
1. {{chiefComplaint}} — [Management]`,
    isDefault: true, updatedAt: new Date().toISOString(),
  },
];

const AVAILABLE_VARS = [
  "{{chiefComplaint}}", "{{hpi}}", "{{patientName}}", "{{age}}", "{{gender}}",
  "{{vitals}}", "{{labs}}", "{{medications}}", "{{pmh}}", "{{allergies}}",
];

const loadTemplates = (): CDSTemplate[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_TEMPLATES;
  } catch { return DEFAULT_TEMPLATES; }
};
const saveTemplates = (tpls: CDSTemplate[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tpls)); } catch { /* full */ }
};

const CDSTemplates = () => {
  const [templates, setTemplates] = useState<CDSTemplate[]>(loadTemplates);
  const [editing, setEditing] = useState<CDSTemplate | null>(null);
  const [previewing, setPreviewing] = useState<CDSTemplate | null>(null);
  const [newMode, setNewMode] = useState<CDSMode>("note-hp");
  const [newName, setNewName] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const { toast } = useToast();
  const { getLog } = useCDSAuditLog();

  useEffect(() => { saveTemplates(templates); }, [templates]);

  const handleCreate = () => {
    if (!newName.trim() || !newBody.trim()) {
      toast({ title: "Name and body required.", variant: "destructive" });
      return;
    }
    const tpl: CDSTemplate = {
      id: `tpl-${Date.now()}`, clinicId: "clinic-001", userId: "user123",
      type: newMode, name: newName, body: newBody, isDefault: newIsDefault,
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, tpl]);
    setNewName(""); setNewBody(""); setShowCreate(false);
    toast({ title: "Template created." });
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    setTemplates((prev) => prev.map((t) => t.id === editing.id ? { ...editing, updatedAt: new Date().toISOString() } : t));
    setEditing(null);
    toast({ title: "Template saved." });
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Template deleted." });
  };

  const auditLog = getLog().slice(0, 20);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-display-lg text-brand-navy">Templates & Preferences</h2>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">
          Manage per-doctor and clinic-wide templates for note generation. Use{" "}
          <code className="bg-muted px-1 rounded text-sm">{"{{variable}}"}</code> placeholders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base font-inter">Note Templates</h3>
            <Button size="sm" onClick={() => setShowCreate(!showCreate)} className="gap-1 text-sm bg-brand-trust hover:bg-brand-navy">
              <PlusCircle className="h-3.5 w-3.5" />
              New Template
            </Button>
          </div>

          {showCreate && (
            <Card className="border-brand-trust/25 bg-brand-soft/60">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Create New Template</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-sm">Template Name</Label>
                    <Input className="h-9 text-sm" placeholder="e.g. Dr. Deshpande H&P" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Note Type</Label>
                    <Select value={newMode} onValueChange={(v) => setNewMode(v as CDSMode)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(MODE_LABELS).map(([v, l]) => <SelectItem key={v} value={v} className="text-sm">{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Template Body</Label>
                  <Textarea className="text-sm font-mono resize-none" rows={8} placeholder="Enter template with {{variables}}" value={newBody} onChange={(e) => setNewBody(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="default-toggle" checked={newIsDefault} onCheckedChange={setNewIsDefault} />
                  <Label htmlFor="default-toggle" className="text-sm cursor-pointer">Set as default for this note type</Label>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreate} className="gap-1 text-sm"><Save className="h-3 w-3" />Save Template</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)} className="text-sm"><X className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {templates.map((tpl) => (
              <Card key={tpl.id} className="border border-border">
                {editing?.id === tpl.id ? (
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-sm">Name</Label>
                        <Input className="h-9 text-sm" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Type</Label>
                        <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as CDSMode })}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(MODE_LABELS).map(([v, l]) => <SelectItem key={v} value={v} className="text-sm">{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Textarea className="text-sm font-mono resize-none" rows={8} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit} className="gap-1 text-sm"><Save className="h-3 w-3" />Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(null)} className="text-sm"><X className="h-3 w-3" /></Button>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{tpl.name}</span>
                          <Badge variant="outline" className="text-sm">{MODE_LABELS[tpl.type]}</Badge>
                          {tpl.isDefault && <Badge className="text-sm bg-green-500/10 text-green-700 dark:text-green-400">Default</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Updated {new Date(tpl.updatedAt).toLocaleDateString("en-IN")}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => setPreviewing(previewing?.id === tpl.id ? null : tpl)} className="h-8 w-8 p-0"><Eye className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(tpl)} className="h-8 w-8 p-0"><Edit3 className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(tpl.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    {previewing?.id === tpl.id && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">{tpl.body}</pre>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Settings2 className="h-4 w-4" />Available Variables</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {AVAILABLE_VARS.map((v) => (
                <code key={v} className="block text-sm bg-muted px-2 py-1 rounded font-mono">{v}</code>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Audit Log (Recent)</CardTitle></CardHeader>
            <CardContent>
              {auditLog.length === 0 ? (
                <p className="text-sm text-muted-foreground">No entries yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {auditLog.map((entry) => (
                    <div key={entry.id} className="text-sm border-b border-border pb-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge variant="outline" className="text-sm px-1.5">{entry.action}</Badge>
                        <span className="text-muted-foreground">{entry.mode}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default CDSTemplates;
