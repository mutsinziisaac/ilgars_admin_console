import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Truck, Search, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { toast } from "sonner"

// Mock vehicle data
const mockVehicles = [
  {
    id: 1,
    plate: "MZB 5678 B",
    owner: "Moza Transportes Lda",
    ownerContact: "+258 84 123 4567",
    ownerEmail: "contact@mozatransportes.co.mz",
    ownerAddress: "Av. Julius Nyerere, 1234, Maputo",
    vehicleType: "Cargo Truck",
    weightClass: "16,001–25,000 kg",
    dailyRate: 2000,
    status: "Active",
    lastPayment: "2026-04-20",
    registrationDate: "2024-01-15",
    compliance: "Non-compliant"
  },
  {
    id: 2,
    plate: "MZB 0011 E",
    owner: "TransMoz Logistics",
    ownerContact: "+258 82 987 6543",
    ownerEmail: "info@transmoz.co.mz",
    ownerAddress: "Av. 25 de Setembro, 567, Maputo",
    vehicleType: "Tractor",
    weightClass: "10,001–16,000 kg",
    dailyRate: 1500,
    status: "Active",
    lastPayment: "2026-05-04",
    registrationDate: "2023-08-22",
    compliance: "Compliant"
  },
  {
    id: 3,
    plate: "MZB 3344 F",
    owner: "Cargo Express Ltd",
    ownerContact: "+258 84 555 7890",
    ownerEmail: "operations@cargoexpress.co.mz",
    ownerAddress: "Av. Mártires de Inhaminga, 890, Maputo",
    vehicleType: "Heavy Truck",
    weightClass: "25,001–35,000 kg",
    dailyRate: 3000,
    status: "Active",
    lastPayment: "2026-05-03",
    registrationDate: "2024-03-10",
    compliance: "Compliant"
  },
  {
    id: 4,
    plate: "MZB 7788 G",
    owner: "Freight Solutions",
    vehicleType: "Cargo Truck",
    weightClass: "16,001–25,000 kg",
    dailyRate: 2000,
    status: "Active",
    lastPayment: "2026-03-15",
    registrationDate: "2023-11-05",
    compliance: "Non-compliant"
  },
  {
    id: 5,
    plate: "MZB 9900 J",
    owner: "Swift Transport",
    vehicleType: "Tractor",
    weightClass: "10,001–16,000 kg",
    dailyRate: 1500,
    status: "Active",
    lastPayment: "2026-05-02",
    registrationDate: "2024-02-18",
    compliance: "Compliant"
  },
]

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState(mockVehicles)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVehicle, setSelectedVehicle] = useState<typeof mockVehicles[0] | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Form state
  const [formData, setFormData] = useState({
    plate: "",
    owner: "",
    vehicleType: "",
    weightClass: "",
    notes: ""
  })

  // Filter vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.vehicleType.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex)

  // Group by status
  const activeCount = vehicles.filter(v => v.status === "Active").length
  const compliantCount = vehicles.filter(v => v.compliance === "Compliant").length

  // Handle view details
  const handleViewDetails = (vehicle: typeof mockVehicles[0]) => {
    setSelectedVehicle(vehicle)
    setIsDetailsDialogOpen(true)
  }

  // Handle edit vehicle
  const handleEditVehicle = () => {
    if (!selectedVehicle) return
    
    setVehicles(vehicles.map(v => 
      v.id === selectedVehicle.id 
        ? { ...v, plate: formData.plate, owner: formData.owner, vehicleType: formData.vehicleType, weightClass: formData.weightClass }
        : v
    ))
    setIsEditDialogOpen(false)
    setSelectedVehicle(null)
    setFormData({ plate: "", owner: "", vehicleType: "", weightClass: "", notes: "" })
    toast.success("Vehicle updated", {
      description: `${formData.plate} has been updated.`
    })
  }

  // Handle delete vehicle
  const handleDeleteVehicle = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    setVehicles(vehicles.filter(v => v.id !== vehicleId))
    toast.error("Vehicle removed", {
      description: `${vehicle?.plate} has been removed from the system.`
    })
  }

  // Handle suspend/activate
  const handleToggleStatus = (vehicleId: number) => {
    setVehicles(vehicles.map(v => 
      v.id === vehicleId 
        ? { ...v, status: v.status === "Active" ? "Suspended" : "Active" }
        : v
    ))
    const vehicle = vehicles.find(v => v.id === vehicleId)
    toast.info("Status updated", {
      description: `${vehicle?.plate} is now ${vehicle?.status === "Active" ? "Suspended" : "Active"}`
    })
  }

  // Open edit dialog
  const openEditDialog = (vehicle: typeof mockVehicles[0]) => {
    setSelectedVehicle(vehicle)
    setFormData({
      plate: vehicle.plate,
      owner: vehicle.owner,
      vehicleType: vehicle.vehicleType,
      weightClass: vehicle.weightClass,
      notes: ""
    })
    setIsEditDialogOpen(true)
  }

  // Simulate loading
  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.info("Data refreshed", {
        description: "Vehicle list has been updated."
      })
    }, 2000)
  }

  // Handle export
  const handleExport = () => {
    toast.success("Export started", {
      description: "Your vehicle report is being generated."
    })
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge className="bg-[#4CAF50] text-white text-sm px-3 py-1">
        <CheckCircle className="h-4 w-4 mr-1" />
        {status}
      </Badge>
    ) : (
      <Badge className="bg-[#E5533D] text-white text-sm px-3 py-1">
        <XCircle className="h-4 w-4 mr-1" />
        {status}
      </Badge>
    )
  }

  // Get compliance badge
  const getComplianceBadge = (compliance: string) => {
    return compliance === "Compliant" ? (
      <Badge className="bg-[#4CAF50] text-white text-sm px-3 py-1">
        {compliance}
      </Badge>
    ) : (
      <Badge className="bg-[#E5533D] text-white text-sm px-3 py-1">
        {compliance}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Vehicles</h1>
          <p className="text-lg text-muted-foreground">Search and manage registered vehicles</p>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 text-base h-12 w-80"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Total Vehicles</CardDescription>
            <CardTitle className="text-4xl">{vehicles.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Active</CardDescription>
            <CardTitle className="text-4xl text-[#D6F0E0]">{activeCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Compliant</CardDescription>
            <CardTitle className="text-4xl text-[#D6F0E0]">{compliantCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">
              {Math.round((compliantCount / vehicles.length) * 100)}% compliance rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Vehicle Registry</CardTitle>
              <CardDescription className="text-base">Complete list of registered vehicles</CardDescription>
            </div>
            <Button variant="outline" onClick={handleRefresh} className="text-base h-11 px-6">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex items-center justify-end gap-3">
            <Label htmlFor="status-filter" className="text-base font-medium">
              Filter by Status:
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="w-[200px] text-base h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-base">
                <SelectItem value="all" className="text-base">All ({vehicles.length})</SelectItem>
                <SelectItem value="Active" className="text-base">Active ({activeCount})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table with Loading State */}
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredVehicles.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Truck className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No vehicles found</h3>
              <p className="text-base text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Plate Number</TableHead>
                  <TableHead className="text-base">Owner</TableHead>
                  <TableHead className="text-base">Type</TableHead>
                  <TableHead className="text-base">Weight Class</TableHead>
                  <TableHead className="text-base">Last Payment</TableHead>
                  <TableHead className="text-right text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-mono font-medium text-base">{vehicle.plate}</TableCell>
                    <TableCell className="text-base">{vehicle.owner}</TableCell>
                    <TableCell className="text-base">{vehicle.vehicleType}</TableCell>
                    <TableCell className="text-base">{vehicle.weightClass}</TableCell>
                    <TableCell className="text-base">{vehicle.lastPayment}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(vehicle)}
                          className="h-10 w-10"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {!isLoading && filteredVehicles.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredVehicles.length)} of {filteredVehicles.length} vehicles
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

      {/* Vehicle Details Modal */}
      <Modal open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen} className="w-[90vw] max-w-[1200px]">
        <ModalHeader onClose={() => setIsDetailsDialogOpen(false)}>
          <div>
            <ModalTitle>Vehicle Details</ModalTitle>
            <ModalDescription>
              Complete information for {selectedVehicle?.plate}
            </ModalDescription>
          </div>
        </ModalHeader>
        
        <ModalBody>
          {selectedVehicle && (
            <div className="space-y-6">
              {/* Compliance Status Banner */}
              {selectedVehicle.compliance === "Non-compliant" && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-destructive">Non-Compliant Vehicle</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Payment overdue since {selectedVehicle.lastPayment}. Vehicle may be subject to enforcement action.
                    </p>
                  </div>
                </div>
              )}

              {selectedVehicle.compliance === "Compliant" && (
                <div className="rounded-lg bg-[#D6F0E0]/30 border border-[#D6F0E0] p-4 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#4FAF7C] mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-[#4FAF7C]">Compliant Vehicle</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      All payments up to date. Last payment: {selectedVehicle.lastPayment}
                    </p>
                  </div>
                </div>
              )}

              {/* Vehicle Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Plate Number</Label>
                  <p className="text-lg font-mono font-bold">{selectedVehicle.plate}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Owner/Company</Label>
                  <p className="text-lg font-medium">{selectedVehicle.owner}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Vehicle Type</Label>
                  <p className="text-lg font-medium">{selectedVehicle.vehicleType}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Weight Class</Label>
                  <p className="text-lg font-medium">{selectedVehicle.weightClass}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Daily Rate</Label>
                  <p className="text-lg font-medium">{selectedVehicle.dailyRate.toLocaleString()} MZN</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Registration Date</Label>
                  <p className="text-lg font-medium">{selectedVehicle.registrationDate}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Last Payment</Label>
                  <p className="text-lg font-medium">{selectedVehicle.lastPayment}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Days Since Payment</Label>
                  <p className="text-lg font-medium">
                    {Math.floor((new Date().getTime() - new Date(selectedVehicle.lastPayment).getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>

              <Separator />

              {/* Transaction History */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Transaction History</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-[#4FAF7C]" />
                      <div>
                        <p className="text-sm font-medium">Payment Received</p>
                        <p className="text-xs text-muted-foreground">{selectedVehicle.lastPayment}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold">{selectedVehicle.dailyRate.toLocaleString()} MZN</p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-[#4FAF7C]" />
                      <div>
                        <p className="text-sm font-medium">Payment Received</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(new Date(selectedVehicle.lastPayment).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold">{selectedVehicle.dailyRate.toLocaleString()} MZN</p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-[#4FAF7C]" />
                      <div>
                        <p className="text-sm font-medium">Payment Received</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(new Date(selectedVehicle.lastPayment).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold">{selectedVehicle.dailyRate.toLocaleString()} MZN</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="text-xs">Total Paid (30 days)</CardDescription>
                      <CardTitle className="text-xl">{(selectedVehicle.dailyRate * 4).toLocaleString()} MZN</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="text-xs">Total Paid (90 days)</CardDescription>
                      <CardTitle className="text-xl">{(selectedVehicle.dailyRate * 13).toLocaleString()} MZN</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="text-xs">Payment Status</CardDescription>
                      <CardTitle className="text-xl">
                        {selectedVehicle.compliance === "Compliant" ? (
                          <span className="text-[#4FAF7C]">Current</span>
                        ) : (
                          <span className="text-destructive">Overdue</span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    {selectedVehicle.compliance === "Non-compliant" && (
                      <CardContent>
                        <Button
                          onClick={() => setIsContactDialogOpen(true)}
                          variant="outline"
                          className="w-full text-sm"
                        >
                          Contact Owner
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                </div>
              </div>

              {/* Warnings/Alerts */}
              {selectedVehicle.compliance === "Non-compliant" && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Active Warnings</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-destructive">Payment Overdue</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last payment was {Math.floor((new Date().getTime() - new Date(selectedVehicle.lastPayment).getTime()) / (1000 * 60 * 60 * 24))} days ago. 
                            Penalties may apply.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-[#DAA22A]/20 border border-[#DAA22A]/50">
                        <AlertCircle className="h-5 w-5 text-[#DAA22A] mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Enforcement Risk</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Vehicle may be subject to impoundment or citation if payment is not received soon.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          {/* Footer can be used for additional actions if needed */}
        </ModalFooter>
      </Modal>

      {/* Edit Vehicle Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="text-base">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Vehicle</DialogTitle>
            <DialogDescription className="text-base">
              Update vehicle information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-plate" className="text-base">Plate Number *</Label>
              <Input
                id="edit-plate"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-owner" className="text-base">Owner/Company *</Label>
              <Input
                id="edit-owner"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type" className="text-base">Vehicle Type *</Label>
              <Select value={formData.vehicleType} onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}>
                <SelectTrigger className="text-base h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="Cargo Truck" className="text-base">Cargo Truck</SelectItem>
                  <SelectItem value="Tractor" className="text-base">Tractor</SelectItem>
                  <SelectItem value="Heavy Truck" className="text-base">Heavy Truck</SelectItem>
                  <SelectItem value="Trailer" className="text-base">Trailer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-weight" className="text-base">Weight Class *</Label>
              <Select value={formData.weightClass} onValueChange={(value) => setFormData({ ...formData, weightClass: value })}>
                <SelectTrigger className="text-base h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="10,001–16,000 kg" className="text-base">10,001–16,000 kg</SelectItem>
                  <SelectItem value="16,001–25,000 kg" className="text-base">16,001–25,000 kg</SelectItem>
                  <SelectItem value="25,001–35,000 kg" className="text-base">25,001–35,000 kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="text-base h-11 px-6">
              Cancel
            </Button>
            <Button onClick={handleEditVehicle} className="text-base h-11 px-6">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Owner Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Contact Vehicle Owner</DialogTitle>
            <DialogDescription className="text-base">
              Owner information for {selectedVehicle?.plate}
            </DialogDescription>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Company/Owner Name</Label>
                <p className="text-base font-semibold">{selectedVehicle.owner}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium">{selectedVehicle.ownerContact}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedVehicle.ownerContact)
                      toast.success("Phone number copied to clipboard")
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Email Address</Label>
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium">{selectedVehicle.ownerEmail}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedVehicle.ownerEmail)
                      toast.success("Email copied to clipboard")
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Address</Label>
                <p className="text-base font-medium">{selectedVehicle.ownerAddress}</p>
              </div>

              <Separator />

              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900">Payment Overdue</p>
                    <p className="text-yellow-700 mt-1">
                      This vehicle has an outstanding balance. Please contact the owner to arrange payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactDialogOpen(false)} className="text-base h-11 px-6">
              Close
            </Button>
            <Button
              onClick={() => {
                window.location.href = `tel:${selectedVehicle?.ownerContact}`
              }}
              className="text-base h-11 px-6"
            >
              Call Owner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
