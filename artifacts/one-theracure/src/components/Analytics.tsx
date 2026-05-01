import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Clock,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Pie } from "recharts";
import { chartColor, chartPalette, chartTooltipProps, type BrandToken } from "@/lib/chartTheme";

const Analytics = () => {
  const monthlyVisits = [
    { month: "Jan", visits: 45, newPatients: 12 },
    { month: "Feb", visits: 52, newPatients: 15 },
    { month: "Mar", visits: 48, newPatients: 8 },
    { month: "Apr", visits: 61, newPatients: 18 },
    { month: "May", visits: 55, newPatients: 11 },
    { month: "Jun", visits: 67, newPatients: 22 }
  ];

  const specialtyDistribution: Array<{
    name: string; value: number; token: BrandToken;
  }> = [
    { name: "General Medicine", value: 35, token: chartPalette[0] },
    { name: "Gynecology",       value: 25, token: chartPalette[3] },
    { name: "Cardiology",       value: 20, token: chartPalette[2] },
    { name: "Oncology",         value: 12, token: chartPalette[1] },
    { name: "Orthopedics",      value:  8, token: chartPalette[4] },
  ];

  const dailyPerformance = [
    { day: "Mon", avgTime: 25, visits: 12 },
    { day: "Tue", avgTime: 22, visits: 15 },
    { day: "Wed", avgTime: 28, visits: 18 },
    { day: "Thu", avgTime: 24, visits: 14 },
    { day: "Fri", avgTime: 26, visits: 16 },
    { day: "Sat", avgTime: 23, visits: 10 }
  ];

  const topDiagnoses = [
    { diagnosis: "Hypertension", count: 45, percentage: 18 },
    { diagnosis: "Diabetes Mellitus", count: 38, percentage: 15 },
    { diagnosis: "Upper Respiratory Infection", count: 32, percentage: 13 },
    { diagnosis: "Anxiety Disorder", count: 28, percentage: 11 },
    { diagnosis: "Migraine", count: 25, percentage: 10 }
  ];

  const metrics = [
    {
      title: "Average Visit Duration",
      value: "24 min",
      change: "-2 min from last month",
      icon: Clock,
      color: "text-blue-500",
      trend: "down"
    },
    {
      title: "Patient Satisfaction",
      value: "4.8/5",
      change: "+0.2 from last month",
      icon: TrendingUp,
      color: "text-emerald-500",
      trend: "up"
    },
    {
      title: "Documentation Time",
      value: "8 min",
      change: "-3 min with smart forms",
      icon: FileText,
      color: "text-purple-500",
      trend: "down"
    },
    {
      title: "No-show Rate",
      value: "12%",
      change: "-3% from last month",
      icon: Users,
      color: "text-orange-500",
      trend: "down"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Export and Date Range */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Clinical Analytics Dashboard</h3>
              <p className="text-muted-foreground">Performance insights and reporting</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Last 30 Days
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                    <p className={`text-sm ${metric.trend === 'up' ? 'text-emerald-500' : 'text-blue-500'}`}>
                      {metric.change}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-muted">
                    <IconComponent className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="visits">
            <Activity className="h-4 w-4 mr-2" />
            Visits
          </TabsTrigger>
          <TabsTrigger value="specialties">
            <PieChart className="h-4 w-4 mr-2" />
            Specialties
          </TabsTrigger>
          <TabsTrigger value="diagnoses">
            <FileText className="h-4 w-4 mr-2" />
            Diagnoses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Visit Trends</CardTitle>
                <CardDescription>Total visits and new patients by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyVisits}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip {...chartTooltipProps} />
                    <Bar dataKey="visits" fill={chartColor("trust")} name="Total Visits" />
                    <Bar dataKey="newPatients" fill={chartColor("success")} name="New Patients" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Performance</CardTitle>
                <CardDescription>Average consultation time and visit count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip {...chartTooltipProps} />
                    <Line type="monotone" dataKey="avgTime" stroke={chartColor("warning")} name="Avg Time (min)" />
                    <Line type="monotone" dataKey="visits" stroke={chartColor("trust")} name="Visits" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visit Analytics</CardTitle>
              <CardDescription>Detailed visit statistics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <h3 className="text-2xl font-bold text-blue-500">324</h3>
                  <p className="text-foreground">Total Visits</p>
                  <p className="text-sm text-blue-500">This month</p>
                </div>
                <div className="text-center p-4 bg-emerald-500/10 rounded-lg">
                  <h3 className="text-2xl font-bold text-emerald-500">86</h3>
                  <p className="text-foreground">New Patients</p>
                  <p className="text-sm text-emerald-500">This month</p>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                  <h3 className="text-2xl font-bold text-purple-500">238</h3>
                  <p className="text-foreground">Follow-ups</p>
                  <p className="text-sm text-purple-500">This month</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyVisits}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip {...chartTooltipProps} />
                  <Bar dataKey="visits" fill={chartColor("trust")} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialties" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Specialty Distribution</CardTitle>
                <CardDescription>Patient visits by medical specialty</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={specialtyDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {specialtyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColor(entry.token)} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltipProps} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specialty Breakdown</CardTitle>
                <CardDescription>Detailed view of each specialty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {specialtyDistribution.map((specialty, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: chartColor(specialty.token) }}
                        ></div>
                        <span className="font-medium">{specialty.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{specialty.value}%</span>
                        <p className="text-sm text-muted-foreground">~{Math.round(specialty.value * 3.24)} visits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diagnoses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Diagnoses</CardTitle>
              <CardDescription>Most common diagnoses this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDiagnoses.map((diagnosis, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <h4 className="font-medium">{diagnosis.diagnosis}</h4>
                        <p className="text-sm text-muted-foreground">{diagnosis.percentage}% of all diagnoses</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">{diagnosis.count}</span>
                      <p className="text-sm text-muted-foreground">cases</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
