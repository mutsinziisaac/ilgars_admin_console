import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, Plus, Edit, Trash2, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import {
  useTariffPlansList,
  useCreateTariffPlan,
  useUpdateTariffPlan,
  useDeleteTariffPlan,
  useActivateTariffPlan,
} from "@/lib/api/tariff-plans/hooks"
import type { TariffPlan, TariffRate } from "@/lib/api/tariff-plans/schemas"

const defaultRates: TariffRate[] = [
  { capacityBandCode: "AGRICULTURAL_TRANSIT", capacityUnit: "KG", minimumCapacity: null, maximumCapacity: null, amountPerDay: 1000, amountPerMonth: 0, minimumCharge: 0 },
  { capacityBandCode: "CARGO_8000_16000_KG", capacityUnit: "KG", minimumCapacity: 8000, maximumCapacity: 16000, amountPerDay: 1000, amountPerMonth: 0, minimumCharge: 0 },
  { capacityBandCode: "CARGO_16001_25000_KG", capacityUnit: "KG", minimumCapacity: 16001, maximumCapacity: 25000, amountPerDay: 2000, amountPerMonth: 20000, minimumCharge: 0 },
  { capacityBandCode: "CARGO_25001_38000_KG", capacityUnit: "KG", minimumCapacity: 25001, maximumCapacity: 38000, amountPerDay: 3000, amountPerMonth: 20000, minimumCharge: 0 },
  { capacityBandCode: "CARGO_38001_48000_KG", capacityUnit: "KG", minimumCapacity: 38001, maximumCapacity: 48000, amountPerDay: 4000, amountPerMonth: 20000, minimumCharge: 0 },
  { capacityBandCode: "CARGO_ABOVE_48001_KG", capacityUnit: "KG", minimumCapacity: 48001, maximumCapacity: null, amountPerDay: 5000, amountPerMonth: 20000, minimumCharge: 0 },
  { capacityBandCode: "NON_AUTHORISED_ROAD_DAILY", capacityUnit: "KG", minimumCapacity: null, maximumCapacity: null, amountPerDay: 1000, amountPerMonth: 0, minimumCharge: 0 },
  { capacityBandCode: "SPECIAL_CIRCULATION_LICENCE", capacityUnit: "KG", minimumCapacity: null, maximumCapacity: null, amountPerDay: 20000, amountPerMonth: 0, minimumCharge: 0 }
]

export function TariffPlansPage() {
  // Fetch tariff plans from API
  const { data: tariffPlansResponse, isLoading, error, refetch } = useTariffPlansList({ status: "all" })
  
  // Mutations
  const createMutation = useCreateTariffPlan({
    onSuccess: () => {
      toast.success("Tariff plan created successfully")
      setIsCreateOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(`Failed to create tariff plan: ${error.message}`)
    },
  })

  const updateMutation = useUpdateTariffPlan(selectedPlan?.id || "", {
    onSuccess: () => {
      toast.success("Tariff plan updated successfully")
      setIsEditOpen(false)
      setSelectedPlan(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to update tariff plan: ${error.message}`)
    },
  })

  const deleteMutation = useDeleteTariffPlan({
    onSuccess: () => {
      toast.success("Tariff plan deleted")
    },
    onError: (error: any) => {
      toast.error(`Failed to delete tariff plan: ${error.message}`)
    },
  })

  const activateMutation = useActivateTariffPlan({
    onSuccess: () => {
      toast.success("Tariff plan activated")
    },
    onError: (error: any) => {
      toast.error(`Failed to activate tariff plan: ${error.message}`)
    },
  })

  // Extract tariff plans from response
  const tariffPlans = tariffPlansResponse?.data || tariffPlansResponse?.content || []
  
  const [selectedPlan, setSelectedPlan] = useState<TariffPlan | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewBandsOpen, setIsViewBandsOpen] = useState(false)

  const [planForm, setPlanForm] = useState({
    code: "",
    name: "",
    tariffType: "CIRCULATION_LICENCE",
    description: "",
    rates: defaultRates
  })

  const resetForm = () => {
    setPlanForm({
      code: "",
      name: "",
      tariffType: "CIRCULATION_LICENCE",
      description: "",
      rates: defaultRates
    })
  }

  const handleCreatePlan = () => {
    createMutation.mutate({
      code: planForm.code,
      name: planForm.name,
      tariffType: planForm.tariffType,
      description: planForm.description,
      rates: planForm.rates
    })
  }

  const handleUpdatePlan = () => {
    if (!selectedPlan) return
    updateMutation.mutate({
      code: planForm.code,
      name: planForm.name,
      tariffType: planForm.tariffType,
      description: planForm.description,
      rates: planForm.rates
    })
  }

  const handleActivatePlan = (planId: string) => {
    activateMutation.mutate(planId)
  }

  const handleDeletePlan = (planId: string) => {
    const plan = tariffPlans.find((p: TariffPlan) => p.id === planId)
    if (plan?.active) {
      toast.error("Cannot delete active tariff plan")
      return
    }
    deleteMutation.mutate(planId)
  }

  const handleEditClick = (plan: TariffPlan) => {
    setSelectedPlan(plan)
    setPlanForm({
      code: plan.code,
      name: plan.name,
      tariffType: plan.tariffType,
      description: plan.description || "",
      rates: [...plan.rates]
    })
    setIsEditOpen(true)
  }

  const handleViewBands = (plan: TariffPlan) => {
    setSelectedPlan(plan)
    setIsViewBandsOpen(true)
  }

  const updateBandRate = (index: number, field: 'amountPerDay' | 'amountPerMonth', value: string) => {
    const newRates = [...planForm.rates]
    newRates[index][field] = parseFloat(value) || 0
    setPlanForm({ ...planForm, rates: newRates })
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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-foreground">Tariff Plans</h1>
            <p className="text-lg text-muted-foreground">Manage capacity-based tariff rate plans</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load tariff plans</h3>
              <p className="text-muted-foreground mb-4">{(error as any)?.message || "An error occurred"}</p>
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Tariff Plans</h1>
          <p className="text-lg text-muted-foreground">Manage capacity-based tariff rate plans</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Create Tariff Plan
        </Button>
      </div>

      {/* Tariff Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tariff Plans</CardTitle>
          <CardDescription className="text-base">
            Configure circulation licence fees based on vehicle capacity bands
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tariffPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tariff plans found</h3>
              <p className="text-muted-foreground mb-4">Create your first tariff plan to get started</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Tariff Plan
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Plan Name</TableHead>
                  <TableHead className="text-base">Description</TableHead>
                  <TableHead className="text-base">Created</TableHead>
                  <TableHead className="text-base">Activated</TableHead>
                  <TableHead className="text-base">Status</TableHead>
                  <TableHead className="text-right text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tariffPlans.map((plan: TariffPlan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium text-base">{plan.name}</TableCell>
                    <TableCell className="text-base">{plan.description || "-"}</TableCell>
                    <TableCell className="text-base">{plan.createdAt?.split('T')[0] || "-"}</TableCell>
                    <TableCell className="text-base">{plan.activatedAt?.split('T')[0] || "-"}</TableCell>
                    <TableCell>{getStatusBadge(plan.active)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewBands(plan)}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          View Rates
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(plan)}
                          disabled={updateMutation.isPending}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!plan.active && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleActivatePlan(plan.id)}
                              disabled={activateMutation.isPending}
                            >
                              {activateMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Activate"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePlan(plan.id)}
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

      {/* Create Tariff Plan Modal */}
      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen} className="w-full max-w-4xl">
        <ModalHeader onClose={() => setIsCreateOpen(false)}>
          <ModalTitle>Create Tariff Plan</ModalTitle>
          <ModalDescription>Define a new capacity-based tariff rate plan</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-base">Plan Code *</Label>
              <Input
                id="code"
                value={planForm.code}
                onChange={(e) => setPlanForm({ ...planForm, code: e.target.value })}
                placeholder="e.g., MAPUTO-CIRCULATION-2026"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Plan Name *</Label>
              <Input
                id="name"
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                placeholder="e.g., Standard Tariff Plan 2026"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Input
                id="description"
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                placeholder="e.g., Standard capacity-based tariff rates"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Capacity Bands & Rates (MZN)</Label>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-base">Capacity Band Code</TableHead>
                      <TableHead className="text-base">Min (kg)</TableHead>
                      <TableHead className="text-base">Max (kg)</TableHead>
                      <TableHead className="text-base">Daily Rate</TableHead>
                      <TableHead className="text-base">Monthly Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planForm.rates.map((rate, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-base">{rate.capacityBandCode}</TableCell>
                        <TableCell className="text-base">{rate.minimumCapacity || '-'}</TableCell>
                        <TableCell className="text-base">{rate.maximumCapacity || '-'}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={rate.amountPerDay}
                            onChange={(e) => updateBandRate(index, 'amountPerDay', e.target.value)}
                            className="text-base h-10"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={rate.amountPerMonth}
                            onChange={(e) => updateBandRate(index, 'amountPerMonth', e.target.value)}
                            className="text-base h-10"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleCreatePlan} disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Plan"
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Tariff Plan Modal */}
      <Modal open={isEditOpen} onOpenChange={setIsEditOpen} className="w-full max-w-4xl">
        <ModalHeader onClose={() => setIsEditOpen(false)}>
          <ModalTitle>Edit Tariff Plan</ModalTitle>
          <ModalDescription>Update tariff plan details and rates</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-code" className="text-base">Plan Code *</Label>
              <Input
                id="edit-code"
                value={planForm.code}
                onChange={(e) => setPlanForm({ ...planForm, code: e.target.value })}
                placeholder="e.g., MAPUTO-CIRCULATION-2026"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-base">Plan Name *</Label>
              <Input
                id="edit-name"
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                placeholder="e.g., Standard Tariff Plan 2026"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-base">Description</Label>
              <Input
                id="edit-description"
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                placeholder="e.g., Standard capacity-based tariff rates"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Capacity Bands & Rates (MZN)</Label>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-base">Capacity Band Code</TableHead>
                      <TableHead className="text-base">Min (kg)</TableHead>
                      <TableHead className="text-base">Max (kg)</TableHead>
                      <TableHead className="text-base">Daily Rate</TableHead>
                      <TableHead className="text-base">Monthly Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planForm.rates.map((rate, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-base">{rate.capacityBandCode}</TableCell>
                        <TableCell className="text-base">{rate.minimumCapacity || '-'}</TableCell>
                        <TableCell className="text-base">{rate.maximumCapacity || '-'}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={rate.amountPerDay}
                            onChange={(e) => updateBandRate(index, 'amountPerDay', e.target.value)}
                            className="text-base h-10"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={rate.amountPerMonth}
                            onChange={(e) => updateBandRate(index, 'amountPerMonth', e.target.value)}
                            className="text-base h-10"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpdatePlan} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* View Bands Modal */}
      <Modal open={isViewBandsOpen} onOpenChange={setIsViewBandsOpen} className="w-full max-w-4xl">
        <ModalHeader onClose={() => setIsViewBandsOpen(false)}>
          <ModalTitle>{selectedPlan?.name}</ModalTitle>
          <ModalDescription>Capacity band rates</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Capacity Band Code</TableHead>
                <TableHead className="text-base">Min Capacity (kg)</TableHead>
                <TableHead className="text-base">Max Capacity (kg)</TableHead>
                <TableHead className="text-base">Daily Rate (MZN)</TableHead>
                <TableHead className="text-base">Monthly Rate (MZN)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedPlan?.rates.map((rate, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-base">{rate.capacityBandCode}</TableCell>
                  <TableCell className="text-base">{rate.minimumCapacity?.toLocaleString() || '-'}</TableCell>
                  <TableCell className="text-base">{rate.maximumCapacity?.toLocaleString() || '-'}</TableCell>
                  <TableCell className="text-base">{rate.amountPerDay.toLocaleString()}</TableCell>
                  <TableCell className="text-base">{rate.amountPerMonth.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setIsViewBandsOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
