
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Settings, Brain, MonitorSmartphone } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  const { t } = useLanguage();

  const tabs = [
    {
      value: "dashboard",
      icon: BarChart3,
      label: t('nav.dashboard'),
      shortLabel: "Dash",
      color: "from-blue-600 to-indigo-600"
    },
    {
      value: "frontdesk",
      icon: MonitorSmartphone,
      label: "Front Desk",
      shortLabel: "Ops",
      color: "from-teal-600 to-cyan-600"
    },
    {
      value: "cds-scribe",
      icon: Brain,
      label: "Clinical",
      shortLabel: "Clinical",
      color: "from-violet-600 to-fuchsia-600"
    },
    {
      value: "settings",
      icon: Settings,
      label: t('nav.settings'),
      shortLabel: "Config",
      color: "from-gray-600 to-slate-600"
    }
  ];

  return (
    <div className="relative">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-4 bg-background/95 backdrop-blur-xl border border-border/50 p-1 rounded-xl shadow-lg relative">
          {/* Subtle background wash */}
          <div className="absolute inset-0 bg-gradient-to-r from-muted/30 via-accent/20 to-muted/30 rounded-2xl pointer-events-none" />

          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.value;

            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                aria-label={`${tab.label} tab`}
                className={`
                  relative flex items-center justify-center gap-2 font-sf-pro rounded-xl
                  transition-all duration-200 text-sm px-2 py-2.5 z-10
                  min-h-[44px] w-full leading-none
                  ${isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-md font-semibold`
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/70 font-medium'
                  }
                `}
              >
                <IconComponent className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? 'drop-shadow-sm' : ''}`} />
                <span className="hidden sm:inline lg:hidden xl:inline truncate">
                  {tab.label}
                </span>

                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl blur-md opacity-20 -z-10`} />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TabNavigation;
