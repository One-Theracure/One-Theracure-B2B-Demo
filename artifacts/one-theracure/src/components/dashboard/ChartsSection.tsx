
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, Legend } from "recharts";
import { chartColor, chartPalette } from "@/lib/chartTheme";

const monthlyVisits = [
  { month: "Jan", visits: 45, newPatients: 12 },
  { month: "Feb", visits: 52, newPatients: 15 },
  { month: "Mar", visits: 48, newPatients: 8 },
  { month: "Apr", visits: 61, newPatients: 18 },
  { month: "May", visits: 55, newPatients: 11 },
  { month: "Jun", visits: 67, newPatients: 22 },
];

const dailyPerformance = [
  { day: "Mon", avgTime: 25, visits: 12 },
  { day: "Tue", avgTime: 22, visits: 15 },
  { day: "Wed", avgTime: 28, visits: 18 },
  { day: "Thu", avgTime: 24, visits: 14 },
  { day: "Fri", avgTime: 26, visits: 16 },
  { day: "Sat", avgTime: 23, visits: 10 },
];

const specialtyDistribution = [
  { name: "General Medicine", value: 35 },
  { name: "Gynecology",       value: 25 },
  { name: "Cardiology",       value: 20 },
  { name: "Oncology",         value: 12 },
  { name: "Orthopedics",      value: 8  },
];

const topDiagnoses = [
  { diagnosis: "Hypertension", count: 45, percentage: 18 },
  { diagnosis: "Diabetes Mellitus", count: 38, percentage: 15 },
  { diagnosis: "Upper Respiratory Infection", count: 32, percentage: 13 },
  { diagnosis: "Anxiety Disorder", count: 28, percentage: 11 },
  { diagnosis: "Migraine", count: 25, percentage: 10 },
];

const ChartsSection = () => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Visit Trends</CardTitle>
            <CardDescription>Total visits and new patients by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyVisits}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 13 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 13 }} className="fill-muted-foreground" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
                <Bar dataKey="visits" fill={chartColor("trust")} name="Total Visits" radius={[3, 3, 0, 0]} />
                <Bar dataKey="newPatients" fill={chartColor("success")} name="New Patients" radius={[3, 3, 0, 0]} />
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
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyPerformance}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 13 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 13 }} className="fill-muted-foreground" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
                <Line type="monotone" dataKey="avgTime" stroke={chartColor("warning")} name="Avg Time (min)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="visits" stroke={chartColor("trust")} name="Visits" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Specialty Distribution</CardTitle>
            <CardDescription>Patient visits by medical specialty</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RechartsPieChart>
                <Pie
                  data={specialtyDistribution}
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  dataKey="value"
                >
                  {specialtyDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColor(chartPalette[index % chartPalette.length])}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Diagnoses</CardTitle>
            <CardDescription>Most common diagnoses this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDiagnoses.map((diagnosis, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs w-6 h-6 p-0 flex items-center justify-center">{index + 1}</Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{diagnosis.diagnosis}</p>
                      <p className="text-xs text-muted-foreground">{diagnosis.percentage}% of all diagnoses</p>
                    </div>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <span className="text-xl font-bold text-primary">{diagnosis.count}</span>
                    <p className="text-xs text-muted-foreground">cases</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ChartsSection;
