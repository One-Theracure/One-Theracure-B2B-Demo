
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileText } from "lucide-react";

const navigate = (tab: string) => {
  window.dispatchEvent(new CustomEvent("command:navigate", { detail: tab }));
};

/**
 * QuickActions — primary "start your day" actions on the dashboard.
 * Brand Foundation Batch 1 (issue 3.3): solid Soft-Blue surface, Trust-Blue
 * icons, Deep-Navy headings. No more blue→indigo gradient.
 */
const QuickActions = () => {
  return (
    <Card className="bg-brand-soft border border-brand-trust/15 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-brand-trust uppercase tracking-wider">Quick Actions</p>
            <h2 className="text-base sm:text-lg font-semibold text-brand-navy leading-snug">
              Start your clinical workflow
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:flex sm:flex-row gap-2">
            <Button
              className="bg-brand-trust text-white hover:bg-brand-navy h-9 text-xs sm:text-sm font-medium px-3 sm:px-4 shadow-sm"
              onClick={() => navigate("cds-scribe")}
            >
              <Plus className="h-4 w-4 sm:mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">New Visit</span>
              <span className="sm:hidden">Visit</span>
            </Button>
            <Button
              className="bg-white text-brand-trust border border-brand-trust/30 hover:bg-brand-trust hover:text-white h-9 text-xs sm:text-sm font-medium px-3 sm:px-4"
              onClick={() => navigate("frontdesk")}
            >
              <Users className="h-4 w-4 sm:mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">Patient Queue</span>
              <span className="sm:hidden">Queue</span>
            </Button>
            <Button
              className="bg-white text-brand-trust border border-brand-trust/30 hover:bg-brand-trust hover:text-white h-9 text-xs sm:text-sm font-medium px-3 sm:px-4"
              onClick={() => navigate("settings")}
            >
              <FileText className="h-4 w-4 sm:mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">Templates</span>
              <span className="sm:hidden">Tmpl</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
