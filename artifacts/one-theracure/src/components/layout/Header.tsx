import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Edit3, Menu, X, Search, Sun, Moon, Eye, EyeOff, Sparkles, ChevronDown, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileEditModal from "@/components/profile/ProfileEditModal";
import { useTheme } from "next-themes";
import { useClerk } from "@clerk/react";

interface HeaderUser {
  name: string;
  role: string;
  id: string;
  email?: string;
}

interface HeaderProps {
  currentUser: HeaderUser;
  onProfileUpdate?: (updatedProfile: HeaderUser) => void;
  accessible?: boolean;
  onAccessibilityToggle?: (val: boolean) => void;
  onStartDemo?: () => void;
}

const Header = ({ currentUser, onProfileUpdate, accessible = false, onAccessibilityToggle, onStartDemo }: HeaderProps) => {
  // Single source of truth: the parent (Index) owns currentUser. We only
  // bubble profile updates back up; we never duplicate state here.
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const logout = () => { signOut(); navigate("/auth"); };

  const handleProfileUpdate = (updated: { name: string; role: string; id: string; email?: string }) => {
    onProfileUpdate?.({ name: updated.name, role: updated.role, id: updated.id, email: updated.email });
  };

  return (
    <>
      <header className="bg-background/98 backdrop-blur-xl border-b border-border/50 shadow-sm sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2.5">
            <div className="flex items-center justify-between gap-3">

              {/* Logo Block */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-card border border-border/30 rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                    <img
                      src="/lovable-uploads/one-theracure-logo.jpeg"
                      alt="One TheraCure Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {/* System status dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full" title="System Online" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold font-playfair bg-gradient-to-r from-foreground via-primary to-primary bg-clip-text text-transparent leading-none tracking-tight">
                  One TheraCure
                </h1>
              </div>

              {/* Center — Search (desktop) */}
              <div className="hidden lg:flex flex-1 max-w-sm mx-4">
                <Button
                  variant="outline"
                  aria-label="Open command palette"
                  onClick={() => window.dispatchEvent(new Event("command:open"))}
                  className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground text-sm font-normal px-3"
                >
                  <Search className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="flex-1 text-left">Search or jump…</span>
                  <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs border">Ctrl K</kbd>
                </Button>
              </div>

              {/* Right — Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2">

                {/* Search icon on md (no text) */}
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Open command palette"
                  onClick={() => window.dispatchEvent(new Event("command:open"))}
                  className="lg:hidden h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Search className="h-4 w-4" />
                </Button>

                {/* Demo Tour */}
                {onStartDemo && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex gap-1.5 h-9 text-sm font-medium border-primary/30 text-primary hover:bg-primary/10"
                    onClick={onStartDemo}
                  >
                    <Play className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="hidden md:inline">Demo Tour</span>
                  </Button>
                )}

                {/* Upgrade */}
                <Button
                  size="sm"
                  className="hidden sm:inline-flex gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm h-9 text-sm font-medium"
                  onClick={() => window.dispatchEvent(new CustomEvent("app:upgrade"))}
                >
                  <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="hidden md:inline">Upgrade</span>
                </Button>

                {/* User menu — desktop */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-border/60 bg-muted/60 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 h-9 group"
                        aria-label="Open user menu"
                      >
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <User className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="hidden lg:block text-sm font-medium text-foreground truncate max-w-[100px]">
                          {currentUser.name.split(" ").slice(0, 2).join(" ")}
                        </span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56 mt-1">
                      {/* User identity header */}
                      <DropdownMenuLabel className="py-2">
                        <p className="text-sm font-semibold text-foreground truncate">{currentUser.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{currentUser.role}</p>
                      </DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onSelect={() => setShowProfileModal(true)}
                      >
                        <Edit3 className="h-4 w-4 text-muted-foreground" />
                        <span>Edit Profile</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Dark mode toggle */}
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onSelect={(e) => {
                          e.preventDefault();
                          setTheme(theme === "dark" ? "light" : "dark");
                        }}
                      >
                        {theme === "dark"
                          ? <Sun className="h-4 w-4 text-muted-foreground" />
                          : <Moon className="h-4 w-4 text-muted-foreground" />
                        }
                        <span className="flex-1">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                        <span className="text-xs text-muted-foreground">{theme === "dark" ? "On" : "Off"}</span>
                      </DropdownMenuItem>

                      {/* Large text toggle */}
                      {onAccessibilityToggle && (
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onSelect={(e) => {
                            e.preventDefault();
                            onAccessibilityToggle(!accessible);
                          }}
                        >
                          {accessible
                            ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                            : <Eye className="h-4 w-4 text-muted-foreground" />
                          }
                          <span className="flex-1">Large Text</span>
                          <span className="text-xs text-muted-foreground">{accessible ? "On" : "Off"}</span>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                    <DropdownMenuItem
                        className="flex items-center gap-2 w-full cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700"
                        onSelect={() => { logout(); navigate("/auth"); }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile menu toggle */}
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
                  >
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile drawer */}
            {isMobileMenuOpen && (
              <div className="md:hidden mt-3 p-4 bg-background/98 backdrop-blur-xl rounded-2xl border border-border/60 shadow-lg space-y-3 animate-fade-in">
                {/* Search */}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-10 text-muted-foreground text-sm font-normal"
                  onClick={() => {
                    window.dispatchEvent(new Event("command:open"));
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Search className="h-4 w-4 flex-shrink-0" />
                  <span>Search or jump…</span>
                  <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs border">Ctrl K</kbd>
                </Button>

                {/* Profile row */}
                <button
                  onClick={() => { setShowProfileModal(true); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border border-border/60 bg-muted/40 hover:bg-accent transition-colors group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">{currentUser.name}</span>
                    <span className="text-xs text-muted-foreground">{currentUser.role}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                </button>

                {/* Utility actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-9 text-sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </Button>

                  {onAccessibilityToggle && (
                    <Button
                      variant={accessible ? "default" : "outline"}
                      size="sm"
                      className={`gap-2 h-9 text-sm ${accessible ? "bg-violet-700 hover:bg-violet-800" : ""}`}
                      onClick={() => onAccessibilityToggle(!accessible)}
                    >
                      {accessible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      Large Text
                    </Button>
                  )}
                </div>

                {/* Sign out */}
                <Button
                  variant="outline" size="sm"
                  className="w-full gap-2 h-9 text-sm text-red-600 hover:text-red-700 hover:bg-red-500/10 hover:border-red-500/30"
                  onClick={() => { setIsMobileMenuOpen(false); logout(); navigate("/auth"); }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUser}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
};

export default Header;
