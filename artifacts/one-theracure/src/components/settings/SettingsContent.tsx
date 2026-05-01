
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, PenTool, Users, FileText, ChevronRight, ArrowLeft } from "lucide-react";
import DigitalSignature from "@/components/digital-signature/DigitalSignature";
import TemplateManagement from "./TemplateManagement";
import UserRoleManagement from "./UserRoleManagement";

type SettingsView = "main" | "templates" | "signature" | "roles";

const SETTINGS_ITEMS = [
  {
    id: "templates" as const,
    icon: Settings,
    label: "Template Management",
    description: "Configure clinical note templates and smart phrases",
  },
  {
    id: "signature" as const,
    icon: PenTool,
    label: "Digital Signature",
    description: "Set up your digital signature for prescriptions and notes",
  },
  {
    id: "roles" as const,
    icon: Users,
    label: "User Roles & Permissions",
    description: "Manage staff access levels and role assignments",
  },
  {
    id: "audit" as const,
    icon: FileText,
    label: "Audit Logs",
    description: "View system activity and compliance records",
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
        {view === "roles" && <UserRoleManagement />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-airbnb-md border border-border p-6 sm:p-8">
        <h2 className="text-display-xl text-brand-navy mb-2">Settings</h2>
        <p className="text-muted-foreground font-inter font-medium text-sm sm:text-base">Configure system preferences, user settings, and digital signatures</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SETTINGS_ITEMS.map((item) => {
          const Icon = item.icon;
          const isClickable = item.id !== "audit";
          return (
            <button
              key={item.id}
              onClick={() => isClickable && setView(item.id as SettingsView)}
              disabled={!isClickable}
              className="group text-left bg-card rounded-airbnb-md border border-border hover-lift transition-shadow duration-200 p-5 flex items-start gap-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 rounded-airbnb-pill bg-brand-soft flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-brand-trust" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  {isClickable && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  )}
                  {!isClickable && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">Coming soon</span>
                  )}
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
