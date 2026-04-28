import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

const LoginModal = ({ isOpen, onClose, onSwitchToSignUp }: LoginModalProps) => {
  const navigate = useNavigate();

  const handleGoToSignIn = () => {
    onClose();
    navigate("/sign-in");
  };

  const handleGoToSignUp = () => {
    onClose();
    navigate("/sign-up");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent text-center flex items-center justify-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span>Secure Login</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 text-center">
          <p className="text-muted-foreground text-sm">
            Sign in with your One TheraCure account to access your clinic dashboard.
          </p>
          <Button onClick={handleGoToSignIn} className="w-full btn-luxury">
            Log In
          </Button>
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              New to One TheraCure?{" "}
              <button
                onClick={handleGoToSignUp}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Create Account
              </button>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">🔒 Secured with enterprise-grade encryption</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
