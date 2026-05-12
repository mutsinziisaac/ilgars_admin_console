import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Label } from "@/components/ui/label"
import {
  Bell, AlertTriangle, CheckCircle, XCircle, Clock, Eye, Search,
  MoreHorizontal, ArrowUpCircle, ShieldAlert, Plus, Trash2,
  Mail, MessageSquare, Smartphone, Settings2, ToggleLeft, ToggleRight,
  Sliders, Save
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// ── Types ────────────────────────────────────────────────────────────────────
type AlertRule = {
  id: string
  name: string
  triggerType: string
  severity: "High" | "Medium" | "Low"
  enabled: boolean
  autoEscalate: boolean
  cooldownMins: number
}

type NotificationChannel = {
  id: string
  type: "Email" | "SMS" | "In-App"
  destination: string
  enabled: boolean
  severities: string[]
}

// ── Default config state ─────────────────────────────────────────────────────
const defaultRules: AlertRule[] = [
  { id: "R-001", name: "Overweight Vehicle",          triggerType: "Weight Violation",        severity: "High",   enabled: true,  autoEscalate: true,  cooldownMins: 0  },
  { id: "R-002", name: "Expired RUC Payment",         triggerType: "Payment Violation",       severity: "High",   enabled: true,  autoEscalate: true,  cooldownMins: 0  },
  { id: "R-003", name: "Restricted Hours Violation",  triggerType: "Time Restriction",        severity: "High",   enabled: true,  autoEscalate: false, cooldownMins: 30 },
  { id: "R-004", name: "No Road Closure Permit",      triggerType: "Permit Violation",        severity: "Medium", enabled: true,  autoEscalate: false, cooldownMins: 15 },
  { id: "R-005", name: "Route Deviation",             triggerType: "Route Violation",         severity: "Low",    enabled: true,  autoEscalate: false, cooldownMins: 60 },
  { id: "R-006", name: "Speed Violation",             triggerType: "Speed Violation",         severity: "Medium", enabled: true,  autoEscalate: false, cooldownMins: 10 },
  { id: "R-007", name: "Repeat Offender",             triggerType: "Repeat Offence (3+)",     severity: "High",   enabled: true,  autoEscalate: true,  cooldownMins: 0  },
  { id: "R-008", name: "Infrastructure Damage",       triggerType: "Infrastructure Damage",   severity: "High",   enabled: false, autoEscalate: true,  cooldownMins: 0  },
]

const defaultChannels: NotificationChannel[] = [
  { id: "C-001", type: "Email",  destination: "enforcement@ilgars.gov.mz",  enabled: true,  severities: ["High", "Medium", "Low"] },
  { id: "C-002", type: "Email",  destination: "supervisor@ilgars.gov.mz",   enabled: true,  severities: ["High"] },
  { id: "C-003", type: "SMS",    destination: "+258 84 000 0001",            enabled: true,  severities: ["High"] },
  { id: "C-004", type: "In-App", destination: "All Officers",               enabled: true,  severities: ["High", "Medium", "Low"] },
]

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

type Alert = typeof mockAlerts[0]

export function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal state
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isResolveOpen, setIsResolveOpen] = useState(false)
  const [isDismissOpen, setIsDismissOpen] = useState(false)
  const [isEscalateOpen, setIsEscalateOpen] = useState(false)
  const [resolveNote, setResolveNote] = useState("")

  // Configure Alerts modal state
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [configTab, setConfigTab] = useState("rules")
  const [rules, setRules] = useState<AlertRule[]>(defaultRules)
  const [channels, setChannels] = useState<NotificationChannel[]>(defaultChannels)
  const [repeatThreshold, setRepeatThreshold] = useState(3)
  const [weightThresholdPct, setWeightThresholdPct] = useState(10)
  const [speedThresholdKmh, setSpeedThresholdKmh] = useState(20)
  const [rucGraceDays, setRucGraceDays] = useState(7)
  const [globalMute, setGlobalMute] = useState(false)

  // New rule form
  const [newRule, setNewRule] = useState({ name: "", triggerType: "", severity: "Medium" as AlertRule["severity"] })
  // New channel form
  const [newChannel, setNewChannel] = useState({ type: "Email" as NotificationChannel["type"], destination: "" })

  // Admin actions
  const handleResolve = () => {
    if (!selectedAlert) return
    setAlerts(prev => prev.map(a => a.id === selectedAlert.id ? { ...a, status: "Resolved" } : a))
    setIsResolveOpen(false)
    setResolveNote("")
    toast.success(`Alert ${selectedAlert.id} marked as resolved`)
  }

  const handleDismiss = () => {
    if (!selectedAlert) return
    setAlerts(prev => prev.map(a => a.id === selectedAlert.id ? { ...a, status: "Dismissed" } : a))
    setIsDismissOpen(false)
    toast.success(`Alert ${selectedAlert.id} dismissed`)
  }

  const handleEscalate = () => {
    if (!selectedAlert) return
    setAlerts(prev => prev.map(a => a.id === selectedAlert.id ? { ...a, severity: "High" } : a))
    setIsEscalateOpen(false)
    toast.success(`Alert ${selectedAlert.id} escalated to High severity`)
  }

  // ── Configure Alerts handlers ─────────────────────────────────────────────
  const toggleRule = (id: string) =>
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))

  const toggleAutoEscalate = (id: string) =>
    setRules(prev => prev.map(r => r.id === id ? { ...r, autoEscalate: !r.autoEscalate } : r))

  const updateCooldown = (id: string, val: number) =>
    setRules(prev => prev.map(r => r.id === id ? { ...r, cooldownMins: val } : r))

  const deleteRule = (id: string) =>
    setRules(prev => prev.filter(r => r.id !== id))

  const addRule = () => {
    if (!newRule.name || !newRule.triggerType) return
    setRules(prev => [...prev, {
      id: `R-${String(prev.length + 1).padStart(3, "0")}`,
      name: newRule.name,
      triggerType: newRule.triggerType,
      severity: newRule.severity,
      enabled: true,
      autoEscalate: false,
      cooldownMins: 0,
    }])
    setNewRule({ name: "", triggerType: "", severity: "Medium" })
    toast.success("Alert rule added")
  }

  const toggleChannel = (id: string) =>
    setChannels(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c))

  const deleteChannel = (id: string) =>
    setChannels(prev => prev.filter(c => c.id !== id))

  const addChannel = () => {
    if (!newChannel.destination) return
    setChannels(prev => [...prev, {
      id: `C-${String(prev.length + 1).padStart(3, "0")}`,
      type: newChannel.type,
      destination: newChannel.destination,
      enabled: true,
      severities: ["High", "Medium", "Low"],
    }])
    setNewChannel({ type: "Email", destination: "" })
    toast.success("Notification channel added")
  }

  const handleSaveConfig = () => {
    setIsConfigOpen(false)
    toast.success("Alert configuration saved")
  }

  const channelIcon = (type: NotificationChannel["type"]) => {
    if (type === "Email")  return <Mail className="h-4 w-4" />
    if (type === "SMS")    return <Smartphone className="h-4 w-4" />
    return <MessageSquare className="h-4 w-4" />
  }

  const severityColor = (s: string) =>
    s === "High" ? "#E5533D" : s === "Medium" ? "#DAA22A" : "#5B8C5A"

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
            <Button className="text-base h-11 px-6" onClick={() => setIsConfigOpen(true)}>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-base">
                        <DropdownMenuItem
                          className="text-base cursor-pointer"
                          onClick={() => { setSelectedAlert(alert); setIsDetailOpen(true) }}
                        >
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        {alert.status === "Active" && (
                          <>
                            <DropdownMenuItem
                              className="text-base cursor-pointer"
                              onClick={() => { setSelectedAlert(alert); setIsResolveOpen(true) }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" /> Resolve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-base cursor-pointer"
                              onClick={() => { setSelectedAlert(alert); setIsEscalateOpen(true) }}
                              disabled={alert.severity === "High"}
                            >
                              <ArrowUpCircle className="h-4 w-4 mr-2" /> Escalate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-base cursor-pointer text-muted-foreground"
                              onClick={() => { setSelectedAlert(alert); setIsDismissOpen(true) }}
                            >
                              <XCircle className="h-4 w-4 mr-2" /> Dismiss
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* ── Alert: View Details ── */}
      <Modal open={isDetailOpen} onOpenChange={setIsDetailOpen} className="w-full max-w-lg">
        <ModalHeader onClose={() => setIsDetailOpen(false)}>
          <ModalTitle>Alert Details</ModalTitle>
          <ModalDescription>{selectedAlert?.id} — {selectedAlert?.type}</ModalDescription>
        </ModalHeader>
        <ModalBody>
          {selectedAlert && (
            <div className="space-y-3 text-base">
              {[
                ["Alert ID", selectedAlert.id],
                ["Type", selectedAlert.type],
                ["Plate Number", selectedAlert.plateNumber],
                ["Location", selectedAlert.location],
                ["Severity", selectedAlert.severity],
                ["Status", selectedAlert.status],
                ["Timestamp", selectedAlert.timestamp],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              <div className="pt-2">
                <p className="text-muted-foreground text-sm mb-1">Description</p>
                <p className="text-base">{selectedAlert.description}</p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
          {selectedAlert?.status === "Active" && (
            <Button onClick={() => { setIsDetailOpen(false); setIsResolveOpen(true) }}>
              <CheckCircle className="h-4 w-4 mr-2" /> Resolve
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* ── Alert: Resolve ── */}
      <Modal open={isResolveOpen} onOpenChange={setIsResolveOpen} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsResolveOpen(false)}>
          <ModalTitle>Resolve Alert</ModalTitle>
          <ModalDescription>{selectedAlert?.id} — {selectedAlert?.plateNumber}</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-base">Mark this alert as resolved? This indicates the violation has been addressed.</p>
            <div className="space-y-1">
              <label className="text-sm font-medium">Resolution Note (optional)</label>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Describe the action taken..."
                value={resolveNote}
                onChange={e => setResolveNote(e.target.value)}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsResolveOpen(false)}>Cancel</Button>
          <Button onClick={handleResolve}><CheckCircle className="h-4 w-4 mr-2" />Mark Resolved</Button>
        </ModalFooter>
      </Modal>

      {/* ── Alert: Escalate ── */}
      <Modal open={isEscalateOpen} onOpenChange={setIsEscalateOpen} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsEscalateOpen(false)}>
          <ModalTitle>Escalate Alert</ModalTitle>
          <ModalDescription>{selectedAlert?.id} — {selectedAlert?.type}</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="flex items-start gap-3 p-4 bg-[#DAA22A]/10 rounded-lg">
            <ShieldAlert className="h-5 w-5 text-[#DAA22A] mt-0.5 flex-shrink-0" />
            <p className="text-base">
              Escalate alert <strong>{selectedAlert?.id}</strong> to <strong>High</strong> severity?
              This will flag it for immediate enforcement action.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEscalateOpen(false)}>Cancel</Button>
          <Button className="bg-[#DAA22A] hover:bg-[#c49020] text-[#1C1C1C]" onClick={handleEscalate}>
            <ArrowUpCircle className="h-4 w-4 mr-2" />Escalate
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Alert: Dismiss ── */}
      <Modal open={isDismissOpen} onOpenChange={setIsDismissOpen} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsDismissOpen(false)}>
          <ModalTitle>Dismiss Alert</ModalTitle>
          <ModalDescription>{selectedAlert?.id} — {selectedAlert?.type}</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <p className="text-base">Dismiss alert <strong>{selectedAlert?.id}</strong>? It will be marked as dismissed and removed from the active queue.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsDismissOpen(false)}>Cancel</Button>
          <Button variant="secondary" onClick={handleDismiss}><XCircle className="h-4 w-4 mr-2" />Dismiss</Button>
        </ModalFooter>
      </Modal>

      {/* ── Configure Alerts ── */}
      <Modal open={isConfigOpen} onOpenChange={setIsConfigOpen} className="w-[95vw] max-w-4xl">
        <ModalHeader onClose={() => setIsConfigOpen(false)}>
          <ModalTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" /> Configure Alerts
          </ModalTitle>
          <ModalDescription>Manage alert rules, notification channels, and detection thresholds</ModalDescription>
        </ModalHeader>

        <ModalBody className="p-0">
          <Tabs value={configTab} onValueChange={setConfigTab} className="w-full">
            <div className="px-6 pt-4 border-b border-border">
              <TabsList className="h-11">
                <TabsTrigger value="rules" className="text-sm px-5">
                  <Bell className="h-4 w-4 mr-2" /> Alert Rules
                </TabsTrigger>
                <TabsTrigger value="channels" className="text-sm px-5">
                  <Mail className="h-4 w-4 mr-2" /> Notifications
                </TabsTrigger>
                <TabsTrigger value="thresholds" className="text-sm px-5">
                  <Sliders className="h-4 w-4 mr-2" /> Thresholds
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── Rules tab ── */}
            <TabsContent value="rules" className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Global mute */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                <div>
                  <p className="font-semibold text-base">Global Alert Mute</p>
                  <p className="text-sm text-muted-foreground">Suppress all alert notifications system-wide</p>
                </div>
                <button
                  onClick={() => { setGlobalMute(p => !p); toast(globalMute ? "Alerts unmuted" : "All alerts muted") }}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  {globalMute
                    ? <><ToggleRight className="h-8 w-8 text-[#E5533D]" /><span className="text-[#E5533D]">Muted</span></>
                    : <><ToggleLeft className="h-8 w-8 text-muted-foreground" /><span className="text-muted-foreground">Active</span></>
                  }
                </button>
              </div>

              {/* Rules list */}
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`rounded-lg border p-4 transition-opacity ${rule.enabled ? "border-border" : "border-border opacity-50"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-base">{rule.name}</span>
                          <Badge
                            className="text-xs border-0"
                            style={{ backgroundColor: severityColor(rule.severity) + "22", color: severityColor(rule.severity) }}
                          >
                            {rule.severity}
                          </Badge>
                          {rule.autoEscalate && (
                            <Badge className="text-xs bg-[#DAA22A]/20 text-[#DAA22A] border-0">Auto-escalate</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">Trigger: {rule.triggerType}</p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Cooldown */}
                        <div className="flex items-center gap-1.5">
                          <Label className="text-xs text-muted-foreground whitespace-nowrap">Cooldown</Label>
                          <Input
                            type="number"
                            min={0}
                            max={1440}
                            value={rule.cooldownMins}
                            onChange={e => updateCooldown(rule.id, Number(e.target.value))}
                            className="w-16 h-8 text-sm text-center"
                          />
                          <span className="text-xs text-muted-foreground">min</span>
                        </div>

                        {/* Auto-escalate toggle */}
                        <button
                          onClick={() => toggleAutoEscalate(rule.id)}
                          title="Toggle auto-escalate"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {rule.autoEscalate
                            ? <ToggleRight className="h-6 w-6 text-[#DAA22A]" />
                            : <ToggleLeft className="h-6 w-6" />
                          }
                        </button>

                        {/* Enable/disable */}
                        <button
                          onClick={() => toggleRule(rule.id)}
                          title={rule.enabled ? "Disable rule" : "Enable rule"}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {rule.enabled
                            ? <ToggleRight className="h-6 w-6 text-[#5B8C5A]" />
                            : <ToggleLeft className="h-6 w-6" />
                          }
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Add new rule */}
              <div className="space-y-3">
                <p className="font-semibold text-sm">Add New Rule</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Rule Name</Label>
                    <Input
                      placeholder="e.g. Missing Permit"
                      value={newRule.name}
                      onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Trigger Type</Label>
                    <Input
                      placeholder="e.g. Permit Violation"
                      value={newRule.triggerType}
                      onChange={e => setNewRule(p => ({ ...p, triggerType: e.target.value }))}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Severity</Label>
                    <Select value={newRule.severity} onValueChange={v => setNewRule(p => ({ ...p, severity: v as AlertRule["severity"] }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button size="sm" onClick={addRule} disabled={!newRule.name || !newRule.triggerType}>
                  <Plus className="h-4 w-4 mr-1" /> Add Rule
                </Button>
              </div>
            </TabsContent>

            {/* ── Notifications tab ── */}
            <TabsContent value="channels" className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                {channels.map((ch) => (
                  <div
                    key={ch.id}
                    className={`rounded-lg border p-4 flex items-center gap-4 transition-opacity ${ch.enabled ? "border-border" : "border-border opacity-50"}`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${ch.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {channelIcon(ch.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{ch.type}</span>
                        <span className="text-sm text-muted-foreground truncate">{ch.destination}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {ch.severities.map(s => (
                          <Badge
                            key={s}
                            className="text-xs border-0 px-1.5 py-0"
                            style={{ backgroundColor: severityColor(s) + "22", color: severityColor(s) }}
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleChannel(ch.id)} className="text-muted-foreground hover:text-foreground">
                        {ch.enabled
                          ? <ToggleRight className="h-6 w-6 text-[#5B8C5A]" />
                          : <ToggleLeft className="h-6 w-6" />
                        }
                      </button>
                      <button onClick={() => deleteChannel(ch.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Add channel */}
              <div className="space-y-3">
                <p className="font-semibold text-sm">Add Notification Channel</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select value={newChannel.type} onValueChange={v => setNewChannel(p => ({ ...p, type: v as NotificationChannel["type"] }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="In-App">In-App</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">
                      {newChannel.type === "Email" ? "Email Address" : newChannel.type === "SMS" ? "Phone Number" : "Recipient Group"}
                    </Label>
                    <Input
                      placeholder={
                        newChannel.type === "Email" ? "officer@ilgars.gov.mz"
                        : newChannel.type === "SMS" ? "+258 84 000 0000"
                        : "e.g. All Officers"
                      }
                      value={newChannel.destination}
                      onChange={e => setNewChannel(p => ({ ...p, destination: e.target.value }))}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <Button size="sm" onClick={addChannel} disabled={!newChannel.destination}>
                  <Plus className="h-4 w-4 mr-1" /> Add Channel
                </Button>
              </div>
            </TabsContent>

            {/* ── Thresholds tab ── */}
            <TabsContent value="thresholds" className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-6 md:grid-cols-2">

                <div className="space-y-3 p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[#E5533D]" />
                    <p className="font-semibold text-sm">Repeat Offender Threshold</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Number of violations within 30 days before flagging as repeat offender</p>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={repeatThreshold}
                      onChange={e => setRepeatThreshold(Number(e.target.value))}
                      className="w-24 h-10 text-base text-center"
                    />
                    <span className="text-sm text-muted-foreground">violations</span>
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[#DAA22A]" />
                    <p className="font-semibold text-sm">Overweight Alert Threshold</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Percentage over the legal weight limit before triggering an alert</p>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={weightThresholdPct}
                      onChange={e => setWeightThresholdPct(Number(e.target.value))}
                      className="w-24 h-10 text-base text-center"
                    />
                    <span className="text-sm text-muted-foreground">% over limit</span>
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[#DAA22A]" />
                    <p className="font-semibold text-sm">Speed Violation Threshold</p>
                  </div>
                  <p className="text-xs text-muted-foreground">km/h over the posted speed limit before triggering an alert</p>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      max={200}
                      value={speedThresholdKmh}
                      onChange={e => setSpeedThresholdKmh(Number(e.target.value))}
                      className="w-24 h-10 text-base text-center"
                    />
                    <span className="text-sm text-muted-foreground">km/h over limit</span>
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[#5B8C5A]" />
                    <p className="font-semibold text-sm">RUC Grace Period</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Days after RUC expiry before triggering an alert</p>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={0}
                      max={90}
                      value={rucGraceDays}
                      onChange={e => setRucGraceDays(Number(e.target.value))}
                      className="w-24 h-10 text-base text-center"
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 border border-border p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Current Summary</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Repeat offender flag after <strong>{repeatThreshold}</strong> violations in 30 days</li>
                  <li>Overweight alert at <strong>{weightThresholdPct}%</strong> over legal limit</li>
                  <li>Speed alert at <strong>{speedThresholdKmh} km/h</strong> over posted limit</li>
                  <li>RUC grace period of <strong>{rucGraceDays}</strong> days after expiry</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsConfigOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveConfig}>
            <Save className="h-4 w-4 mr-2" /> Save Configuration
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
