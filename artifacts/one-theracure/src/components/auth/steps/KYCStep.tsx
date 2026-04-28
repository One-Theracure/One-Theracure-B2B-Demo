
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Shield, CreditCard, Building2 } from "lucide-react";
import { SignUpData } from "../SignUpFlow";

interface KYCStepProps {
  data: SignUpData;
  updateData: (updates: Partial<SignUpData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const KYCStep = ({ data, updateData, onNext, onPrev, onSkip }: KYCStepProps) => {
  const isStepValid = () => {
    return (
      data.panNumber &&
      data.aadhaarNumber &&
      data.bankDetails.accountNumber &&
      data.bankDetails.ifscCode &&
      data.bankDetails.accountName
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-playfair font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
          KYC & Bank Details
        </h2>
        <p className="text-muted-foreground font-inter mt-2">
          Complete verification for payments and compliance (can be done later)
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="luxury-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>Identity Verification</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                placeholder="ABCDE1234F"
                value={data.panNumber}
                onChange={(e) => updateData({ panNumber: e.target.value.toUpperCase() })}
                className="bg-muted/50"
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
              <Input
                id="aadhaarNumber"
                placeholder="1234 5678 9012"
                value={data.aadhaarNumber}
                onChange={(e) => {
                  const formatted = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                  updateData({ aadhaarNumber: formatted });
                }}
                className="bg-muted/50"
                maxLength={14}
              />
            </div>

            <div className="space-y-2">
              <Label>Document Upload</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-20 flex-col space-y-1">
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">PAN Card</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-1">
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Aadhaar</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="luxury-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span>Bank Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Holder Name</Label>
              <Input
                id="accountName"
                placeholder="Dr. Rajesh Kumar"
                value={data.bankDetails.accountName}
                onChange={(e) => updateData({ 
                  bankDetails: { ...data.bankDetails, accountName: e.target.value }
                })}
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="123456789012"
                value={data.bankDetails.accountNumber}
                onChange={(e) => updateData({ 
                  bankDetails: { ...data.bankDetails, accountNumber: e.target.value }
                })}
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                placeholder="SBIN0001234"
                value={data.bankDetails.ifscCode}
                onChange={(e) => updateData({ 
                  bankDetails: { ...data.bankDetails, ifscCode: e.target.value.toUpperCase() }
                })}
                className="bg-muted/50"
                maxLength={11}
              />
            </div>

            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center space-x-2 mb-1">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Secure & Encrypted</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                Your banking information is encrypted and stored securely for payment processing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <h3 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">Why do we need this information?</h3>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>• <strong>PAN & Aadhaar:</strong> Required for tax compliance and government regulations</li>
          <li>• <strong>Bank Details:</strong> To process consultation fee payments directly to your account</li>
          <li>• <strong>Security:</strong> All information is encrypted and stored securely</li>
        </ul>
      </div>

      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={onPrev}>
          Back
        </Button>
        
        <div className="space-x-3">
          <Button variant="outline" onClick={onSkip}>
            Skip for Now
          </Button>
          <Button 
            onClick={onNext}
            disabled={!isStepValid()}
            className="btn-luxury px-8"
          >
            Continue to Verification
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KYCStep;
