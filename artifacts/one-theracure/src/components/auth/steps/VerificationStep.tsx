
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, CheckCircle, RefreshCw } from "lucide-react";
import { SignUpData } from "../SignUpFlow";

interface VerificationStepProps {
  data: SignUpData;
  onNext: () => void;
  onPrev: () => void;
}

const VerificationStep = ({ data, onNext, onPrev }: VerificationStepProps) => {
  const [emailOTP, setEmailOTP] = useState('');
  const [mobileOTP, setMobileOTP] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [mobileSent, setMobileSent] = useState(false);

  const sendEmailOTP = () => {
    setEmailSent(true);
  };

  const sendMobileOTP = () => {
    setMobileSent(true);
  };

  const verifyEmailOTP = () => {
    if (emailOTP === '123456') {
      setEmailVerified(true);
    }
  };

  const verifyMobileOTP = () => {
    if (mobileOTP === '123456') {
      setMobileVerified(true);
    }
  };

  const isStepComplete = () => {
    return emailVerified && mobileVerified;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-display-lg text-brand-navy">
          Verify Your Contacts
        </h2>
        <p className="text-muted-foreground font-inter mt-2">
          We'll send verification codes to secure your account
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Email Verification */}
        <Card className="luxury-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Email Verification</span>
              {emailVerified && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Sending code to:</p>
              <p className="font-medium text-foreground">{data.email}</p>
            </div>

            {!emailSent ? (
              <Button onClick={sendEmailOTP} className="w-full">
                Send Verification Code
              </Button>
            ) : (
              <div className="space-y-3">
                {!emailVerified ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="emailOTP">Enter 6-digit code</Label>
                      <Input
                        id="emailOTP"
                        placeholder="123456"
                        value={emailOTP}
                        onChange={(e) => setEmailOTP(e.target.value)}
                        className="bg-background/50"
                        maxLength={6}
                      />
                    </div>
                    <Button 
                      onClick={verifyEmailOTP}
                      disabled={emailOTP.length !== 6}
                      className="w-full"
                    >
                      Verify Email
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEmailSent(false);
                        setEmailOTP('');
                      }}
                      className="w-full"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resend Code
                    </Button>
                  </>
                ) : (
                  <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium">Email Verified!</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile Verification */}
        <Card className="luxury-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span>Mobile Verification</span>
              {mobileVerified && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Sending SMS to:</p>
              <p className="font-medium text-foreground">+91 {data.mobile}</p>
            </div>

            {!mobileSent ? (
              <Button onClick={sendMobileOTP} className="w-full">
                Send SMS Code
              </Button>
            ) : (
              <div className="space-y-3">
                {!mobileVerified ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="mobileOTP">Enter 6-digit code</Label>
                      <Input
                        id="mobileOTP"
                        placeholder="123456"
                        value={mobileOTP}
                        onChange={(e) => setMobileOTP(e.target.value)}
                        className="bg-background/50"
                        maxLength={6}
                      />
                    </div>
                    <Button 
                      onClick={verifyMobileOTP}
                      disabled={mobileOTP.length !== 6}
                      className="w-full"
                    >
                      Verify Mobile
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setMobileSent(false);
                        setMobileOTP('');
                      }}
                      className="w-full"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resend Code
                    </Button>
                  </>
                ) : (
                  <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium">Mobile Verified!</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground max-w-md mx-auto">
        <p>
          Verification codes are valid for 10 minutes. Check your spam folder if you don't receive the email.
        </p>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={onPrev}>
          Back
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={!isStepComplete()}
          className="btn-luxury px-8"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );
};

export default VerificationStep;
