import { useState } from "react";
import { MessageSquare, GitBranch, ClipboardList, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import CDSConsult from "@/components/cds/CDSConsult";
import CDSDifferential from "@/components/cds/CDSDifferential";
import CDSAssessmentPlan from "@/components/cds/CDSAssessmentPlan";
import CDSChartChat from "@/components/cds/CDSChartChat";

type Tab = "consult" | "ddx" | "assessment" | "chart-chat";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "consult", label: "Ask Questions", icon: MessageSquare },
  { id: "ddx", label: "Differential Dx", icon: GitBranch },
  { id: "assessment", label: "Assessment & Plan", icon: ClipboardList },
  { id: "chart-chat", label: "Chart Chat", icon: MessageCircle },
];

/**
 * Decision Support — wraps four existing CDS components as sub-tabs.
 * "Reuse, do not rewrite" — the underlying clinical components are unchanged.
 */
const CdsGroupView = () => {
  const [tab, setTab] = useState<Tab>("consult");
  return (
    <div className="space-y-3">
      <div className="flex overflow-x-auto gap-1 p-1 bg-muted/40 border border-border/60 rounded-xl">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              tab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
      {tab === "consult" && <CDSConsult />}
      {tab === "ddx" && <CDSDifferential />}
      {tab === "assessment" && <CDSAssessmentPlan />}
      {tab === "chart-chat" && <CDSChartChat />}
    </div>
  );
};

export default CdsGroupView;
