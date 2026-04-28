
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VitalTrendsProps {
  current: string;
  previous: string[];
  label: string;
  unit: string;
  normalRange?: { min: number; max: number };
}

const VitalTrends = ({ current, previous, label, unit, normalRange }: VitalTrendsProps) => {
  const currentValue = parseFloat(current);
  const previousValue = previous.length > 0 ? parseFloat(previous[previous.length - 1]) : null;
  
  const getTrend = () => {
    if (!previousValue || !currentValue) return null;
    if (currentValue > previousValue) return 'up';
    if (currentValue < previousValue) return 'down';
    return 'stable';
  };

  const isOutOfRange = () => {
    if (!normalRange || !currentValue) return false;
    return currentValue < normalRange.min || currentValue > normalRange.max;
  };

  const trend = getTrend();
  const outOfRange = isOutOfRange();

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="font-medium text-foreground">{current} {unit}</span>
        {outOfRange && (
          <Badge variant="destructive" className="ml-2 text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Abnormal
          </Badge>
        )}
      </div>
      
      {trend && (
        <div className="flex items-center text-xs text-muted-foreground">
          {trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
          {trend === 'down' && <TrendingDown className="h-3 w-3 text-blue-500" />}
          {trend === 'stable' && <Minus className="h-3 w-3 text-muted-foreground/70" />}
          <span className="ml-1">vs {previousValue}</span>
        </div>
      )}
    </div>
  );
};

export default VitalTrends;
