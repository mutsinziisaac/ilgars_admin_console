import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, DollarSign, Truck, AlertCircle, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"

// Mock data for charts
const revenueData = [
  { month: "Jan", revenue: 450000, target: 400000 },
  { month: "Feb", revenue: 520000, target: 450000 },
  { month: "Mar", revenue: 480000, target: 500000 },
  { month: "Apr", revenue: 610000, target: 550000 },
  { month: "May", revenue: 580000, target: 600000 },
]

const complianceData = [
  { name: "Compliant", value: 78, color: "#4CAF50" },
  { name: "Non-compliant", value: 15, color: "#E5533D" },
  { name: "Pending", value: 7, color: "#F4A62A" },
]

const vehicleTypeData = [
  { type: "Cargo Truck", count: 45 },
  { type: "Tractor", count: 32 },
  { type: "Heavy Truck", count: 28 },
  { type: "Trailer", count: 15 },
]

const enforcementData = [
  { date: "May 1", checks: 45, fines: 8 },
  { date: "May 2", checks: 52, fines: 12 },
  { date: "May 3", checks: 48, fines: 6 },
  { date: "May 4", checks: 61, fines: 9 },
  { date: "May 5", checks: 55, fines: 11 },
]

export function ReportsPage() {
  const [reportType, setReportType] = useState("overview")
  const [dateRange, setDateRange] = useState("month")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleGenerateReport = () => {
    toast.success("Report generated", {
      description: "Your report is ready for download."
    })
  }

  const handleExportPDF = () => {
    toast.success("Exporting to PDF", {
      description: "Your PDF report is being generated."
    })
  }

  const handleExportExcel = () => {
    toast.success("Exporting to Excel", {
      description: "Your Excel report is being generated."
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-semibold text-foreground">Reports</h1>
        <p className="text-lg text-muted-foreground">Generate and analyze system reports</p>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Report Configuration</CardTitle>
          <CardDescription className="text-base">Select report type and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="report-type" className="text-base">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="text-base h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="revenue" className="text-base">Revenue Report</SelectItem>
                  <SelectItem value="compliance" className="text-base">Compliance Report</SelectItem>
                  <SelectItem value="enforcement" className="text-base">Enforcement Report</SelectItem>
                  <SelectItem value="vehicles" className="text-base">Vehicle Report</SelectItem>
                  <SelectItem value="transporters" className="text-base">Transporter Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-range" className="text-base">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="text-base h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="today" className="text-base">Today</SelectItem>
                  <SelectItem value="week" className="text-base">This Week</SelectItem>
                  <SelectItem value="month" className="text-base">This Month</SelectItem>
                  <SelectItem value="quarter" className="text-base">This Quarter</SelectItem>
                  <SelectItem value="year" className="text-base">This Year</SelectItem>
                  <SelectItem value="custom" className="text-base">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-base">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-base h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-base">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-base h-11"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleGenerateReport} className="text-base h-11 px-6">
              <BarChart3 className="h-5 w-5 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="text-base h-11 px-6">
              <Download className="h-5 w-5 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel} className="text-base h-11 px-6">
              <Download className="h-5 w-5 mr-2" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Type Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Report View</CardTitle>
              <CardDescription className="text-base">Select report type to view detailed analytics</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="report-type" className="text-base font-medium">
                Report Type:
              </Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type" className="w-[200px] text-base h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="overview" className="text-base">Overview</SelectItem>
                  <SelectItem value="revenue" className="text-base">Revenue</SelectItem>
                  <SelectItem value="compliance" className="text-base">Compliance</SelectItem>
                  <SelectItem value="enforcement" className="text-base">Enforcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Report */}
      {reportType === "overview" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </CardDescription>
                <CardTitle className="text-3xl">2,640,000 MZN</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-[#4CAF50]">+12.5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Active Vehicles
                </CardDescription>
                <CardTitle className="text-3xl">120</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">Across 5 transporters</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Compliance Rate
                </CardDescription>
                <CardTitle className="text-3xl">78%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-[#F4A62A]">22% non-compliant</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Permits Issued
                </CardDescription>
                <CardTitle className="text-3xl">8</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">4 pending review</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Vehicle Distribution</CardTitle>
                <CardDescription className="text-base">By vehicle type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vehicleTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E5E2" />
                    <XAxis dataKey="type" tick={{ fontSize: 14 }} />
                    <YAxis tick={{ fontSize: 14 }} />
                    <Tooltip contentStyle={{ fontSize: 14 }} />
                    <Bar dataKey="count" fill="#4FAF7C" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Compliance Status</CardTitle>
                <CardDescription className="text-base">Current compliance breakdown</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 14 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Revenue Report */}
      {reportType === "revenue" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Revenue Trends</CardTitle>
              <CardDescription className="text-base">Monthly revenue vs target (Last 5 months)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E5E2" />
                  <XAxis dataKey="month" tick={{ fontSize: 14 }} />
                  <YAxis tick={{ fontSize: 14 }} />
                  <Tooltip contentStyle={{ fontSize: 14 }} />
                  <Bar dataKey="revenue" fill="#4FAF7C" name="Actual Revenue" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="target" fill="#A8D5BA" name="Target" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Total Revenue (YTD)</CardDescription>
                <CardTitle className="text-3xl">2,640,000 MZN</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-[#4CAF50]">+18.2% vs last year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Average Daily Revenue</CardDescription>
                <CardTitle className="text-3xl">21,129 MZN</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">Based on 125 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Outstanding Payments</CardDescription>
                <CardTitle className="text-3xl text-[#E5533D]">156,000 MZN</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">From 18 vehicles</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Compliance Report */}
      {reportType === "compliance" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Compliance Overview</CardTitle>
                <CardDescription className="text-base">Current compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full bg-[#4CAF50]" />
                      <span className="text-base">Compliant</span>
                    </div>
                    <span className="text-lg font-bold">78 vehicles (78%)</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full bg-[#E5533D]" />
                      <span className="text-base">Non-compliant</span>
                    </div>
                    <span className="text-lg font-bold">15 vehicles (15%)</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full bg-[#F4A62A]" />
                      <span className="text-base">Pending Review</span>
                    </div>
                    <span className="text-lg font-bold">7 vehicles (7%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Compliance by Transporter</CardTitle>
                <CardDescription className="text-base">Top 5 transporters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "TransMoz Logistics", rate: 100, vehicles: 8 },
                    { name: "Swift Transport", rate: 90, vehicles: 10 },
                    { name: "Moza Transportes", rate: 75, vehicles: 12 },
                    { name: "Cargo Express", rate: 67, vehicles: 15 },
                    { name: "Freight Solutions", rate: 50, vehicles: 6 },
                  ].map((transporter, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-base">
                        <span className="font-medium">{transporter.name}</span>
                        <span className="text-muted-foreground">{transporter.rate}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#4FAF7C]" 
                          style={{ width: `${transporter.rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Enforcement Report */}
      {reportType === "enforcement" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Enforcement Activity</CardTitle>
              <CardDescription className="text-base">Daily checks and fines issued (Last 5 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={enforcementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E5E2" />
                  <XAxis dataKey="date" tick={{ fontSize: 14 }} />
                  <YAxis tick={{ fontSize: 14 }} />
                  <Tooltip contentStyle={{ fontSize: 14 }} />
                  <Line type="monotone" dataKey="checks" stroke="#4FAF7C" strokeWidth={3} name="Checks" />
                  <Line type="monotone" dataKey="fines" stroke="#E5533D" strokeWidth={3} name="Fines Issued" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Total Checks</CardDescription>
                <CardTitle className="text-3xl">261</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">Last 5 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Fines Issued</CardDescription>
                <CardTitle className="text-3xl text-[#E5533D]">46</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">17.6% of checks</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Total Fine Amount</CardDescription>
                <CardTitle className="text-3xl">1,674,400 MZN</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">Average: 36,400 MZN</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
