import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, CheckCircle, XCircle, Clock, Eye, Search } from "lucide-react"

// Mock alerts data
const mockAlerts = [
  {
    id: "ALT-001",
    type: "Overweight Vehicle",
    severity: "High",
    plateNumber: "AAA-123-MP",
    location: "Av. Julius Nyerere",
    timestamp: "2026-05-11 14:23",
    status: "Active",
    description: "Vehicle detected exceeding weight limit by 20%"
  },
  {
    id: "ALT-002",
    type: "Expired RUC",
    severity: "Medium",
    plateNumber: "BBB-456-MP",
    location: "Av. 25 de Setembro",
    timestamp: "2026-05-11 13:45",
    status: "Active",
    description: "Vehicle operating with expired RUC payment (30 days overdue)"
  },
  {
    id: "ALT-003",
    type: "Restricted Hours",
    severity: "High",
    plateNumber: "CCC-789-MP",
    location: "Marginal Avenue",
    timestamp: "2026-05-11 12:10",
    status: "Resolved",
    description: "Heavy vehicle detected during restricted hours (22:00-06:00)"
  },
  {
    id: "ALT-004",
    type: "No Permit",
    severity: "Medium",
    plateNumber: "DDD-012-MP",
    location: "Av. Eduardo Mondlane",
    timestamp: "2026-05-11 11:30",
    status: "Active",
    description: "Vehicle on closed road without valid permit"
  },
  {
    id: "ALT-005",
    type: "Route Deviation",
    severity: "Low",
    plateNumber: "EEE-345-MP",
    location: "Av. Acordos de Lusaka",
    timestamp: "2026-05-11 10:15",
    status: "Dismissed",
    description: "Vehicle deviated from authorized route"
  },
  {
    id: "ALT-006",
    type: "Speed Violation",
    severity: "Medium",
    plateNumber: "FFF-678-MP",
    location: "Av. Vladimir Lenine",
    timestamp: "2026-05-11 09:30",
    status: "Active",
    description: "Vehicle exceeding speed limit in restricted zone"
  },
  {
    id: "ALT-007",
    type: "Repeat Offender",
    severity: "High",
    plateNumber: "AAA-123-MP",
    location: "Av. Julius Nyerere",
    timestamp: "2026-05-11 08:20",
    status: "Active",
    description: "Vehicle with 3+ violations in past 30 days"
  },
]

export function AlertsPage() {
  const [alerts] = useState(mockAlerts)
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter
    const matchesSearch = searchQuery === "" || 
      alert.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSeverity && matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex)

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      "High": "bg-[#E5533D] text-white",
      "Medium": "bg-[#DAA22A] text-[#1C1C1C]",
      "Low": "bg-[#5B8C5A] text-white"
    }
    return (
      <Badge className={`${colors[severity] || "bg-secondary"} text-sm px-3 py-1`}>
        {severity}
      </Badge>
    )
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "Active": "bg-[#E5533D] text-white",
      "Resolved": "bg-[#5B8C5A] text-white",
      "Dismissed": "bg-muted text-muted-foreground"
    }
    const icons: Record<string, any> = {
      "Active": AlertTriangle,
      "Resolved": CheckCircle,
      "Dismissed": XCircle
    }
    const Icon = icons[status] || Clock
    return (
      <Badge className={`${colors[status] || "bg-secondary"} text-sm px-3 py-1 flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-semibold text-foreground">Alerts</h1>
        <p className="text-lg text-muted-foreground">Real-time violation alerts and notifications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Active Alerts</CardDescription>
            <CardTitle className="text-4xl text-[#E5533D]">
              {alerts.filter(a => a.status === "Active").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">High Severity</CardDescription>
            <CardTitle className="text-4xl text-[#E5533D]">
              {alerts.filter(a => a.severity === "High" && a.status === "Active").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Critical violations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Resolved Today</CardDescription>
            <CardTitle className="text-4xl text-[#5B8C5A]">
              {alerts.filter(a => a.status === "Resolved").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Completed actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Repeat Offenders</CardDescription>
            <CardTitle className="text-4xl text-[#DAA22A]">
              {alerts.filter(a => a.type === "Repeat Offender").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Multiple violations</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Alert Log</CardTitle>
              <CardDescription className="text-base">Real-time violation alerts</CardDescription>
            </div>
            <Button className="text-base h-11 px-6">
              <Bell className="h-5 w-5 mr-2" />
              Configure Alerts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by plate number or alert type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-base h-11"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] text-base h-11">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="text-base">
                <SelectItem value="all" className="text-base">All Status</SelectItem>
                <SelectItem value="Active" className="text-base">Active</SelectItem>
                <SelectItem value="Resolved" className="text-base">Resolved</SelectItem>
                <SelectItem value="Dismissed" className="text-base">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px] text-base h-11">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="text-base">
                <SelectItem value="all" className="text-base">All Severity</SelectItem>
                <SelectItem value="High" className="text-base">High</SelectItem>
                <SelectItem value="Medium" className="text-base">Medium</SelectItem>
                <SelectItem value="Low" className="text-base">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Alert ID</TableHead>
                <TableHead className="text-base">Type</TableHead>
                <TableHead className="text-base">Plate Number</TableHead>
                <TableHead className="text-base">Location</TableHead>
                <TableHead className="text-base">Severity</TableHead>
                <TableHead className="text-base">Status</TableHead>
                <TableHead className="text-base">Time</TableHead>
                <TableHead className="text-right text-base">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium text-base">{alert.id}</TableCell>
                  <TableCell className="text-base">{alert.type}</TableCell>
                  <TableCell className="font-mono font-bold text-base">{alert.plateNumber}</TableCell>
                  <TableCell className="text-base">{alert.location}</TableCell>
                  <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                  <TableCell>{getStatusBadge(alert.status)}</TableCell>
                  <TableCell className="text-base text-muted-foreground">{alert.timestamp}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <Eye className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filteredAlerts.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAlerts.length)} of {filteredAlerts.length} alerts
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-9 px-4"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 px-4"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
