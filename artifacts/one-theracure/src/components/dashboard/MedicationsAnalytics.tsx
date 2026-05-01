
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Pie, Cell, Legend } from "recharts";
import { Pill, TrendingUp } from "lucide-react";
import { chartColor, chartPalette, chartTooltipProps, type BrandToken } from "@/lib/chartTheme";

const MedicationsAnalytics = () => {
  const topMedications = [
    { name: "Paracetamol", count: 125, percentage: 22, category: "Analgesic", strength: "500mg" },
    { name: "Metformin", count: 98, percentage: 17, category: "Antidiabetic", strength: "500mg" },
    { name: "Amlodipine", count: 87, percentage: 15, category: "Antihypertensive", strength: "5mg" },
    { name: "Omeprazole", count: 76, percentage: 13, category: "PPI", strength: "20mg" },
    { name: "Atorvastatin", count: 65, percentage: 11, category: "Statin", strength: "20mg" },
    { name: "Aspirin", count: 54, percentage: 9, category: "Antiplatelet", strength: "75mg" },
    { name: "Losartan", count: 43, percentage: 8, category: "ARB", strength: "50mg" },
    { name: "Levothyroxine", count: 28, percentage: 5, category: "Thyroid", strength: "50mcg" }
  ];

  const medicationsByCategory: Array<{
    name: string; value: number; token: BrandToken; count: number;
  }> = [
    { name: "Cardiovascular", value: 35, token: chartPalette[0], count: 198 },
    { name: "Analgesics",     value: 22, token: chartPalette[3], count: 125 },
    { name: "Diabetes",       value: 17, token: chartPalette[2], count:  98 },
    { name: "Gastro",         value: 13, token: chartPalette[1], count:  76 },
    { name: "Others",         value: 13, token: chartPalette[4], count:  75 },
  ];

  const monthlyPrescriptions = [
    { month: "Jan", total: 445, antibiotics: 85 },
    { month: "Feb", total: 512, antibiotics: 92 },
    { month: "Mar", total: 489, antibiotics: 78 },
    { month: "Apr", total: 567, antibiotics: 105 },
    { month: "May", total: 523, antibiotics: 88 },
    { month: "Jun", total: 589, antibiotics: 112 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Most Prescribed Medications</span>
            </CardTitle>
            <CardDescription>Top medications prescribed this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMedications.slice(0, 6).map((medication, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="font-bold">{index + 1}</Badge>
                    <div>
                      <h4 className="font-semibold text-foreground">{medication.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{medication.strength}</span>
                        <span>•</span>
                        <span>{medication.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{medication.count}</span>
                    <p className="text-sm text-muted-foreground">{medication.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medications by Category</CardTitle>
            <CardDescription>Distribution of prescribed medication types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={medicationsByCategory}
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  dataKey="value"
                >
                  {medicationsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColor(entry.token)} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipProps} formatter={(value) => `${value}%`} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Prescription Trends</CardTitle>
            <CardDescription>Total prescriptions and antibiotic usage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPrescriptions}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 13 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 13 }} className="text-muted-foreground" />
                <Tooltip {...chartTooltipProps} />
                <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
                <Bar dataKey="total" fill={chartColor("trust")} name="Total Prescriptions" radius={[3, 3, 0, 0]} />
                <Bar dataKey="antibiotics" fill={chartColor("warning")} name="Antibiotics" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Detailed medication category statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medicationsByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: chartColor(category.token) }}
                    ></div>
                    <span className="font-medium text-foreground">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-foreground">{category.value}%</span>
                    <p className="text-sm text-muted-foreground">{category.count} prescriptions</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Prescription Insights</span>
          </CardTitle>
          <CardDescription>Key medication prescribing patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-500/10 rounded-lg">
              <h3 className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">572</h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold">Total Prescriptions</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">This month</p>
            </div>
            <div className="text-center p-4 bg-emerald-500/10 rounded-lg">
              <h3 className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">4.2</h3>
              <p className="text-sm text-emerald-800 dark:text-emerald-300 font-semibold">Avg per Patient</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Medications prescribed</p>
            </div>
            <div className="text-center p-4 bg-orange-500/10 rounded-lg">
              <h3 className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">18%</h3>
              <p className="text-sm text-orange-800 dark:text-orange-300 font-semibold">Antibiotic Rate</p>
              <p className="text-sm text-orange-600 dark:text-orange-400">Of total prescriptions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicationsAnalytics;