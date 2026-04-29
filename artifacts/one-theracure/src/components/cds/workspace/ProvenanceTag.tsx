import { Badge } from "@/components/ui/badge";
import { Bot, Mic, Upload, PenLine } from "lucide-react";

export type ProvenanceSource =
  | "ai-generated"
  | "from-transcript"
  | "uploaded-doc"
  | "clinician-edited";

interface ProvenanceTagProps {
  source: ProvenanceSource;
  className?: string;
}

const config: Record<
  ProvenanceSource,
  { label: string; icon: typeof Bot; colors: string }
> = {
  "ai-generated": {
    label: "AI-generated",
    icon: Bot,
    colors: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-300",
  },
  "from-transcript": {
    label: "From transcript",
    icon: Mic,
    colors: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300",
  },
  "uploaded-doc": {
    label: "Uploaded doc",
    icon: Upload,
    colors: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300",
  },
  "clinician-edited": {
    label: "Clinician edited",
    icon: PenLine,
    colors: "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-300",
  },
};

const ProvenanceTag = ({ source, className = "" }: ProvenanceTagProps) => {
  const { label, icon: Icon, colors } = config[source];

  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0.5 gap-1 font-medium ${colors} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export default ProvenanceTag;
