
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VitalTrends from "@/components/VitalTrends";
import AIInsightsPill from "@/components/AIInsightsPill";

interface VitalSignsStepProps {
  formData: {
    vitalSigns: {
      bp: string;
      pulse: string;
      temp: string;
      rr: string;
      spo2: string;
      weight: string;
      height: string;
    };
    generalExamination: string;
    systemicExamination: string;
  };
  onInputChange: (field: string, value: string) => void;
  onVitalSignChange: (field: string, value: string) => void;
}

const VitalSignsStep = ({ formData, onInputChange, onVitalSignChange }: VitalSignsStepProps) => {
  // Mock previous vital signs data
  const previousVitals = {
    bp: ["130/85", "125/80"],
    pulse: ["78", "82"],
    temp: ["98.6", "99.1"],
    rr: ["16", "18"],
    spo2: ["98", "97"],
    weight: ["79", "80"],
    height: ["178", "178"]
  };

  const aiInsights = [
    "BP elevated compared to baseline - consider medication adjustment",
    "Heart rate within normal range, stable trend",
    "BMI calculation: 25.1 (slightly overweight)"
  ];

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <AIInsightsPill 
        insights={aiInsights} 
        type="outliers"
        className="mb-4"
      />

      {/* Vital Signs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-700 flex items-center justify-between">
            Vital Signs
            <span className="text-xs text-muted-foreground font-normal">Trends vs previous visits</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bp">Blood Pressure</Label>
              <Input
                id="bp"
                value={formData.vitalSigns.bp}
                onChange={(e) => onVitalSignChange("bp", e.target.value)}
                placeholder="120/80"
              />
              <VitalTrends 
                current={formData.vitalSigns.bp.split('/')[0] || "0"}
                previous={previousVitals.bp}
                label="Systolic"
                unit="mmHg"
                normalRange={{ min: 90, max: 140 }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pulse">Pulse Rate</Label>
              <Input
                id="pulse"
                value={formData.vitalSigns.pulse}
                onChange={(e) => onVitalSignChange("pulse", e.target.value)}
                placeholder="72"
              />
              <VitalTrends 
                current={formData.vitalSigns.pulse}
                previous={previousVitals.pulse}
                label="HR"
                unit="bpm"
                normalRange={{ min: 60, max: 100 }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="temp">Temperature</Label>
              <Input
                id="temp"
                value={formData.vitalSigns.temp}
                onChange={(e) => onVitalSignChange("temp", e.target.value)}
                placeholder="98.6"
              />
              <VitalTrends 
                current={formData.vitalSigns.temp}
                previous={previousVitals.temp}
                label="Temp"
                unit="°F"
                normalRange={{ min: 97, max: 99.5 }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="spo2">SpO2</Label>
              <Input
                id="spo2"
                value={formData.vitalSigns.spo2}
                onChange={(e) => onVitalSignChange("spo2", e.target.value)}
                placeholder="98"
              />
              <VitalTrends 
                current={formData.vitalSigns.spo2}
                previous={previousVitals.spo2}
                label="SpO2"
                unit="%"
                normalRange={{ min: 95, max: 100 }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                value={formData.vitalSigns.weight}
                onChange={(e) => onVitalSignChange("weight", e.target.value)}
                placeholder="70"
              />
              <VitalTrends 
                current={formData.vitalSigns.weight}
                previous={previousVitals.weight}
                label="Weight"
                unit="kg"
                normalRange={{ min: 40, max: 150 }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                value={formData.vitalSigns.height}
                onChange={(e) => onVitalSignChange("height", e.target.value)}
                placeholder="170"
              />
              <VitalTrends 
                current={formData.vitalSigns.height}
                previous={previousVitals.height}
                label="Height"
                unit="cm"
                normalRange={{ min: 100, max: 220 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Physical Examination */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-700">Physical Examination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="generalExamination">General Examination</Label>
            <Textarea
              id="generalExamination"
              value={formData.generalExamination}
              onChange={(e) => onInputChange("generalExamination", e.target.value)}
              placeholder="General appearance, consciousness, distress, etc."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="systemicExamination">Systemic Examination</Label>
            <Textarea
              id="systemicExamination"
              value={formData.systemicExamination}
              onChange={(e) => onInputChange("systemicExamination", e.target.value)}
              placeholder="Cardiovascular, respiratory, abdominal, neurological findings"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VitalSignsStep;
