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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Plus, Pencil, Trash2, TrendingUp, Calendar, AlertCircle } from "lucide-react"
import { toast } from "sonner"

// Mock tariff data - Per Hour rates by Purpose and Road Type
const mockTariffs = [
  {
    id: 1,
    purpose: "Construction Works",
    protocolRoads: 50000,
    secondaryRoads: 30000,
    tertiaryRoads: 15000,
    status: "Active",
    effectiveDate: "2024-01-01",
    lastUpdated: "2024-01-01"
  },
  {
    id: 2,
    purpose: "Filming",
    protocolRoads: 50000,
    secondaryRoads: 30000,
    tertiaryRoads: 20000,
    status: "Active",
    effectiveDate: "2024-01-01",
    lastUpdated: "2024-01-01"
  },
  {
    id: 3,
    purpose: "Sporting Events",
    protocolRoads: 10000,
    secondaryRoads: 5000,
    tertiaryRoads: 3500,
    status: "Active",
    effectiveDate: "2024-01-01",
    lastUpdated: "2024-01-01"
  },
  {
    id: 4,
    purpose: "Fairs",
    protocolRoads: 2000,
    secondaryRoads: 1000,
    tertiaryRoads: 0,
    status: "Active",
    effectiveDate: "2024-01-01",
    lastUpdated: "2024-01-01"
  },
  {
    id: 5,
    purpose: "For-Profit Events",
    protocolRoads: 40000,
    secondaryRoads: 20000,
    tertiaryRoads: 10000,
    status: "Active",
    effectiveDate: "2024-01-01",
    lastUpdated: "2024-01-01"
  },
]

// Mock penalty rates
const penaltyRates = {
  latePayment: 30,
  nonCompliance: 50,
  repeatOffender: 100
}

export function TariffsPage() {
  const [tariffs, setTariffs] = useState(mockTariffs)
  const [selectedTariff, setSelectedTariff] = useState<typeof mockTariffs[0] | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isPenaltyDialogOpen, setIsPenaltyDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    purpose: "",
    roadType: "",
    rate: "",
    effectiveDate: "",
    notes: ""
  })

  // Store all rates for a tariff
  const [tariffRates, setTariffRates] = useState<{
    protocolRoads: string
    secondaryRoads: string
    tertiaryRoads: string
  }>({
    protocolRoads: "",
    secondaryRoads: "",
    tertiaryRoads: ""
  })

  // Penalty form state
  const [penaltyFormData, setPenaltyFormData] = useState({
    latePayment: penaltyRates.latePayment.toString(),
    nonCompliance: penaltyRates.nonCompliance.toString(),
    repeatOffender: penaltyRates.repeatOffender.toString()
  })

  // Handle add tariff
  const handleAddTariff = () => {
    const newTariff = {
      id: tariffs.length + 1,
      purpose: formData.purpose,
      protocolRoads: parseInt(tariffRates.protocolRoads),
      secondaryRoads: parseInt(tariffRates.secondaryRoads),
      tertiaryRoads: parseInt(tariffRates.tertiaryRoads),
      status: "Active",
      effectiveDate: formData.effectiveDate,
      lastUpdated: new Date().toISOString().split('T')[0]
    }
    setTariffs([...tariffs, newTariff])
    setIsAddDialogOpen(false)
    setFormData({ purpose: "", roadType: "", rate: "", effectiveDate: "", notes: "" })
    setTariffRates({ protocolRoads: "", secondaryRoads: "", tertiaryRoads: "" })
    toast.success("Tariff added", {
      description: `New tariff for ${formData.purpose} has been added.`
    })
  }

  // Handle edit tariff
  const handleEditTariff = () => {
    if (!selectedTariff) return
    
    setTariffs(tariffs.map(t => 
      t.id === selectedTariff.id 
        ? { 
            ...t, 
            protocolRoads: parseInt(tariffRates.protocolRoads),
            secondaryRoads: parseInt(tariffRates.secondaryRoads),
            tertiaryRoads: parseInt(tariffRates.tertiaryRoads),
            effectiveDate: formData.effectiveDate,
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : t
    ))
    setIsEditDialogOpen(false)
    setSelectedTariff(null)
    setFormData({ purpose: "", roadType: "", rate: "", effectiveDate: "", notes: "" })
    setTariffRates({ protocolRoads: "", secondaryRoads: "", tertiaryRoads: "" })
    toast.success("Tariff updated", {
      description: `Tariff for ${selectedTariff.purpose} has been updated.`
    })
  }

  // Handle delete tariff
  const handleDeleteTariff = (tariffId: number) => {
    const tariff = tariffs.find(t => t.id === tariffId)
    setTariffs(tariffs.filter(t => t.id !== tariffId))
    toast.error("Tariff removed", {
      description: `Tariff for ${tariff?.purpose} has been removed.`
    })
  }

  // Open edit dialog
  const openEditDialog = (tariff: typeof mockTariffs[0]) => {
    setSelectedTariff(tariff)
    setFormData({
      purpose: tariff.purpose,
      roadType: "",
      rate: "",
      effectiveDate: tariff.effectiveDate,
      notes: ""
    })
    setTariffRates({
      protocolRoads: tariff.protocolRoads.toString(),
      secondaryRoads: tariff.secondaryRoads.toString(),
      tertiaryRoads: tariff.tertiaryRoads.toString()
    })
    setIsEditDialogOpen(true)
  }

  // Handle road type rate update
  const handleRateUpdate = (roadType: string, value: string) => {
    if (roadType === "Protocol Roads") {
      setTariffRates({ ...tariffRates, protocolRoads: value })
    } else if (roadType === "Secondary Roads") {
      setTariffRates({ ...tariffRates, secondaryRoads: value })
    } else if (roadType === "Tertiary Roads") {
      setTariffRates({ ...tariffRates, tertiaryRoads: value })
    }
  }

  // Handle update penalties
  const handleUpdatePenalties = () => {
    setIsPenaltyDialogOpen(false)
    toast.success("Penalty rates updated", {
      description: "New penalty rates have been applied."
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Tariffs</h1>
          <p className="text-lg text-muted-foreground">Manage road usage fees by purpose and road type</p>
        </div>
        
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2 text-base h-11 px-6">
          <Plus className="h-5 w-5" />
          Add Tariff
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Active Tariffs</CardDescription>
            <CardTitle className="text-4xl">{tariffs.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Purpose categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Highest Rate</CardDescription>
            <CardTitle className="text-4xl">{Math.max(...tariffs.map(t => t.protocolRoads)).toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">MZN per hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Lowest Rate</CardDescription>
            <CardTitle className="text-4xl">{Math.min(...tariffs.filter(t => t.tertiaryRoads > 0).map(t => t.tertiaryRoads)).toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">MZN per hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Late Payment Penalty</CardDescription>
            <CardTitle className="text-4xl text-[#E5533D]">{penaltyRates.latePayment}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Of outstanding amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Calculation Example */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-xl">Fee Calculation</CardTitle>
          <CardDescription className="text-base">System computes: Total Fee = Hourly Rate × Number of Hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-base"><strong>Example:</strong></p>
            <p className="text-base">Filming on Secondary Road for 5 hours</p>
            <p className="text-lg font-bold text-primary">→ 30,000 × 5 = 150,000 MZN</p>
          </div>
        </CardContent>
      </Card>

      {/* Tariff Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Tariff Structure (Per Hour)</CardTitle>
              <CardDescription className="text-base">Fees based on purpose and road type</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsPenaltyDialogOpen(true)} className="text-base h-11 px-6">
              <AlertCircle className="h-5 w-5 mr-2" />
              Manage Penalties
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Purpose</TableHead>
                <TableHead className="text-base">Protocol Roads</TableHead>
                <TableHead className="text-base">Secondary Roads</TableHead>
                <TableHead className="text-base">Tertiary Roads</TableHead>
                <TableHead className="text-base">Effective Date</TableHead>
                <TableHead className="text-right text-base">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tariffs.map((tariff) => (
                <TableRow key={tariff.id}>
                  <TableCell className="font-medium text-base">{tariff.purpose}</TableCell>
                  <TableCell className="text-base font-bold">{tariff.protocolRoads.toLocaleString()} MZN</TableCell>
                  <TableCell className="text-base font-bold">{tariff.secondaryRoads.toLocaleString()} MZN</TableCell>
                  <TableCell className="text-base font-bold">
                    {tariff.tertiaryRoads === 0 ? "0 MZN" : `${tariff.tertiaryRoads.toLocaleString()} MZN`}
                  </TableCell>
                  <TableCell className="text-base">{tariff.effectiveDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(tariff)}
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
                            <AlertDialogTitle className="text-2xl">Remove Tariff</AlertDialogTitle>
                            <AlertDialogDescription className="text-base">
                              Are you sure you want to remove the tariff for <strong>{tariff.purpose}</strong>? 
                              This may affect existing permits for this purpose.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="text-base h-11 px-6">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTariff(tariff.id)}
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
        </CardContent>
      </Card>

      {/* Penalty Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Penalty Rates</CardTitle>
          <CardDescription className="text-base">Current penalty structure for non-compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-base text-muted-foreground">Late Payment Penalty</Label>
              <p className="text-3xl font-bold text-[#E5533D]">{penaltyRates.latePayment}%</p>
              <p className="text-base text-muted-foreground">Applied to outstanding RUC amount</p>
            </div>

            <div className="space-y-2">
              <Label className="text-base text-muted-foreground">Non-Compliance Fine</Label>
              <p className="text-3xl font-bold text-[#E5533D]">{penaltyRates.nonCompliance}%</p>
              <p className="text-base text-muted-foreground">Additional penalty for violations</p>
            </div>

            <div className="space-y-2">
              <Label className="text-base text-muted-foreground">Repeat Offender</Label>
              <p className="text-3xl font-bold text-[#E5533D]">{penaltyRates.repeatOffender}%</p>
              <p className="text-base text-muted-foreground">For multiple violations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Tariff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="text-base max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Tariff</DialogTitle>
            <DialogDescription className="text-base">
              Create a new tariff for a purpose category
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="purpose" className="text-base">Purpose *</Label>
              <Select value={formData.purpose} onValueChange={(value) => setFormData({ ...formData, purpose: value })}>
                <SelectTrigger className="text-base h-11">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="Construction Works" className="text-base">Construction Works</SelectItem>
                  <SelectItem value="Filming" className="text-base">Filming</SelectItem>
                  <SelectItem value="Sporting Events" className="text-base">Sporting Events</SelectItem>
                  <SelectItem value="Fairs" className="text-base">Fairs</SelectItem>
                  <SelectItem value="For-Profit Events" className="text-base">For-Profit Events</SelectItem>
                  <SelectItem value="Other" className="text-base">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="road-type" className="text-base">Road Type *</Label>
                <Select value={formData.roadType} onValueChange={(value) => setFormData({ ...formData, roadType: value })}>
                  <SelectTrigger className="text-base h-11">
                    <SelectValue placeholder="Select road type" />
                  </SelectTrigger>
                  <SelectContent className="text-base">
                    <SelectItem value="Protocol Roads" className="text-base">Protocol Roads</SelectItem>
                    <SelectItem value="Secondary Roads" className="text-base">Secondary Roads</SelectItem>
                    <SelectItem value="Tertiary Roads" className="text-base">Tertiary Roads</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate" className="text-base">Rate (MZN/hr) *</Label>
                <Input
                  id="rate"
                  type="number"
                  placeholder="e.g., 50000"
                  value={formData.rate}
                  onChange={(e) => {
                    setFormData({ ...formData, rate: e.target.value })
                    if (formData.roadType) {
                      handleRateUpdate(formData.roadType, e.target.value)
                    }
                  }}
                  className="text-base h-11"
                />
              </div>
            </div>

            {/* Display entered rates */}
            {(tariffRates.protocolRoads || tariffRates.secondaryRoads || tariffRates.tertiaryRoads) && (
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <Label className="text-base font-semibold">Entered Rates:</Label>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {tariffRates.protocolRoads && (
                    <div>
                      <p className="text-muted-foreground">Protocol Roads</p>
                      <p className="font-bold text-base">{parseInt(tariffRates.protocolRoads).toLocaleString()} MZN/hr</p>
                    </div>
                  )}
                  {tariffRates.secondaryRoads && (
                    <div>
                      <p className="text-muted-foreground">Secondary Roads</p>
                      <p className="font-bold text-base">{parseInt(tariffRates.secondaryRoads).toLocaleString()} MZN/hr</p>
                    </div>
                  )}
                  {tariffRates.tertiaryRoads && (
                    <div>
                      <p className="text-muted-foreground">Tertiary Roads</p>
                      <p className="font-bold text-base">{parseInt(tariffRates.tertiaryRoads).toLocaleString()} MZN/hr</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="effective-date" className="text-base">Effective Date *</Label>
              <Input
                id="effective-date"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="text-base"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="text-base h-11 px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleAddTariff} 
              disabled={!formData.purpose || !tariffRates.protocolRoads || !tariffRates.secondaryRoads || !tariffRates.tertiaryRoads || !formData.effectiveDate}
              className="text-base h-11 px-6"
            >
              Add Tariff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tariff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="text-base max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Tariff</DialogTitle>
            <DialogDescription className="text-base">
              Update tariff for {selectedTariff?.purpose}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-base">Purpose</Label>
              <p className="text-lg font-bold">{formData.purpose}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-road-type" className="text-base">Road Type *</Label>
                <Select value={formData.roadType} onValueChange={(value) => setFormData({ ...formData, roadType: value })}>
                  <SelectTrigger className="text-base h-11">
                    <SelectValue placeholder="Select road type" />
                  </SelectTrigger>
                  <SelectContent className="text-base">
                    <SelectItem value="Protocol Roads" className="text-base">Protocol Roads</SelectItem>
                    <SelectItem value="Secondary Roads" className="text-base">Secondary Roads</SelectItem>
                    <SelectItem value="Tertiary Roads" className="text-base">Tertiary Roads</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-rate" className="text-base">Rate (MZN/hr) *</Label>
                <Input
                  id="edit-rate"
                  type="number"
                  placeholder="e.g., 50000"
                  value={formData.rate}
                  onChange={(e) => {
                    setFormData({ ...formData, rate: e.target.value })
                    if (formData.roadType) {
                      handleRateUpdate(formData.roadType, e.target.value)
                    }
                  }}
                  className="text-base h-11"
                />
              </div>
            </div>

            {/* Display current rates */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <Label className="text-base font-semibold">Current Rates:</Label>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Protocol Roads</p>
                  <p className="font-bold text-base">{parseInt(tariffRates.protocolRoads || "0").toLocaleString()} MZN/hr</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Secondary Roads</p>
                  <p className="font-bold text-base">{parseInt(tariffRates.secondaryRoads || "0").toLocaleString()} MZN/hr</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tertiary Roads</p>
                  <p className="font-bold text-base">{parseInt(tariffRates.tertiaryRoads || "0").toLocaleString()} MZN/hr</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-effective-date" className="text-base">Effective Date *</Label>
              <Input
                id="edit-effective-date"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                className="text-base h-11"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="text-base h-11 px-6">
              Cancel
            </Button>
            <Button onClick={handleEditTariff} className="text-base h-11 px-6">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Penalties Dialog */}
      <Dialog open={isPenaltyDialogOpen} onOpenChange={setIsPenaltyDialogOpen}>
        <DialogContent className="text-base">
          <DialogHeader>
            <DialogTitle className="text-2xl">Manage Penalty Rates</DialogTitle>
            <DialogDescription className="text-base">
              Update penalty percentages for non-compliance
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="late-payment" className="text-base">Late Payment Penalty (%)</Label>
              <Input
                id="late-payment"
                type="number"
                value={penaltyFormData.latePayment}
                onChange={(e) => setPenaltyFormData({ ...penaltyFormData, latePayment: e.target.value })}
                className="text-base h-11"
              />
              <p className="text-sm text-muted-foreground">Applied to outstanding RUC amount</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="non-compliance" className="text-base">Non-Compliance Fine (%)</Label>
              <Input
                id="non-compliance"
                type="number"
                value={penaltyFormData.nonCompliance}
                onChange={(e) => setPenaltyFormData({ ...penaltyFormData, nonCompliance: e.target.value })}
                className="text-base h-11"
              />
              <p className="text-sm text-muted-foreground">Additional penalty for violations</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repeat-offender" className="text-base">Repeat Offender Penalty (%)</Label>
              <Input
                id="repeat-offender"
                type="number"
                value={penaltyFormData.repeatOffender}
                onChange={(e) => setPenaltyFormData({ ...penaltyFormData, repeatOffender: e.target.value })}
                className="text-base h-11"
              />
              <p className="text-sm text-muted-foreground">For multiple violations</p>
            </div>

            <div className="rounded-lg bg-[#F4A62A]/10 border border-[#F4A62A]/20 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-[#F4A62A] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  Changes to penalty rates will apply to all new violations. Existing penalties will not be affected.
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPenaltyDialogOpen(false)} className="text-base h-11 px-6">
              Cancel
            </Button>
            <Button onClick={handleUpdatePenalties} className="text-base h-11 px-6">
              Update Penalties
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
