
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

const LanguageSelector = () => {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={currentLanguage} onValueChange={setLanguage}>
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            <span className="flex items-center space-x-2">
              <span>{availableLanguages.find(lang => lang.code === currentLanguage)?.flag}</span>
              <span>{availableLanguages.find(lang => lang.code === currentLanguage)?.name}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center space-x-2">
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
