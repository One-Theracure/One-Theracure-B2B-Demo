
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  FileText, 
  DollarSign,
  Download,
  Calendar,
  BarChart3
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { chartColor, chartMutedFill } from "@/lib/chartTheme";

interface AdvancedAnalyticsProps {
  showHeader?: boolean;
  timeRange?: string;
  compact?: boolean;
}

const AdvancedAnalytics = ({ showHeader = true, timeRange = "6months", compact = false }: AdvancedAnalyticsProps) => {
  // Sample data for different analytics
  const patientOutcomes = [
    { month: 'Jan', recovery: 85, satisfaction: 92, readmission: 8 },
    { month: 'Feb', recovery: 88, satisfaction: 94, readmission: 6 },
    { month: 'Mar', recovery: 91, satisfaction: 96, readmission: 5 },
    { month: 'Apr', recovery: 89, satisfaction: 93, readmission: 7 },
    { month: 'May', recovery: 93, satisfaction: 97, readmission: 4 },
    { month: 'Jun', recovery: 95, satisfaction: 98, readmission: 3 }
  ];

  const treatmentEffectiveness = [
    { treatment: 'Hypertension Protocol', success: 94, total: 120 },
    { treatment: 'Diabetes Management', success: 88, total: 95 },
    { treatment: 'Cardiac Rehabilitation', success: 91, total: 67 },
    { treatment: 'Pain Management', success: 85, total: 143 },
    { treatment: 'Respiratory Therapy', success: 89, total: 78 }
  ];

  const costAnalysis = [
    { category: 'Medications', cost: 45000, budget: 50000 },
    { category: 'Lab Tests', cost: 28000, budget: 30000 },
    { category: 'Imaging', cost: 35000, budget: 40000 },
    { category: 'Procedures', cost: 62000, budget: 65000 },
    { category: 'Consultations', cost: 18000, budget: 20000 }
  ];

  const riskFactors = [
    { factor: 'Age > 65', patients: 45, risk: 'High' },
    { factor: 'Diabetes', patients: 32, risk: 'High' },
    { factor: 'Hypertension', patients: 56, risk: 'Medium' },
    { factor: 'Smoking', patients: 23, risk: 'High' },
    { factor: 'Obesity', patients: 34, risk: 'Medium' }
  ];

  const qualityMetrics = [
    { metric: 'Patient Safety Score', value: 96, target: 95, trend: 'up' },
    { metric: 'Clinical Quality Index', value: 88, target: 90, trend: 'down' },
    { metric: 'Care Coordination', value: 92, target: 85, trend: 'up' },
    { metric: 'Preventive Care Rate', value: 84, target: 80, trend: 'up' }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
      case 'Low': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header - conditionally rendered */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold">Advanced Analytics</h2>
            <p className="text-muted-foreground">Comprehensive insights into patient outcomes and healthcare quality</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Select defaultValue={timeRange}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      )}

      {/* Quality Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {qualityMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.metric}</p>
                   <div className="flex items-center space-x-2 mt-1">
                     <span className="text-2xl font-bold">{metric.value}%</span>
                     {getTrendIcon(metric.trend)}
                   </div>
                   <p className="text-xs text-muted-foreground mt-1">Target: {metric.target}%</p>
                </div>
                <div className="h-12 w-12 bg-blue-500/15 rounded-full flex items-center justify-center">
                   <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Patient Outcomes Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Outcomes Trend</CardTitle>
          <CardDescription>Recovery rates, satisfaction scores, and readmission rates over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patientOutcomes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="recovery" stroke={chartColor("trust")} strokeWidth={2} name="Recovery Rate %" />
                <Line type="monotone" dataKey="satisfaction" stroke={chartColor("success")} strokeWidth={2} name="Satisfaction %" />
                <Line type="monotone" dataKey="readmission" stroke={chartColor("warning")} strokeWidth={2} name="Readmission %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Effectiveness and Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Treatment Effectiveness</CardTitle>
            <CardDescription>Success rates across different treatment protocols</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {treatmentEffectiveness.map((treatment, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{treatment.treatment}</span>
                    <span className="text-sm text-muted-foreground">
                      {treatment.success}/{treatment.total} ({Math.round((treatment.success/treatment.total)*100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(treatment.success/treatment.total)*100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
            <CardDescription>Actual vs. budgeted costs by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="budget" fill={chartMutedFill()} name="Budget" />
                  <Bar dataKey="cost" fill={chartColor("trust")} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Factors Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Factors Analysis</CardTitle>
          <CardDescription>Patient population risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskFactors.map((factor, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{factor.factor}</h4>
                  <Badge className={getRiskColor(factor.risk)}>
                    {factor.risk} Risk
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{factor.patients} patients</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictive Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Predictive Analytics</CardTitle>
          <CardDescription>AI-powered insights and predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300">Risk Predictions</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-red-500/10 rounded">
                  <span className="text-sm">High readmission risk</span>
                  <Badge variant="destructive">12 patients</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-500/10 rounded">
                  <span className="text-sm">Medication adherence risk</span>
                  <Badge className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-300">8 patients</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-500/10 rounded">
                  <span className="text-sm">Appointment no-show risk</span>
                  <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-300">15 patients</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-green-700 dark:text-green-300">Optimization Opportunities</h4>
              <div className="space-y-2">
                <div className="p-2 bg-green-500/10 rounded">
                  <span className="text-sm">Reduce lab turnaround time by 15%</span>
                </div>
                <div className="p-2 bg-green-500/10 rounded">
                  <span className="text-sm">Optimize appointment scheduling</span>
                </div>
                <div className="p-2 bg-green-500/10 rounded">
                  <span className="text-sm">Improve preventive care uptake</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300">Recommendations</h4>
              <div className="space-y-2">
                <div className="p-2 bg-purple-500/10 rounded">
                  <span className="text-sm">Implement diabetes prevention program</span>
                </div>
                <div className="p-2 bg-purple-500/10 rounded">
                  <span className="text-sm">Enhance patient education resources</span>
                </div>
                <div className="p-2 bg-purple-500/10 rounded">
                  <span className="text-sm">Expand telehealth services</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;
