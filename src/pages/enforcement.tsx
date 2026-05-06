import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Search, AlertTriangle, DollarSign, QrCode } from "lucide-react"
import { toast } from "sonner"

// Mock enforcement log data
const mockEnforcementLog = [
  { plate: "MZB 0011 E", time: "09:14", outcome: "Paid on-site", amount: 20000, status: "success" },
  { plate: "MZB 3344 F", time: "10:32", outcome: "Fine issued", amount: 36400, status: "warning" },
  { plate: "MZB 7788 G", time: "11:05", outcome: "Compliant", amount: null, status: "success" },
  { plate: "MZB 5678 B", time: "11:47", outcome: "Fine issued", amount: 36400, status: "warning" },
  { plate: "MZB 9900 J", time: "12:03", outcome: "Disputed", amount: 14000, status: "disputed" },
]

// Mock vehicle data
const mockVehicleData: Record<string, any> = {
  "MZB5678B": {
    plate: "MZB 5678 B",
    owner: "Moza Transportes Lda",
    weightClass: "16,001–25,000 kg",
    dailyRate: "2,000 MZN",
    lastPayment: "None on record",
    daysOverdue: 14,
    compliant: false
  },
  "MZB0011E": {
    plate: "MZB 0011 E",
    owner: "TransMoz Logistics",
    weightClass: "10,001–16,000 kg",
    dailyRate: "1,500 MZN",
    lastPayment: "2026-05-04",
    daysOverdue: 0,
    compliant: true
  }
}

export function EnforcementPage() {
  const [plateNumber, setPlateNumber] = useState("")
  const [vehicleData, setVehicleData] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  
  // Dialog states
  const [isIssueFineDialogOpen, setIsIssueFineDialogOpen] = useState(false)
  const [isAcceptPaymentDialogOpen, setIsAcceptPaymentDialogOpen] = useState(false)
  const [isFlagOffenderDialogOpen, setIsFlagOffenderDialogOpen] = useState(false)
  const [isLogDisputeDialogOpen, setIsLogDisputeDialogOpen] = useState(false)
  const [isRecordOfflineDialogOpen, setIsRecordOfflineDialogOpen] = useState(false)
  
  // Form states
  const [fineNotes, setFineNotes] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [offenderReason, setOffenderReason] = useState("")
  const [disputeDetails, setDisputeDetails] = useState("")
  const [offlineNotes, setOfflineNotes] = useState("")
  const [offlineAction, setOfflineAction] = useState("")

  // Today's stats
  const checksToday = 17
  const finesIssued = 4
  const compliantCount = 11

  const handleCheck = () => {
    setIsSearching(true)
    
    // Simulate API call
    setTimeout(() => {
      const cleanPlate = plateNumber.replace(/\s/g, "").toUpperCase()
      const data = mockVehicleData[cleanPlate]
      
      if (data) {
        setVehicleData(data)
        toast.success("Vehicle found", {
          description: `Compliance check completed for ${data.plate}`
        })
      } else {
        setVehicleData(null)
        toast.error("Vehicle not found", {
          description: "Please check the plate number and try again."
        })
      }
      setIsSearching(false)
    }, 1000)
  }

  const handleIssueFine = () => {
    setIsIssueFineDialogOpen(false)
    setFineNotes("")
    toast.success("Fine notice issued", {
      description: `Fine notice has been issued for ${vehicleData.plate}`
    })
  }

  const handleAcceptPayment = () => {
    setIsAcceptPaymentDialogOpen(false)
    setPaymentAmount("")
    setPaymentMethod("")
    toast.success("Payment accepted", {
      description: `On-site payment of ${paymentAmount} MZN recorded for ${vehicleData.plate}`
    })
  }

  const handleFlagOffender = () => {
    setIsFlagOffenderDialogOpen(false)
    setOffenderReason("")
    toast.warning("Vehicle flagged", {
      description: `${vehicleData.plate} has been flagged as a repeat offender`
    })
  }

  const handleLogDispute = () => {
    setIsLogDisputeDialogOpen(false)
    setDisputeDetails("")
    toast.info("Dispute logged", {
      description: `Dispute has been logged for ${vehicleData.plate}`
    })
  }

  const handleRecordOffline = () => {
    setIsRecordOfflineDialogOpen(false)
    setOfflineNotes("")
    setOfflineAction("")
    toast.success("Recorded offline", {
      description: `Action will be synced when connection is restored`
    })
  }

  const calculatePenalty = () => {
    if (!vehicleData || vehicleData.compliant) return null

    const dailyRate = parseInt(vehicleData.dailyRate.replace(/,/g, ""))
    const daysOverdue = vehicleData.daysOverdue
    const outstanding = dailyRate * daysOverdue
    const penalty = Math.round(outstanding * 0.3)
    const total = outstanding + penalty

    return { outstanding, penalty, total, daysOverdue }
  }

  const penalty = calculatePenalty()

  const getOutcomeBadge = (outcome: string, status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-[#4CAF50] text-white text-sm px-3 py-1">
            {outcome}
          </Badge>
        )
      case "warning":
        return (
          <Badge className="bg-[#E5533D] text-white text-sm px-3 py-1">
            {outcome}
          </Badge>
        )
      case "disputed":
        return (
          <Badge className="bg-[#F4A62A] text-white text-sm px-3 py-1">
            {outcome}
          </Badge>
        )
      default:
        return <Badge className="text-sm px-3 py-1">{outcome}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Inline Search */}
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Enforcement — Compliance Check</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Verify vehicle payment status, calculate penalties, and issue enforcement notices.
          </p>
        </div>
        
        {/* Compact Vehicle Lookup */}
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Enter plate number"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              className="text-base h-12 pl-11 w-64"
            />
          </div>
          <Button 
            onClick={handleCheck} 
            disabled={!plateNumber || isSearching}
            className="text-base h-12 px-8"
          >
            {isSearching ? "Checking..." : "Check"}
          </Button>
          <Button 
            variant="outline"
            size="icon"
            className="h-12 w-12"
          >
            <QrCode className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Checks Today</CardDescription>
            <CardTitle className="text-4xl">{checksToday}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Officer: Sitoe — Sector 4B</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Fines Issued</CardDescription>
            <CardTitle className="text-4xl text-[#E5533D]">{finesIssued}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Requires follow-up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Compliant Vehicles</CardDescription>
            <CardTitle className="text-4xl text-[#4CAF50]">{compliantCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">
              {Math.round((compliantCount / checksToday) * 100)}% compliance rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Result - Only shows when vehicle is checked */}
      {vehicleData && (
        <div className="space-y-6">
          {/* Vehicle Info & Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl font-mono">{vehicleData.plate}</CardTitle>
                  <CardDescription className="text-lg mt-1">{vehicleData.owner}</CardDescription>
                </div>
                <Badge 
                  className={`text-base px-4 py-2 ${
                    vehicleData.compliant 
                      ? "bg-[#4CAF50] text-white" 
                      : "bg-[#E5533D] text-white"
                  }`}
                >
                  {vehicleData.compliant ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Compliant
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Non-compliant
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Details Grid */}
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <Label className="text-sm text-muted-foreground uppercase tracking-wide">Weight Class</Label>
                  <p className="text-lg font-medium mt-1">{vehicleData.weightClass}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground uppercase tracking-wide">Daily Rate</Label>
                  <p className="text-lg font-medium mt-1">{vehicleData.dailyRate}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground uppercase tracking-wide">Last Valid Payment</Label>
                  <p className={`text-lg font-medium mt-1 ${!vehicleData.compliant ? "text-[#E5533D]" : ""}`}>
                    {vehicleData.lastPayment}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground uppercase tracking-wide">Days Overdue</Label>
                  <p className={`text-lg font-medium mt-1 ${!vehicleData.compliant ? "text-[#E5533D]" : ""}`}>
                    {vehicleData.daysOverdue > 0 ? `${vehicleData.daysOverdue} days` : "—"}
                  </p>
                </div>
              </div>

              {/* Penalty Calculation - Inline */}
              {penalty && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Penalty Breakdown</Label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-base">
                        <span>Outstanding RUC ({penalty.daysOverdue} days)</span>
                        <span className="font-medium">{penalty.outstanding.toLocaleString()} MZN</span>
                      </div>
                      <div className="flex justify-between text-base text-[#E5533D]">
                        <span>Late payment penalty (30%)</span>
                        <span className="font-medium">+{penalty.penalty.toLocaleString()} MZN</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total Payable</span>
                        <span className="text-[#F4A62A]">{penalty.total.toLocaleString()} MZN</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </CardContent>
          </Card>

          {/* Enforcement Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Enforcement actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!vehicleData.compliant ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => setIsIssueFineDialogOpen(true)}
                      className="text-base h-14 bg-[#E5533D]/10 text-[#E5533D] hover:bg-[#E5533D] hover:text-white border border-[#E5533D]/20"
                    >
                      Issue fine notice
                    </Button>
                    <Button 
                      onClick={() => setIsAcceptPaymentDialogOpen(true)}
                      className="text-base h-14 bg-[#4CAF50]/10 text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white border border-[#4CAF50]/20"
                    >
                      Accept on-site payment
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full text-base h-14"
                    onClick={() => setIsFlagOffenderDialogOpen(true)}
                  >
                    Flag as repeat offender
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-base h-14"
                    onClick={() => setIsLogDisputeDialogOpen(true)}
                  >
                    Log dispute / escalate
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-base h-14"
                  >
                    Record offline (sync later)
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center py-8 text-center">
                    <div>
                      <CheckCircle className="h-12 w-12 text-[#4CAF50] mx-auto mb-3" />
                      <p className="text-lg font-medium text-[#4CAF50]">Vehicle is compliant</p>
                      <p className="text-base text-muted-foreground mt-1">No enforcement action required</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full text-base h-14"
                  >
                    Record offline (sync later)
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Today's Enforcement Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Today's Enforcement Log</CardTitle>
          <CardDescription className="text-base">Recent compliance checks and outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Plate</TableHead>
                <TableHead className="text-base">Time</TableHead>
                <TableHead className="text-base">Outcome</TableHead>
                <TableHead className="text-right text-base">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEnforcementLog.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono font-medium text-base">
                    <Badge variant="outline" className="text-sm font-mono">
                      {log.plate}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-base text-muted-foreground">{log.time}</TableCell>
                  <TableCell>{getOutcomeBadge(log.outcome, log.status)}</TableCell>
                  <TableCell className="text-right text-base font-medium">
                    {log.amount ? (
                      <span className={log.status === "warning" ? "text-[#E5533D]" : ""}>
                        {log.amount.toLocaleString()} MZN
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Issue Fine Dialog */}
      <Dialog open={isIssueFineDialogOpen} onOpenChange={setIsIssueFineDialogOpen}>
        <DialogContent className="text-base">
          <DialogHeader>
            <DialogTitle className="text-2xl">Issue Fine Notice</DialogTitle>
            <DialogDescription className="text-base">
              Issue a fine notice for vehicle {vehicleData?.plate}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-base">Vehicle</Label>
              <p className="text-lg font-mono font-bold">{vehicleData?.plate}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Fine Amount</Label>
              <p className="text-2xl font-bold text-[#F4A62A]">{penalty?.total.toLocaleString()} MZN</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="fine-notes" className="text-base">Additional Notes (Optional)</Label>
              <Textarea
                id="fine-notes"
                placeholder="Add any additional notes about this fine..."
                value={fineNotes}
                onChange={(e) => setFineNotes(e.target.value)}
                rows={3}
                className="text-base"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIssueFineDialogOpen(false)} className="text-base h-11 px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleIssueFine}
              className="text-base h-11 px-6 bg-[#E5533D] hover:bg-[#E5533D]/90"
            >
              Issue Fine Notice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Accept Payment Dialog */}
      <Dialog open={isAcceptPaymentDialogOpen} onOpenChange={setIsAcceptPaymentDialogOpen}>
        <DialogContent className="text-base">
          <DialogHeader>
            <DialogTitle className="text-2xl">Accept On-Site Payment</DialogTitle>
            <DialogDescription className="text-base">
              Record payment for vehicle {vehicleData?.plate}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-base">Vehicle</Label>
              <p className="text-lg font-mono font-bold">{vehicleData?.plate}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Amount Due</Label>
              <p className="text-2xl font-bold text-[#F4A62A]">{penalty?.total.toLocaleString()} MZN</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="payment-amount" className="text-base">Payment Amount *</Label>
              <Input
                id="payment-amount"
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method" className="text-base">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="text-base h-11">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="cash" className="text-base">Cash</SelectItem>
                  <SelectItem value="mpesa" className="text-base">M-Pesa</SelectItem>
                  <SelectItem value="card" className="text-base">Card</SelectItem>
                  <SelectItem value="bank" className="text-base">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAcceptPaymentDialogOpen(false)} className="text-base h-11 px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleAcceptPayment}
              disabled={!paymentAmount || !paymentMethod}
              className="text-base h-11 px-6 bg-[#4CAF50] hover:bg-[#4CAF50]/90"
            >
              Accept Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Offender Dialog */}
      <Dialog open={isFlagOffenderDialogOpen} onOpenChange={setIsFlagOffenderDialogOpen}>
        <DialogContent className="text-base">
          <DialogHeader>
            <DialogTitle className="text-2xl">Flag as Repeat Offender</DialogTitle>
            <DialogDescription className="text-base">
              Flag vehicle {vehicleData?.plate} as a repeat offender
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-base">Vehicle</Label>
              <p className="text-lg font-mono font-bold">{vehicleData?.plate}</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="offender-reason" className="text-base">Reason for Flagging *</Label>
              <Textarea
                id="offender-reason"
                placeholder="Describe the pattern of non-compliance..."
                value={offenderReason}
                onChange={(e) => setOffenderReason(e.target.value)}
                rows={4}
                className="text-base"
              />
            </div>

            <div className="rounded-lg bg-[#F4A62A]/10 border border-[#F4A62A]/20 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-[#F4A62A] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  Flagging this vehicle will trigger additional scrutiny and may result in escalated enforcement actions.
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFlagOffenderDialogOpen(false)} className="text-base h-11 px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleFlagOffender}
              disabled={!offenderReason.trim()}
              className="text-base h-11 px-6 bg-[#F4A62A] hover:bg-[#F4A62A]/90"
            >
              Flag Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Dispute Dialog */}
      <Dialog open={isLogDisputeDialogOpen} onOpenChange={setIsLogDisputeDialogOpen}>
        <DialogContent className="text-base">
          <DialogHeader>
            <DialogTitle className="text-2xl">Log Dispute / Escalate</DialogTitle>
            <DialogDescription className="text-base">
              Record a dispute or escalation for vehicle {vehicleData?.plate}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-base">Vehicle</Label>
              <p className="text-lg font-mono font-bold">{vehicleData?.plate}</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="dispute-details" className="text-base">Dispute Details *</Label>
              <Textarea
                id="dispute-details"
                placeholder="Describe the dispute or reason for escalation..."
                value={disputeDetails}
                onChange={(e) => setDisputeDetails(e.target.value)}
                rows={5}
                className="text-base"
              />
            </div>

            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  This dispute will be logged and forwarded to the enforcement supervisor for review.
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogDisputeDialogOpen(false)} className="text-base h-11 px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleLogDispute}
              disabled={!disputeDetails.trim()}
              className="text-base h-11 px-6"
            >
              Log Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Offline Dialog */}
      <Dialog open={isRecordOfflineDialogOpen} onOpenChange={setIsRecordOfflineDialogOpen}>
        <DialogContent className="text-base">
          <DialogHeader>
            <DialogTitle className="text-2xl">Record Offline</DialogTitle>
            <DialogDescription className="text-base">
              Record this action offline. It will be synced when connection is restored.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {vehicleData && (
              <div className="space-y-2">
                <Label className="text-base">Vehicle</Label>
                <p className="text-lg font-mono font-bold">{vehicleData.plate}</p>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="offline-action" className="text-base">Action Type *</Label>
              <Select value={offlineAction} onValueChange={setOfflineAction}>
                <SelectTrigger className="text-base h-11">
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="fine" className="text-base">Issue Fine Notice</SelectItem>
                  <SelectItem value="payment" className="text-base">Accept Payment</SelectItem>
                  <SelectItem value="warning" className="text-base">Issue Warning</SelectItem>
                  <SelectItem value="check" className="text-base">Compliance Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offline-notes" className="text-base">Notes *</Label>
              <Textarea
                id="offline-notes"
                placeholder="Add details about this action..."
                value={offlineNotes}
                onChange={(e) => setOfflineNotes(e.target.value)}
                rows={4}
                className="text-base"
              />
            </div>

            <div className="rounded-lg bg-muted border p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  This action will be stored locally and automatically synced to the server when internet connection is available.
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRecordOfflineDialogOpen(false)} className="text-base h-11 px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleRecordOffline}
              disabled={!offlineAction || !offlineNotes.trim()}
              className="text-base h-11 px-6"
            >
              Record Offline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
