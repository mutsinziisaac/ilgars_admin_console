import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Plus, TrendingUp, Calendar, AlertCircle, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

// Mock tariff data - Per Hour rates by Purpose, Road Type, and Closure Type
const mockTariffs = [
  {
    id: 1,
    purpose: "Construction Works",
    closureType: "Full Road Closure",
    protocolRoads: 50000,
    secondaryRoads: 30000,
    tertiaryRoads: 15000,
    status: "Active",
    effectiveDate: "2024-01-01",
    lastUpdated: "2024-01-01"
  },
  {
    id: 2,
    purpose: "Construction Works",
    closureType: "Partial Road Closure",
    protocolRoads: 10000,
    secondaryRoads: 5000,
    tertiaryRoads: 3500,
    status: "Active",
    effectiveDate: "2024-01-01",
    lastUpdated: "2024-01-01"
  },
  {
    id: 3,
    purpose: "Filming",
    closureType: "Full Road Closure",
    protocolRoads: 50000,
    secondaryRoads: 30000,
    tertiaryRoads: 20000,
    status: "Active",
    effectiveDate: "2024-01-01",
    lastUpdated: "2024-01-01"
  },
  {
    id: 4,
    purpose: "Filming",
    closureType: "Partial Road Closure",
    protocolRoads: 40000,
    secondaryRoads: 30000,
    tertiaryRoads: 20000,
    status: "Active",
    effectiveDate: "2024-01-01",
    lastUpdated: "2024-01-01"
  },
  {
    id: 5,
    purpose: "Sporting Events",
    closureType: "Full Road Closure",
    protocolRoads: 10000,
    secondaryRoads: 5000,
    tertiaryRoads: 3500,
    status: "Active",
    effectiveDate: "2024-01-01",
    lastUpdated: "2024-01-01"
  },
  {
    id: 6,
    purpose: "Sporting Events",
    closureType: "Partial Road Closure",
    protocolRoads: 5000,
    secondaryRoads: 3500,
    tertiaryRoads: 1800,
    status: "Active",
    effectiveDate: "2024-01-01",
    lastUpdated: "2024-01-01"
  },
  {
    id: 7,
    purpose: "Fairs",
    closureType: "Full Road Closure",
    protocolRoads: 2000,
    secondaryRoads: 1000,
    tertiaryRoads: 0,
    status: "Active",
    effectiveDate: "2024-01-01",
    lastUpdated: "2024-01-01"
  },
  {
    id: 8,
    purpose: "Fairs",
    closureType: "Partial Road Closure",
    protocolRoads: 2000,
    secondaryRoads: 1000,
    tertiaryRoads: 0,
    status: "Active",
    effectiveDate: "2024-01-01",
    lastUpdated: "2024-01-01"
  },
  {
    id: 9,
    purpose: "For-Profit Events",
    closureType: "Full Road Closure",
    protocolRoads: 40000,
    secondaryRoads: 20000,
    tertiaryRoads: 10000,
    status: "Active",
    effectiveDate: "2024-01-01",
    lastUpdated: "2024-01-01"
  },
  {
    id: 10,
    purpose: "For-Profit Events",
    closureType: "Partial Road Closure",
    protocolRoads: 20000,
    secondaryRoads: 10000,
    tertiaryRoads: 5000,
    status: "Active",
    effectiveDate: "2024-01-01",
    lastUpdated: "2024-01-01"
  },
]

export function TariffsPage() {
  const [tariffs, setTariffs] = useState(mockTariffs)
  const [selectedTariff, setSelectedTariff] = useState<typeof mockTariffs[0] | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tariffToDelete, setTariffToDelete] = useState<typeof mockTariffs[0] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Form state
  const [formData, setFormData] = useState({
    purpose: "",
    closureType: "",
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

  // Pagination
  const totalPages = Math.ceil(tariffs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTariffs = tariffs.slice(startIndex, endIndex)

  // Handle add tariff
  const handleAddTariff = () => {
    const newTariff = {
      id: tariffs.length + 1,
      purpose: formData.purpose,
      closureType: formData.closureType,
      protocolRoads: parseInt(tariffRates.protocolRoads),
      secondaryRoads: parseInt(tariffRates.secondaryRoads),
      tertiaryRoads: parseInt(tariffRates.tertiaryRoads),
      status: "Active",
      effectiveDate: formData.effectiveDate,
      lastUpdated: new Date().toISOString().split('T')[0]
    }
    setTariffs([...tariffs, newTariff])
    setIsAddDialogOpen(false)
    setFormData({ purpose: "", closureType: "", roadType: "", rate: "", effectiveDate: "", notes: "" })
    setTariffRates({ protocolRoads: "", secondaryRoads: "", tertiaryRoads: "" })
    toast.success("Tariff added", {
      description: `New tariff for ${formData.purpose} (${formData.closureType}) has been added.`
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
  const handleDeleteTariff = () => {
    if (!tariffToDelete) return
    setTariffs(tariffs.filter(t => t.id !== tariffToDelete.id))
    setDeleteDialogOpen(false)
    toast.error("Tariff removed", {
      description: `Tariff for ${tariffToDelete.purpose} has been removed.`
    })
    setTariffToDelete(null)
  }

  // Open edit dialog
  const openEditDialog = (tariff: typeof mockTariffs[0]) => {
    setSelectedTariff(tariff)
    setFormData({
      purpose: tariff.purpose,
      closureType: tariff.closureType,
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
      <div className="grid gap-6 md:grid-cols-3">
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
      </div>

      {/* Tariff Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-2xl">Tariff Structure (Per Hour)</CardTitle>
            <CardDescription className="text-base">Fees based on purpose, closure type, and road type</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-lg font-semibold">Purpose</TableHead>
                <TableHead className="text-lg font-semibold">Closure Type</TableHead>
                <TableHead className="text-lg font-semibold">Protocol Roads</TableHead>
                <TableHead className="text-lg font-semibold">Secondary Roads</TableHead>
                <TableHead className="text-lg font-semibold">Tertiary Roads</TableHead>
                <TableHead className="text-lg font-semibold">Effective Date</TableHead>
                <TableHead className="text-right text-lg font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTariffs.map((tariff) => (
                <TableRow key={tariff.id}>
                  <TableCell className="font-medium text-base">{tariff.purpose}</TableCell>
                  <TableCell className="text-base">
                    <Badge 
                      variant="outline"
                      className={
                        tariff.closureType === "Full Road Closure" 
                          ? "!bg-green-600 !text-white !border-green-600 text-sm px-3 py-1" 
                          : "!bg-[#4A90E2] !text-white !border-[#4A90E2] text-sm px-3 py-1"
                      }
                    >
                      {tariff.closureType}
                    </Badge>
                  </TableCell>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setTariffToDelete(tariff)
                          setDeleteDialogOpen(true)
                        }}
                        className="h-10 w-10 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {tariffs.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, tariffs.length)} of {tariffs.length} tariffs
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

      {/* Add Tariff Modal */}
      <Modal open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} className="w-[90vw] max-w-[900px]">
        <ModalHeader onClose={() => setIsAddDialogOpen(false)}>
          <div>
            <ModalTitle>Add New Tariff</ModalTitle>
            <ModalDescription>
              Create a new tariff for a purpose category and closure type
            </ModalDescription>
          </div>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purpose" className="text-base">Purpose *</Label>
                <Input
                  id="purpose"
                  placeholder="e.g., Construction Works, Filming, etc."
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closure-type" className="text-base">Closure Type *</Label>
                <Select value={formData.closureType} onValueChange={(value) => setFormData({ ...formData, closureType: value })}>
                  <SelectTrigger className="text-base h-11">
                    <SelectValue placeholder="Select closure type" />
                  </SelectTrigger>
                  <SelectContent className="text-base">
                    <SelectItem value="Full Road Closure" className="text-base">Full Road Closure</SelectItem>
                    <SelectItem value="Partial Road Closure" className="text-base">Partial Road Closure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-base font-semibold">Set Rates by Road Type</Label>
              
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
            </div>

            {/* Display entered rates */}
            {(tariffRates.protocolRoads || tariffRates.secondaryRoads || tariffRates.tertiaryRoads) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Entered Rates:</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {tariffRates.protocolRoads && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription className="text-xs">Protocol Roads</CardDescription>
                          <CardTitle className="text-xl">{parseInt(tariffRates.protocolRoads).toLocaleString()}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">MZN/hr</p>
                        </CardContent>
                      </Card>
                    )}
                    {tariffRates.secondaryRoads && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription className="text-xs">Secondary Roads</CardDescription>
                          <CardTitle className="text-xl">{parseInt(tariffRates.secondaryRoads).toLocaleString()}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">MZN/hr</p>
                        </CardContent>
                      </Card>
                    )}
                    {tariffRates.tertiaryRoads && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardDescription className="text-xs">Tertiary Roads</CardDescription>
                          <CardTitle className="text-xl">{parseInt(tariffRates.tertiaryRoads).toLocaleString()}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">MZN/hr</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

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
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="text-base h-11 px-6">
            Cancel
          </Button>
          <Button 
            onClick={handleAddTariff} 
            disabled={!formData.purpose || !formData.closureType || !tariffRates.protocolRoads || !tariffRates.secondaryRoads || !tariffRates.tertiaryRoads || !formData.effectiveDate}
            className="text-base h-11 px-6"
          >
            Add Tariff
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Tariff Modal */}
      <Modal open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} className="w-[90vw] max-w-[900px]">
        <ModalHeader onClose={() => setIsEditDialogOpen(false)}>
          <div>
            <ModalTitle>Edit Tariff</ModalTitle>
            <ModalDescription>
              Update tariff rates for {selectedTariff?.purpose} ({selectedTariff?.closureType})
            </ModalDescription>
          </div>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base text-muted-foreground">Purpose</Label>
                <p className="text-xl font-bold">{formData.purpose}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-base text-muted-foreground">Closure Type</Label>
                <Badge variant="outline" className="text-base px-3 py-1">
                  {formData.closureType}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-base font-semibold">Update Rates by Road Type</Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-road-type" className="text-base">Select Road Type *</Label>
                  <Select value={formData.roadType} onValueChange={(value) => setFormData({ ...formData, roadType: value })}>
                    <SelectTrigger className="text-base h-11">
                      <SelectValue placeholder="Select road type to update" />
                    </SelectTrigger>
                    <SelectContent className="text-base">
                      <SelectItem value="Protocol Roads" className="text-base">Protocol Roads</SelectItem>
                      <SelectItem value="Secondary Roads" className="text-base">Secondary Roads</SelectItem>
                      <SelectItem value="Tertiary Roads" className="text-base">Tertiary Roads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-rate" className="text-base">New Rate (MZN/hr) *</Label>
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
            </div>

            <Separator />

            {/* Display current rates */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Current Rates:</Label>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Protocol Roads</CardDescription>
                    <CardTitle className="text-2xl">{parseInt(tariffRates.protocolRoads || "0").toLocaleString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">MZN/hr</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Secondary Roads</CardDescription>
                    <CardTitle className="text-2xl">{parseInt(tariffRates.secondaryRoads || "0").toLocaleString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">MZN/hr</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Tertiary Roads</CardDescription>
                    <CardTitle className="text-2xl">{parseInt(tariffRates.tertiaryRoads || "0").toLocaleString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">MZN/hr</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

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
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="text-base h-11 px-6">
            Cancel
          </Button>
          <Button onClick={handleEditTariff} className="text-base h-11 px-6">
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="text-base">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Delete Tariff</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete the tariff for <strong>{tariffToDelete?.purpose}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="text-sm text-muted-foreground">
                Deleting this tariff will affect all future permit applications for this purpose. Existing permits will not be affected.
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-base h-11 px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTariff} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-base h-11 px-6">
              Delete Tariff
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
