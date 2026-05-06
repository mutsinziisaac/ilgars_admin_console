import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, AlertTriangle, CheckCircle, XCircle, Clock, Truck, FileText } from "lucide-react"
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
    action: "Citation Issued",
    officer: "Officer Macamo",
    timestamp: "2026-05-06 13:45",
    notes: "Driver issued citation. Vehicle allowed to proceed to payment center."
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
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [actionFilter, setActionFilter] = useState("all")

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

  // Get action badge
  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      "Vehicle Impounded": "bg-[#E5533D] text-white",
      "Citation Issued": "bg-[#FFF306] text-[#1C1C1C]",
      "Warning Issued": "bg-[#FFF306] text-[#1C1C1C]"
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
      <div className="grid gap-6 md:grid-cols-4">
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
            <CardDescription className="text-base">Citations Issued</CardDescription>
            <CardTitle className="text-4xl text-[#FFF306]">
              {enforcementLogs.filter(l => l.action === "Citation Issued").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Moderate violations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Warnings Issued</CardDescription>
            <CardTitle className="text-4xl text-[#FFF306]">
              {enforcementLogs.filter(l => l.action === "Warning Issued").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Minor violations</p>
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
          <Tabs value={actionFilter} onValueChange={setActionFilter} className="mb-6">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
              <TabsTrigger value="Vehicle Impounded" className="text-sm">Impounded</TabsTrigger>
              <TabsTrigger value="Citation Issued" className="text-sm">Citations</TabsTrigger>
              <TabsTrigger value="Warning Issued" className="text-sm">Warnings</TabsTrigger>
            </TabsList>
          </Tabs>

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                  <SelectItem value="Citation Issued" className="text-base">Citation Issued</SelectItem>
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
    </div>
  )
}
