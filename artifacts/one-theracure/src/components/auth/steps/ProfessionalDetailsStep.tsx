
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Info } from "lucide-react";
import { SignUpData } from "../SignUpFlow";
import { useState } from "react";

interface ProfessionalDetailsStepProps {
  data: SignUpData;
  updateData: (updates: Partial<SignUpData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const ProfessionalDetailsStep = ({ data, updateData, onNext, onPrev }: ProfessionalDetailsStepProps) => {
  const [newLanguage, setNewLanguage] = useState('');

  const degrees = [
    "MBBS", "MD", "MS", "DNB", "DM", "MCh", "BAMS", "BHMS", "BDS", "MDS"
  ];

  const specialties = [
    "General Medicine", "Cardiology", "Dermatology", "Pediatrics", "Orthopedics",
    "Gynecology", "Neurology", "Psychiatry", "Radiology", "Anesthesia"
  ];

  const commonLanguages = [
    "English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Bengali", "Gujarati"
  ];

  const addLanguage = (language: string) => {
    if (language && !data.languagesSpoken.includes(language)) {
      updateData({ 
        languagesSpoken: [...data.languagesSpoken, language] 
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    updateData({ 
      languagesSpoken: data.languagesSpoken.filter(lang => lang !== language) 
    });
  };

  const isStepValid = () => {
    return (
      data.primaryDegree &&
      data.specialty &&
      data.yearsOfExperience >= 0 &&
      data.languagesSpoken.length > 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-display-lg text-brand-navy">
          Professional Details
        </h2>
        <p className="text-muted-foreground font-inter mt-2">
          Help patients understand your expertise and qualifications
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="primaryDegree">Primary Medical Degree *</Label>
              <div className="relative group">
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md border border-border">
                  Your highest medical qualification
                </div>
              </div>
            </div>
            <Select value={data.primaryDegree} onValueChange={(value) => updateData({ primaryDegree: value })}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select your degree" />
              </SelectTrigger>
              <SelectContent>
                {degrees.map((degree) => (
                  <SelectItem key={degree} value={degree}>
                    {degree}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="specialty">Primary Specialty *</Label>
              <div className="relative group">
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md border border-border">
                  Your main area of medical practice
                </div>
              </div>
            </div>
            <Select value={data.specialty} onValueChange={(value) => updateData({ specialty: value })}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="subSpecialty">Sub-specialty (Optional)</Label>
              <div className="relative group">
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md border border-border">
                  Your area of specialization within your primary specialty
                </div>
              </div>
            </div>
            <Input
              id="subSpecialty"
              placeholder="e.g., Interventional Cardiology"
              value={data.subSpecialty}
              onChange={(e) => updateData({ subSpecialty: e.target.value })}
              className="bg-background/50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Label>Years of Experience *</Label>
              <div className="relative group">
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md border border-border">
                  Total years practicing medicine after graduation
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Slider
                value={[data.yearsOfExperience]}
                onValueChange={(value) => updateData({ yearsOfExperience: value[0] })}
                max={50}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0 years</span>
                <span className="font-medium text-primary">
                  {data.yearsOfExperience} {data.yearsOfExperience === 1 ? 'year' : 'years'}
                </span>
                <span>50+ years</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label>Languages Spoken *</Label>
              <div className="relative group">
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md border border-border">
                  Languages you can communicate with patients in
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {data.languagesSpoken.map((language) => (
                  <Badge 
                    key={language} 
                    variant="secondary" 
                    className="flex items-center space-x-1 bg-primary/10 text-primary"
                  >
                    <span>{language}</span>
                    <button
                      onClick={() => removeLanguage(language)}
                      className="ml-1 hover:text-primary/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {commonLanguages
                  .filter(lang => !data.languagesSpoken.includes(lang))
                  .slice(0, 6)
                  .map((language) => (
                    <button
                      key={language}
                      onClick={() => addLanguage(language)}
                      className="text-sm px-3 py-1 bg-muted hover:bg-muted/70 text-foreground rounded-md transition-colors"
                    >
                      + {language}
                    </button>
                  ))}
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="Add another language"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="bg-background/50 flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addLanguage(newLanguage);
                    }
                  }}
                />
                <Button 
                  onClick={() => addLanguage(newLanguage)}
                  variant="outline"
                  disabled={!newLanguage.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={onPrev}>
          Back
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={!isStepValid()}
          className="btn-luxury px-8"
        >
          Continue to Clinic Details
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalDetailsStep;
