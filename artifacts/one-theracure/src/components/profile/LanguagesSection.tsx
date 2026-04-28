
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface LanguagesSectionProps {
  languagesSpoken: string[];
  onLanguagesChange: (languages: string[]) => void;
}

const LanguagesSection = ({ languagesSpoken, onLanguagesChange }: LanguagesSectionProps) => {
  const [newLanguage, setNewLanguage] = useState("");

  const addLanguage = () => {
    if (newLanguage && !languagesSpoken.includes(newLanguage)) {
      onLanguagesChange([...languagesSpoken, newLanguage]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (language: string) => {
    onLanguagesChange(languagesSpoken.filter(lang => lang !== language));
  };

  return (
    <div className="space-y-2">
      <Label>Languages Spoken</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {languagesSpoken.map((language) => (
          <Badge key={language} variant="secondary" className="flex items-center space-x-1">
            <span>{language}</span>
            <button
              onClick={() => removeLanguage(language)}
              className="ml-1 hover:text-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex space-x-2">
        <Input
          placeholder="Add language"
          value={newLanguage}
          onChange={(e) => setNewLanguage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
        />
        <Button onClick={addLanguage} variant="outline" disabled={!newLanguage.trim()}>
          Add
        </Button>
      </div>
    </div>
  );
};

export default LanguagesSection;
