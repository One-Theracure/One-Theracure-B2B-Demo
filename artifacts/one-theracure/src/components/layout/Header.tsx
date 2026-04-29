import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown, LogOut, Menu, Play, RotateCcw, Sun, Moon, Sparkles, Users2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useDemo } from "@/contexts/DemoContext";
import { useDemoStore } from "@/stores/useDemoStore";
import PersonaSwitchModal from "@/components/persona/PersonaSwitchModal";
import { WifiOff } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  onStartTour: () => void;
}

export default function Header({ onToggleSidebar, onStartTour }: HeaderProps) {
  const { currentPersona, resetDemo, signOut } = useDemo();
  const { theme, setTheme } = useTheme();
  const offline = useDemoStore((s) => s.devToggles.offlineMode);
  const [showSwitch, setShowSwitch] = useState(false);

  if (!currentPersona) return null;

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/60">
        {/* Offline banner — shown above the Demo Mode pill when offline mode is toggled */}
        {offline && (
          <div
            data-testid="offline-banner"
            className="flex items-center justify-center bg-amber-100 dark:bg-amber-950/50 border-b border-amber-300 dark:border-amber-900/60 py-1.5 px-3"
          >
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase text-amber-900 dark:text-amber-200">
              <WifiOff className="h-3 w-3" />
              Offline mode · Notes & Rx will sync to ABDM when you reconnect
            </span>
          </div>
        )}

        {/* Demo Mode banner pill */}
        <div className="flex items-center justify-center bg-gradient-to-r from-violet-50 via-blue-50 to-violet-50 dark:from-violet-950/40 dark:to-blue-950/40 border-b border-violet-200/60 dark:border-violet-900/40 py-1.5">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase text-violet-700 dark:text-violet-300">
            <Sparkles className="h-3 w-3" />
            Demo Mode · Investor preview · No live data
          </span>
        </div>

        <div className="flex items-center justify-between px-4 sm:px-6 h-14 gap-3">
          {/* Left */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="h-9 w-9 p-0 lg:hidden" aria-label="Toggle sidebar">
              <Menu className="h-4 w-4" />
            </Button>
            <Link to={currentPersona.homePath} className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-sm">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold font-playfair bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  One TheraCure
                </div>
                <div className="text-[10px] text-muted-foreground -mt-0.5">Sunrise Medical Center</div>
              </div>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              data-tour="demo-tour-button"
              onClick={onStartTour}
              className="h-9 gap-1.5 border-violet-300/60 text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:border-violet-700/60 dark:hover:bg-violet-950/50"
            >
              <Play className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Demo Tour</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={resetDemo}
              className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
              data-tour="reset-demo-button"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-border/60 bg-muted/40 hover:bg-accent transition-colors h-9" data-tour="persona-avatar">
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${currentPersona.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                    {currentPersona.initials}
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-none">
                    <span className="text-xs font-semibold text-foreground">{currentPersona.name}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{currentPersona.role}</span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <div className="text-sm font-semibold">{currentPersona.name}</div>
                  <div className="text-xs text-muted-foreground">{currentPersona.credentials}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setShowSwitch(true)} className="gap-2 cursor-pointer">
                  <Users2 className="h-4 w-4 text-muted-foreground" />
                  Switch Persona
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => { e.preventDefault(); setTheme(theme === "dark" ? "light" : "dark"); }}
                  className="gap-2 cursor-pointer"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={resetDemo} className="gap-2 cursor-pointer">
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  Reset Demo
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={signOut} className="gap-2 cursor-pointer text-red-600">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <PersonaSwitchModal open={showSwitch} onOpenChange={setShowSwitch} />
    </>
  );
}
