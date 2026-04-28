import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Lightbulb, 
  Clock, 
  CheckCircle, 
  X,
  Brain,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SmartSuggestion {
  field: string;
  suggestion: string;
  confidence: number;
  reasoning: string;
  template?: boolean;
}

interface SmartEMRFieldsProps {
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  patientData?: any;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}

export const SmartEMRFields = ({
  fieldName,
  value,
  onChange,
  patientData,
  placeholder,
  multiline = false,
  className = ""
}: SmartEMRFieldsProps) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Trigger AI suggestions when field gains focus or changes significantly
    if (value.length > 10) {
      generateSmartSuggestions();
    }
  }, [fieldName, patientData]);

  const generateSmartSuggestions = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI-powered suggestions based on field type and patient data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSuggestions: SmartSuggestion[] = getSuggestionsForField(fieldName, patientData);
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
      
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getSuggestionsForField = (field: string, data: any): SmartSuggestion[] => {
    switch (field) {
      case 'diagnosis':
        return [
          {
            field: 'diagnosis',
            suggestion: 'Hypertension, uncontrolled (I10)',
            confidence: 0.89,
            reasoning: 'Based on BP readings 160/95 and patient history',
            template: false
          },
          {
            field: 'diagnosis',
            suggestion: 'Type 2 diabetes mellitus without complications (E11.9)',
            confidence: 0.76,
            reasoning: 'HbA1c 8.2%, consistent with previous diagnoses',
            template: false
          }
        ];
      
      case 'treatment':
        return [
          {
            field: 'treatment',
            suggestion: 'Initiate ACE inhibitor therapy, lifestyle modifications for weight management',
            confidence: 0.91,
            reasoning: 'Evidence-based approach for hypertension management',
            template: true
          },
          {
            field: 'treatment',
            suggestion: 'Metformin dose adjustment, diabetes education referral',
            confidence: 0.84,
            reasoning: 'Standard care for uncontrolled diabetes',
            template: true
          }
        ];
      
      case 'followUp':
        return [
          {
            field: 'followUp',
            suggestion: 'Return in 2 weeks for BP check, 3 months for comprehensive diabetes review',
            confidence: 0.88,
            reasoning: 'Standard follow-up intervals for new hypertension treatment',
            template: true
          }
        ];
      
      case 'advice':
        return [
          {
            field: 'advice',
            suggestion: 'DASH diet, regular exercise 150min/week, home BP monitoring, medication compliance',
            confidence: 0.92,
            reasoning: 'Evidence-based lifestyle recommendations for hypertension',
            template: true
          }
        ];
      
      default:
        return [];
    }
  };

  const applySuggestion = (suggestion: SmartSuggestion) => {
    if (suggestion.template) {
      // For template suggestions, append to existing content
      const newValue = value ? `${value}\n\n${suggestion.suggestion}` : suggestion.suggestion;
      onChange(newValue);
    } else {
      // For direct suggestions, replace content
      onChange(suggestion.suggestion);
    }
    
    setShowSuggestions(false);
    toast({
      title: "AI Suggestion Applied",
      description: "Content has been updated with AI-generated suggestion.",
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800 border-green-200";
    if (confidence >= 0.8) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <InputComponent
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${className} ${suggestions.length > 0 ? 'border-blue-300' : ''}`}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        
        {/* AI Indicator */}
        {(isGenerating || suggestions.length > 0) && (
          <div className="absolute right-2 top-2">
            {isGenerating ? (
              <Brain className="h-4 w-4 text-blue-500 animate-pulse" />
            ) : (
              <Sparkles className="h-4 w-4 text-blue-500" />
            )}
          </div>
        )}
      </div>

      {/* AI Suggestions Panel */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-10 w-full mt-1 border-2 border-blue-200 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  AI Suggestions
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestions(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 border border-border rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getConfidenceColor(suggestion.confidence)}>
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </Badge>
                    {suggestion.template && (
                      <Badge variant="outline" className="text-xs">
                        Template
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm font-medium">{suggestion.suggestion}</p>
                  <p className="text-xs text-muted-foreground">{suggestion.reasoning}</p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => applySuggestion(suggestion)}
                      className="text-xs"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        // Copy to clipboard
                        navigator.clipboard.writeText(suggestion.suggestion);
                        toast({
                          title: "Copied to clipboard",
                          description: "Suggestion copied for manual editing.",
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 p-2 bg-primary/10 rounded text-xs text-primary">
              💡 AI suggestions are based on your patient data and clinical guidelines. 
              Please review before applying.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};