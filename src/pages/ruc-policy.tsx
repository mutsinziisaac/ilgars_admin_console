import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Settings, Edit, Info, Plus, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import {
  useRUCPoliciesList,
  useCreateRUCPolicy,
  useUpdateRUCPolicy,
  useActivateRUCPolicy,
} from "@/lib/api/ruc-policies/hooks"
import type { RUCPolicy } from "@/lib/api/ruc-policies/schemas"

export function RUCPolicyPage() {
  const [selectedPolicy, setSelectedPolicy] = useState<RUCPolicy | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [activatingPolicyId, setActivatingPolicyId] = useState<string | null>(null)
  const [activatedPolicyIds, setActivatedPolicyIds] = useState<Set<string>>(() => new Set())

  // Fetch RUC policies from API
  const { data: policiesResponse, isLoading, error, refetch } = useRUCPoliciesList({ active: undefined })
  
  // Mutations
  const createMutation = useCreateRUCPolicy({
    onSuccess: () => {
      toast.success("RUC policy created successfully")
      setIsCreateOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(`Failed to create RUC policy: ${error.message}`)
    },
  })

  const updateMutation = useUpdateRUCPolicy(selectedPolicy?.id || "", {
    onSuccess: () => {
      toast.success("RUC policy updated successfully")
      setIsEditOpen(false)
      setSelectedPolicy(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to update RUC policy: ${error.message}`)
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
    onError: (error: any) => {
      setActivatingPolicyId(null)
      toast.error(`Failed to activate RUC policy: ${error.message}`)
    },
  })

  // Extract policies from response
  const policies = policiesResponse?.data || policiesResponse?.content || []
  const activePolicy = policies.find((p: RUCPolicy) => p.active || activatedPolicyIds.has(p.id))
  
  const [policyForm, setPolicyForm] = useState({
    specialPermitCapacityThreshold: 8000,
    specialPermitCapacityUnit: "TONNES",
    gracePeriodHours: 168 // 7 days default
  })

  const resetForm = () => {
    setPolicyForm({
      specialPermitCapacityThreshold: 8000,
      specialPermitCapacityUnit: "TONNES",
      gracePeriodHours: 168
    })
  }

  const handleCreatePolicy = () => {
    createMutation.mutate({
      specialPermitCapacityThreshold: policyForm.specialPermitCapacityThreshold,
      specialPermitCapacityUnit: policyForm.specialPermitCapacityUnit,
      gracePeriodHours: policyForm.gracePeriodHours,
      active: false
    })
  }

  const handleUpdatePolicy = () => {
    if (!selectedPolicy) return
    updateMutation.mutate({
      specialPermitCapacityThreshold: policyForm.specialPermitCapacityThreshold,
      specialPermitCapacityUnit: policyForm.specialPermitCapacityUnit,
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
      specialPermitCapacityThreshold: policy.specialPermitCapacityThreshold,
      specialPermitCapacityUnit: policy.specialPermitCapacityUnit,
      gracePeriodHours: policy.gracePeriodHours
    })
    setIsEditOpen(true)
  }

  const handleViewPolicy = (policy: RUCPolicy) => {
    setSelectedPolicy(policy)
    setIsViewOpen(true)
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
        <Button onClick={() => setIsCreateOpen(true)} disabled={createMutation.isPending}>
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
                  Currently enforced RUC policy configuration
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
                  <p className="text-2xl font-semibold">{activePolicy.specialPermitCapacityThreshold.toLocaleString()} {activePolicy.specialPermitCapacityUnit}</p>
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
          <CardTitle className="text-2xl">RUC Policies</CardTitle>
          <CardDescription className="text-base">
            Manage all RUC policy configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load RUC policies</h3>
              <p className="text-muted-foreground mb-4">{(error as any)?.message || "An error occurred"}</p>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : policies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No RUC policies found</h3>
              <p className="text-muted-foreground">Create your first RUC policy to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Threshold ({policies[0]?.specialPermitCapacityUnit})</TableHead>
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

      {/* Create Policy Modal */}
      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen} className="w-full max-w-2xl">
        <ModalHeader onClose={() => setIsCreateOpen(false)}>
          <ModalTitle>Create RUC Policy</ModalTitle>
          <ModalDescription>Define a new Road User Charge policy configuration</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
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
                Vehicles exceeding this weight require circulation licence (in {policyForm.specialPermitCapacityUnit})
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
        </ModalBody>
        <ModalFooter>
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
        </ModalFooter>
      </Modal>

      {/* Edit Policy Modal */}
      <Modal open={isEditOpen} onOpenChange={setIsEditOpen} className="w-full max-w-2xl">
        <ModalHeader onClose={() => setIsEditOpen(false)}>
          <ModalTitle>Edit RUC Policy</ModalTitle>
          <ModalDescription>Update Road User Charge policy configuration</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
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
                Vehicles exceeding this weight require circulation licence
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
                    Ensure you review the impact before saving.
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
                  <p className="text-sm text-muted-foreground mb-1">Municipality ID</p>
                  <p className="text-base font-mono text-sm">{selectedPolicy.municipalityId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Special Permit Capacity Threshold</p>
                  <p className="text-2xl font-semibold">{selectedPolicy.specialPermitCapacityThreshold.toLocaleString()} {selectedPolicy.specialPermitCapacityUnit}</p>
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
