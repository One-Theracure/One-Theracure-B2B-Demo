
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Stethoscope, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";

interface AIInsightsPillProps {
  insights: string[];
  type?: 'trends' | 'outliers' | 'recommendations';
  className?: string;
}

const AIInsightsPill = ({ insights, type = 'trends', className }: AIInsightsPillProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'outliers': return <Stethoscope className="h-4 w-4" />;
      case 'recommendations': return <Lightbulb className="h-4 w-4" />;
      default: return <Stethoscope className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'outliers': return 'AI Outliers';
      case 'recommendations': return 'AI Suggests';
      default: return 'AI Trends';
    }
  };

  if (insights.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          {getIcon()}
          <span className="ml-1 text-sm">{getLabel()}</span>
          <Badge variant="secondary" className="ml-1 text-sm px-1.5">
            {insights.length}
          </Badge>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-1" />
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              • {insight}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AIInsightsPill;
