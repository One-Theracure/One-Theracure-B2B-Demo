import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Settings, Brain, MonitorSmartphone } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

/**
 * TabNavigation — primary product tabs (Brand Foundation Batch 1, issue 1.3).
 *
 * Reference design: 32px icon above label, 2px Trust-Blue ink underline for
 * the active tab, no per-tab gradient. Replaces the four conflicting gradient
 * pills (blue/indigo, teal/cyan, violet/fuchsia, gray/slate) with a single
 * unified Trust-Blue identity.
 */
const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  const { t } = useLanguage();

  const tabs = [
    { value: "dashboard",  icon: BarChart3,         label: t('nav.dashboard') },
    { value: "frontdesk",  icon: MonitorSmartphone, label: "Front Desk" },
    { value: "cds-scribe", icon: Brain,             label: "Clinical" },
    { value: "settings",   icon: Settings,          label: t('nav.settings') },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-4 h-auto bg-transparent p-0 gap-2 rounded-none">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.value;

          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              aria-label={`${tab.label} tab`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex flex-col items-center justify-end gap-1.5",
                "rounded-none bg-transparent p-2 pt-2.5 pb-2",
                "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                "transition-colors duration-200 min-h-[64px]",
              )}
            >
              <IconComponent
                aria-hidden
                className={cn(
                  "h-8 w-8 transition-colors duration-200",
                  isActive
                    ? "text-brand-trust"
                    : "text-brand-slate group-hover:text-brand-navy",
                )}
                strokeWidth={isActive ? 2 : 1.6}
              />
              <span
                className={cn(
                  "font-inter text-xs sm:text-sm leading-none tracking-tight transition-colors",
                  isActive
                    ? "text-brand-navy font-semibold"
                    : "text-brand-slate font-medium group-hover:text-brand-navy",
                )}
              >
                {tab.label}
              </span>
              {/* 2px Trust-Blue ink underline — active indicator */}
              <span
                aria-hidden
                className={cn(
                  "absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-200",
                  isActive
                    ? "w-8 bg-brand-trust opacity-100"
                    : "w-0 bg-brand-trust opacity-0",
                )}
              />
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};

export default TabNavigation;
