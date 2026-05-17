import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, DollarSign, MoreHorizontal, Plus, Edit, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import {
  useTariffPlansList,
  useCreateTariffPlan,
  useUpdateTariffPlan,
  useActivateTariffPlan,
} from "@/lib/api/tariff-plans/hooks"
import type { TariffPlan, TariffRate } from "@/lib/api/tariff-plans/schemas"
import { TARIFF_PLANS_STORAGE_KEY_PREFIX } from "@/lib/api/constants"
import {
  getMunicipalityDisplayName,
  getStoredMunicipalityId as getRegistryMunicipalityId,
} from "@/lib/municipality-registry"

const defaultRates: TariffRate[] = [
  { capacityBandCode: "AGRICULTURAL_TRANSIT", amountPerDay: 1000, minimumCharge: 0 },
  { capacityBandCode: "CARGO_8000_16000_KG", capacityUnit: "KG", minimumCapacity: 8000, maximumCapacity: 16000, amountPerDay: 1000, amountPerMonth: 0, minimumCharge: 0 },
  { capacityBandCode: "CARGO_16001_25000_KG", capacityUnit: "KG", minimumCapacity: 16001, maximumCapacity: 25000, amountPerDay: 2000, amountPerMonth: 20000, minimumCharge: 0 },
  { capacityBandCode: "CARGO_25001_38000_KG", capacityUnit: "KG", minimumCapacity: 25001, maximumCapacity: 38000, amountPerDay: 3000, amountPerMonth: 20000, minimumCharge: 0 },
  { capacityBandCode: "CARGO_38001_48000_KG", capacityUnit: "KG", minimumCapacity: 38001, maximumCapacity: 48000, amountPerDay: 4000, amountPerMonth: 20000, minimumCharge: 0 },
  { capacityBandCode: "CARGO_ABOVE_48001_KG", capacityUnit: "KG", minimumCapacity: 48001, maximumCapacity: null, amountPerDay: 5000, amountPerMonth: 20000, minimumCharge: 0 },
  { capacityBandCode: "NON_AUTHORISED_ROAD_DAILY", amountPerDay: 1000, minimumCharge: 0 },
  { capacityBandCode: "SPECIAL_CIRCULATION_LICENCE", amountPerDay: 20000, minimumCharge: 0 }
]

const getStoredMunicipalityId = () => {
  return getRegistryMunicipalityId()
}

const getTariffPlansStorageKey = (municipalityId: string) =>
  `${TARIFF_PLANS_STORAGE_KEY_PREFIX}.${municipalityId}`

const getStoredTariffPlans = (municipalityId: string): TariffPlan[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(getTariffPlansStorageKey(municipalityId))
    return stored ? (JSON.parse(stored) as TariffPlan[]) : []
  } catch {
    return []
  }
}

const storeTariffPlans = (municipalityId: string, plans: TariffPlan[]) => {
  if (typeof window === "undefined") return

  localStorage.setItem(getTariffPlansStorageKey(municipalityId), JSON.stringify(plans))
}

const mergeTariffPlans = (incoming: TariffPlan[], fallback: TariffPlan[] = []) => {
  const byId = new Map<string, TariffPlan>()

  fallback.forEach((plan) => byId.set(plan.id, plan))
  incoming.forEach((plan) => byId.set(plan.id, plan))

  return Array.from(byId.values())
}

const createDefaultPlanCode = () => `MAPUTO-CIRCULATION-2026-${Date.now()}`

const cleanRate = (rate: TariffRate): TariffRate => {
  const entries = Object.entries(rate).filter(([, value]) => value !== null && value !== undefined)

  return Object.fromEntries(entries) as TariffRate
}

const withTariffPlanDisplayFields = (
  plan: TariffPlan,
  fallback: Partial<TariffPlan> = {},
): TariffPlan => ({
  ...plan,
  description: plan.description ?? fallback.description ?? "",
  createdAt: plan.createdAt ?? fallback.createdAt ?? new Date().toISOString(),
})

export function TariffPlansPage() {
  const storedMunicipalityId = getStoredMunicipalityId()
  const [activeMunicipalityId, setActiveMunicipalityId] = useState(storedMunicipalityId)
  const [selectedPlan, setSelectedPlan] = useState<TariffPlan | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewBandsOpen, setIsViewBandsOpen] = useState(false)
  const [activatingPlanId, setActivatingPlanId] = useState<string | null>(null)
  const [activatedPlanIds, setActivatedPlanIds] = useState<Set<string>>(() => new Set())
  const [cachedTariffPlans, setCachedTariffPlans] = useState<TariffPlan[]>(() =>
    getStoredTariffPlans(storedMunicipalityId),
  )

  useEffect(() => {
    const latestMunicipalityId = getStoredMunicipalityId()
    setActiveMunicipalityId(latestMunicipalityId)
    setCachedTariffPlans(getStoredTariffPlans(latestMunicipalityId))
    setPlanForm((current) => ({
      ...current,
      municipalityId: latestMunicipalityId,
    }))
  }, [])

  // Fetch tariff plans from API
  const { data: tariffPlansResponse, isLoading, error, refetch } = useTariffPlansList({
    municipalityId: activeMunicipalityId,
    status: "all",
  })
  
  // Mutations
  const createMutation = useCreateTariffPlan({
    onSuccess: (data, variables) => {
      if (variables.municipalityId) {
        setActiveMunicipalityId(variables.municipalityId)
      }
      const municipalityId = variables.municipalityId || getStoredMunicipalityId()
      const nextPlans = mergeTariffPlans(
        [
          withTariffPlanDisplayFields(data.data, {
            description: variables.description,
          }),
        ],
        getStoredTariffPlans(municipalityId),
      )
      setCachedTariffPlans(nextPlans)
      storeTariffPlans(municipalityId, nextPlans)
      toast.success("Tariff plan created successfully")
      setIsCreateOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(`Failed to create tariff plan: ${error.message}`)
    },
  })

  const updateMutation = useUpdateTariffPlan(selectedPlan?.id || "", {
    onSuccess: (data, variables) => {
      const municipalityId = data.data.municipalityId || getStoredMunicipalityId()
      const nextPlans = mergeTariffPlans(
        [
          withTariffPlanDisplayFields(data.data, {
            description: variables.description,
            createdAt: selectedPlan?.createdAt,
          }),
        ],
        getStoredTariffPlans(municipalityId),
      )
      setCachedTariffPlans(nextPlans)
      storeTariffPlans(municipalityId, nextPlans)
      toast.success("Tariff plan updated successfully")
      setIsEditOpen(false)
      setSelectedPlan(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to update tariff plan: ${error.message}`)
    },
  })

  const activateMutation = useActivateTariffPlan({
    onSuccess: (_data, planId) => {
      setActivatedPlanIds((current) => {
        const next = new Set(current)
        next.add(planId)
        return next
      })
      setActivatingPlanId(null)
      toast.success("Tariff plan activated")
    },
    onError: (error: any) => {
      setActivatingPlanId(null)
      toast.error(`Failed to activate tariff plan: ${error.message}`)
    },
  })

  // Extract tariff plans from response
  const apiTariffPlans = tariffPlansResponse?.data || tariffPlansResponse?.content || []
  const tariffPlans = mergeTariffPlans(apiTariffPlans, cachedTariffPlans)

  useEffect(() => {
    if (!apiTariffPlans.length) return

    const nextPlans = mergeTariffPlans(apiTariffPlans, getStoredTariffPlans(activeMunicipalityId))
    setCachedTariffPlans(nextPlans)
    storeTariffPlans(activeMunicipalityId, nextPlans)
  }, [activeMunicipalityId, apiTariffPlans])

  const [planForm, setPlanForm] = useState({
    municipalityId: storedMunicipalityId,
    code: createDefaultPlanCode(),
    name: "Maputo Circulation Licence Fees",
    tariffType: "CIRCULATION_LICENCE",
    description: "",
    rates: defaultRates
  })

  const resetForm = () => {
    const municipalityId = getStoredMunicipalityId()
    setActiveMunicipalityId(municipalityId)
    setCachedTariffPlans(getStoredTariffPlans(municipalityId))
    setPlanForm({
      municipalityId,
      code: createDefaultPlanCode(),
      name: "Maputo Circulation Licence Fees",
      tariffType: "CIRCULATION_LICENCE",
      description: "",
      rates: defaultRates
    })
  }

  const openCreatePlan = () => {
    resetForm()
    setIsCreateOpen(true)
  }

  const handleCreatePlan = () => {
    const municipalityId = planForm.municipalityId.trim()

    if (!municipalityId) {
      toast.error("Create a municipality before creating a tariff plan")
      return
    }

    createMutation.mutate({
      municipalityId,
      code: planForm.code,
      name: planForm.name,
      tariffType: planForm.tariffType,
      description: planForm.description || undefined,
      rates: planForm.rates.map(cleanRate)
    })
  }

  const handleUpdatePlan = () => {
    if (!selectedPlan) return
    updateMutation.mutate({
      municipalityId: planForm.municipalityId.trim() || selectedPlan.municipalityId,
      code: planForm.code,
      name: planForm.name,
      tariffType: planForm.tariffType,
      description: planForm.description || undefined,
      rates: planForm.rates.map(cleanRate)
    })
  }

  const handleActivatePlan = (planId: string) => {
    setActivatingPlanId(planId)
    activateMutation.mutate(planId)
  }

  const handleEditClick = (plan: TariffPlan) => {
    setSelectedPlan(plan)
    setPlanForm({
      municipalityId: plan.municipalityId,
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

  const updateBandText = (index: number, field: "capacityBandCode", value: string) => {
    const newRates = [...planForm.rates]
    newRates[index] = {
      ...newRates[index],
      [field]: value,
    }
    setPlanForm({ ...planForm, rates: newRates })
  }

  const updateBandCapacity = (
    index: number,
    field: "minimumCapacity" | "maximumCapacity",
    value: string,
  ) => {
    const newRates = [...planForm.rates]
    newRates[index] = {
      ...newRates[index],
      [field]: value === "" ? null : Number(value),
    }
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

  if (isCreateOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCreateOpen(false)}
            disabled={createMutation.isPending}
            aria-label="Back to tariff plans"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Create Tariff Plan</h1>
            <p className="text-base text-muted-foreground">
              Define a new capacity-based tariff rate plan.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Plan Details</CardTitle>
            <CardDescription className="text-base">
              Set the tariff identity for {getMunicipalityDisplayName(planForm.municipalityId)}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base">Municipality</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-3 text-base font-medium">
                {getMunicipalityDisplayName(planForm.municipalityId)}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-base">Plan Code *</Label>
                <Input
                  id="code"
                  value={planForm.code}
                  onChange={(e) => setPlanForm({ ...planForm, code: e.target.value })}
                  placeholder="e.g., MAPUTO-CIRCULATION-2026-1778687378"
                  className="text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Plan Name *</Label>
                <Input
                  id="name"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="e.g., Maputo Circulation Licence Fees"
                  className="text-base h-11"
                />
              </div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Capacity Bands & Rates</CardTitle>
            <CardDescription className="text-base">
              Configure the daily and monthly MZN rates for each capacity band.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
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
                      <TableCell>
                        <Input
                          value={rate.capacityBandCode}
                          onChange={(e) => updateBandText(index, "capacityBandCode", e.target.value)}
                          className="h-10 min-w-[220px] text-base"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={rate.minimumCapacity ?? ""}
                          onChange={(e) => updateBandCapacity(index, "minimumCapacity", e.target.value)}
                          className="h-10 min-w-[120px] text-base"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={rate.maximumCapacity ?? ""}
                          onChange={(e) => updateBandCapacity(index, "maximumCapacity", e.target.value)}
                          className="h-10 min-w-[120px] text-base"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={rate.amountPerDay}
                          onChange={(e) => updateBandRate(index, "amountPerDay", e.target.value)}
                          className="text-base h-10"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={rate.amountPerMonth ?? ""}
                          onChange={(e) => updateBandRate(index, "amountPerMonth", e.target.value)}
                          className="text-base h-10"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4">
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
        </div>
      </div>
    )
  }

  if (isEditOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsEditOpen(false)
              setSelectedPlan(null)
            }}
            disabled={updateMutation.isPending}
            aria-label="Back to tariff plans"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Edit Tariff Plan</h1>
            <p className="text-base text-muted-foreground">
              Update tariff plan details and capacity-based rates.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Plan Details</CardTitle>
            <CardDescription className="text-base">
              Update the tariff identity for {getMunicipalityDisplayName(planForm.municipalityId)}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base">Municipality</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-3 text-base font-medium">
                {getMunicipalityDisplayName(planForm.municipalityId)}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Capacity Bands & Rates</CardTitle>
            <CardDescription className="text-base">
              Adjust the daily and monthly MZN rates for each capacity band.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
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
                      <TableCell className="text-base">{rate.minimumCapacity || "-"}</TableCell>
                      <TableCell className="text-base">{rate.maximumCapacity || "-"}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={rate.amountPerDay}
                          onChange={(e) => updateBandRate(index, "amountPerDay", e.target.value)}
                          className="text-base h-10"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={rate.amountPerMonth ?? ""}
                          onChange={(e) => updateBandRate(index, "amountPerMonth", e.target.value)}
                          className="text-base h-10"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditOpen(false)
              setSelectedPlan(null)
            }}
            disabled={updateMutation.isPending}
          >
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
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading && tariffPlans.length === 0) {
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Tariff Plans</h1>
          <p className="text-lg text-muted-foreground">Manage capacity-based tariff rate plans</p>
        </div>
        <Button onClick={openCreatePlan} disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Create New Tariff
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
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load tariff plans</h3>
              <p className="text-muted-foreground mb-4">{(error as any)?.message || "An error occurred"}</p>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : tariffPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tariff plans found</h3>
              <p className="text-muted-foreground">Create your first tariff plan to get started</p>
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
                    <TableCell className="text-base">
                      {activatedPlanIds.has(plan.id) ? new Date().toISOString().split("T")[0] : plan.activatedAt?.split('T')[0] || "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(plan.active || activatedPlanIds.has(plan.id))}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" aria-label={`Actions for ${plan.name}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onSelect={() => handleViewBands(plan)}>
                            <DollarSign className="h-4 w-4" />
                            View Rates
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => handleEditClick(plan)}
                            disabled={updateMutation.isPending}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {!(plan.active || activatedPlanIds.has(plan.id)) && (
                            <DropdownMenuItem
                              onSelect={() => handleActivatePlan(plan.id)}
                              disabled={activatingPlanId === plan.id}
                            >
                              {activatingPlanId === plan.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                              Activate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
                  <TableCell className="text-base">{(rate.amountPerMonth ?? 0).toLocaleString()}</TableCell>
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
