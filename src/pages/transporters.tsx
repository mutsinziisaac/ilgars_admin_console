import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Search, Eye, Pencil, Trash2, Download, CheckCircle, XCircle, Building2, Phone, Mail } from "lucide-react"
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

  // Group by status
  const activeCount = transporters.filter(t => t.status === "Active").length
  const compliantCount = transporters.filter(t => t.compliance === "Compliant").length
  const totalVehicles = transporters.reduce((sum, t) => sum + t.vehicleCount, 0)

  // Handle view details
  const handleViewDetails = (transporter: typeof mockTransporters[0]) => {
    setSelectedTransporter(transporter)
    setIsDetailsDialogOpen(true)
  }

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
                {filteredTransporters.map((transporter) => (
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(transporter)}
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
                              <AlertDialogTitle className="text-2xl">Remove Transporter</AlertDialogTitle>
                              <AlertDialogDescription className="text-base">
                                Are you sure you want to remove <strong>{transporter.name}</strong>? 
                                This action cannot be undone and will affect {transporter.vehicleCount} vehicles.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="text-base h-11 px-6">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTransporter(transporter.id)}
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

      {/* Transporter Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="text-base max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Transporter Details</DialogTitle>
            <DialogDescription className="text-base">
              Complete information for {selectedTransporter?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransporter && (
            <div className="space-y-6 py-4">
              {/* Transporter Info Grid */}
              <div className="grid grid-cols-2 gap-6">
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
                  <Label className="text-base text-muted-foreground">Registered Vehicles</Label>
                  <p className="text-lg font-medium">{selectedTransporter.vehicleCount} vehicles</p>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label className="text-base text-muted-foreground">Address</Label>
                  <p className="text-lg font-medium">{selectedTransporter.address}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Registration Date</Label>
                  <p className="text-lg font-medium">{selectedTransporter.registrationDate}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)} className="text-base h-11 px-6">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
