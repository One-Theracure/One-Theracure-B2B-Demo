
import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, FileText, Users } from "lucide-react";

const analyticsMetrics = [
  {
    title: "Avg Visit Duration",
    value: "24 min",
    change: "↓2 min from last month",
    icon: Clock,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    changeColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Patient Satisfaction",
    value: "4.8/5",
    change: "↑0.2 from last month",
    icon: TrendingUp,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    changeColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Documentation Time",
    value: "8 min",
    change: "↓3 min with smart forms",
    icon: FileText,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    changeColor: "text-purple-600 dark:text-purple-400",
  },
  {
    title: "No-show Rate",
    value: "12%",
    change: "↓3% from last month",
    icon: Users,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600 dark:text-orange-400",
    changeColor: "text-orange-600 dark:text-orange-400",
  },
];

const AnalyticsMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {analyticsMetrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-3xl font-bold text-foreground tabular-nums">{metric.value}</p>
                  <p className={`text-xs font-medium ${metric.changeColor}`}>{metric.change}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${metric.iconBg} flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${metric.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AnalyticsMetrics;