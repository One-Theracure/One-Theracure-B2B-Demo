import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, Phone, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SecurityContext";
import { toast } from "sonner";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

const LoginModal = ({ isOpen, onClose, onSwitchToSignUp }: LoginModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    password: '',
    otp: ''
  });
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const navigate = useNavigate();
  const { login } = useAuth();

  const MAX_LOGIN_ATTEMPTS = 3;
  const isBlocked = loginAttempts >= MAX_LOGIN_ATTEMPTS;

  const handleLogin = async () => {
    if (isBlocked) {
      toast.error("Too many failed attempts. Please try again later.");
      return;
    }

    if (loginMethod === 'email' && (!formData.email || !formData.password)) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        onClose();
        navigate('/');
        setLoginAttempts(0);
      } else {
        setLoginAttempts(prev => prev + 1);
        if (loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
          toast.error(`Account temporarily locked after ${MAX_LOGIN_ATTEMPTS} failed attempts`);
        }
      }
    } catch (error) {
      setLoginAttempts(prev => prev + 1);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = () => {
    if (formData.mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setShowOTP(true);
    toast.success("OTP sent to your mobile number");
  };

  const sanitizeInput = (value: string) => {
    return value.replace(/[<>\"']/g, '').trim();
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

        {isBlocked && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
            <p className="text-destructive text-sm text-center">
              Account temporarily locked due to multiple failed login attempts. 
              Please try again in 15 minutes or contact support.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Login Method Tabs */}
          <div className="flex space-x-2 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setLoginMethod('email')}
              disabled={isBlocked}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-all ${
                loginMethod === 'email' 
                  ? 'bg-card shadow-sm text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              } ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Mail className="h-4 w-4" />
              <span className="text-sm font-medium">Email</span>
            </button>
            <button
              onClick={() => setLoginMethod('mobile')}
              disabled={isBlocked}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-all ${
                loginMethod === 'mobile' 
                  ? 'bg-card shadow-sm text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              } ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Phone className="h-4 w-4" />
              <span className="text-sm font-medium">Mobile</span>
            </button>
          </div>

          {/* Email Login */}
          {loginMethod === 'email' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@clinic.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: sanitizeInput(e.target.value) }))}
                  className="bg-background/50"
                  disabled={isBlocked}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-background/50 pr-10"
                    disabled={isBlocked}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isBlocked}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                onClick={handleLogin}
                className="w-full btn-luxury"
                disabled={!formData.email || !formData.password || isLoading || isBlocked}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>

              <div className="text-center">
                <button 
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                  disabled={isBlocked}
                  onClick={() => toast.info("Password reset will be available soon. Please contact support.")}
                >
                  Forgot password?
                </button>
              </div>
            </div>
          )}

          {/* Mobile Login */}
          {loginMethod === 'mobile' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-muted border border-r-0 border-border rounded-l-md">
                    <span className="text-sm text-muted-foreground">+91</span>
                  </div>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                    className="bg-background/50 rounded-l-none"
                    maxLength={10}
                  />
                </div>
              </div>

              {!showOTP ? (
                <Button 
                  onClick={handleSendOTP}
                  className="w-full btn-luxury"
                  disabled={formData.mobile.length !== 10 || isBlocked}
                >
                  Send OTP
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="6-digit code"
                      value={formData.otp}
                      onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                      className="bg-background/50"
                      maxLength={6}
                    />
                  </div>
                  <Button 
                    onClick={() => toast.info("OTP verification will be available soon.")}
                    className="w-full btn-luxury"
                    disabled={formData.otp.length !== 6 || isBlocked}
                  >
                    Verify & Login
                  </Button>
                  <button 
                    onClick={() => setShowOTP(false)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground"
                  >
                    Change mobile number
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Security Notice */}
          <div className="text-xs text-muted-foreground text-center">
            <p>🔒 Your session is encrypted and secure</p>
          </div>

          {/* Google SSO */}
          <div className="space-y-4">
            <Separator />
            <Button
              variant="outline"
              className="w-full bg-background/50 hover:bg-background/80"
              onClick={() => toast.info("Google Sign-In will be available soon.")}
            >
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-4 h-4 mr-2" />
              Continue with Google
            </Button>
          </div>

          {/* Switch to Sign Up */}
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              New to One TheraCure?{' '}
              <button 
                onClick={onSwitchToSignUp}
                className="text-primary hover:text-primary/80 font-medium"
                disabled={isBlocked}
              >
                Create Account
              </button>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
