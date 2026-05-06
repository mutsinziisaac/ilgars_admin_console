import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from "recharts"
import { useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

export function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week")

  // Revenue data for different time ranges
  const revenueDataDay = [
    { day: "12am", revenue: 15000, fill: "#D6F0E0" },
    { day: "3am", revenue: 8000, fill: "#D6F0E0" },
    { day: "6am", revenue: 25000, fill: "#D6F0E0" },
    { day: "9am", revenue: 45000, fill: "#D6F0E0" },
    { day: "12pm", revenue: 65000, fill: "oklch(0.30 0.06 155)" }, // Peak hour - primary color
    { day: "3pm", revenue: 52000, fill: "#D6F0E0" },
    { day: "6pm", revenue: 38000, fill: "#D6F0E0" },
    { day: "9pm", revenue: 22000, fill: "#D6F0E0" },
  ]

  const revenueDataWeek = [
    { day: "Mon", revenue: 250000, fill: "#D6F0E0" },
    { day: "Tue", revenue: 320000, fill: "#D6F0E0" },
    { day: "Wed", revenue: 280000, fill: "#D6F0E0" },
    { day: "Thu", revenue: 380000, fill: "#D6F0E0" },
    { day: "Fri", revenue: 450000, fill: "#D6F0E0" },
    { day: "Sat", revenue: 310000, fill: "#D6F0E0" },
    { day: "Sun", revenue: 270000, fill: "#D6F0E0" },
    { day: "Mon", revenue: 340000, fill: "#D6F0E0" },
    { day: "Tue", revenue: 390000, fill: "#D6F0E0" },
    { day: "Wed", revenue: 420000, fill: "#D6F0E0" },
    { day: "Thu", revenue: 460000, fill: "#D6F0E0" },
    { day: "Fri", revenue: 520000, fill: "oklch(0.30 0.06 155)" }, // Tallest bar - primary color
    { day: "Sat", revenue: 380000, fill: "#D6F0E0" },
    { day: "Sun", revenue: 290000, fill: "#D6F0E0" },
  ]

  const revenueDataMonth = [
    { day: "Week 1", revenue: 1200000, fill: "#D6F0E0" },
    { day: "Week 2", revenue: 1450000, fill: "#D6F0E0" },
    { day: "Week 3", revenue: 1680000, fill: "oklch(0.30 0.06 155)" }, // Highest week - primary color
    { day: "Week 4", revenue: 1320000, fill: "#D6F0E0" },
  ]

  // Select data based on active tab
  const revenueData = 
    timeRange === "day" ? revenueDataDay :
    timeRange === "week" ? revenueDataWeek :
    revenueDataMonth

  // Calculate total revenue
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const formattedTotal = totalRevenue >= 1000000 
    ? `${(totalRevenue / 1000000).toFixed(2)}M` 
    : `${(totalRevenue / 1000).toFixed(0)}k`

  // Compliance data for donut chart
  const complianceData = [
    { name: "Compliant", value: 1847, color: "#D6F0E0" },
    { name: "Postponed open", value: 331, color: "#FFF306" },
    { name: "Delinquent", value: 189, color: "#E5533D" },
  ]

  const totalVehicles = complianceData.reduce((sum, item) => sum + item.value, 0)
  const compliancePercentage = Math.round((complianceData[0].value / totalVehicles) * 100)

  // Chart configuration
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#D6F0E0",
    },
  }

  const complianceChartConfig = {
    compliant: { label: "Compliant", color: "#D6F0E0" },
    postponed: { label: "Postponed open", color: "#FFF306" },
    delinquent: { label: "Delinquent", color: "#E5533D" },
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Today */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Revenue Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">412,500 <span className="text-xl font-normal text-muted-foreground">MZN</span></div>
            <div className="mt-2 flex items-center gap-2">
              <Badge className="bg-[#D6F0E0] text-[#1C1C1C] hover:bg-[#D6F0E0]/80 text-sm px-2 py-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12.4%
              </Badge>
              <span className="text-sm text-muted-foreground">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Vehicles */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Active Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">2,367</div>
            <div className="mt-2 flex items-center gap-2">
              <Badge className="bg-[#D6F0E0] text-[#1C1C1C] hover:bg-[#D6F0E0]/80 text-sm px-2 py-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +31k
              </Badge>
              <span className="text-sm text-muted-foreground">open city presence</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Permits */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Pending Permits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">8</div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="border-[#FFF306]/30 bg-[#FFF306]/10 text-[#1C1C1C] hover:bg-[#FFF306]/20 text-sm px-2 py-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +2
              </Badge>
              <span className="text-sm text-muted-foreground">awaiting review</span>
            </div>
          </CardContent>
        </Card>

        {/* Enforcement Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Enforcement Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">47</div>
            <div className="mt-2 flex items-center gap-2">
              <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm px-2 py-1 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                -8.2%
              </Badge>
              <span className="text-sm text-muted-foreground">lower than avg</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart and Revenue by Category - Side by Side */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Revenue · Last {timeRange === "day" ? "24 Hours" : timeRange === "week" ? "14 Days" : "4 Weeks"}
              </CardTitle>
              <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as "day" | "week" | "month")}>
                <TabsList>
                  <TabsTrigger value="day" className="text-sm">Day</TabsTrigger>
                  <TabsTrigger value="week" className="text-sm">Week</TabsTrigger>
                  <TabsTrigger value="month" className="text-sm">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="text-4xl font-bold">{formattedTotal} <span className="text-xl font-normal text-muted-foreground">MZN</span></div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }} barGap={1} barCategoryGap="5%">
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false}
                  stroke="#E0E5E2"
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9AA8A0", fontSize: 14 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9AA8A0", fontSize: 14 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => {
                        return `${Number(value).toLocaleString()} MZN`
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="revenue"
                  radius={[6, 6, 0, 0]}
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Revenue by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Cargo Truck */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Cargo Truck (E-481)</span>
                  <span className="text-base font-bold">248,500 MZN</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-[#D6F0E0]" style={{ width: "75%" }} />
                </div>
              </div>

              {/* Heavy Truck */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Heavy Truck (E-482)</span>
                  <span className="text-base font-bold">186,200 MZN</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-[#D6F0E0]" style={{ width: "56%" }} />
                </div>
              </div>

              {/* Tractor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Tractor (E-483)</span>
                  <span className="text-base font-bold">124,800 MZN</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-[#FFF306]" style={{ width: "38%" }} />
                </div>
              </div>

              {/* Light Truck */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Light Truck (E-480)</span>
                  <span className="text-base font-bold">98,400 MZN</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-[#FFF306]" style={{ width: "30%" }} />
                </div>
              </div>

              {/* Bus */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Bus (E-484)</span>
                  <span className="text-base font-bold">72,600 MZN</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-[#FFF306]" style={{ width: "22%" }} />
                </div>
              </div>

              {/* Other */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Other Vehicles</span>
                  <span className="text-base font-bold">45,000 MZN</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-[#DAA22A]" style={{ width: "14%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Compliance & Live Transactions */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Compliance Today */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Compliance Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-8">
              {/* Donut Chart */}
              <div className="relative h-40 w-40 flex-shrink-0">
                <ChartContainer config={complianceChartConfig} className="h-full w-full">
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                {/* Center text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-4xl font-bold">{compliancePercentage}%</div>
                  <div className="text-sm text-muted-foreground text-center">of vehicles<br />in city</div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex-1 space-y-3">
                {complianceData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-4 w-4 rounded-sm flex-shrink-0" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-base text-foreground">{item.name}</span>
                    </div>
                    <span className="text-base font-medium">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Live Transactions
              </CardTitle>
              <button className="text-sm text-primary hover:underline">View all →</button>
            </div>
            <p className="text-sm text-muted-foreground">Updating · 124 ops</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Transaction Item 1 */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-sm font-semibold text-primary">CT</span>
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">Cargo Truck</p>
                    <p className="text-sm text-muted-foreground">License: MPT-2847-A</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold text-foreground">12,500 MZN</p>
                  <p className="text-sm text-muted-foreground">2 min ago</p>
                </div>
              </div>

              {/* Transaction Item 2 */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-sm font-semibold text-primary">TR</span>
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">Tractor</p>
                    <p className="text-sm text-muted-foreground">License: MPT-1923-B</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold text-foreground">8,200 MZN</p>
                  <p className="text-sm text-muted-foreground">5 min ago</p>
                </div>
              </div>

              {/* Transaction Item 3 */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-sm font-semibold text-primary">HT</span>
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">Heavy Truck</p>
                    <p className="text-sm text-muted-foreground">License: MPT-5612-C</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold text-foreground">15,750 MZN</p>
                  <p className="text-sm text-muted-foreground">8 min ago</p>
                </div>
              </div>

              {/* Transaction Item 4 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-sm font-semibold text-primary">TR</span>
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">Tractor</p>
                    <p className="text-sm text-muted-foreground">License: MPT-8934-D</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold text-foreground">9,500 MZN</p>
                  <p className="text-sm text-muted-foreground">12 min ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
