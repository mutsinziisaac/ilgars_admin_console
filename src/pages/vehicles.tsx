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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, Search, Eye, Pencil, Trash2, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

// Mock vehicle data
const mockVehicles = [
  {
    id: 1,
    plate: "MZB 5678 B",
    owner: "Moza Transportes Lda",
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
    status: "Suspended",
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

  // Group by status
  const activeCount = vehicles.filter(v => v.status === "Active").length
  const suspendedCount = vehicles.filter(v => v.status === "Suspended").length
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
      <div className="grid gap-6 md:grid-cols-4">
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
            <CardTitle className="text-4xl text-[#4CAF50]">{activeCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Suspended</CardDescription>
            <CardTitle className="text-4xl text-[#E5533D]">{suspendedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Compliant</CardDescription>
            <CardTitle className="text-4xl text-[#4CAF50]">{compliantCount}</CardTitle>
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
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="all" className="text-base">
                All ({vehicles.length})
              </TabsTrigger>
              <TabsTrigger value="Active" className="text-base">
                Active ({activeCount})
              </TabsTrigger>
              <TabsTrigger value="Suspended" className="text-base">
                Suspended ({suspendedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

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
                  <TableHead className="text-base">Status</TableHead>
                  <TableHead className="text-base">Compliance</TableHead>
                  <TableHead className="text-base">Last Payment</TableHead>
                  <TableHead className="text-right text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-mono font-medium text-base">{vehicle.plate}</TableCell>
                    <TableCell className="text-base">{vehicle.owner}</TableCell>
                    <TableCell className="text-base">{vehicle.vehicleType}</TableCell>
                    <TableCell className="text-base">{vehicle.weightClass}</TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell>{getComplianceBadge(vehicle.compliance)}</TableCell>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(vehicle)}
                          className="h-10 w-10"
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        
                        {/* Delete Confirmation Dialog */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                              <Trash2 className="h-5 w-5 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="text-base">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-2xl">Remove Vehicle</AlertDialogTitle>
                              <AlertDialogDescription className="text-base">
                                Are you sure you want to remove <strong>{vehicle.plate}</strong>? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="text-base h-11 px-6">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteVehicle(vehicle.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-base h-11 px-6"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="text-base max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Vehicle Details</DialogTitle>
            <DialogDescription className="text-base">
              Complete information for {selectedVehicle?.plate}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVehicle && (
            <div className="space-y-6 py-4">
              {/* Status Badges */}
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedVehicle.status)}
                {getComplianceBadge(selectedVehicle.compliance)}
              </div>

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
                  <Label className="text-base text-muted-foreground">Compliance Status</Label>
                  <p className="text-lg font-medium">{selectedVehicle.compliance}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)} className="text-base h-11 px-6">
              Close
            </Button>
            {selectedVehicle && (
              <Button 
                onClick={() => handleToggleStatus(selectedVehicle.id)} 
                variant={selectedVehicle.status === "Active" ? "outline" : "default"}
                className="text-base h-11 px-6"
              >
                {selectedVehicle.status === "Active" ? "Suspend Vehicle" : "Activate Vehicle"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  )
}
