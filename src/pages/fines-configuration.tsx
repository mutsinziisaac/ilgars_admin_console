import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Edit, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  useCreateFinePolicy,
  useFinePoliciesList,
  useUpdateFinePolicy,
} from "@/lib/api/fine-policies/hooks"
import type { FinePolicy } from "@/lib/api/fine-policies/schemas"
import {
  getMunicipalityDisplayName,
  getStoredMunicipalityId,
} from "@/lib/municipality-registry"

const defaultFineForm = {
  municipalityId: getStoredMunicipalityId(),
  code: "",
  trigger: "",
  gracePeriodHours: 0,
  baseAmount: 0,
  incrementAmount: 0,
  incrementEveryHours: 0,
  appliesWhileInside: true,
  active: true,
}

type FinePolicyForm = typeof defaultFineForm

const fineTriggerOptions = [
  { value: "OVERWEIGHT", label: "Overweight" },
  { value: "EXPIRED_PERMIT", label: "Expired Permit" },
  { value: "NO_CIRCULATION_LICENSE", label: "No Circulation License" },
  { value: "UNAUTHORIZED_ROUTE", label: "Unauthorized Route" },
]

export function FinesConfigurationPage() {
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState(getStoredMunicipalityId())
  const [selectedPolicy, setSelectedPolicy] = useState<FinePolicy | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [fineForm, setFineForm] = useState<FinePolicyForm>({
    ...defaultFineForm,
    municipalityId: selectedMunicipalityId,
  })

  const { data, isLoading, error, refetch } = useFinePoliciesList({
    municipalityId: selectedMunicipalityId,
    active: true,
  })
  const createMutation = useCreateFinePolicy()
  const updateMutation = useUpdateFinePolicy()
  const finePolicies = data?.data ?? data?.content ?? []

  const resetForm = (municipalityId = selectedMunicipalityId) => {
    setFineForm({
      ...defaultFineForm,
      municipalityId,
    })
  }

  const openCreateFine = () => {
    const municipalityId = getStoredMunicipalityId()
    setSelectedMunicipalityId(municipalityId)
    resetForm(municipalityId)
    setIsCreateOpen(true)
  }

  const openEditFine = (policy: FinePolicy) => {
    setSelectedPolicy(policy)
    setFineForm({
      municipalityId: policy.municipalityId,
      code: policy.code,
      trigger: policy.trigger,
      gracePeriodHours: policy.gracePeriodHours,
      baseAmount: policy.baseAmount,
      incrementAmount: policy.incrementAmount,
      incrementEveryHours: policy.incrementEveryHours,
      appliesWhileInside: policy.appliesWhileInside,
      active: policy.active,
    })
    setIsEditOpen(true)
  }

  const handleCreateFine = () => {
    if (!fineForm.municipalityId) {
      toast.error("Create a municipality before creating a fine policy")
      return
    }

    createMutation.mutate(fineForm, {
      onSuccess: () => {
        setSelectedMunicipalityId(fineForm.municipalityId)
        setIsCreateOpen(false)
        resetForm(fineForm.municipalityId)
        toast.success("Fine policy created successfully")
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to create fine policy")
      },
    })
  }

  const handleUpdateFine = () => {
    if (!selectedPolicy) return

    updateMutation.mutate(
      {
        id: selectedPolicy.id,
        payload: {
          ...fineForm,
          municipalityId: selectedPolicy.municipalityId,
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false)
          setSelectedPolicy(null)
          toast.success("Fine policy updated successfully")
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to update fine policy")
        },
      },
    )
  }

  const renderFineFormFields = (isEdit = false) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base">Municipality</Label>
        <div className="rounded-md border bg-muted/40 px-3 py-3 text-base font-medium">
          {getMunicipalityDisplayName(fineForm.municipalityId)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? "edit-" : ""}code`} className="text-base">Policy Code *</Label>
          <Input
            id={`${isEdit ? "edit-" : ""}code`}
            value={fineForm.code}
            onChange={(event) => setFineForm({ ...fineForm, code: event.target.value })}
            placeholder="e.g., OVERWEIGHT_0_10"
            className="h-11 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? "edit-" : ""}trigger`} className="text-base">Trigger *</Label>
          <Select
            value={fineForm.trigger}
            onValueChange={(trigger) => setFineForm({ ...fineForm, trigger })}
          >
            <SelectTrigger id={`${isEdit ? "edit-" : ""}trigger`} className="h-11 text-base">
              <SelectValue placeholder="Select trigger" />
            </SelectTrigger>
            <SelectContent>
              {fineTriggerOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-base">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? "edit-" : ""}baseAmount`} className="text-base">Base Amount (MZN) *</Label>
          <Input
            id={`${isEdit ? "edit-" : ""}baseAmount`}
            type="number"
            value={fineForm.baseAmount}
            onChange={(event) => setFineForm({ ...fineForm, baseAmount: Number(event.target.value) || 0 })}
            className="h-11 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? "edit-" : ""}gracePeriodHours`} className="text-base">Grace Period (hours)</Label>
          <Input
            id={`${isEdit ? "edit-" : ""}gracePeriodHours`}
            type="number"
            value={fineForm.gracePeriodHours}
            onChange={(event) => setFineForm({ ...fineForm, gracePeriodHours: Number(event.target.value) || 0 })}
            className="h-11 text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? "edit-" : ""}incrementAmount`} className="text-base">Increment Amount (MZN)</Label>
          <Input
            id={`${isEdit ? "edit-" : ""}incrementAmount`}
            type="number"
            value={fineForm.incrementAmount}
            onChange={(event) => setFineForm({ ...fineForm, incrementAmount: Number(event.target.value) || 0 })}
            className="h-11 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? "edit-" : ""}incrementEveryHours`} className="text-base">Increment Every (hours)</Label>
          <Input
            id={`${isEdit ? "edit-" : ""}incrementEveryHours`}
            type="number"
            value={fineForm.incrementEveryHours}
            onChange={(event) => setFineForm({ ...fineForm, incrementEveryHours: Number(event.target.value) || 0 })}
            className="h-11 text-base"
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Fines Configuration</h1>
          <p className="text-lg text-muted-foreground">Configure municipality-specific violation fines and penalties</p>
        </div>
        <Button onClick={openCreateFine} disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Create Fine Policy
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Fine Policies</CardTitle>
              <CardDescription className="text-base">
                Policies for {getMunicipalityDisplayName(selectedMunicipalityId)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
              <h3 className="mb-2 text-lg font-semibold">Failed to load fine policies</h3>
              <p className="mb-4 text-muted-foreground">{(error as Error)?.message || "An error occurred"}</p>
              <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-3 rounded-md border border-dashed p-5 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading fine policies...</span>
            </div>
          ) : finePolicies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No fine policies found</h3>
              <p className="text-muted-foreground">Create a fine policy for {getMunicipalityDisplayName(selectedMunicipalityId)}.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Code</TableHead>
                  <TableHead className="text-base">Trigger</TableHead>
                  <TableHead className="text-base text-right">Base Amount</TableHead>
                  <TableHead className="text-base text-right">Increment</TableHead>
                  <TableHead className="text-base text-right">Grace</TableHead>
                  <TableHead className="text-right text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finePolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="text-base font-medium">{policy.code}</TableCell>
                    <TableCell className="text-base">{policy.trigger}</TableCell>
                    <TableCell className="text-right text-base font-semibold">{policy.baseAmount.toLocaleString()} MZN</TableCell>
                    <TableCell className="text-right text-base">{policy.incrementAmount.toLocaleString()} / {policy.incrementEveryHours}h</TableCell>
                    <TableCell className="text-right text-base">{policy.gracePeriodHours}h</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditFine(policy)}>
                          <Edit className="h-4 w-4" />
                        </Button>
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
              <AlertCircle className="h-5 w-5 text-[#5B8C5A]" />
              Create Fine Policy
            </SheetTitle>
            <SheetDescription>
              Add a municipality-specific fine policy.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto bg-muted/20 px-6 py-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Fine Policy Scope</p>
                <p className="text-sm text-muted-foreground">
                  This policy will be used to calculate violation fines for the selected municipality.
                </p>
              </div>
            </div>
            {renderFineFormFields()}
          </div>

          <SheetFooter className="border-t border-border bg-background px-6 py-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={createMutation.isPending}>Cancel</Button>
            <Button onClick={handleCreateFine} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Fine Policy"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open && updateMutation.isPending) return
          setIsEditOpen(open)
          if (!open) setSelectedPolicy(null)
        }}
      >
        <SheetContent side="right" className="w-[560px] p-0 sm:max-w-[560px]">
          <SheetHeader className="border-b border-border bg-muted/40 px-6 py-4 pr-14">
            <SheetTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-[#5B8C5A]" />
              Edit Fine Policy
            </SheetTitle>
            <SheetDescription>
              Update the fine policy for {getMunicipalityDisplayName(fineForm.municipalityId)}.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto bg-muted/20 px-6 py-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Fine Policy Scope</p>
                <p className="text-sm text-muted-foreground">
                  Changes update how this violation fine is calculated for the municipality.
                </p>
              </div>
            </div>
            {renderFineFormFields(true)}
          </div>

          <SheetFooter className="border-t border-border bg-background px-6 py-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false)
                setSelectedPolicy(null)
              }}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateFine} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
