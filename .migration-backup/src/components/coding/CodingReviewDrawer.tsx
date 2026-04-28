import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tag } from "lucide-react";
import { CodingAssistPanel } from "./CodingAssistPanel";

interface CodingReviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteContent: string;
  patientId: string;
  encounterId: string;
}

export function CodingReviewDrawer({
  open,
  onOpenChange,
  noteContent,
  patientId,
  encounterId,
}: CodingReviewDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[440px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2.5 text-lg font-semibold">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Tag className="h-4 w-4 text-violet-600" />
            </div>
            Coding Review
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            AI-suggested ICD-10 and CPT codes from current note. Review and confirm before billing.
          </SheetDescription>
        </SheetHeader>
        <CodingAssistPanel
          noteContent={noteContent}
          patientId={patientId}
          encounterId={encounterId}
        />
      </SheetContent>
    </Sheet>
  );
}
