
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileText } from "lucide-react";

const navigate = (tab: string) => {
  window.dispatchEvent(new CustomEvent("command:navigate", { detail: tab }));
};

const QuickActions = () => {
  return (
    <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-blue-200 uppercase tracking-wider">Quick Actions</p>
            <h2 className="text-base sm:text-lg font-semibold text-white leading-snug">Start your clinical workflow</h2>
          </div>
          <div className="grid grid-cols-3 sm:flex sm:flex-row gap-2">
            <Button
              className="bg-white text-blue-600 hover:bg-white/90 h-9 text-xs sm:text-sm font-medium px-3 sm:px-4"
              onClick={() => navigate("cds-scribe")}
            >
              <Plus className="h-4 w-4 sm:mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">New Visit</span>
              <span className="sm:hidden">Visit</span>
            </Button>
            <Button
              className="bg-white text-blue-600 hover:bg-white/90 h-9 text-xs sm:text-sm font-medium px-3 sm:px-4"
              onClick={() => navigate("frontdesk")}
            >
              <Users className="h-4 w-4 sm:mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">Patient Queue</span>
              <span className="sm:hidden">Queue</span>
            </Button>
            <Button
              className="bg-white/20 text-white hover:bg-white/30 border border-white/30 h-9 text-xs sm:text-sm font-medium px-3 sm:px-4"
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
