import { useState } from "react"
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
import { Search, MapPin, AlertTriangle, CheckCircle, XCircle, Clock, Truck, FileText, Eye, User, Calendar, Map, Flame, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { EnforcementMap, UNENFORCED_VIOLATIONS, severityColor } from "@/components/enforcement-map"

// Unenforced violations â€” detected but no action taken yet
const mockUnenforcedViolations = [
  {
    id: "VIO-001",
    plateNumber: "HHH-234-MP",
    vehicleType: "Heavy Truck",
    owner: "Beira Freight Co.",
    violationType: "Overweight Vehicle",
    severity: "High",
    location: "Av. Julius Nyerere & Av. Mao Tse Tung",
    detectedAt: "2026-05-12 09:14",
    detectedBy: "CAM-001 (ANPR)",
    estimatedPenalty: "25,000 MZN",
    mapPos: { top: "32%", left: "42%" },
  },
  {
    id: "VIO-002",
    plateNumber: "III-567-MP",
    vehicleType: "Cargo Truck",
    owner: "Maputo Cargo Ltd",
    violationType: "Expired RUC Payment",
    severity: "High",
    location: "Av. 25 de Setembro",
    detectedAt: "2026-05-12 09:45",
    detectedBy: "CAM-002 (ANPR)",
    estimatedPenalty: "45,000 MZN",
    mapPos: { top: "52%", left: "38%" },
  },
  {
    id: "VIO-003",
    plateNumber: "JJJ-890-MP",
    vehicleType: "Bus",
    owner: "City Transit",
    violationType: "No Road Closure Permit",
    severity: "Medium",
    location: "Av. Eduardo Mondlane",
    detectedAt: "2026-05-12 10:02",
    detectedBy: "CAM-004 (Traffic)",
    estimatedPenalty: "20,000 MZN",
    mapPos: { top: "62%", left: "33%" },
  },
  {
    id: "VIO-004",
    plateNumber: "KKK-123-MP",
    vehicleType: "Tractor",
    owner: "Heavy Haul Services",
    violationType: "Restricted Hours Violation",
    severity: "High",
    location: "Marginal Avenue",
    detectedAt: "2026-05-12 10:30",
    detectedBy: "GPS-003",
    estimatedPenalty: "35,000 MZN",
    mapPos: { top: "44%", left: "57%" },
  },
  {
    id: "VIO-005",
    plateNumber: "LLL-456-MP",
    vehicleType: "Heavy Truck",
    owner: "Freight Masters",
    violationType: "Route Deviation",
    severity: "Low",
    location: "Av. Vladimir Lenine",
    detectedAt: "2026-05-12 10:55",
    detectedBy: "GPS-002",
    estimatedPenalty: "10,000 MZN",
    mapPos: { top: "48%", left: "46%" },
  },
]

// Enforcement hotspot zones for the heatmap
const heatmapZones = [
  { top: "30%", left: "38%", size: "120px", opacity: 0.55, label: "Julius Nyerere" },
  { top: "48%", left: "33%", size: "100px", opacity: 0.45, label: "25 de Setembro" },
  { top: "40%", left: "52%", size: "90px",  opacity: 0.40, label: "Marginal Ave" },
  { top: "58%", left: "28%", size: "80px",  opacity: 0.35, label: "Eduardo Mondlane" },
  { top: "44%", left: "43%", size: "70px",  opacity: 0.30, label: "Vladimir Lenine" },
  { top: "36%", left: "55%", size: "60px",  opacity: 0.25, label: "Mao Tse Tung" },
]

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
    offenceType: "Operating Without Valid RUC Payment",
    offenceCategory: "Payment Violation",
    severity: "High",
    penaltyAmount: "45,000 MZN",
    action: "Vehicle Impounded",
    officer: "Officer Silva",
    timestamp: "2026-05-06 14:23",
    notes: "Vehicle operating 14 days past RUC payment due date. Owner notified. Vehicle towed to impound lot.",
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
    offenceCategory: "Weight Violation",
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
    offenceType: "Operating During Restricted Hours",
    offenceCategory: "Time Restriction Violation",
    severity: "High",
    penaltyAmount: "35,000 MZN",
    action: "Vehicle Impounded",
    officer: "Officer Nhantumbo",
    timestamp: "2026-05-06 12:10",
    notes: "Heavy vehicle operating during night restriction hours (20:00-06:00) without authorization. Repeat offender. Vehicle impounded.",
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
    offenceType: "Operating Without Road Closure Permit",
    offenceCategory: "Permit Violation",
    severity: "Medium",
    penaltyAmount: "20,000 MZN",
    action: "Warning Issued",
    officer: "Officer Costa",
    timestamp: "2026-05-06 11:30",
    notes: "Vehicle operating on road with active closure without valid permit. First offense. Warning issued. Must obtain permit within 24 hours.",
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
    offenceType: "Unauthorized Route Deviation",
    offenceCategory: "Route Violation",
    severity: "Low",
    penaltyAmount: "10,000 MZN",
    action: "Warning Issued",
    officer: "Officer Bila",
    timestamp: "2026-05-06 10:15",
    notes: "Vehicle deviated from authorized route specified in permit. First offense. Verbal warning issued.",
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
    offenceType: "Damaged Road Infrastructure",
    offenceCategory: "Infrastructure Damage",
    severity: "High",
    penaltyAmount: "50,000 MZN",
    action: "Fine Issued",
    officer: "Officer Tembe",
    timestamp: "2026-05-06 09:30",
    notes: "Vehicle caused damage to road surface due to excessive weight. Fine issued for repair costs. Vehicle inspection required.",
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
    offenceType: "Operating Without Valid RUC Payment",
    offenceCategory: "Payment Violation",
    severity: "High",
    penaltyAmount: "45,000 MZN",
    action: "Fine Issued",
    officer: "Officer Silva",
    timestamp: "2026-04-22 15:45",
    notes: "Previous offense for same violation. Fine issued. Driver warned about repeat offender status.",
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
    offenceType: "Missing Safety Equipment",
    offenceCategory: "Safety Violation",
    severity: "Low",
    penaltyAmount: "5,000 MZN",
    action: "Warning Issued",
    officer: "Officer Cossa",
    timestamp: "2026-05-06 08:20",
    notes: "Vehicle missing required safety reflectors. Warning issued. Must rectify within 48 hours.",
    priorOffences: 0,
    isRepeatOffender: false
  }
]

// Mock vehicle lookup data with driver offence history
const mockVehicleData: Record<string, any> = {
  "AAA-123-MP": {
    plateNumber: "AAA-123-MP",
    vehicleType: "Cargo Truck",
    owner: "TransMoz Logistics",
    driverName: "JoÃ£o Silva",
    driverLicense: "DL-2345678",
    status: "Repeat Offender",
    totalOffences: 3,
    recentOffences: [
      { date: "2026-05-06", type: "Operating Without Valid RUC Payment", penalty: "45,000 MZN" },
      { date: "2026-04-22", type: "Operating Without Valid RUC Payment", penalty: "45,000 MZN" },
      { date: "2026-03-15", type: "Overweight Vehicle", penalty: "25,000 MZN" }
    ],
    totalPenalties: "115,000 MZN",
    lastOffence: "2026-05-06",
    riskLevel: "High"
  },
  "BBB-456-MP": {
    plateNumber: "BBB-456-MP",
    vehicleType: "Heavy Truck",
    owner: "Cargo Express Ltd",
    driverName: "Maria Santos",
    driverLicense: "DL-3456789",
    status: "Compliant",
    totalOffences: 1,
    recentOffences: [
      { date: "2026-05-06", type: "Overweight Vehicle", penalty: "25,000 MZN" }
    ],
    totalPenalties: "25,000 MZN",
    lastOffence: "2026-05-06",
    riskLevel: "Low"
  },
  "HHH-234-MP": {
    plateNumber: "HHH-234-MP",
    vehicleType: "Bus",
    owner: "Maputo Transport Services",
    driverName: "Alberto Tembe",
    driverLicense: "DL-9012345",
    status: "Clean Record",
    totalOffences: 0,
    recentOffences: [],
    totalPenalties: "0 MZN",
    lastOffence: "Never",
    riskLevel: "None"
  }
}

export function StatisticsPage() {
  const [enforcementLogs, setEnforcementLogs] = useState(mockEnforcementLogs)
  const [selectedEnforcement, setSelectedEnforcement] = useState<typeof mockEnforcementLogs[0] | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [hoveredViolation, setHoveredViolation] = useState<typeof mockUnenforcedViolations[0] | null>(null)
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Violations</h1>
          <p className="text-lg text-muted-foreground">Track violations and compliance monitoring</p>
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
                      <SelectItem value="Operating Without Valid RUC Payment" className="text-base">Operating Without Valid RUC Payment</SelectItem>
                      <SelectItem value="Overweight Vehicle" className="text-base">Overweight Vehicle</SelectItem>
                      <SelectItem value="Operating During Restricted Hours" className="text-base">Operating During Restricted Hours</SelectItem>
                      <SelectItem value="Operating Without Road Closure Permit" className="text-base">Operating Without Road Closure Permit</SelectItem>
                      <SelectItem value="Unauthorized Route Deviation" className="text-base">Unauthorized Route Deviation</SelectItem>
                      <SelectItem value="Damaged Road Infrastructure" className="text-base">Damaged Road Infrastructure</SelectItem>
                      <SelectItem value="Missing Safety Equipment" className="text-base">Missing Safety Equipment</SelectItem>
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
                      <SelectItem value="Payment Violation" className="text-base">Payment Violation</SelectItem>
                      <SelectItem value="Weight Violation" className="text-base">Weight Violation</SelectItem>
                      <SelectItem value="Time Restriction Violation" className="text-base">Time Restriction Violation</SelectItem>
                      <SelectItem value="Permit Violation" className="text-base">Permit Violation</SelectItem>
                      <SelectItem value="Route Violation" className="text-base">Route Violation</SelectItem>
                      <SelectItem value="Infrastructure Damage" className="text-base">Infrastructure Damage</SelectItem>
                      <SelectItem value="Safety Violation" className="text-base">Safety Violation</SelectItem>
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

      {/* Enforcement Details Modal */}
      <Modal open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen} className="w-[90vw] max-w-[1200px]">
        <ModalHeader onClose={() => setIsDetailsModalOpen(false)}>
          <div>
            <ModalTitle>Enforcement Action Details</ModalTitle>
            <ModalDescription>
              Complete information for {selectedEnforcement?.id}
            </ModalDescription>
          </div>
        </ModalHeader>
        
        <ModalBody>
          {selectedEnforcement && (
            <div className="space-y-6">
              {/* Action Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getActionBadge(selectedEnforcement.action)}
                  {selectedEnforcement.isRepeatOffender && (
                    <Badge className="bg-[#E5533D] text-white text-sm px-3 py-1">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Repeat Offender
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {selectedEnforcement.timestamp}
                  </span>
                </div>
                <Badge variant="outline" className="text-sm">
                  {selectedEnforcement.id}
                </Badge>
              </div>

              <Separator />

              {/* Offence Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
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

              {/* Vehicle & Driver Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Vehicle & Driver Information
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Plate Number</Label>
                    <p className="text-lg font-mono font-bold">{selectedEnforcement.plateNumber}</p>
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
                  <p className="text-base font-mono font-medium">{selectedEnforcement.driverLicense}</p>
                </div>
              </div>

              <Separator />

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
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
                    <p className="text-base font-mono">{selectedEnforcement.coordinates}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Officer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Officer Information
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Officer Name</Label>
                    <p className="text-base font-medium">{selectedEnforcement.officer}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Timestamp
                    </Label>
                    <p className="text-base font-medium">{selectedEnforcement.timestamp}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Action Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Action Notes
                </h3>
                <div className="rounded-lg bg-muted/40 p-4">
                  <p className="text-base leading-relaxed">{selectedEnforcement.notes}</p>
                </div>
              </div>

              {/* Action Summary */}
              {selectedEnforcement.action === "Vehicle Impounded" && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-semibold text-destructive">Vehicle Impounded</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vehicle has been impounded and towed to the impound lot. Owner must pay all outstanding penalties plus impound fees to retrieve the vehicle.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedEnforcement.action === "Fine Issued" && (
                <div className="rounded-lg bg-[#5B8C5A]/20 border border-[#5B8C5A]/50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#5B8C5A] mt-0.5" />
                    <div>
                      <p className="font-semibold">Fine Issued</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Fine has been issued for the offence. Payment must be made within the specified timeframe to avoid further enforcement action.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedEnforcement.action === "Warning Issued" && (
                <div className="rounded-lg bg-[#DAA22A]/20 border border-[#DAA22A]/50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-[#DAA22A] mt-0.5" />
                    <div>
                      <p className="font-semibold">Warning Issued</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Driver has been issued a formal warning. Corrective action must be taken within the specified timeframe to avoid escalation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedEnforcement.isRepeatOffender && (
                <div className="rounded-lg bg-[#E5533D]/10 border border-[#E5533D]/30 p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-[#E5533D] mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#E5533D]">Repeat Offender Alert</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This driver/vehicle has {selectedEnforcement.priorOffences} prior offence(s) on record. Escalated enforcement procedures may apply.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)} className="text-base h-11 px-6">
            Close
          </Button>
        </ModalFooter>
      </Modal>


      {/* ── Enforcement Heatmap Modal ── */}
      <Modal open={isMapOpen} onOpenChange={setIsMapOpen} className="w-[95vw] max-w-7xl">
        <ModalHeader onClose={() => setIsMapOpen(false)}>
          <div className="flex items-center justify-between w-full pr-4">
            <div>
              <ModalTitle>Enforcement Heatmap — Maputo</ModalTitle>
              <ModalDescription>
                Real-time enforcement activity &amp; unenforced violations
              </ModalDescription>
            </div>
            <div className="flex items-center gap-2">
              {(["both", "heatmap", "violations"] as const).map((layer) => (
                <Button
                  key={layer}
                  size="sm"
                  variant={mapLayer === layer ? "default" : "outline"}
                  className="h-8 text-sm capitalize"
                  onClick={() => setMapLayer(layer)}
                >
                  {layer === "both" ? "All Layers" : layer === "heatmap" ? "Heatmap" : "Violations"}
                </Button>
              ))}
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="p-0">
          <div className="flex h-[75vh]">
            {/* Real Leaflet map */}
            <div className="relative flex-1 overflow-hidden">
              {isMapOpen && (
                <EnforcementMap
                  layer={mapLayer}
                  hoveredId={hoveredViolation?.id ?? null}
                  onHover={(id) =>
                    setHoveredViolation(
                      id ? (UNENFORCED_VIOLATIONS.find((v) => v.id === id) ?? null) : null
                    )
                  }
                />
              )}
            </div>

            {/* Side panel */}
            <div className="w-80 border-l border-border bg-card flex flex-col">
              <div className="p-4 border-b border-border">
                <p className="font-semibold text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#DAA22A]" />
                  Unenforced Violations
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {UNENFORCED_VIOLATIONS.length} awaiting action — hover to highlight on map
                </p>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {UNENFORCED_VIOLATIONS.map((vio) => {
                  const color = severityColor(vio.severity)
                  const isActive = hoveredViolation?.id === vio.id
                  return (
                    <div
                      key={vio.id}
                      className={`p-3 cursor-pointer transition-colors ${isActive ? "bg-muted" : "hover:bg-muted/50"}`}
                      onMouseEnter={() => setHoveredViolation(vio)}
                      onMouseLeave={() => setHoveredViolation(null)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm font-mono">{vio.plateNumber}</span>
                            <Badge
                              className="text-xs px-1.5 py-0 border-0"
                              style={{ backgroundColor: color + "22", color }}
                            >
                              {vio.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-foreground mt-0.5 truncate">{vio.violationType}</p>
                          <p className="text-xs text-muted-foreground truncate">{vio.location}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">{vio.detectedAt}</span>
                            <span className="text-xs font-semibold" style={{ color }}>{vio.estimatedPenalty}</span>
                          </div>
                        </div>
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="p-3 border-t border-border space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Legend</p>
                <div className="space-y-1.5">
                  {[
                    { color: "#E5533D", label: "Vehicle Impounded / High" },
                    { color: "#5B8C5A", label: "Fine Issued" },
                    { color: "#DAA22A", label: "Warning / Medium" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border border-white shadow-sm flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                  ))}
                  <Separator className="my-1" />
                  <div className="flex items-center gap-2">
                    <div className="relative w-3 h-3 flex-shrink-0">
                      <div className="absolute inset-0 rounded-full bg-[#E5533D] opacity-40 animate-ping" />
                      <div className="w-3 h-3 rounded-full bg-[#E5533D] border border-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Pulsing = unenforced violation</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center pt-1">
                  {mockEnforcementLogs.length} enforcement actions today
                </p>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  )
}
