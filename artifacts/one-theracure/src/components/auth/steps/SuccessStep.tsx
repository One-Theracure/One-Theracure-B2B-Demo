
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { SignUpData } from "../SignUpFlow";
import { useNavigate } from "react-router-dom";

interface SuccessStepProps {
  data: SignUpData;
  onClose: () => void;
}

const SuccessStep = ({ data, onClose }: SuccessStepProps) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    onClose();
    navigate('/');
  };

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-display-xl text-brand-success">
            Setup Complete!
          </h2>
          <p className="text-lg text-muted-foreground font-inter">
            Welcome to One TheraCure, Dr. {data.fullName.split(' ')[0]}
          </p>
        </div>
      </div>

      <Card className="luxury-card max-w-2xl mx-auto">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-3 text-green-600 dark:text-green-400">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">Your AI-powered clinic is ready!</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">✓ Profile Verified</h3>
              <p className="text-sm text-muted-foreground">Medical credentials confirmed</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">✓ Clinic Setup</h3>
              <p className="text-sm text-muted-foreground">{data.clinicName} is live</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">✓ Payment Ready</h3>
              <p className="text-sm text-muted-foreground">Start receiving consultation fees</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">✓ AI Features</h3>
              <p className="text-sm text-muted-foreground">Smart documentation activated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">What's Next?</h3>
        <div className="max-w-md mx-auto space-y-3 text-left">
          <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <span className="text-foreground">Create your first patient visit</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 bg-muted-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <span className="text-foreground">Explore AI documentation features</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 bg-muted-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <span className="text-foreground">Customize prescription templates</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          onClick={handleGetStarted}
          className="btn-luxury px-8 py-3 text-lg"
          size="lg"
        >
          <span>Open Patient List</span>
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
        
        <p className="text-sm text-muted-foreground">
          You can always update your profile and settings later from the dashboard
        </p>
      </div>
    </div>
  );
};

export default SuccessStep;
