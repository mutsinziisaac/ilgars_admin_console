import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Download, Search, Eye, XCircle, CheckCircle, Clock, Truck } from "lucide-react"
import { toast } from "sonner"

// Mock transaction data
const mockTransactions = [
  { 
    id: "TXN-001", 
    vehicle: "AAB-123-MP", 
    vehicleType: "Cargo Truck",
    amount: 2500, 
    status: "Completed", 
    date: "2026-05-04 09:23",
    location: "Maputo Central",
    operator: "Joana Macavel"
  },
  { 
    id: "TXN-002", 
    vehicle: "XYZ-456-MP", 
    vehicleType: "Tractor",
    amount: 1800, 
    status: "Completed", 
    date: "2026-05-04 09:15",
    location: "Matola Gate",
    operator: "João Silva"
  },
  { 
    id: "TXN-003", 
    vehicle: "LMN-789-MP", 
    vehicleType: "Heavy Truck",
    amount: 3200, 
    status: "Pending", 
    date: "2026-05-04 09:10",
    location: "Maputo Port",
    operator: "Maria Santos"
  },
  { 
    id: "TXN-004", 
    vehicle: "QRS-321-MP", 
    vehicleType: "Cargo Truck",
    amount: 2500, 
    status: "Failed", 
    date: "2026-05-04 08:55",
    location: "Maputo Central",
    operator: "Pedro Costa"
  },
  { 
    id: "TXN-005", 
    vehicle: "TUV-654-MP", 
    vehicleType: "Tractor",
    amount: 1800, 
    status: "Completed", 
    date: "2026-05-04 08:42",
    location: "Matola Gate",
    operator: "Ana Ferreira"
  },
  { 
    id: "TXN-006", 
    vehicle: "WXY-987-MP", 
    vehicleType: "Heavy Truck",
    amount: 3200, 
    status: "Completed", 
    date: "2026-05-04 08:30",
    location: "Maputo Port",
    operator: "Joana Macavel"
  },
]

export function TransactionsPage() {
  const [transactions, setTransactions] = useState(mockTransactions)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTransaction, setSelectedTransaction] = useState<typeof mockTransactions[0] | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter transactions
  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = 
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || txn.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Group by status
  const completedCount = transactions.filter(t => t.status === "Completed").length
  const pendingCount = transactions.filter(t => t.status === "Pending").length
  const failedCount = transactions.filter(t => t.status === "Failed").length

  // Handle view details
  const handleViewDetails = (transaction: typeof mockTransactions[0]) => {
    setSelectedTransaction(transaction)
    setIsDetailsDialogOpen(true)
  }

  // Handle cancel transaction
  const handleCancelTransaction = (txnId: string) => {
    const txn = transactions.find(t => t.id === txnId)
    setTransactions(transactions.map(t => 
      t.id === txnId ? { ...t, status: "Failed" } : t
    ))
    toast.error("Transaction cancelled", {
      description: `${txn?.id} has been cancelled.`
    })
  }

  // Handle export
  const handleExport = () => {
    toast.success("Export started", {
      description: "Your transaction report is being generated."
    })
  }

  // Simulate loading
  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.info("Data refreshed", {
        description: "Transaction list has been updated."
      })
    }, 2000)
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge className="bg-[#4CAF50] text-white text-sm px-3 py-1">
            <CheckCircle className="h-4 w-4 mr-1" />
            {status}
          </Badge>
        )
      case "Pending":
        return (
          <Badge className="bg-[#F4A62A] text-white text-sm px-3 py-1">
            <Clock className="h-4 w-4 mr-1" />
            {status}
          </Badge>
        )
      case "Failed":
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Transactions</h1>
          <p className="text-lg text-muted-foreground">View and manage all revenue transactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Total Transactions</CardDescription>
            <CardTitle className="text-4xl">{transactions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Total Revenue</CardDescription>
            <CardTitle className="text-4xl">
              {transactions.filter(t => t.status === "Completed").reduce((sum, t) => sum + t.amount, 0).toLocaleString()} MZN
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-success">
              <span className="font-medium">+{completedCount}</span> completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Pending/Failed</CardDescription>
            <CardTitle className="text-4xl">{pendingCount + failedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">
              {pendingCount} pending, {failedCount} failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Transaction History</CardTitle>
              <CardDescription className="text-base">Complete list of all transactions</CardDescription>
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
                <SelectItem value="all" className="text-base">All ({transactions.length})</SelectItem>
                <SelectItem value="Completed" className="text-base">Completed ({completedCount})</SelectItem>
                <SelectItem value="Pending" className="text-base">Pending ({pendingCount})</SelectItem>
                <SelectItem value="Failed" className="text-base">Failed ({failedCount})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID, vehicle, or location..."
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
          ) : filteredTransactions.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No transactions found</h3>
              <p className="text-base text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Transaction ID</TableHead>
                  <TableHead className="text-base">Vehicle</TableHead>
                  <TableHead className="text-base">Type</TableHead>
                  <TableHead className="text-base">Amount</TableHead>
                  <TableHead className="text-base">Date & Time</TableHead>
                  <TableHead className="text-base">Location</TableHead>
                  <TableHead className="text-right text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium text-base">{txn.id}</TableCell>
                    <TableCell className="text-base">{txn.vehicle}</TableCell>
                    <TableCell className="text-base">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        {txn.vehicleType}
                      </div>
                    </TableCell>
                    <TableCell className="text-base font-medium">{txn.amount.toLocaleString()} MZN</TableCell>
                    <TableCell className="text-base">{txn.date}</TableCell>
                    <TableCell className="text-base">{txn.location}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(txn)}
                          className="h-10 w-10"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                        
                        {txn.status === "Pending" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10">
                                <XCircle className="h-5 w-5 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="text-base">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl">Cancel Transaction</AlertDialogTitle>
                                <AlertDialogDescription className="text-base">
                                  Are you sure you want to cancel transaction <strong>{txn.id}</strong>? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="text-base h-11 px-6">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelTransaction(txn.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-base h-11 px-6"
                                >
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {!isLoading && filteredTransactions.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
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

      {/* Transaction Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="text-base max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Transaction Details</DialogTitle>
            <DialogDescription className="text-base">
              Complete information for transaction {selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6 py-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">Status</span>
                {getStatusBadge(selectedTransaction.status)}
              </div>

              {/* Transaction Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Transaction ID</Label>
                  <p className="text-base font-medium">{selectedTransaction.id}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Amount</Label>
                  <p className="text-base font-medium">{selectedTransaction.amount.toLocaleString()} MZN</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Vehicle</Label>
                  <p className="text-base font-medium">{selectedTransaction.vehicle}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Vehicle Type</Label>
                  <p className="text-base font-medium">{selectedTransaction.vehicleType}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Date & Time</Label>
                  <p className="text-base font-medium">{selectedTransaction.date}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Location</Label>
                  <p className="text-base font-medium">{selectedTransaction.location}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Operator</Label>
                  <p className="text-base font-medium">{selectedTransaction.operator}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Payment Method</Label>
                  <p className="text-base font-medium">M-Pesa</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)} className="text-base h-11 px-6">
              Close
            </Button>
            <Button onClick={handleExport} className="text-base h-11 px-6">
              <Download className="h-5 w-5 mr-2" />
              Export Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
