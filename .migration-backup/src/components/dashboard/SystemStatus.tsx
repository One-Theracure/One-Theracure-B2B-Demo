
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, TrendingUp } from "lucide-react";

const SystemStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-3 min-w-0">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-green-700 dark:text-green-300 truncate">PDF Generation</p>
                <p className="text-xs text-green-600 dark:text-green-400">All systems operational</p>
              </div>
            </div>
            <Badge className="bg-green-500/15 text-green-700 dark:text-green-300 text-xs flex-shrink-0 ml-2">Active</Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-3 min-w-0">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-green-700 dark:text-green-300 truncate">Database</p>
                <p className="text-xs text-green-600 dark:text-green-400">Connected and synced</p>
              </div>
            </div>
            <Badge className="bg-green-500/15 text-green-700 dark:text-green-300 text-xs flex-shrink-0 ml-2">Active</Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-3 min-w-0">
              <TrendingUp className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">Performance</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Optimal response times</p>
              </div>
            </div>
            <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs flex-shrink-0 ml-2">Good</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;
