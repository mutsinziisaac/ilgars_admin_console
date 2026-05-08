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
const mockRoadClosureTariffs = [
  {
    id: 1,
    purpose: "Construction Works",
    closureType: "Full Road Closure",
    protocolRoads: 50000,
    secondaryRoads: 30000,
    tertiaryRoads: 15000,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 2,
    purpose: "Construction Works",
    closureType: "Partial Road Closure",
    protocolRoads: 10000,
    secondaryRoads: 5000,
    tertiaryRoads: 3500,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 3,
    purpose: "Filming",
    closureType: "Full Road Closure",
    protocolRoads: 50000,
    secondaryRoads: 30000,
    tertiaryRoads: 20000,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 4,
    purpose: "Filming",
    closureType: "Partial Road Closure",
    protocolRoads: 40000,
    secondaryRoads: 30000,
    tertiaryRoads: 20000,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 5,
    purpose: "Sporting Events",
    closureType: "Full Road Closure",
    protocolRoads: 10000,
    secondaryRoads: 5000,
    tertiaryRoads: 3500,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 6,
    purpose: "Sporting Events",
    closureType: "Partial Road Closure",
    protocolRoads: 5000,
    secondaryRoads: 3500,
    tertiaryRoads: 1800,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 7,
    purpose: "Fairs",
    closureType: "Full Road Closure",
    protocolRoads: 2000,
    secondaryRoads: 1000,
    tertiaryRoads: 0,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 8,
    purpose: "Fairs",
    closureType: "Partial Road Closure",
    protocolRoads: 2000,
    secondaryRoads: 1000,
    tertiaryRoads: 0,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 9,
    purpose: "For-Profit Events",
    closureType: "Full Road Closure",
    protocolRoads: 40000,
    secondaryRoads: 20000,
    tertiaryRoads: 10000,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 10,
    purpose: "For-Profit Events",
    closureType: "Partial Road Closure",
    protocolRoads: 20000,
    secondaryRoads: 10000,
    tertiaryRoads: 5000,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
]

// Mock circulation fees data - Weight-based charges for heavy vehicles
const mockCirculationFees = [
  {
    id: 1,
    activity: "Monthly authorisation for agricultural transit",
    weightRange: "N/A",
    dailyFee: 1000,
    monthlyFee: null,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 2,
    activity: "Circulation — cargo trucks",
    weightRange: "8,000–16,000 kg",
    dailyFee: 1000,
    monthlyFee: null,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 3,
    activity: "Circulation — cargo trucks",
    weightRange: "16,001–25,000 kg",
    dailyFee: 2000,
    monthlyFee: 20000,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 4,
    activity: "Circulation — cargo trucks",
    weightRange: "25,001–38,000 kg",
    dailyFee: 3000,
    monthlyFee: 20000,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 5,
    activity: "Circulation — cargo trucks",
    weightRange: "38,001–48,000 kg",
    dailyFee: 4000,
    monthlyFee: 20000,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 6,
    activity: "Circulation — cargo trucks",
    weightRange: "above 48,001 kg",
    dailyFee: 5000,
    monthlyFee: 20000,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 7,
    activity: "Daily authorisation for non-authorised roads",
    weightRange: "N/A",
    dailyFee: 1000,
    monthlyFee: null,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  },
  {
    id: 8,
    activity: "Special circulation licence",
    weightRange: "N/A",
    dailyFee: 20000,
    monthlyFee: null,
    status: "Active",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01"
  }
]

export function TariffsPage() {
  const [roadClosureTariffs, setRoadClosureTariffs] = useState(mockRoadClosureTariffs)
  const [circulationFees, setCirculationFees] = useState(mockCirculationFees)
  const [tariffType, setTariffType] = useState("road-closure")
  const [selectedTariff, setSelectedTariff] = useState<typeof mockRoadClosureTariffs[0] | null>(null)
  const [selectedCirculationFee, setSelectedCirculationFee] = useState<typeof mockCirculationFees[0] | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tariffToDelete, setTariffToDelete] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Get current tariffs based on type
  const currentTariffs = tariffType === "road-closure" ? roadClosureTariffs : circulationFees

  // Form state for road closure tariffs
  const [formData, setFormData] = useState({
    purpose: "",
    closureType: "",
    roadType: "",
    rate: "",
    effectiveDate: "",
    notes: ""
  })

  // Form state for circulation fees
  const [circulationFormData, setCirculationFormData] = useState({
    activity: "",
    weightRange: "",
    dailyFee: "",
    monthlyFee: "",
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
  const totalPages = Math.ceil(currentTariffs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTariffs = currentTariffs.slice(startIndex, endIndex)

  // Handle add road closure tariff
  const handleAddTariff = () => {
    const newTariff = {
      id: roadClosureTariffs.length + 1,
      purpose: formData.purpose,
      closureType: formData.closureType,
      protocolRoads: parseInt(tariffRates.protocolRoads),
      secondaryRoads: parseInt(tariffRates.secondaryRoads),
      tertiaryRoads: parseInt(tariffRates.tertiaryRoads),
      status: "Active",
      effectiveDate: formData.effectiveDate,
      lastUpdated: new Date().toISOString().split('T')[0]
    }
    setRoadClosureTariffs([...roadClosureTariffs, newTariff])
    setIsAddDialogOpen(false)
    setFormData({ purpose: "", closureType: "", roadType: "", rate: "", effectiveDate: "", notes: "" })
    setTariffRates({ protocolRoads: "", secondaryRoads: "", tertiaryRoads: "" })
    toast.success("Tariff added", {
      description: `New tariff for ${formData.purpose} (${formData.closureType}) has been added.`
    })
  }

  // Handle add circulation fee
  const handleAddCirculationFee = () => {
    const newFee = {
      id: circulationFees.length + 1,
      activity: circulationFormData.activity,
      weightRange: circulationFormData.weightRange || "N/A",
      dailyFee: parseInt(circulationFormData.dailyFee),
      monthlyFee: circulationFormData.monthlyFee ? parseInt(circulationFormData.monthlyFee) : null,
      status: "Active",
      effectiveDate: circulationFormData.effectiveDate,
      lastUpdated: new Date().toISOString().split('T')[0]
    }
    setCirculationFees([...circulationFees, newFee])
    setIsAddDialogOpen(false)
    setCirculationFormData({ activity: "", weightRange: "", dailyFee: "", monthlyFee: "", effectiveDate: "", notes: "" })
    toast.success("Circulation fee added", {
      description: `New circulation fee for ${circulationFormData.activity} has been added.`
    })
  }

  // Handle edit road closure tariff
  const handleEditTariff = () => {
    if (!selectedTariff) return
    
    setRoadClosureTariffs(roadClosureTariffs.map(t => 
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
    setFormData({ purpose: "", closureType: "", roadType: "", rate: "", effectiveDate: "", notes: "" })
    setTariffRates({ protocolRoads: "", secondaryRoads: "", tertiaryRoads: "" })
    toast.success("Tariff updated", {
      description: `Tariff for ${selectedTariff.purpose} has been updated.`
    })
  }

  // Handle edit circulation fee
  const handleEditCirculationFee = () => {
    if (!selectedCirculationFee) return
    
    setCirculationFees(circulationFees.map(f => 
      f.id === selectedCirculationFee.id 
        ? { 
            ...f, 
            dailyFee: parseInt(circulationFormData.dailyFee),
            monthlyFee: circulationFormData.monthlyFee ? parseInt(circulationFormData.monthlyFee) : null,
            effectiveDate: circulationFormData.effectiveDate,
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : f
    ))
    setIsEditDialogOpen(false)
    setSelectedCirculationFee(null)
    setCirculationFormData({ activity: "", weightRange: "", dailyFee: "", monthlyFee: "", effectiveDate: "", notes: "" })
    toast.success("Circulation fee updated", {
      description: `Circulation fee for ${selectedCirculationFee.activity} has been updated.`
    })
  }

  // Handle delete tariff or circulation fee
  const handleDeleteTariff = () => {
    if (!tariffToDelete) return
    
    if (tariffType === "road-closure") {
      setRoadClosureTariffs(roadClosureTariffs.filter(t => t.id !== tariffToDelete.id))
      toast.error("Tariff removed", {
        description: `Tariff for ${tariffToDelete.purpose} has been removed.`
      })
    } else {
      setCirculationFees(circulationFees.filter(f => f.id !== tariffToDelete.id))
      toast.error("Circulation fee removed", {
        description: `Circulation fee for ${tariffToDelete.activity} has been removed.`
      })
    }
    
    setDeleteDialogOpen(false)
    setTariffToDelete(null)
  }

  // Open edit dialog for road closure tariff
  const openEditDialog = (tariff: typeof mockRoadClosureTariffs[0]) => {
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

  // Open edit dialog for circulation fee
  const openEditCirculationDialog = (fee: typeof mockCirculationFees[0]) => {
    setSelectedCirculationFee(fee)
    setCirculationFormData({
      activity: fee.activity,
      weightRange: fee.weightRange,
      dailyFee: fee.dailyFee.toString(),
      monthlyFee: fee.monthlyFee ? fee.monthlyFee.toString() : "",
      effectiveDate: fee.effectiveDate,
      notes: ""
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
          <p className="text-lg text-muted-foreground">Manage road closure fees and circulation licence fees</p>
        </div>
        
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2 text-base h-11 px-6">
          <Plus className="h-5 w-5" />
          Add {tariffType === "road-closure" ? "Tariff" : "Circulation Fee"}
        </Button>
      </div>

      {/* Tariff Type Filter */}
      <div className="flex items-center justify-end gap-3">
        <Label htmlFor="tariff-type" className="text-base font-medium">
          Tariff Type:
        </Label>
        <Select value={tariffType} onValueChange={(value) => {
          setTariffType(value)
          setCurrentPage(1)
        }}>
          <SelectTrigger id="tariff-type" className="w-[250px] text-base h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="text-base">
            <SelectItem value="road-closure" className="text-base">Road Closure Fees</SelectItem>
            <SelectItem value="circulation" className="text-base">Circulation Licence Fees</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">
              {tariffType === "road-closure" ? "Active Tariffs" : "Active Fees"}
            </CardDescription>
            <CardTitle className="text-4xl">{currentTariffs.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">
              {tariffType === "road-closure" ? "Purpose categories" : "Fee categories"}
            </p>
          </CardContent>
        </Card>

        {tariffType === "road-closure" ? (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Highest Rate</CardDescription>
                <CardTitle className="text-4xl">{Math.max(...roadClosureTariffs.map(t => t.protocolRoads)).toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">MZN per hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Lowest Rate</CardDescription>
                <CardTitle className="text-4xl">{Math.min(...roadClosureTariffs.filter(t => t.tertiaryRoads > 0).map(t => t.tertiaryRoads)).toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">MZN per hour</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Highest Daily Fee</CardDescription>
                <CardTitle className="text-4xl">{Math.max(...circulationFees.map(f => f.dailyFee)).toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">MZN per day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Monthly Fee</CardDescription>
                <CardTitle className="text-4xl">20,000</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">MZN (06:00-20:00)</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tariff Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-2xl">
              {tariffType === "road-closure" ? "Road Closure Tariff Structure (Per Hour)" : "Circulation Licence Fees"}
            </CardTitle>
            <CardDescription className="text-base">
              {tariffType === "road-closure" 
                ? "Fees based on purpose, closure type, and road type" 
                : "Weight-based charges for heavy vehicles"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {tariffType === "road-closure" ? (
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
                {paginatedTariffs.map((tariff: any) => (
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg font-semibold">Activity</TableHead>
                  <TableHead className="text-lg font-semibold">Weight Range</TableHead>
                  <TableHead className="text-lg font-semibold">Daily Fee</TableHead>
                  <TableHead className="text-lg font-semibold">Monthly Fee (06:00-20:00)</TableHead>
                  <TableHead className="text-lg font-semibold">Effective Date</TableHead>
                  <TableHead className="text-right text-lg font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTariffs.map((fee: any) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium text-base max-w-[300px]">{fee.activity}</TableCell>
                    <TableCell className="text-base">
                      {fee.weightRange === "N/A" ? (
                        <Badge variant="outline" className="text-sm">N/A</Badge>
                      ) : (
                        <span className="font-medium">{fee.weightRange}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-base font-bold">{fee.dailyFee.toLocaleString()} MZN</TableCell>
                    <TableCell className="text-base font-bold">
                      {fee.monthlyFee ? `${fee.monthlyFee.toLocaleString()} MZN` : "—"}
                    </TableCell>
                    <TableCell className="text-base">{fee.effectiveDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditCirculationDialog(fee)}
                          className="h-10 w-10"
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setTariffToDelete(fee)
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
          )}

          {/* Pagination */}
          {currentTariffs.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, currentTariffs.length)} of {currentTariffs.length} {tariffType === "road-closure" ? "tariffs" : "fees"}
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
      {tariffType === "road-closure" ? (
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
      ) : (
        <Modal open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} className="w-[90vw] max-w-[800px]">
          <ModalHeader onClose={() => setIsAddDialogOpen(false)}>
            <div>
              <ModalTitle>Add New Circulation Fee</ModalTitle>
              <ModalDescription>
                Create a new circulation licence fee
              </ModalDescription>
            </div>
          </ModalHeader>
          
          <ModalBody>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="activity" className="text-base">Activity *</Label>
                <Input
                  id="activity"
                  placeholder="e.g., Circulation — cargo trucks"
                  value={circulationFormData.activity}
                  onChange={(e) => setCirculationFormData({ ...circulationFormData, activity: e.target.value })}
                  className="text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight-range" className="text-base">Weight Range (Optional)</Label>
                <Input
                  id="weight-range"
                  placeholder="e.g., 8,000–16,000 kg or leave empty for N/A"
                  value={circulationFormData.weightRange}
                  onChange={(e) => setCirculationFormData({ ...circulationFormData, weightRange: e.target.value })}
                  className="text-base h-11"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daily-fee" className="text-base">Daily Fee (MZN) *</Label>
                  <Input
                    id="daily-fee"
                    type="number"
                    placeholder="e.g., 1000"
                    value={circulationFormData.dailyFee}
                    onChange={(e) => setCirculationFormData({ ...circulationFormData, dailyFee: e.target.value })}
                    className="text-base h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly-fee" className="text-base">Monthly Fee (MZN) - Optional</Label>
                  <Input
                    id="monthly-fee"
                    type="number"
                    placeholder="e.g., 20000 or leave empty"
                    value={circulationFormData.monthlyFee}
                    onChange={(e) => setCirculationFormData({ ...circulationFormData, monthlyFee: e.target.value })}
                    className="text-base h-11"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="circ-effective-date" className="text-base">Effective Date *</Label>
                <Input
                  id="circ-effective-date"
                  type="date"
                  value={circulationFormData.effectiveDate}
                  onChange={(e) => setCirculationFormData({ ...circulationFormData, effectiveDate: e.target.value })}
                  className="text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="circ-notes" className="text-base">Notes (Optional)</Label>
                <Textarea
                  id="circ-notes"
                  placeholder="Add any additional notes..."
                  value={circulationFormData.notes}
                  onChange={(e) => setCirculationFormData({ ...circulationFormData, notes: e.target.value })}
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
              onClick={handleAddCirculationFee} 
              disabled={!circulationFormData.activity || !circulationFormData.dailyFee || !circulationFormData.effectiveDate}
              className="text-base h-11 px-6"
            >
              Add Circulation Fee
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Edit Tariff Modal */}
      {tariffType === "road-closure" && selectedTariff ? (
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
      ) : tariffType === "circulation" && selectedCirculationFee ? (
        <Modal open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} className="w-[90vw] max-w-[800px]">
        <ModalHeader onClose={() => setIsEditDialogOpen(false)}>
          <div>
            <ModalTitle>Edit Circulation Fee</ModalTitle>
            <ModalDescription>
              Update circulation fee for {selectedCirculationFee?.activity}
            </ModalDescription>
          </div>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base text-muted-foreground">Activity</Label>
              <p className="text-xl font-bold">{circulationFormData.activity}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-base text-muted-foreground">Weight Range</Label>
              <p className="text-lg font-medium">{circulationFormData.weightRange || "N/A"}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-daily-fee" className="text-base">Daily Fee (MZN) *</Label>
                <Input
                  id="edit-daily-fee"
                  type="number"
                  placeholder="e.g., 1000"
                  value={circulationFormData.dailyFee}
                  onChange={(e) => setCirculationFormData({ ...circulationFormData, dailyFee: e.target.value })}
                  className="text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-monthly-fee" className="text-base">Monthly Fee (MZN) - Optional</Label>
                <Input
                  id="edit-monthly-fee"
                  type="number"
                  placeholder="e.g., 20000 or leave empty"
                  value={circulationFormData.monthlyFee}
                  onChange={(e) => setCirculationFormData({ ...circulationFormData, monthlyFee: e.target.value })}
                  className="text-base h-11"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="edit-circ-effective-date" className="text-base">Effective Date *</Label>
              <Input
                id="edit-circ-effective-date"
                type="date"
                value={circulationFormData.effectiveDate}
                onChange={(e) => setCirculationFormData({ ...circulationFormData, effectiveDate: e.target.value })}
                className="text-base h-11"
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="text-base h-11 px-6">
            Cancel
          </Button>
          <Button onClick={handleEditCirculationFee} className="text-base h-11 px-6">
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="text-base">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">
              Delete {tariffType === "road-closure" ? "Tariff" : "Circulation Fee"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete {tariffType === "road-closure" 
                ? `the tariff for ${tariffToDelete?.purpose}` 
                : `the circulation fee for ${tariffToDelete?.activity}`}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="text-sm text-muted-foreground">
                {tariffType === "road-closure" 
                  ? "Deleting this tariff will affect all future permit applications for this purpose. Existing permits will not be affected."
                  : "Deleting this circulation fee will affect all future vehicle registrations. Existing registrations will not be affected."}
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-base h-11 px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTariff} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-base h-11 px-6">
              Delete {tariffType === "road-closure" ? "Tariff" : "Fee"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
