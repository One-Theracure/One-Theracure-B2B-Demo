import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  Download,
  TrendingUp,
  Brain,
  Stethoscope,
  Users,
  Clock,
  DollarSign,
  Target,
  Activity,
  FileText,
  Zap,
  BarChart3,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdvancedAnalytics from "@/components/analytics/AdvancedAnalytics";
import { ProductivityAnalytics } from "@/components/analytics/ProductivityAnalytics";
import AIInsightsPill from "@/components/AIInsightsPill";

const UnifiedAnalyticsSection = () => {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");

  const handleExport = () => {
    toast({ title: "Report exported", description: "Dashboard report downloaded as PDF (mock)." });
  };

  // Combined KPI data from both analytics sections
  const combinedKPIs = [
    {
      title: "Documentation Time",
      value: "8.5 min",
      change: "↓65% vs manual",
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Patient Satisfaction",
      value: "4.8/5",
      change: "+0.2 from last month",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Patients Per Day",
      value: "28",
      change: "↑18% increase",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Revenue Per Visit",
      value: "₹185",
      change: "↑12% vs last period",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Coding Accuracy",
      value: "94%",
      change: "↑8% with AI assist",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10"
    },
    {
      title: "Patient Safety Score",
      value: "96%",
      change: "Above target (95%)",
      icon: Activity,
      color: "text-cyan-600",
      bgColor: "bg-cyan-500/10"
    }
  ];

  const aiInsights = [
    "15.7 minutes saved per patient with AI documentation",
    "23 coding errors prevented this month",
    "89% clinical guideline adherence with AI CDSS",
    "12 high-risk patients identified for intervention"
  ];

  return (
    <div className="space-y-6">
      {/* Unified Header with Controls */}
      <Card className="border rounded-2xl bg-gradient-to-r from-blue-50 via-purple-50 to-cyan-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-cyan-950/30 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Clinical Intelligence Dashboard
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI-powered insights combining clinic analytics and doctor productivity
                </p>
              </div>
              <div className="hidden lg:block"><AIInsightsPill insights={aiInsights} /></div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px] h-9 text-sm">
                  <Calendar className="h-3.5 w-3.5 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-[140px] h-9 text-sm">
                  <Stethoscope className="h-3.5 w-3.5 mr-2" />
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  <SelectItem value="dr-smith">Dr. Smith</SelectItem>
                  <SelectItem value="dr-johnson">Dr. Johnson</SelectItem>
                  <SelectItem value="dr-williams">Dr. Williams</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-[150px] h-9 text-sm">
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="general">General Medicine</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                </SelectContent>
              </Select>
              
              <Button size="sm" className="h-9 text-sm" onClick={handleExport}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combined KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {combinedKPIs.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <Card key={index} className="relative overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground leading-none">
                      {kpi.title}
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tabular-nums leading-none">
                      {kpi.value}
                    </p>
                    <p className={`text-xs ${kpi.color} leading-none`}>
                      {kpi.change}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-2.5 rounded-xl ${kpi.bgColor} flex-shrink-0`}>
                    <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="clinic-overview" className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto h-auto gap-1 p-1">
          <TabsTrigger value="clinic-overview" className="flex-shrink-0 text-sm">
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Clinic Overview
          </TabsTrigger>
          <TabsTrigger value="productivity" className="flex-shrink-0 text-sm">
            <Zap className="h-4 w-4 mr-1.5" />
            Productivity
          </TabsTrigger>
          <TabsTrigger value="clinical-quality" className="flex-shrink-0 text-sm">
            <Activity className="h-4 w-4 mr-1.5" />
            Clinical Quality
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex-shrink-0 text-sm">
            <Brain className="h-4 w-4 mr-1.5" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clinic-overview" className="space-y-6">
          <AdvancedAnalytics 
            showHeader={false} 
            timeRange={timeRange} 
            compact={true}
          />
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <ProductivityAnalytics 
            showHeader={false} 
            timeRange={timeRange}
            compact={true}
          />
        </TabsContent>

        <TabsContent value="clinical-quality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quality Metrics Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Documentation Completeness</span>
                    <Badge variant="secondary">94%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Clinical Guideline Adherence</span>
                    <Badge variant="secondary">89%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Error Prevention Rate</span>
                    <Badge variant="secondary">97%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Patient Safety Score</span>
                    <Badge variant="secondary">96%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI Impact on Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-accent/50 rounded-lg border border-border/50">
                    <p className="text-sm font-medium text-foreground">23 Coding Errors Prevented</p>
                    <p className="text-xs text-muted-foreground">AI coding assistant</p>
                  </div>
                  <div className="p-3 bg-accent/50 rounded-lg border border-border/50">
                    <p className="text-sm font-medium text-foreground">15 Documentation Gaps Filled</p>
                    <p className="text-xs text-muted-foreground">Smart EMR fields</p>
                  </div>
                  <div className="p-3 bg-accent/50 rounded-lg border border-border/50">
                    <p className="text-sm font-medium text-foreground">8 Drug Interactions Flagged</p>
                    <p className="text-xs text-muted-foreground">Clinical decision support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-destructive">Risk Predictions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-2.5 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-sm font-medium text-foreground">High Readmission Risk</p>
                  <p className="text-xs text-muted-foreground">12 patients identified</p>
                </div>
                <div className="p-2.5 bg-accent/50 rounded-lg border border-border/50">
                  <p className="text-sm font-medium text-foreground">Medication Adherence Risk</p>
                  <p className="text-xs text-muted-foreground">8 patients at risk</p>
                </div>
                <div className="p-2.5 bg-accent/50 rounded-lg border border-border/50">
                  <p className="text-sm font-medium text-foreground">Appointment No-show Risk</p>
                  <p className="text-xs text-muted-foreground">15 patients flagged</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-primary">Optimization Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-foreground">Reduce lab turnaround by 15%</p>
                </div>
                <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-foreground">Optimize appointment scheduling</p>
                </div>
                <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-foreground">Improve preventive care uptake</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-secondary-foreground">AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-2.5 bg-secondary/50 rounded-lg border border-border/50">
                  <p className="text-sm text-foreground">Implement diabetes prevention program</p>
                </div>
                <div className="p-2.5 bg-secondary/50 rounded-lg border border-border/50">
                  <p className="text-sm text-foreground">Enhance patient education resources</p>
                </div>
                <div className="p-2.5 bg-secondary/50 rounded-lg border border-border/50">
                  <p className="text-sm text-foreground">Expand telehealth services</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedAnalyticsSection;