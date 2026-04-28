
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Users, FileText } from "lucide-react";

const stats = [
  {
    title: "Today's Visits",
    value: "12",
    change: "+3 from yesterday",
    icon: Calendar,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    title: "Pending Notes",
    value: "3",
    change: "2 urgent",
    icon: Clock,
    gradient: "from-orange-500 to-amber-600",
  },
  {
    title: "Total Patients",
    value: "1,247",
    change: "+15 this week",
    icon: Users,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    title: "Reports Generated",
    value: "89",
    change: "This month",
    icon: FileText,
    gradient: "from-violet-500 to-purple-600",
  },
];

const StatsGrid = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground leading-none">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums leading-none">{stat.value}</p>
                  <p className="text-xs text-muted-foreground/70 leading-none">{stat.change}</p>
                </div>
                <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} flex-shrink-0`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsGrid;
