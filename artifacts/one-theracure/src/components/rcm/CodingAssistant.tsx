import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, X, Code } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { searchICD10Codes } from "@/data/icd10";

interface ICD10Code {
  code: string;
  description: string;
  category: string;
  confidence?: number;
}

interface CodingAssistantProps {
  diagnosis: string;
  selectedCodes: string[];
  onCodesChange: (codes: string[]) => void;
  className?: string;
}

const CodingAssistant = ({ diagnosis, selectedCodes, onCodesChange, className }: CodingAssistantProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<ICD10Code[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-suggest based on diagnosis
  useEffect(() => {
    if (diagnosis.trim()) {
      const results = searchICD10Codes(diagnosis);
      setSuggestions(results.slice(0, 6));
    } else {
      setSuggestions([]);
    }
  }, [diagnosis]);

  // Search manually
  const handleSearch = () => {
    if (searchTerm.trim()) {
      const results = searchICD10Codes(searchTerm);
      setSuggestions(results);
      setIsExpanded(true);
    }
  };

  const handleAddCode = (code: ICD10Code) => {
    if (!selectedCodes.includes(code.code)) {
      const newCodes = [...selectedCodes, code.code];
      onCodesChange(newCodes);
      toast({
        title: "ICD-10 code added",
        description: `${code.code} - ${code.description.substring(0, 50)}...`
      });
    }
  };

  const handleRemoveCode = (codeToRemove: string) => {
    const newCodes = selectedCodes.filter(code => code !== codeToRemove);
    onCodesChange(newCodes);
    toast({
      title: "Code removed",
      description: `${codeToRemove} removed from selection`
    });
  };

  const getConfidenceColor = (confidence: number = 0) => {
    if (confidence >= 0.8) return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    if (confidence >= 0.6) return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Code className="h-4 w-4" />
          ICD-10 Coding Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Manual search */}
        <div className="flex gap-2">
          <Input
            placeholder="Search ICD-10 codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected codes */}
        {selectedCodes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Selected Codes</h4>
            <div className="flex flex-wrap gap-2">
              {selectedCodes.map((code) => (
                <Badge key={code} variant="secondary" className="flex items-center gap-1">
                  {code}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCode(code)}
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Auto-suggestions from diagnosis */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {diagnosis ? "Suggested for diagnosis" : "Search results"}
              </h4>
              {suggestions.length > 3 && !isExpanded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                >
                  Show all ({suggestions.length})
                </Button>
              )}
            </div>
            
            <div className="space-y-1">
              {(isExpanded ? suggestions : suggestions.slice(0, 3)).map((code, index) => {
                const isSelected = selectedCodes.includes(code.code);
                return (
                  <div
                    key={`${code.code}-${index}`}
                    className={`p-2 rounded border transition-colors ${
                      isSelected 
                        ? "bg-primary/10 border-primary/20" 
                        : "bg-muted/50 border-border hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium">
                            {code.code}
                          </span>
                          {code.confidence && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getConfidenceColor(code.confidence)}`}
                            >
                              {Math.round(code.confidence * 100)}%
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {code.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {code.description}
                        </p>
                      </div>
                      <Button
                        variant={isSelected ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleAddCode(code)}
                        disabled={isSelected}
                        className="shrink-0"
                      >
                        {isSelected ? "Added" : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No suggestions message */}
        {diagnosis && suggestions.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">No ICD-10 codes found for this diagnosis.</p>
            <p className="text-xs mt-1">Try searching manually above.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodingAssistant;