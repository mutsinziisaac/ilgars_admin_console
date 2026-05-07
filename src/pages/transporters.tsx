import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Users, Search, Eye, CheckCircle, XCircle, Building2, Phone, Mail } from "lucide-react"
import { toast } from "sonner"

// Mock transporter data
const mockTransporters = [
  {
    id: 1,
    name: "Moza Transportes Lda",
    registrationNumber: "REG-2023-001",
    contactPerson: "Carlos Moza",
    email: "carlos@mozatransportes.co.mz",
    phone: "+258 84 123 4567",
    address: "Av. Julius Nyerere, Maputo",
    vehicleCount: 12,
    status: "Active",
    registrationDate: "2023-01-15",
    compliance: "Compliant"
  },
  {
    id: 2,
    name: "TransMoz Logistics",
    registrationNumber: "REG-2023-002",
    contactPerson: "Ana Silva",
    email: "ana@transmoz.co.mz",
    phone: "+258 82 987 6543",
    address: "Av. 24 de Julho, Maputo",
    vehicleCount: 8,
    status: "Active",
    registrationDate: "2023-03-22",
    compliance: "Compliant"
  },
  {
    id: 3,
    name: "Cargo Express Ltd",
    registrationNumber: "REG-2023-003",
    contactPerson: "João Ferreira",
    email: "joao@cargoexpress.co.mz",
    phone: "+258 86 555 1234",
    address: "Av. Marginal, Matola",
    vehicleCount: 15,
    status: "Active",
    registrationDate: "2023-02-10",
    compliance: "Non-compliant"
  },
  {
    id: 4,
    name: "Freight Solutions",
    registrationNumber: "REG-2023-004",
    contactPerson: "Maria Santos",
    email: "maria@freightsolutions.co.mz",
    phone: "+258 84 777 8888",
    address: "Av. Eduardo Mondlane, Maputo",
    vehicleCount: 6,
    status: "Active",
    registrationDate: "2023-05-18",
    compliance: "Non-compliant"
  },
  {
    id: 5,
    name: "Swift Transport",
    registrationNumber: "REG-2023-005",
    contactPerson: "Pedro Costa",
    email: "pedro@swifttransport.co.mz",
    phone: "+258 82 333 4444",
    address: "Av. Acordos de Lusaka, Maputo",
    vehicleCount: 10,
    status: "Active",
    registrationDate: "2023-04-05",
    compliance: "Compliant"
  },
]

export function TransportersPage() {
  const [transporters, setTransporters] = useState(mockTransporters)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTransporter, setSelectedTransporter] = useState<typeof mockTransporters[0] | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [fleetCurrentPage, setFleetCurrentPage] = useState(1)
  const vehiclesPerPage = 5

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  })

  // Filter transporters
  const filteredTransporters = transporters.filter(transporter => {
    const matchesSearch = 
      transporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transporter.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transporter.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || transporter.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredTransporters.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransporters = filteredTransporters.slice(startIndex, endIndex)

  // Group by status
  const activeCount = transporters.filter(t => t.status === "Active").length
  const compliantCount = transporters.filter(t => t.compliance === "Compliant").length
  const totalVehicles = transporters.reduce((sum, t) => sum + t.vehicleCount, 0)

  // Handle view details
  const handleViewDetails = (transporter: typeof mockTransporters[0]) => {
    setSelectedTransporter(transporter)
    setIsDetailsDialogOpen(true)
    setFleetCurrentPage(1) // Reset to first page when opening
  }

  // Get mock fleet data for selected transporter
  const getFleetData = (transporterId: number) => {
    const allVehicles = []
    
    if (transporterId === 1) {
      allVehicles.push(
        { plate: "MZB 5678 B", type: "Cargo Truck", lastPayment: "2026-04-20", daysOverdue: 17, fines: "25,500 MZN", status: "Non-Compliant" },
        { plate: "MZB 1234 A", type: "Heavy Truck", lastPayment: "2026-05-03", daysOverdue: 0, fines: "0 MZN", status: "Compliant" },
        { plate: "MZB 9876 C", type: "Tractor", lastPayment: "2026-05-01", daysOverdue: 0, fines: "0 MZN", status: "Compliant" },
        { plate: "MZB 4455 D", type: "Cargo Truck", lastPayment: "2026-04-15", daysOverdue: 22, fines: "33,000 MZN", status: "Non-Compliant" },
        { plate: "MZB 2211 E", type: "Heavy Truck", lastPayment: "2026-05-04", daysOverdue: 0, fines: "0 MZN", status: "Compliant" },
        { plate: "MZB 6677 F", type: "Tractor", lastPayment: "2026-05-02", daysOverdue: 0, fines: "0 MZN", status: "Compliant" },
        { plate: "MZB 8899 G", type: "Cargo Truck", lastPayment: "2026-04-28", daysOverdue: 9, fines: "13,500 MZN", status: "Non-Compliant" },
        { plate: "MZB 3322 H", type: "Heavy Truck", lastPayment: "2026-05-05", daysOverdue: 0, fines: "0 MZN", status: "Compliant" },
        { plate: "MZB 5544 I", type: "Tractor", lastPayment: "2026-05-03", daysOverdue: 0, fines: "0 MZN", status: "Compliant" },
        { plate: "MZB 7766 J", type: "Cargo Truck", lastPayment: "2026-05-01", daysOverdue: 0, fines: "0 MZN", status: "Compliant" },
        { plate: "MZB 9988 K", type: "Heavy Truck", lastPayment: "2026-05-04", daysOverdue: 0, fines: "0 MZN", status: "Compliant" },
        { plate: "MZB 1122 L", type: "Tractor", lastPayment: "2026-05-02", daysOverdue: 0, fines: "0 MZN", status: "Compliant" }
      )
    } else if (transporterId === 2) {
      allVehicles.push(
        { plate: "MZB 0011 E", type: "Tractor", lastPayment: "2026-05-04", daysOverdue: 0, fines: "0 MZN", status: "Compliant" },
        { plate: "MZB 2233 F", type: "Heavy Truck", lastPayment: "2026-05-02", daysOverdue: 0, fines: "0 MZN", status: "Compliant" }
      )
    } else if (transporterId === 3) {
      allVehicles.push(
        { plate: "MZB 3344 F", type: "Heavy Truck", lastPayment: "2026-04-10", daysOverdue: 27, fines: "40,500 MZN", status: "Non-Compliant" },
        { plate: "MZB 5566 G", type: "Cargo Truck", lastPayment: "2026-05-01", daysOverdue: 0, fines: "0 MZN", status: "Compliant" }
      )
    } else {
      allVehicles.push(
        { plate: "MZB XXXX X", type: "Cargo Truck", lastPayment: "2026-05-02", daysOverdue: 0, fines: "0 MZN", status: "Compliant" }
      )
    }
    
    return allVehicles
  }

  // Pagination logic
  const paginatedVehicles = selectedTransporter ? (() => {
    const allVehicles = getFleetData(selectedTransporter.id)
    const startIndex = (fleetCurrentPage - 1) * vehiclesPerPage
    const endIndex = startIndex + vehiclesPerPage
    return allVehicles.slice(startIndex, endIndex)
  })() : []

  const fleetTotalPages = selectedTransporter ? Math.ceil(getFleetData(selectedTransporter.id).length / vehiclesPerPage) : 0

  // Handle edit transporter
  const handleEditTransporter = () => {
    if (!selectedTransporter) return
    
    setTransporters(transporters.map(t => 
      t.id === selectedTransporter.id 
        ? { ...t, name: formData.name, contactPerson: formData.contactPerson, email: formData.email, phone: formData.phone, address: formData.address }
        : t
    ))
    setIsEditDialogOpen(false)
    setSelectedTransporter(null)
    setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", notes: "" })
    toast.success("Transporter updated", {
      description: `${formData.name} has been updated.`
    })
  }

  // Handle delete transporter
  const handleDeleteTransporter = (transporterId: number) => {
    const transporter = transporters.find(t => t.id === transporterId)
    setTransporters(transporters.filter(t => t.id !== transporterId))
    toast.error("Transporter removed", {
      description: `${transporter?.name} has been removed from the system.`
    })
  }

  // Handle suspend/activate
  const handleToggleStatus = (transporterId: number) => {
    setTransporters(transporters.map(t => 
      t.id === transporterId 
        ? { ...t, status: t.status === "Active" ? "Suspended" : "Active" }
        : t
    ))
    const transporter = transporters.find(t => t.id === transporterId)
    toast.info("Status updated", {
      description: `${transporter?.name} is now ${transporter?.status === "Active" ? "Suspended" : "Active"}`
    })
  }

  // Open edit dialog
  const openEditDialog = (transporter: typeof mockTransporters[0]) => {
    setSelectedTransporter(transporter)
    setFormData({
      name: transporter.name,
      contactPerson: transporter.contactPerson,
      email: transporter.email,
      phone: transporter.phone,
      address: transporter.address,
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
        description: "Transporter list has been updated."
      })
    }, 2000)
  }

  // Handle export
  const handleExport = () => {
    toast.success("Export started", {
      description: "Your transporter report is being generated."
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
          <h1 className="text-4xl font-semibold text-foreground">Transporters</h1>
          <p className="text-lg text-muted-foreground">Search and manage transport companies</p>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transporters..."
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
            <CardDescription className="text-base">Total Transporters</CardDescription>
            <CardTitle className="text-4xl">{transporters.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Registered companies</p>
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
            <CardDescription className="text-base">Total Vehicles</CardDescription>
            <CardTitle className="text-4xl">{totalVehicles}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Across all transporters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Compliant</CardDescription>
            <CardTitle className="text-4xl text-[#4CAF50]">{compliantCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">
              {Math.round((compliantCount / transporters.length) * 100)}% compliance rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Transporter Registry</CardTitle>
              <CardDescription className="text-base">Complete list of registered transport companies</CardDescription>
            </div>
            <Button variant="outline" onClick={handleRefresh} className="text-base h-11 px-6">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="all" className="text-base">
                All ({transporters.length})
              </TabsTrigger>
              <TabsTrigger value="Active" className="text-base">
                Active ({activeCount})
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
          ) : filteredTransporters.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No transporters found</h3>
              <p className="text-base text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Company Name</TableHead>
                  <TableHead className="text-base">Registration No.</TableHead>
                  <TableHead className="text-base">Contact Person</TableHead>
                  <TableHead className="text-base">Phone</TableHead>
                  <TableHead className="text-base">Vehicles</TableHead>
                  <TableHead className="text-right text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransporters.map((transporter) => (
                  <TableRow key={transporter.id}>
                    <TableCell className="font-medium text-base">{transporter.name}</TableCell>
                    <TableCell className="font-mono text-base">{transporter.registrationNumber}</TableCell>
                    <TableCell className="text-base">{transporter.contactPerson}</TableCell>
                    <TableCell className="text-base">{transporter.phone}</TableCell>
                    <TableCell className="text-base font-medium">{transporter.vehicleCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(transporter)}
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
          {!isLoading && filteredTransporters.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransporters.length)} of {filteredTransporters.length} transporters
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

      {/* Transporter Details Modal */}
      <Modal open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen} className="w-[95vw] max-w-[1600px]">
        <ModalHeader onClose={() => setIsDetailsDialogOpen(false)}>
          <div>
            <ModalTitle>Transporter Details</ModalTitle>
            <ModalDescription>
              Complete information for {selectedTransporter?.name}
            </ModalDescription>
          </div>
        </ModalHeader>
        
        <ModalBody>
          {selectedTransporter && (
            <div className="space-y-6">
              {/* Company Info Grid */}
              <div className="grid grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company Name
                  </Label>
                  <p className="text-lg font-bold">{selectedTransporter.name}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Registration Number</Label>
                  <p className="text-lg font-mono font-medium">{selectedTransporter.registrationNumber}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Contact Person</Label>
                  <p className="text-lg font-medium">{selectedTransporter.contactPerson}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <p className="text-lg font-medium">{selectedTransporter.phone}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="text-lg font-medium">{selectedTransporter.email}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Registration Date</Label>
                  <p className="text-lg font-medium">{selectedTransporter.registrationDate}</p>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label className="text-base text-muted-foreground">Address</Label>
                  <p className="text-lg font-medium">{selectedTransporter.address}</p>
                </div>
              </div>

              <Separator />

              {/* Fleet Overview */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Fleet Overview</h3>
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="text-xs">Total Vehicles</CardDescription>
                      <CardTitle className="text-2xl">{selectedTransporter.vehicleCount}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="text-xs">Compliant</CardDescription>
                      <CardTitle className="text-2xl text-[#4FAF7C]">
                        {Math.floor(selectedTransporter.vehicleCount * 0.75)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="text-xs">Non-Compliant</CardDescription>
                      <CardTitle className="text-2xl text-destructive">
                        {Math.ceil(selectedTransporter.vehicleCount * 0.25)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="text-xs">Total Fines</CardDescription>
                      <CardTitle className="text-2xl text-[#DAA22A]">
                        {(selectedTransporter.vehicleCount * 12500).toLocaleString()} MZN
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Fleet Details Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Fleet Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Showing {((fleetCurrentPage - 1) * vehiclesPerPage) + 1}-{Math.min(fleetCurrentPage * vehiclesPerPage, selectedTransporter.vehicleCount)} of {selectedTransporter.vehicleCount} vehicles
                  </p>
                </div>
                <div className="border rounded-lg">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-base">Plate Number</TableHead>
                      <TableHead className="text-base">Vehicle Type</TableHead>
                      <TableHead className="text-base">Last Payment</TableHead>
                      <TableHead className="text-base">Days Overdue</TableHead>
                      <TableHead className="text-base">Fines</TableHead>
                      <TableHead className="text-base">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedVehicles.map((vehicle, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono font-medium text-base">{vehicle.plate}</TableCell>
                        <TableCell className="text-base">{vehicle.type}</TableCell>
                        <TableCell className="text-base">{vehicle.lastPayment}</TableCell>
                        <TableCell className={`text-base font-medium ${vehicle.daysOverdue > 0 ? 'text-destructive' : 'text-[#4FAF7C]'}`}>
                          {vehicle.daysOverdue} days
                        </TableCell>
                        <TableCell className={`text-base ${vehicle.daysOverdue > 0 ? 'font-bold text-destructive' : ''}`}>
                          {vehicle.fines}
                        </TableCell>
                        <TableCell>
                          <Badge className={vehicle.status === "Compliant" ? "bg-[#4FAF7C] text-white text-sm" : "bg-destructive text-white text-sm"}>
                            {vehicle.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Page {fleetCurrentPage} of {fleetTotalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setFleetCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={fleetCurrentPage === 1}
                        className="text-base h-10 px-4"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setFleetCurrentPage(prev => Math.min(fleetTotalPages, prev + 1))}
                        disabled={fleetCurrentPage === fleetTotalPages}
                        className="text-base h-10 px-4"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Payment Summary */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Payment Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-muted/40">
                    <CardHeader className="pb-3">
                      <CardDescription className="text-xs">Total Paid (30 days)</CardDescription>
                      <CardTitle className="text-xl">
                        {(selectedTransporter.vehicleCount * 8000).toLocaleString()} MZN
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="bg-muted/40">
                    <CardHeader className="pb-3">
                      <CardDescription className="text-xs">Outstanding Fines</CardDescription>
                      <CardTitle className="text-xl text-destructive">
                        {(selectedTransporter.vehicleCount * 12500).toLocaleString()} MZN
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="bg-muted/40">
                    <CardHeader className="pb-3">
                      <CardDescription className="text-xs">Compliance Rate</CardDescription>
                      <CardTitle className="text-xl text-[#4FAF7C]">75%</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          {/* Footer can be used for additional actions if needed */}
        </ModalFooter>
      </Modal>

      {/* Edit Transporter Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="text-base max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Transporter</DialogTitle>
            <DialogDescription className="text-base">
              Update transporter information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-base">Company Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contact" className="text-base">Contact Person *</Label>
              <Input
                id="edit-contact"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="text-base h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-base">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="text-base">Phone *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-base h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address" className="text-base">Address *</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="text-base"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="text-base h-11 px-6">
              Cancel
            </Button>
            <Button onClick={handleEditTransporter} className="text-base h-11 px-6">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
