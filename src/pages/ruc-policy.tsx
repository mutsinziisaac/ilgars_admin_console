import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Settings, Edit, Info, Plus, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/api"
import {
  useRUCPoliciesList,
  useCreateRUCPolicy,
  useUpdateRUCPolicy,
  useActivateRUCPolicy,
} from "@/lib/api/ruc-policies/hooks"
import type { RUCPolicy } from "@/lib/api/ruc-policies/schemas"
import {
  getMunicipalityDisplayName,
  getStoredMunicipalityId,
} from "@/lib/municipality-registry"

const POLICY_CAPACITY_UNIT = "KGS"
const POLICY_CAPACITY_UNIT_LABEL = "kg"

export function RUCPolicyPage() {
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState(getStoredMunicipalityId())
  const [selectedPolicy, setSelectedPolicy] = useState<RUCPolicy | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [activatingPolicyId, setActivatingPolicyId] = useState<string | null>(null)
  const [activatedPolicyIds, setActivatedPolicyIds] = useState<Set<string>>(() => new Set())

  // Fetch RUC policies from API
  const { data: policiesResponse, isLoading, error, refetch } = useRUCPoliciesList({
    municipalityId: selectedMunicipalityId,
    active: undefined,
  })
  
  // Mutations
  const createMutation = useCreateRUCPolicy({
    onSuccess: () => {
      toast.success("RUC policy created successfully")
      setIsCreateOpen(false)
      setSelectedMunicipalityId(policyForm.municipalityId)
      resetForm()
    },
    onError: (error: unknown) => {
      toast.error(`Failed to create RUC policy: ${getApiErrorMessage(error, "Create request failed")}`)
    },
  })

  const updateMutation = useUpdateRUCPolicy(selectedPolicy?.id || "", {
    onSuccess: () => {
      toast.success("RUC policy updated successfully")
      setIsEditOpen(false)
      setSelectedPolicy(null)
    },
    onError: (error: unknown) => {
      toast.error(`Failed to update RUC policy: ${getApiErrorMessage(error, "Update request failed")}`)
    },
  })

  const activateMutation = useActivateRUCPolicy({
    onSuccess: (_data, policy) => {
      setActivatedPolicyIds((current) => {
        const next = new Set(current)
        next.add(policy.id)
        return next
      })
      setActivatingPolicyId(null)
      toast.success("RUC policy activated")
    },
    onError: (error: unknown) => {
      setActivatingPolicyId(null)
      toast.error(`Failed to activate RUC policy: ${getApiErrorMessage(error, "Activation request failed")}`)
    },
  })

  // Extract policies from response
  const policies = policiesResponse?.data || policiesResponse?.content || []
  const activePolicy = policies.find((p: RUCPolicy) => p.active || activatedPolicyIds.has(p.id))
  
  const [policyForm, setPolicyForm] = useState({
    municipalityId: getStoredMunicipalityId(),
    specialPermitCapacityThreshold: 20000,
    specialPermitCapacityUnit: POLICY_CAPACITY_UNIT,
    gracePeriodHours: 168 // 7 days default
  })

  const resetForm = () => {
    const municipalityId = getStoredMunicipalityId()
    setSelectedMunicipalityId(municipalityId)
    setPolicyForm({
      municipalityId,
      specialPermitCapacityThreshold: 20000,
      specialPermitCapacityUnit: POLICY_CAPACITY_UNIT,
      gracePeriodHours: 168
    })
  }

  const handleCreatePolicy = () => {
    if (!policyForm.municipalityId) {
      toast.error("Create a municipality before creating a RUC policy")
      return
    }

    createMutation.mutate({
      municipalityId: policyForm.municipalityId,
      specialPermitCapacityThreshold: policyForm.specialPermitCapacityThreshold,
      specialPermitCapacityUnit: POLICY_CAPACITY_UNIT,
      gracePeriodHours: policyForm.gracePeriodHours,
      active: true
    }, {
      onSuccess: () => {
        setSelectedMunicipalityId(policyForm.municipalityId)
      },
    })
  }

  const handleUpdatePolicy = () => {
    if (!selectedPolicy) return
    updateMutation.mutate({
      municipalityId: policyForm.municipalityId || selectedPolicy.municipalityId,
      specialPermitCapacityThreshold: policyForm.specialPermitCapacityThreshold,
      specialPermitCapacityUnit: POLICY_CAPACITY_UNIT,
      gracePeriodHours: policyForm.gracePeriodHours
    })
  }

  const handleActivatePolicy = (policy: RUCPolicy) => {
    setActivatingPolicyId(policy.id)
    activateMutation.mutate(policy)
  }

  const handleEditClick = (policy: RUCPolicy) => {
    setSelectedPolicy(policy)
    setPolicyForm({
      municipalityId: policy.municipalityId,
      specialPermitCapacityThreshold: policy.specialPermitCapacityThreshold,
      specialPermitCapacityUnit: POLICY_CAPACITY_UNIT,
      gracePeriodHours: policy.gracePeriodHours
    })
    setIsEditOpen(true)
  }

  const handleViewPolicy = (policy: RUCPolicy) => {
    setSelectedPolicy(policy)
    setIsViewOpen(true)
  }

  const openCreatePolicy = () => {
    resetForm()
    setIsCreateOpen(true)
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
            <Skeleton className="h-10 w-96 mb-2" />
            <Skeleton className="h-6 w-[500px]" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
          <h1 className="text-4xl font-semibold text-foreground">RUC Policy Configuration</h1>
          <p className="text-lg text-muted-foreground">Manage Road User Charge policy settings and thresholds</p>
        </div>
        <Button onClick={openCreatePolicy} disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Create RUC Policy
        </Button>
      </div>

      {/* Active Policy Overview Card */}
      {activePolicy && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Active Policy</CardTitle>
                <CardDescription className="text-base">
                  Currently enforced RUC policy for {getMunicipalityDisplayName(selectedMunicipalityId)}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => handleViewPolicy(activePolicy)}>
                <Info className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Permit Threshold</p>
                  <p className="text-2xl font-semibold">{activePolicy.specialPermitCapacityThreshold.toLocaleString()} {POLICY_CAPACITY_UNIT_LABEL}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Grace Period</p>
                  <p className="text-2xl font-semibold">{activePolicy.gracePeriodHours} hours ({Math.round(activePolicy.gracePeriodHours / 24)} days)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Policies Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">RUC Policies</CardTitle>
              <CardDescription className="text-base">
                Manage policies for {getMunicipalityDisplayName(selectedMunicipalityId)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load RUC policies</h3>
              <p className="text-muted-foreground mb-4">{getApiErrorMessage(error, "An error occurred")}</p>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : policies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No RUC policies found</h3>
              <p className="text-muted-foreground">Create a RUC policy for {getMunicipalityDisplayName(selectedMunicipalityId)}.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Threshold ({POLICY_CAPACITY_UNIT_LABEL})</TableHead>
                  <TableHead className="text-base">Grace Period (hours)</TableHead>
                  <TableHead className="text-base">Created</TableHead>
                  <TableHead className="text-base">Status</TableHead>
                  <TableHead className="text-right text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy: RUCPolicy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="text-base">{policy.specialPermitCapacityThreshold.toLocaleString()}</TableCell>
                    <TableCell className="text-base">{policy.gracePeriodHours} ({Math.round(policy.gracePeriodHours / 24)}d)</TableCell>
                    <TableCell className="text-base">{policy.createdAt?.split('T')[0] || "-"}</TableCell>
                    <TableCell>{getStatusBadge(policy.active || activatedPolicyIds.has(policy.id))}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPolicy(policy)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(policy)}
                          disabled={updateMutation.isPending}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!(policy.active || activatedPolicyIds.has(policy.id)) && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleActivatePolicy(policy)}
                              disabled={activatingPolicyId === policy.id}
                            >
                              {activatingPolicyId === policy.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Activate"
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

      <Sheet
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open && createMutation.isPending) return
          setIsCreateOpen(open)
        }}
      >
        <SheetContent side="right" className="w-[560px] p-0 sm:max-w-[560px]">
          <SheetHeader className="border-b border-border bg-muted/40 px-6 py-4 pr-14">
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#5B8C5A]" />
              Create RUC Policy
            </SheetTitle>
            <SheetDescription>
              Define a new Road User Charge policy configuration.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto bg-muted/20 px-6 py-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Policy Scope</p>
                <p className="text-sm text-muted-foreground">
                  This policy will be created as active for the selected municipality so special permit requests can pass backend validation.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-[#DAA22A]/40 bg-[#DAA22A]/10 p-4">
              <div className="flex gap-3">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#8A6414]" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Weight unit policy</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter and review all capacity thresholds in kilograms ({POLICY_CAPACITY_UNIT_LABEL}), not tonnes.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Municipality</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-3 text-base font-medium">
                {getMunicipalityDisplayName(policyForm.municipalityId)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold" className="text-base">Special Permit Capacity Threshold *</Label>
              <Input
                id="threshold"
                type="number"
                value={policyForm.specialPermitCapacityThreshold}
                onChange={(e) => setPolicyForm({ 
                  ...policyForm, 
                  specialPermitCapacityThreshold: parseInt(e.target.value) || 0 
                })}
                placeholder="e.g., 8000"
                className="text-base h-11"
              />
              <p className="text-sm text-muted-foreground">
                Vehicles at or above this threshold require a special permit route request. Use kilograms ({POLICY_CAPACITY_UNIT_LABEL}), not tonnes.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gracePeriod" className="text-base">Grace Period (hours) *</Label>
              <Input
                id="gracePeriod"
                type="number"
                value={policyForm.gracePeriodHours}
                onChange={(e) => setPolicyForm({ 
                  ...policyForm, 
                  gracePeriodHours: parseInt(e.target.value) || 0 
                })}
                placeholder="e.g., 168 (7 days)"
                className="text-base h-11"
              />
              <p className="text-sm text-muted-foreground">
                Hours allowed for permit renewal before enforcement (168 hours = 7 days)
              </p>
            </div>
          </div>

          <SheetFooter className="border-t border-border bg-background px-6 py-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleCreatePolicy} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Policy"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Edit Policy Modal */}
      <Modal open={isEditOpen} onOpenChange={setIsEditOpen} className="w-full max-w-2xl">
        <ModalHeader onClose={() => setIsEditOpen(false)}>
          <ModalTitle>Edit RUC Policy</ModalTitle>
          <ModalDescription>Update Road User Charge policy configuration</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base">Municipality</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-3 text-base font-medium">
                {getMunicipalityDisplayName(policyForm.municipalityId)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-threshold" className="text-base">Special Permit Capacity Threshold *</Label>
              <Input
                id="edit-threshold"
                type="number"
                value={policyForm.specialPermitCapacityThreshold}
                onChange={(e) => setPolicyForm({ 
                  ...policyForm, 
                  specialPermitCapacityThreshold: parseInt(e.target.value) || 0 
                })}
                placeholder="e.g., 8000"
                className="text-base h-11"
              />
              <p className="text-sm text-muted-foreground">
                Vehicles exceeding this weight require circulation licence. Use kilograms ({POLICY_CAPACITY_UNIT_LABEL}), not tonnes.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-gracePeriod" className="text-base">Grace Period (hours) *</Label>
              <Input
                id="edit-gracePeriod"
                type="number"
                value={policyForm.gracePeriodHours}
                onChange={(e) => setPolicyForm({ 
                  ...policyForm, 
                  gracePeriodHours: parseInt(e.target.value) || 0 
                })}
                placeholder="e.g., 168 (7 days)"
                className="text-base h-11"
              />
              <p className="text-sm text-muted-foreground">
                Hours allowed for permit renewal before enforcement (168 hours = 7 days)
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Important</p>
                  <p className="text-sm text-amber-800 mt-1">
                    Changes to RUC policy will affect all vehicles and permits immediately. 
                    Capacity thresholds must remain in kilograms ({POLICY_CAPACITY_UNIT_LABEL}), not tonnes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpdatePolicy} disabled={updateMutation.isPending}>
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

      {/* View Policy Modal */}
      <Modal open={isViewOpen} onOpenChange={setIsViewOpen} className="w-full max-w-2xl">
        <ModalHeader onClose={() => setIsViewOpen(false)}>
          <ModalTitle>RUC Policy Details</ModalTitle>
          <ModalDescription>View policy configuration</ModalDescription>
        </ModalHeader>
        <ModalBody>
          {selectedPolicy && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(selectedPolicy.active || activatedPolicyIds.has(selectedPolicy.id))}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Municipality</p>
                  <p className="text-base font-semibold">{getMunicipalityDisplayName(selectedPolicy.municipalityId)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Special Permit Capacity Threshold</p>
                  <p className="text-2xl font-semibold">{selectedPolicy.specialPermitCapacityThreshold.toLocaleString()} {POLICY_CAPACITY_UNIT_LABEL}</p>
                  <p className="text-sm text-muted-foreground">Stored as kilograms, not tonnes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Grace Period</p>
                  <p className="text-2xl font-semibold">{selectedPolicy.gracePeriodHours} hours</p>
                  <p className="text-sm text-muted-foreground">({Math.round(selectedPolicy.gracePeriodHours / 24)} days)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="text-base">{selectedPolicy.createdAt?.split('T')[0] || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Activated</p>
                  <p className="text-base">
                    {activatedPolicyIds.has(selectedPolicy.id)
                      ? new Date().toISOString().split("T")[0]
                      : selectedPolicy.activatedAt?.split('T')[0] || "Not activated"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setIsViewOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
