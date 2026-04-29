
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Zap, FileText } from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import SignUpFlow from "@/components/auth/SignUpFlow";

const FEATURES = [
  { icon: Zap, label: "AI Scribe", desc: "Hands-free clinical notes" },
  { icon: FileText, label: "Smart EMR", desc: "Auto-coded, ABDM-ready" },
  { icon: Shield, label: "HIPAA & NMC", desc: "Compliant by default" },
];

const Auth = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto text-center space-y-10">

        {/* Logo + Brand */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-14 h-14 bg-card border border-border/50 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
            <img
              src="/lovable-uploads/one-theracure-logo.jpeg"
              alt="One TheraCure Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold font-playfair bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            One TheraCure
          </h1>
        </div>

        {/* Hero copy */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold font-playfair text-foreground leading-tight">
            Run an AI-powered clinic in minutes.
          </h2>
          <p className="text-base text-muted-foreground font-inter max-w-xl mx-auto leading-relaxed">
            Intelligent documentation, automated prescriptions, and seamless
            practice management — built for Indian doctors.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-card border border-border/70 rounded-full px-4 py-2 shadow-sm"
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">{desc}</span>
            </div>
          ))}
        </div>

        {/* Equal-ratio action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {/* Card 1 — Log In */}
          <div
            className="flex flex-col bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
            onClick={() => setShowLogin(true)}
          >
            <div className="flex-1 flex flex-col items-center text-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-1 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                Existing Doctor?
              </h3>
              <p className="text-sm text-muted-foreground leading-snug">
                Welcome back — access your clinic dashboard
              </p>
            </div>
            <Button
              className="w-full btn-luxury text-base py-5 rounded-xl"
              size="lg"
              onClick={(e) => { e.stopPropagation(); setShowLogin(true); }}
            >
              Log In
            </Button>
          </div>

          {/* Card 2 — Sign Up */}
          <div
            className="flex flex-col bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
            onClick={() => setShowSignUp(true)}
          >
            <div className="flex-1 flex flex-col items-center text-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-1 group-hover:bg-primary/20 transition-colors">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                New to Platform?
              </h3>
              <p className="text-sm text-muted-foreground leading-snug">
                Get verified and start in under 2 minutes
              </p>
            </div>
            <Button
              className="w-full btn-luxury text-base py-5 rounded-xl"
              size="lg"
              onClick={(e) => { e.stopPropagation(); setShowSignUp(true); }}
            >
              Create Account
            </Button>
          </div>
        </div>

        {/* Trust bar */}
        <div className="pt-4 border-t border-border/70">
          <p className="text-xs text-muted-foreground font-inter mb-3">
            Trusted by 10,000+ doctors across India
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span>✓ NMC Verified</span>
            <span>✓ HIPAA Compliant</span>
            <span>✓ 256-bit Encryption</span>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToSignUp={() => { setShowLogin(false); setShowSignUp(true); }}
      />
      <SignUpFlow
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToLogin={() => { setShowSignUp(false); setShowLogin(true); }}
      />
    </div>
  );
};

export default Auth;
