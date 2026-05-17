import { useCallback, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MapPin, AlertTriangle, CheckCircle, XCircle, Truck, FileText, Eye, User, Calendar, Map, BellRing, Search } from "lucide-react"
import { toast } from "sonner"
import { EnforcementMap, UNENFORCED_VIOLATIONS, severityColor } from "@/components/enforcement-map"

// Mock enforcement log data with offence types
const mockEnforcementLogs = [
  {
    id: "ENF-001",
    plateNumber: "AAA-123-MP",
    driverName: "JoÃ£o Silva",
    driverLicense: "DL-2345678",
    vehicleType: "Cargo Truck",
    location: "Av. Julius Nyerere & Mao Tse Tung",
    coordinates: "-25.9655, 32.5892",
    offenceType: "Outstanding Payments",
    offenceCategory: "Payment Compliance",
    severity: "High",
    penaltyAmount: "45,000 MZN",
    action: "Vehicle Impounded",
    officer: "Officer Silva",
    timestamp: "2026-05-06 14:23",
    notes: "Vehicle has unpaid road user charges. Owner notified. Vehicle towed to impound lot.",
    priorOffences: 2,
    isRepeatOffender: true
  },
  {
    id: "ENF-002",
    plateNumber: "BBB-456-MP",
    driverName: "Maria Santos",
    driverLicense: "DL-3456789",
    vehicleType: "Heavy Truck",
    location: "Av. 25 de Setembro",
    coordinates: "-25.9612, 32.5731",
    offenceType: "Overweight Vehicle",
    offenceCategory: "Weight Compliance",
    severity: "Medium",
    penaltyAmount: "25,000 MZN",
    action: "Fine Issued",
    officer: "Officer Macamo",
    timestamp: "2026-05-06 13:45",
    notes: "Vehicle exceeded maximum weight limit by 15%. Fine issued. Vehicle allowed to proceed after unloading excess cargo.",
    priorOffences: 0,
    isRepeatOffender: false
  },
  {
    id: "ENF-003",
    plateNumber: "CCC-789-MP",
    driverName: "Pedro Nhantumbo",
    driverLicense: "DL-4567890",
    vehicleType: "Tractor",
    location: "Marginal Avenue",
    coordinates: "-25.9701, 32.5945",
    offenceType: "Expired Permit",
    offenceCategory: "Permit Compliance",
    severity: "High",
    penaltyAmount: "35,000 MZN",
    action: "Vehicle Impounded",
    officer: "Officer Nhantumbo",
    timestamp: "2026-05-06 12:10",
    notes: "Vehicle was operating after its RUC permit expired. Repeat offender. Vehicle impounded.",
    priorOffences: 3,
    isRepeatOffender: true
  },
  {
    id: "ENF-004",
    plateNumber: "DDD-012-MP",
    driverName: "Ana Costa",
    driverLicense: "DL-5678901",
    vehicleType: "Bus",
    location: "Av. Eduardo Mondlane",
    coordinates: "-25.9588, 32.5823",
    offenceType: "No Circulation License",
    offenceCategory: "License Compliance",
    severity: "Medium",
    penaltyAmount: "20,000 MZN",
    action: "Warning Issued",
    officer: "Officer Costa",
    timestamp: "2026-05-06 11:30",
    notes: "Vehicle operating without an active circulation license. First offence. Warning issued. Must regularize within 24 hours.",
    priorOffences: 0,
    isRepeatOffender: false
  },
  {
    id: "ENF-005",
    plateNumber: "EEE-345-MP",
    driverName: "Carlos Macuacua",
    driverLicense: "DL-6789012",
    vehicleType: "Heavy Truck",
    location: "Av. Acordos de Lusaka",
    coordinates: "-25.9723, 32.5834",
    offenceType: "Unauthorized Route",
    offenceCategory: "Route Compliance",
    severity: "Low",
    penaltyAmount: "10,000 MZN",
    action: "Warning Issued",
    officer: "Officer Bila",
    timestamp: "2026-05-06 10:15",
    notes: "Vehicle entered a route that was not configured for this vehicle. First offence. Verbal warning issued.",
    priorOffences: 0,
    isRepeatOffender: false
  },
  {
    id: "ENF-006",
    plateNumber: "FFF-678-MP",
    driverName: "Isabel Mondlane",
    driverLicense: "DL-7890123",
    vehicleType: "Cargo Truck",
    location: "Av. Vladimir Lenine",
    coordinates: "-25.9634, 32.5789",
    offenceType: "Device Tampered",
    offenceCategory: "Tracker Integrity",
    severity: "High",
    penaltyAmount: "50,000 MZN",
    action: "Fine Issued",
    officer: "Officer Tembe",
    timestamp: "2026-05-06 09:30",
    notes: "Tracker tamper alert was confirmed during roadside inspection. Fine issued and vehicle inspection required.",
    priorOffences: 1,
    isRepeatOffender: false
  },
  {
    id: "ENF-007",
    plateNumber: "AAA-123-MP",
    driverName: "JoÃ£o Silva",
    driverLicense: "DL-2345678",
    vehicleType: "Cargo Truck",
    location: "Av. Julius Nyerere",
    coordinates: "-25.9667, 32.5901",
    offenceType: "Outstanding Payments",
    offenceCategory: "Payment Compliance",
    severity: "High",
    penaltyAmount: "45,000 MZN",
    action: "Fine Issued",
    officer: "Officer Silva",
    timestamp: "2026-04-22 15:45",
    notes: "Previous offence for unpaid RUC charges. Fine issued. Driver warned about repeat offender status.",
    priorOffences: 1,
    isRepeatOffender: true
  },
  {
    id: "ENF-008",
    plateNumber: "GGG-901-MP",
    driverName: "Fernando Chissano",
    driverLicense: "DL-8901234",
    vehicleType: "Heavy Truck",
    location: "Av. Mao Tse Tung",
    coordinates: "-25.9589, 32.5912",
    offenceType: "Signal Lost",
    offenceCategory: "Connectivity",
    severity: "Medium",
    penaltyAmount: "5,000 MZN",
    action: "Warning Issued",
    officer: "Officer Cossa",
    timestamp: "2026-05-06 08:20",
    notes: "Tracker stopped transmitting and officer confirmed the vehicle location manually. Warning issued. Must restore signal within 48 hours.",
    priorOffences: 0,
    isRepeatOffender: false
  }
]

type AlertDispatchState = "sent" | "responding"

export function EnforcementPage() {
  const [enforcementLogs, setEnforcementLogs] = useState(mockEnforcementLogs)
  const [selectedEnforcement, setSelectedEnforcement] = useState<typeof mockEnforcementLogs[0] | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [hoveredViolation, setHoveredViolation] = useState<(typeof UNENFORCED_VIOLATIONS)[number] | null>(null)
  const [selectedViolationId, setSelectedViolationId] = useState<string | null>(null)
  const [alertDispatchStates, setAlertDispatchStates] = useState<Partial<Record<string, AlertDispatchState>>>({})
  const [alertSearch, setAlertSearch] = useState("")
  const [alertSeverityFilter, setAlertSeverityFilter] = useState("all")
  const [alertTypeFilter, setAlertTypeFilter] = useState("all")
  const [alertStatusFilter, setAlertStatusFilter] = useState("all")
  const [alertPage, setAlertPage] = useState(1)
  const [mapLayer, setMapLayer] = useState<"heatmap" | "violations" | "both">("both")
  const [actionFilter, setActionFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Form state for logging enforcement
  const [formData, setFormData] = useState({
    plateNumber: "",
    driverName: "",
    driverLicense: "",
    vehicleType: "",
    location: "",
    coordinates: "",
    offenceType: "",
    offenceCategory: "",
    penaltyAmount: "",
    action: "",
    notes: ""
  })

  // Handle log enforcement action
  const handleLogEnforcement = () => {
    const newLog = {
      id: `ENF-${String(enforcementLogs.length + 1).padStart(3, '0')}`,
      plateNumber: formData.plateNumber,
      driverName: formData.driverName,
      driverLicense: formData.driverLicense,
      vehicleType: formData.vehicleType,
      location: formData.location,
      coordinates: formData.coordinates,
      offenceType: formData.offenceType,
      offenceCategory: formData.offenceCategory,
      severity: "Medium",
      penaltyAmount: formData.penaltyAmount,
      action: formData.action,
      officer: "Current Officer",
      timestamp: new Date().toLocaleString('en-GB', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }).replace(',', ''),
      notes: formData.notes,
      priorOffences: 0,
      isRepeatOffender: false
    }

    setEnforcementLogs([newLog, ...enforcementLogs])
    setIsLogDialogOpen(false)
    setFormData({
      plateNumber: "",
      driverName: "",
      driverLicense: "",
      vehicleType: "",
      location: "",
      coordinates: "",
      offenceType: "",
      offenceCategory: "",
      penaltyAmount: "",
      action: "",
      notes: ""
    })
    toast.success("Enforcement action logged", {
      description: `${formData.offenceType} recorded for ${formData.plateNumber}`
    })
  }

  const handleAlertEnforcement = (violation: (typeof UNENFORCED_VIOLATIONS)[number]) => {
    setAlertDispatchStates((previous) => ({ ...previous, [violation.id]: "sent" }))
    toast.success("Enforcement alert triggered", {
      description: `Nearby enforcers were notified to follow up on ${violation.plateNumber}.`,
    })

    window.setTimeout(() => {
      setAlertDispatchStates((previous) => {
        if (previous[violation.id] !== "sent") return previous
        return { ...previous, [violation.id]: "responding" }
      })
      toast.success("Officer responding", {
        description: `An enforcement officer accepted ${violation.plateNumber} and is moving to the location.`,
      })
    }, 1500)
  }

  const handleOpenFollowUp = (violation: (typeof UNENFORCED_VIOLATIONS)[number]) => {
    setFormData({
      plateNumber: violation.plateNumber,
      driverName: "",
      driverLicense: "",
      vehicleType: violation.vehicleType,
      location: violation.location,
      coordinates: violation.latlng.join(", "),
      offenceType: violation.violationType,
      offenceCategory: violation.detectedBy.includes("GPS") || violation.detectedBy.includes("tracker") ? "Tracker Integrity" : "Payment Compliance",
      penaltyAmount: violation.estimatedPenalty,
      action: "",
      notes: `Officer follow-up for ${violation.violationType} alert from ${violation.detectedBy}.`,
    })
    setIsLogDialogOpen(true)
  }

  const alertTypes = useMemo(
    () => Array.from(new Set(UNENFORCED_VIOLATIONS.map((violation) => violation.violationType))).sort(),
    []
  )

  const filteredEnforcementAlerts = useMemo(() => {
    const normalizedSearch = alertSearch.trim().toLowerCase()
    const severityRank = { High: 0, Medium: 1, Low: 2 }

    return UNENFORCED_VIOLATIONS
      .filter((violation) => {
        const status = alertDispatchStates[violation.id] ?? "new"
        const matchesSearch = !normalizedSearch ||
          violation.plateNumber.toLowerCase().includes(normalizedSearch) ||
          violation.violationType.toLowerCase().includes(normalizedSearch) ||
          violation.location.toLowerCase().includes(normalizedSearch) ||
          violation.detectedBy.toLowerCase().includes(normalizedSearch)
        const matchesSeverity = alertSeverityFilter === "all" || violation.severity === alertSeverityFilter
        const matchesType = alertTypeFilter === "all" || violation.violationType === alertTypeFilter
        const matchesStatus = alertStatusFilter === "all" || alertStatusFilter === status
        return matchesSearch && matchesSeverity && matchesType && matchesStatus
      })
      .sort((a, b) => {
        const severityDelta = severityRank[a.severity] - severityRank[b.severity]
        if (severityDelta !== 0) return severityDelta
        return b.detectedAt.localeCompare(a.detectedAt)
      })
  }, [alertSearch, alertSeverityFilter, alertTypeFilter, alertStatusFilter, alertDispatchStates])

  const alertPageSize = 8
  const alertTotalPages = Math.max(1, Math.ceil(filteredEnforcementAlerts.length / alertPageSize))
  const normalizedAlertPage = Math.min(alertPage, alertTotalPages)
  const visibleEnforcementAlerts = filteredEnforcementAlerts.slice(
    (normalizedAlertPage - 1) * alertPageSize,
    normalizedAlertPage * alertPageSize
  )

  const handleSelectViolation = useCallback((id: string | null) => {
    setSelectedViolationId(id)
    setHoveredViolation(id ? (UNENFORCED_VIOLATIONS.find((violation) => violation.id === id) ?? null) : null)
  }, [])

  const handleHoverViolation = useCallback((id: string | null) => {
    setHoveredViolation(id ? (UNENFORCED_VIOLATIONS.find((violation) => violation.id === id) ?? null) : null)
  }, [])

  // Filter logs
  const filteredLogs = enforcementLogs.filter(log => {
    if (actionFilter === "all") return true
    return log.action === actionFilter
  })

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

  // Get action badge
  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      "Vehicle Impounded": "bg-[#E5533D] text-white",
      "Warning Issued": "bg-[#DAA22A] text-[#1C1C1C]",
      "Fine Issued": "bg-[#5B8C5A] text-white"
    }
    return (
      <Badge className={`${colors[action] || "bg-secondary"} text-sm px-3 py-1`}>
        {action}
      </Badge>
    )
  }

  if (isMapOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsMapOpen(false)} className="mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-semibold text-foreground">Enforcement Heatmap - Maputo</h1>
              <p className="text-lg text-muted-foreground">Real-time enforcement activity and alerts for nearby officers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(["both", "heatmap", "violations"] as const).map((layer) => (
              <Button
                key={layer}
                size="sm"
                variant={mapLayer === layer ? "default" : "outline"}
                className="h-9 text-sm capitalize"
                onClick={() => setMapLayer(layer)}
              >
                {layer === "both" ? "All Layers" : layer === "heatmap" ? "Heatmap" : "Violations"}
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex h-[calc(100vh-220px)] min-h-[560px] overflow-hidden rounded-lg">
              <div className="relative flex-1 overflow-hidden">
                <EnforcementMap
                  layer={mapLayer}
                  hoveredId={hoveredViolation?.id ?? null}
                  selectedId={selectedViolationId}
                  violations={filteredEnforcementAlerts}
                  onSelect={handleSelectViolation}
                  onHover={handleHoverViolation}
                />
              </div>

              <div className="flex w-80 flex-col border-l border-border bg-card">
                <div className="border-b border-border p-4">
                  <p className="flex items-center gap-2 text-base font-semibold">
                    <AlertTriangle className="h-4 w-4 text-[#DAA22A]" />
                    Enforcement Alerts
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {filteredEnforcementAlerts.length} of {UNENFORCED_VIOLATIONS.length} visible, sorted by urgency
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={alertSearch}
                        onChange={(event) => {
                          setAlertSearch(event.target.value)
                          setAlertPage(1)
                        }}
                        placeholder="Plate, type, source..."
                        className="h-9 pl-8 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={alertSeverityFilter} onValueChange={(value) => {
                        setAlertSeverityFilter(value)
                        setAlertPage(1)
                      }}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All severity</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={alertStatusFilter} onValueChange={(value) => {
                        setAlertStatusFilter(value)
                        setAlertPage(1)
                      }}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All status</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="sent">Alert Sent</SelectItem>
                          <SelectItem value="responding">Officer Responding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Select value={alertTypeFilter} onValueChange={(value) => {
                      setAlertTypeFilter(value)
                      setAlertPage(1)
                    }}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All alert types</SelectItem>
                        {alertTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex-1 divide-y divide-border overflow-y-auto">
                  {visibleEnforcementAlerts.map((vio) => {
                    const color = severityColor(vio.severity)
                    const isActive = hoveredViolation?.id === vio.id || selectedViolationId === vio.id
                    const dispatchState = alertDispatchStates[vio.id] ?? "new"
                    return (
                      <div
                        key={vio.id}
                        className={`cursor-pointer p-3 transition-colors ${isActive ? "bg-muted" : "hover:bg-muted/50"}`}
                        onClick={() => handleSelectViolation(vio.id)}
                        onMouseEnter={() => setHoveredViolation(vio)}
                        onMouseLeave={() => setHoveredViolation(null)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold">{vio.plateNumber}</span>
                              <Badge className="border-0 px-1.5 py-0 text-xs" style={{ backgroundColor: color + "22", color }}>
                                {vio.severity}
                              </Badge>
                              {dispatchState !== "new" && (
                                <Badge
                                  variant="outline"
                                  className={`px-1.5 py-0 text-xs ${dispatchState === "responding" ? "border-[#5B8C5A] text-[#5B8C5A]" : "border-[#DAA22A] text-[#DAA22A]"}`}
                                >
                                  {dispatchState === "responding" ? "Officer Responding" : "Alert Sent"}
                                </Badge>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-xs text-foreground">{vio.violationType}</p>
                            <p className="truncate text-xs text-muted-foreground">{vio.location}</p>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{vio.detectedAt}</span>
                              <span className="text-xs font-semibold" style={{ color }}>{vio.estimatedPenalty}</span>
                            </div>
                            <Button
                              size="sm"
                              variant={dispatchState === "responding" ? "default" : dispatchState === "sent" ? "secondary" : "outline"}
                              className="mt-2 h-8 w-full justify-center text-xs"
                              onClick={(event) => {
                                event.stopPropagation()
                                if (dispatchState === "responding") {
                                  handleOpenFollowUp(vio)
                                  return
                                }
                                handleAlertEnforcement(vio)
                              }}
                              disabled={dispatchState === "sent"}
                            >
                              <BellRing className="mr-1.5 h-3.5 w-3.5" />
                              {dispatchState === "responding" ? "Log Officer Follow-up" : dispatchState === "sent" ? "Waiting for Officer" : "Alert Enforcement"}
                            </Button>
                          </div>
                          <div className="mt-1.5 h-2 w-2 flex-shrink-0 animate-pulse rounded-full" style={{ backgroundColor: color }} />
                        </div>
                      </div>
                    )
                  })}
                  {visibleEnforcementAlerts.length === 0 && (
                    <div className="p-4 text-sm text-muted-foreground">
                      No alerts match the current filters.
                    </div>
                  )}
                </div>
                <div className="space-y-2 border-t border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => setAlertPage((page) => Math.max(1, page - 1))}
                      disabled={normalizedAlertPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Page {normalizedAlertPage} of {alertTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => setAlertPage((page) => Math.min(alertTotalPages, page + 1))}
                      disabled={normalizedAlertPage === alertTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legend</p>
                  <div className="space-y-1.5">
                    {[
                      { color: "#E5533D", label: "Vehicle Impounded / High" },
                      { color: "#5B8C5A", label: "Fine Issued" },
                      { color: "#DAA22A", label: "Warning / Medium" },
                    ].map(({ color, label }) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className="h-3 w-3 flex-shrink-0 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} />
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                    ))}
                    <Separator className="my-1" />
                    <div className="flex items-center gap-2">
                      <div className="relative h-3 w-3 flex-shrink-0">
                        <div className="absolute inset-0 animate-ping rounded-full bg-[#E5533D] opacity-40" />
                        <div className="h-3 w-3 rounded-full border border-white bg-[#E5533D]" />
                      </div>
                      <span className="text-xs text-muted-foreground">Pulsing = alert enforcement candidate</span>
                    </div>
                  </div>
                  <p className="pt-1 text-center text-xs text-muted-foreground">
                    {mockEnforcementLogs.length} enforcement actions today
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isDetailsModalOpen && selectedEnforcement) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsDetailsModalOpen(false)
              setSelectedEnforcement(null)
            }}
            className="mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-semibold text-foreground">Enforcement Action Details</h1>
            <p className="text-lg text-muted-foreground">Complete information for {selectedEnforcement.id}</p>
          </div>
        </div>

        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getActionBadge(selectedEnforcement.action)}
                {selectedEnforcement.isRepeatOffender && (
                  <Badge className="bg-[#E5533D] px-3 py-1 text-sm text-white">
                    <AlertTriangle className="mr-1 h-4 w-4" />
                    Repeat Offender
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">{selectedEnforcement.timestamp}</span>
              </div>
              <Badge variant="outline" className="text-sm">{selectedEnforcement.id}</Badge>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <AlertTriangle className="h-5 w-5" />
                Offence Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-muted/40">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Offence Type</CardDescription>
                    <CardTitle className="text-lg">{selectedEnforcement.offenceType}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="bg-muted/40">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Category</CardDescription>
                    <CardTitle className="text-lg">{selectedEnforcement.offenceCategory}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Penalty Amount</Label>
                  <p className="text-2xl font-bold text-[#E5533D]">{selectedEnforcement.penaltyAmount}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Prior Offences</Label>
                  <p className="text-2xl font-bold">{selectedEnforcement.priorOffences}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Truck className="h-5 w-5" />
                Vehicle & Driver Information
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Plate Number</Label>
                  <p className="font-mono text-lg font-bold">{selectedEnforcement.plateNumber}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Vehicle Type</Label>
                  <p className="text-base font-medium">{selectedEnforcement.vehicleType}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Driver Name</Label>
                  <p className="text-base font-medium">{selectedEnforcement.driverName}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Driver License</Label>
                <p className="font-mono text-base font-medium">{selectedEnforcement.driverLicense}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5" />
                Location Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Location</Label>
                  <p className="text-base font-medium">{selectedEnforcement.location}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">GPS Coordinates</Label>
                  <p className="font-mono text-base">{selectedEnforcement.coordinates}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5" />
                Officer Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Officer Name</Label>
                  <p className="text-base font-medium">{selectedEnforcement.officer}</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Timestamp
                  </Label>
                  <p className="text-base font-medium">{selectedEnforcement.timestamp}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5" />
                Action Notes
              </h3>
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-base leading-relaxed">{selectedEnforcement.notes}</p>
              </div>
            </div>

            {selectedEnforcement.action === "Vehicle Impounded" && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-semibold text-destructive">Vehicle Impounded</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Vehicle has been impounded and towed to the impound lot. Owner must pay all outstanding penalties plus impound fees to retrieve the vehicle.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedEnforcement.action === "Fine Issued" && (
              <div className="rounded-lg border border-[#5B8C5A]/50 bg-[#5B8C5A]/20 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-[#5B8C5A]" />
                  <div>
                    <p className="font-semibold">Fine Issued</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Fine has been issued for the offence. Payment must be made within the specified timeframe to avoid further enforcement action.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedEnforcement.action === "Warning Issued" && (
              <div className="rounded-lg border border-[#DAA22A]/50 bg-[#DAA22A]/20 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-[#DAA22A]" />
                  <div>
                    <p className="font-semibold">Warning Issued</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Driver has been issued a formal warning. Corrective action must be taken within the specified timeframe to avoid escalation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedEnforcement.isRepeatOffender && (
              <div className="rounded-lg border border-[#E5533D]/30 bg-[#E5533D]/10 p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 text-[#E5533D]" />
                  <div>
                    <p className="font-semibold text-[#E5533D]">Repeat Offender Alert</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This driver/vehicle has {selectedEnforcement.priorOffences} prior offence(s) on record. Escalated enforcement procedures may apply.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Enforcement</h1>
          <p className="text-lg text-muted-foreground">Log officer actions for RUC, permit, route, and tracker violations</p>
        </div>
        <Button className="text-base h-11 px-6" onClick={() => setIsMapOpen(true)}>
          <Map className="h-5 w-5 mr-2" />
          View Map
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Total Offences Today</CardDescription>
            <CardTitle className="text-4xl">{enforcementLogs.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Enforcement actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Vehicles Impounded</CardDescription>
            <CardTitle className="text-4xl text-[#E5533D]">
              {enforcementLogs.filter(l => l.action === "Vehicle Impounded").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">High severity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Fines Issued</CardDescription>
            <CardTitle className="text-4xl text-[#5B8C5A]">
              {enforcementLogs.filter(l => l.action === "Fine Issued").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Penalties applied</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Repeat Offenders</CardDescription>
            <CardTitle className="text-4xl text-[#DAA22A]">
              {enforcementLogs.filter(l => l.isRepeatOffender).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Escalation required</p>
          </CardContent>
        </Card>
      </div>

      {/* Enforcement Log */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-2xl">Today's Enforcement Log</CardTitle>
            <CardDescription className="text-base">All enforcement actions recorded today</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Action Filter */}
          <div className="mb-6 flex items-center justify-end gap-3">
            <Label htmlFor="action-filter" className="text-base font-medium">
              Filter by Action:
            </Label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger id="action-filter" className="w-[200px] text-base h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-base">
                <SelectItem value="all" className="text-base">All Actions</SelectItem>
                <SelectItem value="Vehicle Impounded" className="text-base">Impounded</SelectItem>
                <SelectItem value="Fine Issued" className="text-base">Fines</SelectItem>
                <SelectItem value="Warning Issued" className="text-base">Warnings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">ID</TableHead>
                <TableHead className="text-base">Plate / Driver</TableHead>
                <TableHead className="text-base">Offence Type</TableHead>
                <TableHead className="text-base">Category</TableHead>
                <TableHead className="text-base">Penalty</TableHead>
                <TableHead className="text-base">Action Taken</TableHead>
                <TableHead className="text-base">Officer</TableHead>
                <TableHead className="text-base">Time</TableHead>
                <TableHead className="text-right text-base">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium text-base">{log.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-bold text-base">{log.plateNumber}</p>
                      <p className="text-sm text-muted-foreground">{log.driverName}</p>
                      {log.isRepeatOffender && (
                        <Badge variant="outline" className="text-xs mt-1 bg-[#E5533D]/10 text-[#E5533D] border-[#E5533D]">
                          Repeat Offender
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-base max-w-[200px]">{log.offenceType}</TableCell>
                  <TableCell className="text-base text-muted-foreground">{log.offenceCategory}</TableCell>
                  <TableCell className="text-base font-medium">{log.penaltyAmount}</TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell className="text-base">{log.officer}</TableCell>
                  <TableCell className="text-base text-muted-foreground">{log.timestamp}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedEnforcement(log)
                        setIsDetailsModalOpen(true)
                      }}
                      className="h-10 w-10"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filteredLogs.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} logs
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

      {/* Log Enforcement Action Dialog */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent className="text-base max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Log Enforcement Action</DialogTitle>
            <DialogDescription className="text-base">
              Record offence and enforcement action taken
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Vehicle & Driver Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vehicle & Driver Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plate" className="text-base">Plate Number *</Label>
                  <Input
                    id="plate"
                    placeholder="e.g., AAA-123-MP"
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                    className="text-base h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle-type" className="text-base">Vehicle Type *</Label>
                  <Select value={formData.vehicleType} onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}>
                    <SelectTrigger className="text-base h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="text-base">
                      <SelectItem value="Cargo Truck" className="text-base">Cargo Truck</SelectItem>
                      <SelectItem value="Heavy Truck" className="text-base">Heavy Truck</SelectItem>
                      <SelectItem value="Tractor" className="text-base">Tractor</SelectItem>
                      <SelectItem value="Bus" className="text-base">Bus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driver-name" className="text-base">Driver Name *</Label>
                  <Input
                    id="driver-name"
                    placeholder="e.g., JoÃ£o Silva"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="text-base h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driver-license" className="text-base">Driver License *</Label>
                  <Input
                    id="driver-license"
                    placeholder="e.g., DL-2345678"
                    value={formData.driverLicense}
                    onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value.toUpperCase() })}
                    className="text-base h-11"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Offence Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Offence Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offence-type" className="text-base">Offence Type *</Label>
                  <Select value={formData.offenceType} onValueChange={(value) => setFormData({ ...formData, offenceType: value })}>
                    <SelectTrigger className="text-base h-11">
                      <SelectValue placeholder="Select offence type" />
                    </SelectTrigger>
                    <SelectContent className="text-base">
                      <SelectItem value="Outstanding Payments" className="text-base">Outstanding Payments</SelectItem>
                      <SelectItem value="Expired Permit" className="text-base">Expired Permit</SelectItem>
                      <SelectItem value="No Circulation License" className="text-base">No Circulation License</SelectItem>
                      <SelectItem value="Unauthorized Route" className="text-base">Unauthorized Route</SelectItem>
                      <SelectItem value="Overweight Vehicle" className="text-base">Overweight Vehicle</SelectItem>
                      <SelectItem value="Operating Without Road Closure Permit" className="text-base">Operating Without Road Closure Permit</SelectItem>
                      <SelectItem value="Restricted Hours Violation" className="text-base">Restricted Hours Violation</SelectItem>
                      <SelectItem value="Device Tampered" className="text-base">Device Tampered</SelectItem>
                      <SelectItem value="Signal Lost" className="text-base">Signal Lost</SelectItem>
                      <SelectItem value="Power Disconnected" className="text-base">Power Disconnected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offence-category" className="text-base">Offence Category *</Label>
                  <Select value={formData.offenceCategory} onValueChange={(value) => setFormData({ ...formData, offenceCategory: value })}>
                    <SelectTrigger className="text-base h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="text-base">
                      <SelectItem value="Payment Compliance" className="text-base">Payment Compliance</SelectItem>
                      <SelectItem value="Permit Compliance" className="text-base">Permit Compliance</SelectItem>
                      <SelectItem value="License Compliance" className="text-base">License Compliance</SelectItem>
                      <SelectItem value="Route Compliance" className="text-base">Route Compliance</SelectItem>
                      <SelectItem value="Weight Compliance" className="text-base">Weight Compliance</SelectItem>
                      <SelectItem value="Time Window Compliance" className="text-base">Time Window Compliance</SelectItem>
                      <SelectItem value="Tracker Integrity" className="text-base">Tracker Integrity</SelectItem>
                      <SelectItem value="Connectivity" className="text-base">Connectivity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="penalty" className="text-base">Penalty Amount *</Label>
                  <Input
                    id="penalty"
                    placeholder="e.g., 45,000 MZN"
                    value={formData.penaltyAmount}
                    onChange={(e) => setFormData({ ...formData, penaltyAmount: e.target.value })}
                    className="text-base h-11"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Av. Julius Nyerere"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="text-base h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coordinates" className="text-base">GPS Coordinates</Label>
                  <Input
                    id="coordinates"
                    placeholder="e.g., -25.9655, 32.5892"
                    value={formData.coordinates}
                    onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                    className="text-base h-11"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Enforcement Action */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Enforcement Action</h3>
              <div className="space-y-2">
                <Label htmlFor="action" className="text-base">Action Taken *</Label>
                <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
                  <SelectTrigger className="text-base h-11">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent className="text-base">
                    <SelectItem value="Vehicle Impounded" className="text-base">Vehicle Impounded</SelectItem>
                    <SelectItem value="Fine Issued" className="text-base">Fine Issued</SelectItem>
                    <SelectItem value="Warning Issued" className="text-base">Warning Issued</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base">Notes *</Label>
                <Textarea
                  id="notes"
                  placeholder="Describe the situation and action taken..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="text-base"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogDialogOpen(false)} className="text-base h-11 px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleLogEnforcement}
              disabled={
                !formData.plateNumber || 
                !formData.driverName || 
                !formData.driverLicense || 
                !formData.vehicleType || 
                !formData.location || 
                !formData.offenceType || 
                !formData.offenceCategory || 
                !formData.penaltyAmount || 
                !formData.action || 
                !formData.notes
              }
              className="text-base h-11 px-6"
            >
              Log Offence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
