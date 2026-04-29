import { useState } from "react";
import { BookOpen, Pill, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import CDSPatientInstructions from "@/components/cds/CDSPatientInstructions";
import CDSMedicationAssist from "@/components/cds/CDSMedicationAssist";
import CDSTemplates from "@/components/cds/CDSTemplates";

type Tab = "instructions" | "medications" | "templates";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "instructions", label: "Patient Instructions", icon: BookOpen },
  { id: "medications", label: "Prescriptions", icon: Pill },
  { id: "templates", label: "Templates", icon: Settings2 },
];

/**
 * Orders & Patient Outputs — what the patient walks out with.
 * Sub-tabs wrap the existing CDS components unchanged.
 */
const OrdersGroupView = () => {
  const [tab, setTab] = useState<Tab>("instructions");
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
      {tab === "instructions" && <CDSPatientInstructions />}
      {tab === "medications" && <CDSMedicationAssist />}
      {tab === "templates" && <CDSTemplates />}
    </div>
  );
};

export default OrdersGroupView;
