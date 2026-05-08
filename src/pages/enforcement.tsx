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
import { Search, MapPin, AlertTriangle, CheckCircle, XCircle, Clock, Truck, FileText, Eye, User, Calendar } from "lucide-react"
import { toast } from "sonner"

// Mock enforcement log data
const mockEnforcementLogs = [
  {
    id: "ENF-001",
    plateNumber: "MZB5678B",
    vehicleType: "Cargo Truck",
    location: "Av. Julius Nyerere & Mao Tse Tung",
    coordinates: "-25.9655, 32.5892",
    amountOwed: "45,000 MZN",
    daysOverdue: 14,
    action: "Vehicle Impounded",
    officer: "Officer Silva",
    timestamp: "2026-05-06 14:23",
    notes: "Vehicle operating 14 days past due. Owner notified. Vehicle towed to impound lot."
  },
  {
    id: "ENF-002",
    plateNumber: "MZB3421A",
    vehicleType: "Heavy Truck",
    location: "Av. 25 de Setembro",
    coordinates: "-25.9612, 32.5731",
    amountOwed: "32,500 MZN",
    daysOverdue: 8,
    action: "Warning Issued",
    officer: "Officer Macamo",
    timestamp: "2026-05-06 13:45",
    notes: "Driver issued warning. Vehicle allowed to proceed. Must pay within 7 days."
  },
  {
    id: "ENF-003",
    plateNumber: "MZB7890C",
    vehicleType: "Tractor",
    location: "Marginal Avenue",
    coordinates: "-25.9701, 32.5945",
    amountOwed: "28,000 MZN",
    daysOverdue: 21,
    action: "Vehicle Impounded",
    officer: "Officer Nhantumbo",
    timestamp: "2026-05-06 12:10",
    notes: "Repeat offender. Vehicle impounded pending payment. Owner notified."
  },
  {
    id: "ENF-004",
    plateNumber: "MZB1122D",
    vehicleType: "Bus",
    location: "Av. Eduardo Mondlane",
    coordinates: "-25.9588, 32.5823",
    amountOwed: "18,500 MZN",
    daysOverdue: 5,
    action: "Warning Issued",
    officer: "Officer Costa",
    timestamp: "2026-05-06 11:30",
    notes: "First offense. Verbal warning given. Must pay within 48 hours."
  },
]

// Mock vehicle lookup data
const mockVehicleData: Record<string, any> = {
  "MZB5678B": {
    plateNumber: "MZB5678B",
    vehicleType: "Cargo Truck",
    owner: "TransMoz Logistics",
    status: "Non-Compliant",
    amountOwed: "45,000 MZN",
    daysOverdue: 14,
    lastPayment: "2026-03-22",
    penalties: "13,500 MZN (30% late fee)",
    totalDue: "58,500 MZN"
  },
  "MZB0011E": {
    plateNumber: "MZB0011E",
    vehicleType: "Heavy Truck",
    owner: "Cargo Express Ltd",
    status: "Compliant",
    amountOwed: "0 MZN",
    daysOverdue: 0,
    lastPayment: "2026-05-01",
    penalties: "0 MZN",
    totalDue: "0 MZN"
  }
}

export function EnforcementPage() {
  const [enforcementLogs, setEnforcementLogs] = useState(mockEnforcementLogs)
  const [searchQuery, setSearchQuery] = useState("")
  const [lookupResult, setLookupResult] = useState<any>(null)
  const [selectedEnforcement, setSelectedEnforcement] = useState<typeof mockEnforcementLogs[0] | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [actionFilter, setActionFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Form state for logging enforcement
  const [formData, setFormData] = useState({
    plateNumber: "",
    vehicleType: "",
    location: "",
    coordinates: "",
    amountOwed: "",
    daysOverdue: "",
    action: "",
    notes: ""
  })

  // Handle vehicle lookup
  const handleLookup = () => {
    const result = mockVehicleData[searchQuery.toUpperCase()]
    if (result) {
      setLookupResult(result)
      toast.success("Vehicle found", {
        description: `${result.plateNumber} - ${result.status}`
      })
    } else {
      setLookupResult(null)
      toast.error("Vehicle not found", {
        description: "Please check the plate number and try again."
      })
    }
  }

  // Handle log enforcement action
  const handleLogEnforcement = () => {
    const newLog = {
      id: `ENF-${String(enforcementLogs.length + 1).padStart(3, '0')}`,
      plateNumber: formData.plateNumber,
      vehicleType: formData.vehicleType,
      location: formData.location,
      coordinates: formData.coordinates,
      amountOwed: formData.amountOwed,
      daysOverdue: parseInt(formData.daysOverdue),
      action: formData.action,
      officer: "Current Officer",
      timestamp: new Date().toLocaleString('en-GB', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }).replace(',', ''),
      notes: formData.notes
    }

    setEnforcementLogs([newLog, ...enforcementLogs])
    setIsLogDialogOpen(false)
    setFormData({
      plateNumber: "",
      vehicleType: "",
      location: "",
      coordinates: "",
      amountOwed: "",
      daysOverdue: "",
      action: "",
      notes: ""
    })
    toast.success("Enforcement action logged", {
      description: `${formData.action} recorded for ${formData.plateNumber}`
    })
  }

  // Pre-fill form from lookup
  const handleUseVehicleData = () => {
    if (lookupResult) {
      setFormData({
        ...formData,
        plateNumber: lookupResult.plateNumber,
        vehicleType: lookupResult.vehicleType,
        amountOwed: lookupResult.totalDue,
        daysOverdue: lookupResult.daysOverdue.toString()
      })
      setIsLogDialogOpen(true)
    }
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
      "Warning Issued": "bg-[#DAA22A] text-[#1C1C1C]"
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
      <div>
        <h1 className="text-4xl font-semibold text-foreground">Enforcement</h1>
        <p className="text-lg text-muted-foreground">Field enforcement and compliance monitoring</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Actions Today</CardDescription>
            <CardTitle className="text-4xl">{enforcementLogs.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Enforcement logs</p>
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
            <p className="text-base text-muted-foreground">Severe violations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Warnings Issued</CardDescription>
            <CardTitle className="text-4xl text-[#DAA22A]">
              {enforcementLogs.filter(l => l.action === "Warning Issued").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Moderate violations</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Lookup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Vehicle Compliance Check</CardTitle>
          <CardDescription className="text-base">Look up vehicle by plate number to check compliance status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter plate number (e.g., MZB5678B)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                className="pl-11 text-base h-12"
              />
            </div>
            <Button onClick={handleLookup} className="h-12 px-8 text-base">
              Check Vehicle
            </Button>
          </div>

          {/* Lookup Result */}
          {lookupResult && (
            <Card className={lookupResult.status === "Compliant" ? "border-[#D6F0E0] bg-[#D6F0E0]/10" : "border-[#E5533D] bg-[#E5533D]/10"}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{lookupResult.plateNumber}</CardTitle>
                    <CardDescription className="text-base">{lookupResult.vehicleType} · {lookupResult.owner}</CardDescription>
                  </div>
                  {lookupResult.status === "Compliant" ? (
                    <Badge className="bg-[#D6F0E0] text-[#1C1C1C] text-base px-4 py-2">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Compliant
                    </Badge>
                  ) : (
                    <Badge className="bg-[#E5533D] text-white text-base px-4 py-2">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Non-Compliant
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Amount Owed</p>
                    <p className="text-lg font-bold">{lookupResult.amountOwed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Days Overdue</p>
                    <p className="text-lg font-bold">{lookupResult.daysOverdue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Penalties</p>
                    <p className="text-lg font-bold text-[#E5533D]">{lookupResult.penalties}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Due</p>
                    <p className="text-lg font-bold">{lookupResult.totalDue}</p>
                  </div>
                </div>

                {lookupResult.status === "Non-Compliant" && (
                  <div className="mt-6 flex gap-3">
                    <Button onClick={handleUseVehicleData} className="gap-2 text-base h-11 px-6">
                      <FileText className="h-5 w-5" />
                      Log Enforcement Action
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

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
                <SelectItem value="Warning Issued" className="text-base">Warnings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">ID</TableHead>
                <TableHead className="text-base">Plate Number</TableHead>
                <TableHead className="text-base">Vehicle Type</TableHead>
                <TableHead className="text-base">Location</TableHead>
                <TableHead className="text-base">Amount Owed</TableHead>
                <TableHead className="text-base">Days Overdue</TableHead>
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
                  <TableCell className="font-bold text-base">{log.plateNumber}</TableCell>
                  <TableCell className="text-base">{log.vehicleType}</TableCell>
                  <TableCell className="text-base">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {log.location}
                    </div>
                  </TableCell>
                  <TableCell className="text-base font-medium">{log.amountOwed}</TableCell>
                  <TableCell className="text-base">
                    <Badge variant="outline" className="text-sm">{log.daysOverdue} days</Badge>
                  </TableCell>
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
        <DialogContent className="text-base max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Log Enforcement Action</DialogTitle>
            <DialogDescription className="text-base">
              Record enforcement action taken against non-compliant vehicle
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plate" className="text-base">Plate Number *</Label>
                <Input
                  id="plate"
                  placeholder="e.g., MZB5678B"
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
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-base">Amount Owed *</Label>
                <Input
                  id="amount"
                  placeholder="e.g., 45,000 MZN"
                  value={formData.amountOwed}
                  onChange={(e) => setFormData({ ...formData, amountOwed: e.target.value })}
                  className="text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overdue" className="text-base">Days Overdue *</Label>
                <Input
                  id="overdue"
                  type="number"
                  placeholder="e.g., 14"
                  value={formData.daysOverdue}
                  onChange={(e) => setFormData({ ...formData, daysOverdue: e.target.value })}
                  className="text-base h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action" className="text-base">Enforcement Action Taken *</Label>
              <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
                <SelectTrigger className="text-base h-11">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="Vehicle Impounded" className="text-base">Vehicle Impounded</SelectItem>
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogDialogOpen(false)} className="text-base h-11 px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleLogEnforcement}
              disabled={!formData.plateNumber || !formData.vehicleType || !formData.location || !formData.amountOwed || !formData.daysOverdue || !formData.action || !formData.notes}
              className="text-base h-11 px-6"
            >
              Log Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enforcement Details Modal */}
      <Modal open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen} className="w-[90vw] max-w-[1000px]">
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
                  <span className="text-sm text-muted-foreground">
                    {selectedEnforcement.timestamp}
                  </span>
                </div>
                <Badge variant="outline" className="text-sm">
                  {selectedEnforcement.id}
                </Badge>
              </div>

              <Separator />

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Vehicle Information
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
                    <Label className="text-sm text-muted-foreground">Days Overdue</Label>
                    <p className="text-base font-medium text-destructive">{selectedEnforcement.daysOverdue} days</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Financial Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-muted/40">
                    <CardHeader className="pb-3">
                      <CardDescription className="text-xs">Amount Owed</CardDescription>
                      <CardTitle className="text-2xl text-destructive">{selectedEnforcement.amountOwed}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="bg-muted/40">
                    <CardHeader className="pb-3">
                      <CardDescription className="text-xs">Overdue Period</CardDescription>
                      <CardTitle className="text-2xl">{selectedEnforcement.daysOverdue} days</CardTitle>
                    </CardHeader>
                  </Card>
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
                        Vehicle has been impounded and towed to the impound lot. Owner must pay all outstanding fees plus impound fees to retrieve the vehicle.
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
                        Driver has been issued a formal warning. Payment must be made within the specified timeframe to avoid further enforcement action.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          {/* Footer can be used for additional actions if needed */}
        </ModalFooter>
      </Modal>
    </div>
  )
}
