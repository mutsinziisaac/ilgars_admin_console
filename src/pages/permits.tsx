import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Search, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"

// Mock permit data
const mockPermits = [
  { 
    id: "PRM-001", 
    applicant: "TransMoz Logistics", 
    vehicle: "AAB-123-MP",
    permitType: "Heavy Load",
    route: "Maputo - Beira",
    status: "Pending", 
    submittedDate: "2026-05-01",
    expiryDate: "2026-08-01",
    fee: 5000
  },
  { 
    id: "PRM-002", 
    applicant: "Cargo Express Ltd", 
    vehicle: "XYZ-456-MP",
    permitType: "Oversize",
    route: "Maputo - Nampula",
    status: "Approved", 
    submittedDate: "2026-04-28",
    expiryDate: "2026-07-28",
    fee: 7500
  },
  { 
    id: "PRM-003", 
    applicant: "Freight Solutions", 
    vehicle: "LMN-789-MP",
    permitType: "Hazardous",
    route: "Maputo - Tete",
    status: "Pending", 
    submittedDate: "2026-05-02",
    expiryDate: "2026-08-02",
    fee: 10000
  },
  { 
    id: "PRM-004", 
    applicant: "Swift Transport", 
    vehicle: "QRS-321-MP",
    permitType: "Heavy Load",
    route: "Maputo - Quelimane",
    status: "Rejected", 
    submittedDate: "2026-04-25",
    expiryDate: "-",
    fee: 5000
  },
  { 
    id: "PRM-005", 
    applicant: "National Carriers", 
    vehicle: "TUV-654-MP",
    permitType: "Oversize",
    route: "Maputo - Pemba",
    status: "Approved", 
    submittedDate: "2026-04-30",
    expiryDate: "2026-07-30",
    fee: 7500
  },
  { 
    id: "PRM-006", 
    applicant: "Metro Freight", 
    vehicle: "WXY-987-MP",
    permitType: "Heavy Load",
    route: "Maputo - Chimoio",
    status: "Pending", 
    submittedDate: "2026-05-03",
    expiryDate: "2026-08-03",
    fee: 5000
  },
  { 
    id: "PRM-007", 
    applicant: "Global Logistics", 
    vehicle: "DEF-147-MP",
    permitType: "Hazardous",
    route: "Maputo - Lichinga",
    status: "Pending", 
    submittedDate: "2026-05-04",
    expiryDate: "2026-08-04",
    fee: 10000
  },
  { 
    id: "PRM-008", 
    applicant: "Prime Movers", 
    vehicle: "GHI-258-MP",
    permitType: "Oversize",
    route: "Maputo - Inhambane",
    status: "Approved", 
    submittedDate: "2026-04-27",
    expiryDate: "2026-07-27",
    fee: 7500
  },
]

export function PermitsPage() {
  const [permits, setPermits] = useState(mockPermits)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPermit, setSelectedPermit] = useState<typeof mockPermits[0] | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  // Filter permits
  const filteredPermits = permits.filter(permit => {
    const matchesSearch = 
      permit.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permit.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permit.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permit.route.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || permit.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Group by status
  const pendingCount = permits.filter(p => p.status === "Pending").length
  const approvedCount = permits.filter(p => p.status === "Approved").length
  const rejectedCount = permits.filter(p => p.status === "Rejected").length

  // Handle view details
  const handleViewDetails = (permit: typeof mockPermits[0]) => {
    setSelectedPermit(permit)
    setIsDetailsDialogOpen(true)
  }

  // Handle approve permit
  const handleApprovePermit = () => {
    if (!selectedPermit) return
    
    setPermits(permits.map(p => 
      p.id === selectedPermit.id ? { ...p, status: "Approved" } : p
    ))
    setIsApproveDialogOpen(false)
    setIsDetailsDialogOpen(false)
    toast.success("Permit approved", {
      description: `${selectedPermit.id} has been approved successfully.`
    })
  }

  // Handle reject permit
  const handleRejectPermit = () => {
    if (!selectedPermit) return
    
    setPermits(permits.map(p => 
      p.id === selectedPermit.id ? { ...p, status: "Rejected" } : p
    ))
    setIsRejectDialogOpen(false)
    setIsDetailsDialogOpen(false)
    setRejectionReason("")
    toast.error("Permit rejected", {
      description: `${selectedPermit.id} has been rejected.`
    })
  }

  // Simulate loading
  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.info("Data refreshed", {
        description: "Permits list has been updated."
      })
    }, 2000)
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Badge className="bg-[#D6F0E0] text-[#1C1C1C] text-sm px-3 py-1">
            <CheckCircle className="h-4 w-4 mr-1" />
            {status}
          </Badge>
        )
      case "Pending":
        return (
          <Badge className="bg-[#FFF306] text-[#1C1C1C] text-sm px-3 py-1">
            <Clock className="h-4 w-4 mr-1" />
            {status}
          </Badge>
        )
      case "Rejected":
        return (
          <Badge className="bg-[#E5533D] text-white text-sm px-3 py-1">
            <XCircle className="h-4 w-4 mr-1" />
            {status}
          </Badge>
        )
      default:
        return <Badge className="text-sm px-3 py-1">{status}</Badge>
    }
  }

  // Get permit type badge
  const getPermitTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      "Heavy Load": "bg-primary",
      "Oversize": "bg-[#FFF306] text-[#1C1C1C]",
      "Hazardous": "bg-[#E5533D]"
    }
    return (
      <Badge className={`${colors[type] || "bg-secondary"} text-white text-sm px-3 py-1`}>
        {type}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Permits</h1>
          <p className="text-lg text-muted-foreground">Manage and review transport permits</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Total Permits</CardDescription>
            <CardTitle className="text-4xl">{permits.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">All applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Pending Review</CardDescription>
            <CardTitle className="text-4xl text-[#FFF306]">{pendingCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">
              <Badge className="bg-[#FFF306] text-[#1C1C1C] text-sm">Requires action</Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Approved</CardDescription>
            <CardTitle className="text-4xl text-[#D6F0E0]">{approvedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Active permits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Total Revenue</CardDescription>
            <CardTitle className="text-4xl">
              {permits.filter(p => p.status === "Approved").reduce((sum, p) => sum + p.fee, 0).toLocaleString()} MZN
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">From approved permits</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Permit Applications</CardTitle>
              <CardDescription className="text-base">Review and manage all permit requests</CardDescription>
            </div>
            <Button variant="outline" onClick={handleRefresh} className="text-base h-11 px-6">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="all" className="text-base">
                All ({permits.length})
              </TabsTrigger>
              <TabsTrigger value="Pending" className="text-base">
                Pending ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="Approved" className="text-base">
                Approved ({approvedCount})
              </TabsTrigger>
              <TabsTrigger value="Rejected" className="text-base">
                Rejected ({rejectedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by permit ID, applicant, vehicle, or route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 text-base h-12"
              />
            </div>
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
          ) : filteredPermits.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No permits found</h3>
              <p className="text-base text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Permit ID</TableHead>
                  <TableHead className="text-base">Applicant</TableHead>
                  <TableHead className="text-base">Vehicle</TableHead>
                  <TableHead className="text-base">Type</TableHead>
                  <TableHead className="text-base">Route</TableHead>
                  <TableHead className="text-base">Status</TableHead>
                  <TableHead className="text-base">Submitted</TableHead>
                  <TableHead className="text-base">Fee</TableHead>
                  <TableHead className="text-right text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermits.map((permit) => (
                  <TableRow key={permit.id}>
                    <TableCell className="font-medium text-base">{permit.id}</TableCell>
                    <TableCell className="text-base">{permit.applicant}</TableCell>
                    <TableCell className="text-base">{permit.vehicle}</TableCell>
                    <TableCell>{getPermitTypeBadge(permit.permitType)}</TableCell>
                    <TableCell className="text-base">{permit.route}</TableCell>
                    <TableCell>{getStatusBadge(permit.status)}</TableCell>
                    <TableCell className="text-base">{permit.submittedDate}</TableCell>
                    <TableCell className="text-base font-medium">{permit.fee.toLocaleString()} MZN</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(permit)}
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
        </CardContent>
      </Card>

      {/* Permit Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="text-base max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Permit Details</DialogTitle>
            <DialogDescription className="text-base">
              Complete information for permit {selectedPermit?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPermit && (
            <div className="space-y-6 py-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">Status</span>
                {getStatusBadge(selectedPermit.status)}
              </div>

              {/* Permit Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Permit ID</Label>
                  <p className="text-base font-medium">{selectedPermit.id}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Permit Type</Label>
                  <div>{getPermitTypeBadge(selectedPermit.permitType)}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Applicant</Label>
                  <p className="text-base font-medium">{selectedPermit.applicant}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Vehicle</Label>
                  <p className="text-base font-medium">{selectedPermit.vehicle}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Route</Label>
                  <p className="text-base font-medium">{selectedPermit.route}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Fee</Label>
                  <p className="text-base font-medium">{selectedPermit.fee.toLocaleString()} MZN</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Submitted Date</Label>
                  <p className="text-base font-medium">{selectedPermit.submittedDate}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Expiry Date</Label>
                  <p className="text-base font-medium">{selectedPermit.expiryDate}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                <Label className="text-base text-muted-foreground">Additional Notes</Label>
                <p className="text-base">Vehicle inspection completed. All documentation verified.</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)} className="text-base h-11 px-6">
              Close
            </Button>
            {selectedPermit?.status === "Pending" && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsRejectDialogOpen(true)
                  }} 
                  className="text-base h-11 px-6 text-destructive hover:text-destructive"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Reject
                </Button>
                <Button 
                  onClick={() => setIsApproveDialogOpen(true)} 
                  className="text-base h-11 px-6 bg-[#D6F0E0] text-[#1C1C1C] hover:bg-[#D6F0E0]/90"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent className="text-base">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Approve Permit</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to approve permit <strong>{selectedPermit?.id}</strong> for{" "}
              <strong>{selectedPermit?.applicant}</strong>? This will activate the permit immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-base h-11 px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprovePermit}
              className="bg-[#D6F0E0] text-[#1C1C1C] hover:bg-[#D6F0E0]/90 text-base h-11 px-6"
            >
              Approve Permit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog with Reason */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="text-base">
          <DialogHeader>
            <DialogTitle className="text-2xl">Reject Permit</DialogTitle>
            <DialogDescription className="text-base">
              Please provide a reason for rejecting permit {selectedPermit?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="text-base">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="text-base"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} className="text-base h-11 px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleRejectPermit} 
              disabled={!rejectionReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-base h-11 px-6"
            >
              Reject Permit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
