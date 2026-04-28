
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, PenTool, Users, FileText, ChevronRight, ArrowLeft } from "lucide-react";
import DigitalSignature from "@/components/digital-signature/DigitalSignature";
import TemplateManagement from "./TemplateManagement";
import UserRoleManagement from "./UserRoleManagement";
import AuditLogView from "./AuditLogView";
import { RequireRole } from "@/hooks/useRequireRole";

type SettingsView = "main" | "templates" | "signature" | "roles" | "audit";

const SETTINGS_ITEMS = [
  {
    id: "templates" as const,
    icon: Settings,
    label: "Template Management",
    description: "Configure clinical note templates and smart phrases",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "signature" as const,
    icon: PenTool,
    label: "Digital Signature",
    description: "Set up your digital signature for prescriptions and notes",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "roles" as const,
    icon: Users,
    label: "User Roles & Permissions",
    description: "Manage staff access levels and role assignments",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "audit" as const,
    icon: FileText,
    label: "Audit Logs",
    description: "View system activity and compliance records",
    gradient: "from-orange-500 to-amber-500",
  },
];

const SettingsContent = () => {
  const [view, setView] = useState<SettingsView>("main");

  if (view !== "main") {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setView("main")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Button>
        {view === "templates" && <TemplateManagement />}
        {view === "signature" && <DigitalSignature />}
        {view === "roles" && (
          <RequireRole roles={["owner"]}>
            <UserRoleManagement />
          </RequireRole>
        )}
        {view === "audit" && (
          <RequireRole roles={["owner", "auditor"]}>
            <AuditLogView />
          </RequireRole>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold font-playfair bg-gradient-to-r from-blue-900 to-indigo-900 dark:from-blue-300 dark:to-indigo-300 bg-clip-text text-transparent mb-2">Settings</h2>
        <p className="text-muted-foreground font-inter font-medium text-sm sm:text-base">Configure system preferences, user settings, and digital signatures</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SETTINGS_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as SettingsView)}
              className="group text-left bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md hover:border-border transition-all duration-200 p-5 flex items-start gap-4"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsContent;
