import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, Info, Plus, Trash2, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import {
  useRoadClosureRatesList,
  useCreateRoadClosureRate,
  useUpdateRoadClosureRate,
  useDeleteRoadClosureRate,
  useActivateRoadClosureRate,
} from "@/lib/api/road-closure-rates/hooks"

interface RateEntry {
  purpose: string
  roadType: string
  hourlyRate: number
}

interface RatesConfiguration {
  id: string
  municipalityId: string
  name: string
  currency: string
  chargeType: string
  closureType: string
  lastUpdated?: string
  updatedBy?: string
  active: boolean
  rates: RateEntry[]
}

export function RoadClosureRatesPage() {
  const [selectedConfig, setSelectedConfig] = useState<RatesConfiguration | null>(null)
  const [closureType, setClosureType] = useState<"FULL_CLOSURE" | "PARTIAL_RESTRICTION">("FULL_CLOSURE")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingRates, setEditingRates] = useState<RateEntry[]>([])
  const [configForm, setConfigForm] = useState({
    name: "",
    closureType: "FULL_CLOSURE" as "FULL_CLOSURE" | "PARTIAL_RESTRICTION"
  })

  // Fetch road closure rates from API
  const { data, isLoading, error, refetch } = useRoadClosureRatesList({ active: undefined })
  
  // Mutations
  const createMutation = useCreateRoadClosureRate({
    onSuccess: () => {
      toast.success("Road closure rate configuration created successfully")
      setIsCreateOpen(false)
      setConfigForm({ name: "", closureType: "FULL_CLOSURE" })
    },
    onError: (error: any) => {
      toast.error(`Failed to create: ${error.message || "Unknown error"}`)
    },
  })

  const updateMutation = useUpdateRoadClosureRate({
    onSuccess: () => {
      toast.success("Road closure rates updated successfully")
      setIsEditOpen(false)
      setSelectedConfig(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to update: ${error.message || "Unknown error"}`)
    },
  })

  const deleteMutation = useDeleteRoadClosureRate({
    onSuccess: () => {
      toast.success("Rate configuration deleted")
    },
    onError: (error: any) => {
      toast.error(`Failed to delete: ${error.message || "Unknown error"}`)
    },
  })

  const activateMutation = useActivateRoadClosureRate({
    onSuccess: () => {
      toast.success("Rate configuration activated")
    },
    onError: (error: any) => {
      toast.error(`Failed to activate: ${error.message || "Unknown error"}`)
    },
  })

  // Extract data from API response
  const ratesConfigurations = (data?.data || data?.content || []) as RatesConfiguration[]

  const purposes = ["CONSTRUCTION_WORKS", "FILMING", "SPORTING_EVENTS", "FAIRS", "FOR_PROFIT_EVENTS"]
  const roadTypes = ["PROTOCOL_ROAD", "SECONDARY_ROAD", "TERTIARY_ROAD"]
  
  const purposeLabels: Record<string, string> = {
    "CONSTRUCTION_WORKS": "Construction works",
    "FILMING": "Filming",
    "SPORTING_EVENTS": "Sporting events",
    "FAIRS": "Fairs",
    "FOR_PROFIT_EVENTS": "For-profit events"
  }
  
  const roadTypeLabels: Record<string, string> = {
    "PROTOCOL_ROAD": "Protocol Roads",
    "SECONDARY_ROAD": "Secondary Roads",
    "TERTIARY_ROAD": "Tertiary Roads"
  }

  const currentConfigs = ratesConfigurations.filter(c => c.closureType === closureType)
  const activeConfig = currentConfigs.find(c => c.active)

  const handleCreateConfig = () => {
    // Initialize rates with default values
    const defaultRates: RateEntry[] = []
    purposes.forEach(purpose => {
      roadTypes.forEach(roadType => {
        defaultRates.push({ purpose, roadType, hourlyRate: 0 })
      })
    })

    createMutation.mutate({
      name: configForm.name,
      closureType: configForm.closureType,
      rates: defaultRates,
    })
  }

  const handleEditClick = (config: RatesConfiguration) => {
    setSelectedConfig(config)
    setEditingRates([...config.rates])
    setIsEditOpen(true)
  }

  const handleUpdateRates = () => {
    if (!selectedConfig) return
    
    updateMutation.mutate({
      id: selectedConfig.id,
      payload: {
        name: selectedConfig.name,
        closureType: selectedConfig.closureType,
        rates: editingRates,
      },
    })
  }

  const handleActivateConfig = (configId: string) => {
    const config = ratesConfigurations.find(c => c.id === configId)
    if (config?.active) {
      toast.info("This configuration is already active")
      return
    }
    activateMutation.mutate(configId)
  }

  const handleDeleteConfig = (configId: string) => {
    const config = ratesConfigurations.find(c => c.id === configId)
    if (config?.active) {
      toast.error("Cannot delete active rate configuration")
      return
    }
    deleteMutation.mutate(configId)
  }

  const updateRate = (purpose: string, roadType: string, value: string) => {
    const newRates = editingRates.map(rate => 
      rate.purpose === purpose && rate.roadType === roadType
        ? { ...rate, hourlyRate: parseFloat(value) || 0 }
        : rate
    )
    setEditingRates(newRates)
  }

  const getRateForCell = (purpose: string, roadType: string) => {
    if (!activeConfig) return 0
    const rate = activeConfig.rates.find(r => r.purpose === purpose && r.roadType === roadType)
    return rate?.hourlyRate || 0
  }

  const getEditingRateForCell = (purpose: string, roadType: string) => {
    const rate = editingRates.find(r => r.purpose === purpose && r.roadType === roadType)
    return rate?.hourlyRate || 0
  }

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge className="bg-[#5B8C5A] text-white">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="text-muted-foreground">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Road Closure Rates</h1>
          <p className="text-lg text-muted-foreground">Configure hourly rates by purpose and road type</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <button
              onClick={() => setClosureType("FULL_CLOSURE")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                closureType === "FULL_CLOSURE"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Full Closure
            </button>
            <button
              onClick={() => setClosureType("PARTIAL_RESTRICTION")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                closureType === "PARTIAL_RESTRICTION"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Partial Restriction
            </button>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Create Rate Configuration
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-semibold">Failed to load road closure rates</p>
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
      )}

      {/* Rate Configurations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {closureType === "FULL_CLOSURE" ? "Full Road Closure" : "Partial Road Restriction"} - Rate Configurations
          </CardTitle>
          <CardDescription className="text-base">
            Manage rate schedules for {closureType === "FULL_CLOSURE" ? "full road closures" : "partial road restrictions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : currentConfigs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Info className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No rate configurations found</h3>
              <p className="text-base text-muted-foreground mb-4">
                Create your first rate configuration to get started
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Rate Configuration
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Configuration Name</TableHead>
                  <TableHead className="text-base">Last Updated</TableHead>
                  <TableHead className="text-base">Updated By</TableHead>
                  <TableHead className="text-base">Status</TableHead>
                  <TableHead className="text-right text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium text-base">{config.name}</TableCell>
                    <TableCell className="text-base">{config.lastUpdated || "N/A"}</TableCell>
                    <TableCell className="text-base">{config.updatedBy || "N/A"}</TableCell>
                    <TableCell>{getStatusBadge(config.active)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(config)}
                          disabled={updateMutation.isPending}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Rates
                        </Button>
                        {!config.active && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleActivateConfig(config.id)}
                              disabled={activateMutation.isPending}
                            >
                              {activateMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : null}
                              Activate
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteConfig(config.id)}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Active Configuration Preview */}
      {activeConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Active Rate Schedule: {activeConfig.name}</CardTitle>
            <CardDescription className="text-base">
              Current hourly rates (MZN) for {closureType === "FULL_CLOSURE" ? "full road closures" : "partial road restrictions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base font-semibold">Purpose / Road Type</TableHead>
                    {roadTypes.map((roadType) => (
                      <TableHead key={roadType} className="text-base font-semibold text-center">
                        {roadTypeLabels[roadType]}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purposes.map((purpose) => (
                    <TableRow key={purpose}>
                      <TableCell className="font-medium text-base">{purposeLabels[purpose]}</TableCell>
                      {roadTypes.map((roadType) => (
                        <TableCell key={roadType} className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm text-muted-foreground">MZN</span>
                            <span className="text-base font-semibold">
                              {getRateForCell(purpose, roadType).toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Last updated: {activeConfig.lastUpdated} by {activeConfig.updatedBy}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Rate Configuration Modal */}
      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen} className="w-full max-w-2xl">
        <ModalHeader onClose={() => setIsCreateOpen(false)}>
          <ModalTitle>Create Rate Configuration</ModalTitle>
          <ModalDescription>Create a new road closure rate schedule</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Configuration Name *</Label>
              <Input
                id="name"
                value={configForm.name}
                onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                placeholder="e.g., Full Road Closure Rates 2026"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Closure Type *</Label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setConfigForm({ ...configForm, closureType: "FULL_CLOSURE" })}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                    configForm.closureType === "FULL_CLOSURE"
                      ? "border-[#5B8C5A] bg-[#5B8C5A]/10 text-[#5B8C5A]"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <p className="font-semibold">Full Closure</p>
                  <p className="text-sm">Complete road closure</p>
                </button>
                <button
                  type="button"
                  onClick={() => setConfigForm({ ...configForm, closureType: "PARTIAL_RESTRICTION" })}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                    configForm.closureType === "PARTIAL_RESTRICTION"
                      ? "border-[#5B8C5A] bg-[#5B8C5A]/10 text-[#5B8C5A]"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <p className="font-semibold">Partial Restriction</p>
                  <p className="text-sm">Limited access</p>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Next Step</p>
                  <p className="text-sm text-blue-800 mt-1">
                    After creating the configuration, you can edit it to set the hourly rates for each purpose and road type combination.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateConfig}
            disabled={!configForm.name || createMutation.isPending}
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Configuration
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Rates Modal */}
      <Modal open={isEditOpen} onOpenChange={setIsEditOpen} className="w-full max-w-5xl">
        <ModalHeader onClose={() => setIsEditOpen(false)}>
          <ModalTitle>Edit Rates: {selectedConfig?.name}</ModalTitle>
          <ModalDescription>Update hourly rates for road closures</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base font-semibold">Purpose / Road Type</TableHead>
                  {roadTypes.map((roadType) => (
                    <TableHead key={roadType} className="text-base font-semibold text-center">
                      {roadTypeLabels[roadType]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {purposes.map((purpose) => (
                  <TableRow key={purpose}>
                    <TableCell className="font-medium text-base">{purposeLabels[purpose]}</TableCell>
                    {roadTypes.map((roadType) => (
                      <TableCell key={roadType} className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-sm text-muted-foreground">MZN</span>
                          <Input
                            type="number"
                            value={getEditingRateForCell(purpose, roadType)}
                            onChange={(e) => updateRate(purpose, roadType, e.target.value)}
                            className="text-base h-10 w-32 text-center"
                          />
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Rate Update Notice</p>
                  <p className="text-sm text-blue-800 mt-1">
                    Updated rates will apply to all new road closure permit applications immediately. 
                    Existing permits will retain their original rates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateRates}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
