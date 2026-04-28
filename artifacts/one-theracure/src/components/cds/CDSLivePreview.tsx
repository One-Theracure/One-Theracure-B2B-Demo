import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Sparkles } from "lucide-react";
import { CDSInputs } from "@/types/cds";

interface CDSLivePreviewProps {
  inputs: CDSInputs;
  generatedContent?: string;
}

const Section = ({ title, content }: { title: string; content: string }) => (
  <div>
    <h3 className="text-sm font-semibold font-playfair text-primary mb-1">{title}</h3>
    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
  </div>
);

const CDSLivePreview = ({ inputs, generatedContent }: CDSLivePreviewProps) => {
  const hasAnyInput =
    inputs.chiefComplaint?.trim() ||
    inputs.hpi?.trim() ||
    inputs.vitals?.trim() ||
    inputs.labs?.trim() ||
    inputs.meds?.trim() ||
    inputs.pmh?.trim() ||
    inputs.allergies?.trim();

  const hasPatientInfo =
    inputs.patientName?.trim() || inputs.age?.trim() || inputs.gender?.trim();

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const renderGeneratedContent = (markdown: string) => {
    const lines = markdown.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("## "))
        return (
          <h2 key={i} className="text-base font-bold font-playfair text-foreground mt-4 mb-2">
            {line.slice(3)}
          </h2>
        );
      if (line.startsWith("### "))
        return (
          <h3 key={i} className="text-sm font-semibold text-foreground mt-3 mb-1">
            {line.slice(4)}
          </h3>
        );
      if (line.startsWith("#### "))
        return (
          <h4 key={i} className="text-sm font-medium text-muted-foreground mt-2 mb-1">
            {line.slice(5)}
          </h4>
        );
      if (line.startsWith("- "))
        return (
          <li key={i} className="text-sm text-foreground ml-4 list-disc">
            {line.slice(2)}
          </li>
        );
      if (line.startsWith("**") && line.endsWith("**"))
        return (
          <p key={i} className="text-sm font-semibold text-foreground mt-2">
            {line.slice(2, -2)}
          </p>
        );
      if (line.startsWith("> "))
        return (
          <blockquote key={i} className="border-l-2 border-primary/30 pl-3 text-sm text-muted-foreground italic my-2">
            {line.slice(2)}
          </blockquote>
        );
      if (line === "---") return <hr key={i} className="border-border my-3" />;
      if (line.trim() === "") return <div key={i} className="h-1" />;
      return (
        <p key={i} className="text-sm text-foreground leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3 bg-accent/30 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold font-inter">Live Preview</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            Auto-updating
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {!hasAnyInput && !generatedContent ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Eye className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground font-inter">
              Start typing to see your note preview
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {hasPatientInfo && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  {inputs.patientName?.trim() && (
                    <div>
                      <span className="font-semibold text-primary">Patient:</span>{" "}
                      <span className="text-foreground">{inputs.patientName}</span>
                    </div>
                  )}
                  {inputs.age?.trim() && (
                    <div>
                      <span className="font-semibold text-primary">Age:</span>{" "}
                      <span className="text-foreground">{inputs.age} yr</span>
                    </div>
                  )}
                  {inputs.gender?.trim() && (
                    <div>
                      <span className="font-semibold text-primary">Gender:</span>{" "}
                      <span className="text-foreground">{inputs.gender}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-primary">Date:</span>{" "}
                    <span className="text-foreground">{today}</span>
                  </div>
                </div>
              </div>
            )}

            {inputs.chiefComplaint?.trim() && (
              <Section title="Chief Complaint" content={inputs.chiefComplaint} />
            )}

            {inputs.hpi?.trim() && (
              <>
                <Separator />
                <Section title="History of Present Illness" content={inputs.hpi} />
              </>
            )}

            {inputs.vitals?.trim() && (
              <>
                <Separator />
                <Section title="Vitals" content={inputs.vitals} />
              </>
            )}

            {inputs.labs?.trim() && (
              <>
                <Separator />
                <Section title="Labs / Investigations" content={inputs.labs} />
              </>
            )}

            {inputs.meds?.trim() && (
              <>
                <Separator />
                <Section title="Current Medications" content={inputs.meds} />
              </>
            )}

            {inputs.pmh?.trim() && (
              <>
                <Separator />
                <Section title="Past Medical History" content={inputs.pmh} />
              </>
            )}

            {inputs.allergies?.trim() && (
              <>
                <Separator />
                <Section title="Allergies" content={inputs.allergies} />
              </>
            )}

            {generatedContent && (
              <>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                      AI-Generated
                    </span>
                    <div className="flex-1 border-t border-purple-500/20" />
                  </div>
                  <div className="prose prose-sm max-w-none bg-purple-500/5 rounded-lg p-3 border border-purple-500/10">
                    {renderGeneratedContent(generatedContent)}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CDSLivePreview;
