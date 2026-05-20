import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Truck, Eye, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useVehiclesList } from "@/lib/api/vehicles/hooks"

export function VehiclesPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Fetch vehicles from API using the new hooks
  const { data, isLoading, error, refetch } = useVehiclesList({
    page: 0,
    size: 100,
    status: statusFilter !== "all" ? statusFilter : undefined,
  })

  // Extract data from API response
  const vehicles = (data?.data || []) as any[]

  const getVehicleStatus = (vehicle: any) => vehicle.registryStatus || vehicle.status || "ACTIVE"
  const isActiveVehicle = (vehicle: any) => String(getVehicleStatus(vehicle)).toUpperCase() === "ACTIVE"
  const getVehicleOwner = (vehicle: any) => vehicle.ownerName || vehicle.operatorName || "N/A"
  const getVehicleType = (vehicle: any) =>
    [vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
    vehicle.vehicleType ||
    vehicle.truckNumber ||
    "N/A"
  const getVehicleCapacity = (vehicle: any) => {
    const capacity =
      vehicle.currentLogbookCapacity ??
      vehicle.logbookCapacityKg ??
      vehicle.capacity ??
      vehicle.grossWeightTotalKg
    const unit = vehicle.capacityUnit || (vehicle.logbookCapacityKg || vehicle.grossWeightTotalKg ? "KG" : "")

    return capacity ? `${capacity.toLocaleString()}${unit ? ` ${unit}` : ""}` : "N/A"
  }
  const getVehicleRegistrationDate = (vehicle: any) =>
    vehicle.registrationDate || vehicle.createdAt?.split?.("T")?.[0] || "N/A"
  const toVehicleView = (vehicle: any) => ({
    ...vehicle,
    plate: vehicle.plateNumber,
    owner: getVehicleOwner(vehicle),
    vehicleType: getVehicleType(vehicle),
    weightClass: getVehicleCapacity(vehicle),
    dailyRate: 0,
    registrationDate: getVehicleRegistrationDate(vehicle),
    lastPayment: "N/A",
    compliance: isActiveVehicle(vehicle) ? "Compliant" : "Non-compliant",
  })

  // Form state
  const [formData, setFormData] = useState({
    plate: "",
    owner: "",
    vehicleType: "",
    weightClass: "",
    notes: ""
  })

  // Filter vehicles (client-side filtering for status if needed)
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesStatus = statusFilter === "all" || String(getVehicleStatus(vehicle)).toUpperCase() === statusFilter
    return matchesStatus
  })
  const totalItems = filteredVehicles.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const normalizedCurrentPage = Math.min(currentPage, totalPages)
  const pageStartIndex = (normalizedCurrentPage - 1) * itemsPerPage
  const paginatedVehicles = filteredVehicles.slice(pageStartIndex, pageStartIndex + itemsPerPage)

  // Group by status
  const activeCount = vehicles.filter(isActiveVehicle).length
  const compliantCount = vehicles.length // Adjust based on your compliance logic

  // Handle view details
  const handleViewDetails = (vehicle: any) => {
    setSelectedVehicle(toVehicleView(vehicle))
  }

  // Handle edit vehicle
  const handleEditVehicle = () => {
    if (!selectedVehicle) return
    
    // TODO: Implement update vehicle API call
    toast.success("Vehicle updated successfully")
    setIsEditDialogOpen(false)
  }

  // Simulate loading
  const handleRefresh = () => {
    refetch()
    toast.info("Data refreshed", {
      description: "Vehicle list has been updated."
    })
  }

  const contactOwnerDialog = (
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
                <p className="text-base font-medium">{selectedVehicle.ownerContact || "N/A"}</p>
                {selectedVehicle.ownerContact && (
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
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Email Address</Label>
              <div className="flex items-center gap-2">
                <p className="text-base font-medium">{selectedVehicle.ownerEmail || "N/A"}</p>
                {selectedVehicle.ownerEmail && (
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
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Address</Label>
              <p className="text-base font-medium">{selectedVehicle.ownerAddress || "N/A"}</p>
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
              if (selectedVehicle?.ownerContact) {
                window.location.href = `tel:${selectedVehicle.ownerContact}`
              }
            }}
            disabled={!selectedVehicle?.ownerContact}
            className="text-base h-11 px-6"
          >
            Call Owner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  if (selectedVehicle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-6">
          <div>
            <Button
              variant="ghost"
              onClick={() => setSelectedVehicle(null)}
              className="mb-3 h-9 px-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vehicles
            </Button>
            <h1 className="text-4xl font-semibold text-foreground">Vehicle Details</h1>
            <p className="text-lg text-muted-foreground">Complete information for {selectedVehicle.plate}</p>
          </div>
          <Badge variant="outline" className="text-base px-3 py-1">
            {getVehicleStatus(selectedVehicle)}
          </Badge>
        </div>

        {selectedVehicle.compliance === "Non-compliant" && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">Non-Compliant Vehicle</p>
              <p className="text-sm text-muted-foreground mt-1">
                This vehicle is not currently marked active in the registry.
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
                This vehicle is active in the registry.
              </p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Vehicle Information</CardTitle>
            <CardDescription className="text-base">Registry and ownership details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
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
                <p className="text-lg font-medium">
                  {selectedVehicle.dailyRate ? `${selectedVehicle.dailyRate.toLocaleString()} MZN` : "N/A"}
                </p>
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
                <p className="text-lg font-medium">N/A</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Registry Details</CardTitle>
            <CardDescription className="text-base">Motor vehicle backend fields</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Truck Number", selectedVehicle.truckNumber || "N/A"],
                ["VIN / Chassis", selectedVehicle.vinOrChassis || selectedVehicle.vin || "N/A"],
                ["Fuel Type", selectedVehicle.fuelType || "N/A"],
                ["Service Type", selectedVehicle.serviceType || "N/A"],
                ["Registry Status", getVehicleStatus(selectedVehicle)],
                ["Logbook Number", selectedVehicle.logbookNumber || "N/A"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total Paid (30 days)</CardDescription>
              <CardTitle className="text-xl">N/A</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total Paid (90 days)</CardDescription>
              <CardTitle className="text-xl">N/A</CardTitle>
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

        {selectedVehicle.compliance === "Non-compliant" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Active Warnings</CardTitle>
              <CardDescription className="text-base">Open compliance risks for this vehicle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Payment Overdue</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This vehicle is not currently marked active in the registry.
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
            </CardContent>
          </Card>
        )}

        {contactOwnerDialog}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Vehicles</h1>
          <p className="text-lg text-muted-foreground">Manage registered vehicles</p>
        </div>
      </div>

      {/* Error State */}
      {error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-semibold">Failed to load vehicles</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Total Vehicles</CardDescription>
            <CardTitle className="text-4xl">
              {isLoading ? <Skeleton className="h-10 w-20" /> : totalItems}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Active</CardDescription>
            <CardTitle className="text-4xl text-[#D6F0E0]">
              {isLoading ? <Skeleton className="h-10 w-20" /> : activeCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Compliant</CardDescription>
            <CardTitle className="text-4xl text-[#D6F0E0]">
              {isLoading ? <Skeleton className="h-10 w-20" /> : compliantCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">
              {vehicles.length > 0 ? `${Math.round((compliantCount / vehicles.length) * 100)}% compliance rate` : "N/A"}
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
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger id="status-filter" className="w-[200px] text-base h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-base">
                <SelectItem value="all" className="text-base">All ({vehicles.length})</SelectItem>
                <SelectItem value="ACTIVE" className="text-base">Active ({activeCount})</SelectItem>
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
                Try adjusting your filter criteria
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
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No vehicles found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-mono font-medium text-base">{vehicle.plateNumber}</TableCell>
                    <TableCell className="text-base">{getVehicleOwner(vehicle)}</TableCell>
                    <TableCell className="text-base">{getVehicleType(vehicle)}</TableCell>
                    <TableCell className="text-base">{getVehicleCapacity(vehicle)}</TableCell>
                    <TableCell className="text-base">{getVehicleRegistrationDate(vehicle)}</TableCell>
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
                  ))
                )}

              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {!isLoading && filteredVehicles.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {pageStartIndex + 1} to {pageStartIndex + paginatedVehicles.length} of {totalItems} vehicles
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={normalizedCurrentPage === 1}
                  className="h-9 px-4"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {normalizedCurrentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={normalizedCurrentPage === totalPages}
                  className="h-9 px-4"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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

      {contactOwnerDialog}
    </div>
  )
}
