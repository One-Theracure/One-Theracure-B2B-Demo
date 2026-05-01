import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Clock, 
  Users, 
  DollarSign,
  FileText,
  AlertTriangle,
  Calendar,
  Target,
  Brain,
  Zap,
  BarChart3
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { chartColor } from "@/lib/chartTheme";

interface ProductivityMetrics {
  documentationTime: {
    current: number;
    previous: number;
    savedMinutes: number;
  };
  patientThroughput: {
    patientsPerDay: number;
    averageVisitTime: number;
    noShowRate: number;
  };
  revenueMetrics: {
    revenuePerVisit: number;
    codingAccuracy: number;
    claimApprovalRate: number;
  };
  aiEfficiencyGains: {
    soapNoteGeneration: number;
    codingAssistance: number;
    clinicalDecisionSupport: number;
  };
}

const mockProductivityData = {
  documentationTime: [
    { date: '2024-01-01', manualTime: 25, aiAssistedTime: 8, timeSaved: 17 },
    { date: '2024-01-02', manualTime: 23, aiAssistedTime: 7, timeSaved: 16 },
    { date: '2024-01-03', manualTime: 28, aiAssistedTime: 9, timeSaved: 19 },
    { date: '2024-01-04', manualTime: 22, aiAssistedTime: 6, timeSaved: 16 },
    { date: '2024-01-05', manualTime: 26, aiAssistedTime: 8, timeSaved: 18 },
    { date: '2024-01-06', manualTime: 24, aiAssistedTime: 7, timeSaved: 17 },
    { date: '2024-01-07', manualTime: 21, aiAssistedTime: 6, timeSaved: 15 },
  ],
  throughputTrends: [
    { week: 'Week 1', patients: 45, avgVisitTime: 32, revenue: 4850 },
    { week: 'Week 2', patients: 48, avgVisitTime: 29, revenue: 5280 },
    { week: 'Week 3', patients: 52, avgVisitTime: 27, revenue: 5720 },
    { week: 'Week 4', patients: 55, avgVisitTime: 25, revenue: 6050 },
  ],
  aiFeatureUsage: [
    { name: 'SOAP Generation',     value: 78, token: 'trust'   as const },
    { name: 'Coding Assistant',    value: 65, token: 'success' as const },
    { name: 'AI CDSS',             value: 82, token: 'warning' as const },
    { name: 'Voice Transcription', value: 71, token: 'sky'     as const },
  ],
  errorDetection: [
    { category: 'Coding Errors', prevented: 23, impact: 'High' },
    { category: 'Documentation Gaps', prevented: 15, impact: 'Medium' },
    { category: 'Drug Interactions', prevented: 8, impact: 'Critical' },
    { category: 'Billing Discrepancies', prevented: 12, impact: 'High' },
  ]
};

interface ProductivityAnalyticsProps {
  showHeader?: boolean;
  timeRange?: string;
  compact?: boolean;
}

export const ProductivityAnalytics = ({ showHeader = true, timeRange: initialTimeRange = "30d", compact = false }: ProductivityAnalyticsProps) => {
  const [metrics, setMetrics] = useState<ProductivityMetrics>({
    documentationTime: {
      current: 8.5,
      previous: 24.2,
      savedMinutes: 15.7
    },
    patientThroughput: {
      patientsPerDay: 28,
      averageVisitTime: 26,
      noShowRate: 12
    },
    revenueMetrics: {
      revenuePerVisit: 185,
      codingAccuracy: 94,
      claimApprovalRate: 97
    },
    aiEfficiencyGains: {
      soapNoteGeneration: 68,
      codingAssistance: 71,
      clinicalDecisionSupport: 82
    }
  });

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>(initialTimeRange as '7d' | '30d' | '90d');

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'High': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - conditionally rendered */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Doctor Productivity Analytics
            </h1>
            <p className="text-muted-foreground">
              AI-powered insights into clinical efficiency and practice performance
            </p>
          </div>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Documentation Time</p>
                <p className="text-2xl font-bold text-emerald-500">
                  {metrics.documentationTime.current}min
                </p>
                <p className="text-xs text-emerald-500">
                  ↓{metrics.documentationTime.savedMinutes}min saved vs manual
                </p>
              </div>
              <Clock className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Patients Per Day</p>
                <p className="text-2xl font-bold text-blue-500">
                  {metrics.patientThroughput.patientsPerDay}
                </p>
                <p className="text-xs text-blue-500">
                  ↑18% increase this month
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Per Visit</p>
                <p className="text-2xl font-bold text-purple-500">
                  ${metrics.revenueMetrics.revenuePerVisit}
                </p>
                <p className="text-xs text-purple-500">
                  ↑12% vs last period
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Coding Accuracy</p>
                <p className="text-2xl font-bold text-orange-500">
                  {metrics.revenueMetrics.codingAccuracy}%
                </p>
                <p className="text-xs text-orange-500">
                  ↑8% with AI assistance
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="efficiency" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="efficiency">
            <Zap className="h-4 w-4 mr-2" />
            Efficiency Gains
          </TabsTrigger>
          <TabsTrigger value="throughput">
            <TrendingUp className="h-4 w-4 mr-2" />
            Patient Throughput
          </TabsTrigger>
          <TabsTrigger value="ai-impact">
            <Brain className="h-4 w-4 mr-2" />
            AI Impact
          </TabsTrigger>
          <TabsTrigger value="quality">
            <FileText className="h-4 w-4 mr-2" />
            Quality Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="efficiency">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Documentation Time Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockProductivityData.documentationTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="manualTime"
                      stackId="1"
                      stroke={chartColor("warning")}
                      fill={chartColor("warning")}
                      fillOpacity={0.18}
                      name="Manual Time (min)"
                    />
                    <Area
                      type="monotone"
                      dataKey="aiAssistedTime"
                      stackId="2"
                      stroke={chartColor("success")}
                      fill={chartColor("success")}
                      fillOpacity={0.18}
                      name="AI-Assisted Time (min)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Feature Adoption</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProductivityData.aiFeatureUsage.map((feature, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{feature.name}</span>
                        <span className="text-sm text-muted-foreground">{feature.value}%</span>
                      </div>
                      <Progress value={feature.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="throughput">
          <Card>
            <CardHeader>
              <CardTitle>Patient Throughput Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={mockProductivityData.throughputTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="patients" fill={chartColor("trust")} name="Patients Seen" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgVisitTime"
                    stroke={chartColor("success")}
                    strokeWidth={3}
                    name="Avg Visit Time (min)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-impact">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AI Efficiency Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">SOAP Note Generation</span>
                    <Badge variant="outline">{metrics.aiEfficiencyGains.soapNoteGeneration}% faster</Badge>
                  </div>
                  <Progress value={metrics.aiEfficiencyGains.soapNoteGeneration} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Coding Assistance</span>
                    <Badge variant="outline">{metrics.aiEfficiencyGains.codingAssistance}% accuracy</Badge>
                  </div>
                  <Progress value={metrics.aiEfficiencyGains.codingAssistance} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Clinical Decision Support</span>
                    <Badge variant="outline">{metrics.aiEfficiencyGains.clinicalDecisionSupport}% utilization</Badge>
                  </div>
                  <Progress value={metrics.aiEfficiencyGains.clinicalDecisionSupport} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Saved by AI Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                    <div>
                      <p className="font-medium">AI Note Generation</p>
                      <p className="text-sm text-muted-foreground">SOAP note generation</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-500">15.2 min/day</p>
                      <p className="text-xs text-blue-500">76 hours/month</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                    <div>
                      <p className="font-medium">Coding Assistant</p>
                      <p className="text-sm text-muted-foreground">ICD-10/CPT coding</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-500">8.7 min/day</p>
                      <p className="text-xs text-emerald-500">43.5 hours/month</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                    <div>
                      <p className="font-medium">Clinical Decision Support</p>
                      <p className="text-sm text-muted-foreground">Diagnosis assistance</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-500">5.3 min/day</p>
                      <p className="text-xs text-purple-500">26.5 hours/month</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Error Prevention & Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProductivityData.errorDetection.map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{error.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {error.prevented} errors prevented this month
                        </p>
                      </div>
                      <Badge className={getImpactColor(error.impact)}>
                        {error.impact}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Improvement Trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Documentation Completeness</span>
                    <span className="text-sm font-medium">94%</span>
                  </div>
                  <Progress value={94} />
                  <p className="text-xs text-emerald-500">↑12% improvement with AI assistance</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Coding Accuracy</span>
                    <span className="text-sm font-medium">97%</span>
                  </div>
                  <Progress value={97} />
                  <p className="text-xs text-emerald-500">↑15% improvement vs manual</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clinical Guideline Adherence</span>
                    <span className="text-sm font-medium">89%</span>
                  </div>
                  <Progress value={89} />
                  <p className="text-xs text-emerald-500">↑8% with AI CDSS recommendations</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};