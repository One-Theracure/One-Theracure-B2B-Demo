
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const recentVisits = [
  {
    id: "V001",
    patient: "Mrs. Priya Sharma",
    time: "2 hours ago",
    status: "completed",
    specialty: "Gynecology",
  },
  {
    id: "V002",
    patient: "Mr. Raj Kumar",
    time: "4 hours ago",
    status: "pending",
    specialty: "General",
  },
  {
    id: "V003",
    patient: "Ms. Anita Singh",
    time: "6 hours ago",
    status: "completed",
    specialty: "Oncology",
  },
];

const RecentVisits = () => {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader className="pb-3 px-5 pt-5">
        <CardTitle className="flex items-center justify-between text-sm font-semibold text-foreground">
          Recent Visits
          <Button variant="ghost" size="sm" className="text-xs h-7 font-medium text-muted-foreground hover:text-foreground" onClick={() => navigate("/frontdesk")}>
            View All
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentVisits.map((visit) => (
            <div
              key={visit.id}
              className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate("/frontdesk")}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {visit.status === "completed" ? (
                    <CheckCircle className="h-4.5 w-4.5 text-green-500" />
                  ) : (
                    <Clock className="h-4.5 w-4.5 text-orange-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{visit.patient}</p>
                  <p className="text-xs text-muted-foreground">{visit.specialty} · {visit.time}</p>
                </div>
              </div>
              <Badge
                className={
                  visit.status === "completed"
                    ? "bg-green-500/15 text-green-700 dark:text-green-300 hover:bg-green-500/15 text-xs"
                    : "bg-orange-500/15 text-orange-700 dark:text-orange-300 hover:bg-orange-500/15 text-xs"
                }
              >
                {visit.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentVisits;
