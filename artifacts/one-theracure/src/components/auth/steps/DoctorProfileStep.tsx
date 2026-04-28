
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { SignUpData } from "../SignUpFlow";

interface DoctorProfileStepProps {
  data: SignUpData;
  updateData: (updates: Partial<SignUpData>) => void;
  onNext: () => void;
  onSwitchToLogin: () => void;
}

const DoctorProfileStep = ({ data, updateData, onNext, onSwitchToLogin }: DoctorProfileStepProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [mobileVerified, setMobileVerified] = useState(false);
  const [regVerificationStatus, setRegVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');

  const stateMedicalCouncils = [
    "Andhra Pradesh Medical Council",
    "Karnataka Medical Council", 
    "Maharashtra Medical Council",
    "Tamil Nadu Medical Council",
    "Delhi Medical Council",
    "West Bengal Medical Council"
  ];

  const handleMobileOTP = () => {
    setShowOTP(true);
  };

  const verifyOTP = () => {
    if (otp === '123456') {
      setMobileVerified(true);
      setShowOTP(false);
    }
  };

  const verifyRegistration = async () => {
    setRegVerificationStatus('verifying');
    
    setTimeout(() => {
      const isValid = data.medicalRegNo.length >= 10;
      if (isValid) {
        setRegVerificationStatus('verified');
        updateData({ regVerified: true });
      } else {
        setRegVerificationStatus('failed');
        updateData({ regVerified: false });
      }
    }, 2000);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(data.password);

  const isStepValid = () => {
    return (
      data.fullName &&
      data.email &&
      data.mobile &&
      mobileVerified &&
      data.password &&
      passwordStrength >= 75 &&
      data.medicalRegNo &&
      data.regVerified &&
      data.stateMedicalCouncil &&
      data.yearOfRegistration
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-playfair font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
          Doctor Profile
        </h2>
        <p className="text-muted-foreground font-inter mt-2">
          Let's verify your medical credentials and set up your account
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="Dr. Rajesh Kumar"
              value={data.fullName}
              onChange={(e) => updateData({ fullName: e.target.value })}
              className="bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Professional Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="dr.rajesh@clinic.com"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              className="bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number *</Label>
            <div className="flex space-x-2">
              <div className="flex">
                <div className="flex items-center px-3 bg-muted border border-input rounded-l-md">
                  <span className="text-sm text-muted-foreground">+91</span>
                </div>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="9876543210"
                  value={data.mobile}
                  onChange={(e) => updateData({ mobile: e.target.value })}
                  className="bg-muted/50 rounded-l-none flex-1"
                  maxLength={10}
                />
              </div>
              {!mobileVerified && (
                <Button 
                  onClick={handleMobileOTP}
                  variant="outline"
                  disabled={data.mobile.length !== 10}
                  className="shrink-0"
                >
                  Verify
                </Button>
              )}
              {mobileVerified && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>

          {showOTP && (
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <div className="flex space-x-2">
                <Input
                  id="otp"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="bg-muted/50"
                  maxLength={6}
                />
                <Button 
                  onClick={verifyOTP}
                  disabled={otp.length !== 6}
                >
                  Verify
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={data.password}
                onChange={(e) => updateData({ password: e.target.value })}
                className="bg-muted/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {data.password && (
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength < 50 ? 'bg-red-500' : 
                        passwordStrength < 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Good' : 'Strong'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-700 dark:text-blue-400">Medical Registration Verification</h3>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              We verify all doctors through the National Medical Commission database
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalRegNo">Medical Registration Number *</Label>
            <div className="flex space-x-2">
              <Input
                id="medicalRegNo"
                placeholder="KMC/2020/123456"
                value={data.medicalRegNo}
                onChange={(e) => {
                  const formatted = e.target.value.toUpperCase();
                  updateData({ medicalRegNo: formatted });
                }}
                className="bg-muted/50 flex-1"
              />
              {regVerificationStatus === 'idle' && data.medicalRegNo && (
                <Button 
                  onClick={verifyRegistration}
                  variant="outline"
                  className="shrink-0"
                >
                  Verify
                </Button>
              )}
              {regVerificationStatus === 'verifying' && (
                <div className="flex items-center px-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
              {regVerificationStatus === 'verified' && (
                <div className="flex items-center text-green-600 px-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm ml-1">Verified</span>
                </div>
              )}
              {regVerificationStatus === 'failed' && (
                <div className="flex items-center text-red-600 px-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm ml-1">Failed</span>
                </div>
              )}
            </div>
            {regVerificationStatus === 'failed' && (
              <p className="text-sm text-red-600">
                Unable to verify. Please upload your certificate in the next step.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="council">State Medical Council *</Label>
            <Select value={data.stateMedicalCouncil} onValueChange={(value) => updateData({ stateMedicalCouncil: value })}>
              <SelectTrigger className="bg-muted/50">
                <SelectValue placeholder="Select your medical council" />
              </SelectTrigger>
              <SelectContent>
                {stateMedicalCouncils.map((council) => (
                  <SelectItem key={council} value={council}>
                    {council}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearOfRegistration">Year of Registration *</Label>
            <Select value={data.yearOfRegistration} onValueChange={(value) => updateData({ yearOfRegistration: value })}>
              <SelectTrigger className="bg-muted/50">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 30 }, (_, i) => 2024 - i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t">
        <div className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <button 
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Log in here
          </button>
        </div>
        
        <Button 
          onClick={onNext}
          disabled={!isStepValid()}
          className="btn-luxury px-8"
        >
          Continue to Professional Details
        </Button>
      </div>
    </div>
  );
};

export default DoctorProfileStep;
