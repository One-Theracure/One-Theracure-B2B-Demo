
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Zap, FileText } from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import SignUpFlow from "@/components/auth/SignUpFlow";
import { LogoRing } from "@/components/brand/LogoRing";

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

        <div className="flex items-center justify-center gap-4">
          <LogoRing size="lg" />
          <div className="flex flex-col items-start text-left">
            <h1 className="text-display-xl text-brand-navy">One TheraCure</h1>
            <p className="mt-1 text-body-sm italic tracking-wide text-brand-trust">
              Enhancing Life
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-display-xl text-foreground">
            Run an AI-powered clinic in minutes.
          </h2>
          <p className="text-body-md text-muted-foreground max-w-xl mx-auto">
            Intelligent documentation, automated prescriptions, and seamless
            practice management — built for Indian doctors.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-card border border-border/70 rounded-airbnb-pill px-4 py-2"
            >
              <div className="w-6 h-6 rounded-airbnb-pill bg-brand-soft flex items-center justify-center flex-shrink-0">
                <Icon className="h-3.5 w-3.5 text-brand-trust" />
              </div>
              <span className="text-caption text-foreground">{label}</span>
              <span className="text-caption-sm text-muted-foreground hidden sm:inline">{desc}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          <div
            className="flex flex-col bg-card border border-border/60 rounded-airbnb-md p-8 transition-shadow duration-200 hover:shadow-airbnb cursor-pointer group"
            onClick={() => setShowLogin(true)}
          >
            <div className="flex-1 flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-airbnb-pill bg-brand-soft flex items-center justify-center mb-1 transition-colors group-hover:bg-brand-trust/15">
                <Shield className="h-5 w-5 text-brand-trust" />
              </div>
              <h3 className="text-display-sm text-foreground">Existing Doctor?</h3>
              <p className="text-body-sm text-muted-foreground">
                Welcome back — access your clinic dashboard
              </p>
            </div>
            <Button
              className="w-full btn-luxury"
              size="lg"
              onClick={(e) => { e.stopPropagation(); setShowLogin(true); }}
            >
              Log In
            </Button>
          </div>

          <div
            className="flex flex-col bg-card border border-border/60 rounded-airbnb-md p-8 transition-shadow duration-200 hover:shadow-airbnb cursor-pointer group"
            onClick={() => setShowSignUp(true)}
          >
            <div className="flex-1 flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-airbnb-pill bg-brand-soft flex items-center justify-center mb-1 transition-colors group-hover:bg-brand-trust/15">
                <Zap className="h-5 w-5 text-brand-trust" />
              </div>
              <h3 className="text-display-sm text-foreground">New to Platform?</h3>
              <p className="text-body-sm text-muted-foreground">
                Get verified and start in under 2 minutes
              </p>
            </div>
            <Button
              className="w-full btn-luxury"
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
