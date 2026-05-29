import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, Eye, Receipt, Search, Truck, XCircle } from "lucide-react"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/api"
import { useEnforcementOfficersList } from "@/lib/api/enforcement/hooks"
import type { EnforcementOfficer } from "@/lib/api/enforcement/schemas"
import type { SpecialPermit } from "@/lib/api/special-permits/schemas"
import {
  useApproveSpecialPermit,
  useReviewSpecialPermitRouteRequest,
  useSpecialPermitDetail,
  useSpecialPermitRouteRequestsList,
  useSpecialPermitsList,
  useUpdateSpecialPermitPaymentStatus,
} from "@/lib/api/special-permits/hooks"
import { useAuthorization } from "@/lib/auth/authorization"
import { userManager } from "@/lib/userManager"

type PermitStatus = "PENDING" | "APPROVED" | "REJECTED" | string

type RouteApprovalForm = {
  routeCode: string
  roadType: string
  escortReference: string
  notes: string
}

const emptyRouteApprovalForm: RouteApprovalForm = {
  routeCode: "",
  roadType: "PRIMARY_ROAD",
  escortReference: "",
  notes: "Approved",
}

const firstString = (...values: unknown[]) =>
  values.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim()

const formatDate = (value: unknown) => {
  const text = firstString(value)
  if (!text) return "N/A"

  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return text

  return date.toISOString().split("T")[0]
}

const normalizeStatus = (status: unknown): PermitStatus => {
  const value = firstString(status)?.toUpperCase() ?? "PENDING"
  if (["PENDING_APPROVAL", "PENDING_ADMIN_APPROVAL", "PENDING_SECURITY_REVIEW", "AWAITING_APPROVAL", "SUBMITTED"].includes(value)) return "PENDING"
  if (["APPROVED", "ACTIVE", "ISSUED"].includes(value)) return "APPROVED"
  if (["REJECTED", "DECLINED"].includes(value)) return "REJECTED"
  return value
}

const getPlateNumber = (permit: SpecialPermit) =>
  firstString(permit.vehiclePlate, permit.plateNumber, permit.vehicleRegistration, permit.truckNumber) || "N/A"

const getApplicant = (permit: SpecialPermit) =>
  firstString(permit.applicantName, permit.requestedBy, permit.operatorName, permit.ownerName, permit.companyName) || "N/A"

const getContact = (permit: SpecialPermit) =>
  firstString(permit.applicantContact, permit.applicantPhone, permit.phoneNumber, permit.contactPhone) || "N/A"

const getPermitType = (permit: SpecialPermit) =>
  firstString(permit.permitType, permit.authorizationType, permit.type, permit.routeName) || "Special Permit"

const getVehicleClass = (permit: SpecialPermit) =>
  firstString(permit.vehicleClass, permit.vehicleType, permit.classification) || "N/A"

const getWeight = (permit: SpecialPermit) => {
  const weight = permit.grossWeightKg ?? permit.grossWeight ?? permit.vehicleCapacitySnapshot
  const unit = firstString(permit.capacityUnit) ?? "kg"
  return typeof weight === "number" && Number.isFinite(weight) ? `${weight.toLocaleString()} ${unit.toLowerCase()}` : "N/A"
}

const getReason = (permit: SpecialPermit) =>
  firstString(permit.travelReason, permit.reason, permit.justification, permit.notes, permit.conditions) || "Not specified"

const getStatusBadge = (status: PermitStatus) => {
  const normalized = normalizeStatus(status)

  if (normalized === "APPROVED") {
    return (
      <Badge className="bg-[#D6F0E0] text-[#1C1C1C] text-sm px-3 py-1 gap-1">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approved
      </Badge>
    )
  }

  if (normalized === "PENDING") {
    return (
      <Badge className="bg-[#DAA22A] text-[#1C1C1C] text-sm px-3 py-1 gap-1">
        <Clock className="h-3.5 w-3.5" />
        Pending
      </Badge>
    )
  }

  if (normalized === "REJECTED") {
    return (
      <Badge className="bg-[#E5533D] text-white text-sm px-3 py-1 gap-1">
        <XCircle className="h-3.5 w-3.5" />
        Rejected
      </Badge>
    )
  }

  return <Badge variant="outline" className="text-sm px-3 py-1">{normalized}</Badge>
}

const getTypeBadge = (type: string) => (
  <Badge variant="outline" className="!bg-[#4A90E2] !text-white !border-[#4A90E2]">
    {type.replaceAll("_", " ")}
  </Badge>
)

const getOfficerName = (officer: EnforcementOfficer) => {
  const fullName = [officer.firstName, officer.lastName].filter(Boolean).join(" ")
  return firstString(
    officer.officerName,
    officer.displayName,
    officer.name,
    fullName,
    officer.preferredUsername,
    officer.username,
    officer.officerSubject,
    officer.id,
  ) || "Unnamed Officer"
}

const getOfficerReference = (officer: EnforcementOfficer) =>
  firstString(
    officer.officerSubject,
    officer.subject,
    officer.userSubject,
    officer.userId,
    officer.id,
    officer.username,
    officer.preferredUsername,
    officer.officerName,
    officer.name,
  ) || ""

const buildRouteCode = (permit: SpecialPermit) => {
  const name = firstString(permit.routeCode, permit.routeName)
  const code = name
    ?.toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32)

  return code || `ROUTE-${permit.id.slice(0, 8).toUpperCase()}`
}

const getCurrentApprover = async () => {
  let user = await userManager.getUser()

  if (!user?.access_token?.trim()) {
    user = await userManager.signinSilent()
  }

  return (
    user?.profile?.name ||
    user?.profile?.preferred_username ||
    user?.profile?.email ||
    "Current User"
  )
}

export function SpecialPermitsPage() {
  const { hasPermission } = useAuthorization()
  const canApprovePermits = hasPermission("permits:approve")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPermitId, setSelectedPermitId] = useState<string | null>(null)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRouteApproveOpen, setIsRouteApproveOpen] = useState(false)
  const [isRouteRejectOpen, setIsRouteRejectOpen] = useState(false)
  const [escortReference, setEscortReference] = useState("")
  const [routeApprovalForm, setRouteApprovalForm] = useState<RouteApprovalForm>(emptyRouteApprovalForm)
  const [routeRejectNotes, setRouteRejectNotes] = useState("")
  const itemsPerPage = 10

  const listParams = {
    page: 0,
    size: 100,
  }
  const specialPermitsQuery = useSpecialPermitsList(listParams)
  const routeRequestsQuery = useSpecialPermitRouteRequestsList(listParams)
  const activeOfficersQuery = useEnforcementOfficersList({ page: 0, size: 100, status: "ACTIVE" })
  const activeOfficers = activeOfficersQuery.data?.data ?? []
  const shouldLoadFallbackOfficers =
    !activeOfficersQuery.isLoading && (activeOfficersQuery.isError || activeOfficers.length === 0)
  const allOfficersQuery = useEnforcementOfficersList(
    { page: 0, size: 100 },
    { enabled: shouldLoadFallbackOfficers },
  )
  const approveMutation = useApproveSpecialPermit()
  const routeReviewMutation = useReviewSpecialPermitRouteRequest()
  const paymentMutation = useUpdateSpecialPermitPaymentStatus()

  const routeRequests = routeRequestsQuery.data?.data ?? []
  const fallbackOfficers = allOfficersQuery.data?.data ?? []
  const officers = activeOfficers.length > 0 ? activeOfficers : fallbackOfficers
  const officersLoading =
    activeOfficersQuery.isLoading || (shouldLoadFallbackOfficers && allOfficersQuery.isLoading)
  const officersError = allOfficersQuery.error ?? activeOfficersQuery.error
  const refreshOfficers = () => {
    void activeOfficersQuery.refetch()
    void allOfficersQuery.refetch()
  }
  const escortOptions = officers.reduce<Array<{ label: string; value: string }>>((options, officer) => {
    const option = {
      label: getOfficerName(officer),
      value: getOfficerReference(officer),
    }

    if (option.value && !options.some((current) => current.value === option.value)) {
      options.push(option)
    }

    return options
  }, [])
  const routeRequestIds = new Set(routeRequests.map((permit) => permit.id))
  const selectedIsRouteRequest = Boolean(selectedPermitId && routeRequestIds.has(selectedPermitId))
  const detailQuery = useSpecialPermitDetail(selectedPermitId && !selectedIsRouteRequest ? selectedPermitId : null)
  const specialPermits = specialPermitsQuery.data?.data ?? []
  const permits = [...specialPermits, ...routeRequests]
  const isLoading = specialPermitsQuery.isLoading || routeRequestsQuery.isLoading
  const error = specialPermitsQuery.error ?? routeRequestsQuery.error
  const refetch = () => {
    void specialPermitsQuery.refetch()
    void routeRequestsQuery.refetch()
  }
  const normalizedPermits = permits.map((permit) => ({
    permit,
    status: normalizeStatus(permit.status),
    plate: getPlateNumber(permit),
    applicant: getApplicant(permit),
    type: getPermitType(permit),
    createdAt: formatDate(permit.createdAt),
  }))
  const matchesFilters = ({ permit, status, plate, applicant, type }: (typeof normalizedPermits)[number]) => {
    if (statusFilter !== "ALL" && status !== statusFilter) return false

    const query = searchQuery.trim().toLowerCase()
    if (!query) return true

    return [permit.id, plate, applicant, type].some((value) => value.toLowerCase().includes(query))
  }
  const filteredPermits = normalizedPermits.filter(matchesFilters)
  const totalPages = Math.max(1, Math.ceil(filteredPermits.length / itemsPerPage))
  const normalizedCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (normalizedCurrentPage - 1) * itemsPerPage
  const paginatedPermits = filteredPermits.slice(startIndex, startIndex + itemsPerPage)
  const selectedPermit = detailQuery.data?.data ?? permits.find((permit) => permit.id === selectedPermitId) ?? null
  const stats = {
    total: permits.length,
    approved: normalizedPermits.filter(({ status }) => status === "APPROVED").length,
    pending: normalizedPermits.filter(({ status }) => status === "PENDING").length,
    rejected: normalizedPermits.filter(({ status }) => status === "REJECTED").length,
  }

  const handleApprove = async () => {
    if (!selectedPermit) return
    if (!escortReference.trim()) {
      toast.error("Escort reference required", {
        description: "Assign an escort before approving this special permit.",
      })
      return
    }
    if (!canApprovePermits) {
      toast.error("Approval unavailable", {
        description: "Your role does not include permits:approve.",
      })
      return
    }

    try {
      await approveMutation.mutateAsync({
        permitId: selectedPermit.id,
        payload: {
          approvedBy: await getCurrentApprover(),
          escortReference: escortReference.trim(),
        },
      })
      toast.success("Special permit approved", {
        description: `${selectedPermit.id} has been sent to the approval endpoint.`,
      })
      setIsApproveOpen(false)
      setEscortReference("")
      setSelectedPermitId(null)
      refetch()
    } catch (approvalError) {
      toast.error("Failed to approve special permit", {
        description: getApiErrorMessage(approvalError, "Approval request failed"),
      })
    }
  }

  const updateRouteApprovalForm = (field: keyof RouteApprovalForm, value: string) => {
    setRouteApprovalForm((current) => ({ ...current, [field]: value }))
  }

  const openRouteApproveDialog = () => {
    if (!selectedPermit) return

    setRouteApprovalForm({
      routeCode: buildRouteCode(selectedPermit),
      roadType: firstString(selectedPermit.roadType) || "PRIMARY_ROAD",
      escortReference: escortReference.trim(),
      notes: "Approved",
    })
    setIsRouteApproveOpen(true)
  }

  const handleRouteApproval = async () => {
    if (!selectedPermit) return
    if (!routeApprovalForm.routeCode.trim()) {
      toast.error("Route code required", {
        description: "Add the route code before approving this special permit review.",
      })
      return
    }
    if (!routeApprovalForm.roadType.trim()) {
      toast.error("Road type required", {
        description: "Select the road type before approving this special permit review.",
      })
      return
    }
    if (!routeApprovalForm.escortReference.trim()) {
      toast.error("Escort reference required", {
        description: "Assign an escort before approving this special permit review.",
      })
      return
    }
    if (!canApprovePermits) {
      toast.error("Approval unavailable", {
        description: "Your role does not include permits:approve.",
      })
      return
    }

    try {
      await routeReviewMutation.mutateAsync({
        requestId: selectedPermit.id,
        payload: {
          decision: "APPROVED",
          approvedBy: await getCurrentApprover(),
          routeCode: routeApprovalForm.routeCode.trim(),
          roadType: routeApprovalForm.roadType,
          escortReference: routeApprovalForm.escortReference.trim(),
          notes: routeApprovalForm.notes.trim() || "Approved",
        },
      })
      toast.success("Special permit review approved", {
        description: `${selectedPermit.id} was approved.`,
      })
      setIsRouteApproveOpen(false)
      setEscortReference("")
      setRouteApprovalForm(emptyRouteApprovalForm)
      setSelectedPermitId(null)
      refetch()
    } catch (approvalError) {
      toast.error("Failed to approve special permit review", {
        description: getApiErrorMessage(approvalError, "Approval request failed"),
      })
    }
  }

  const handleRouteRejection = async () => {
    if (!selectedPermit) return
    if (!routeRejectNotes.trim()) {
      toast.error("Reject reason required", {
        description: "Add a reason before rejecting this special permit review.",
      })
      return
    }
    if (!canApprovePermits) {
      toast.error("Rejection unavailable", {
        description: "Your role does not include permits:approve.",
      })
      return
    }

    try {
      await routeReviewMutation.mutateAsync({
        requestId: selectedPermit.id,
        payload: {
          decision: "REJECTED",
          approvedBy: await getCurrentApprover(),
          notes: routeRejectNotes.trim(),
        },
      })
      toast.success("Special permit review rejected", {
        description: `${selectedPermit.id} was rejected.`,
      })
      setIsRouteRejectOpen(false)
      setRouteRejectNotes("")
      setSelectedPermitId(null)
      refetch()
    } catch (rejectionError) {
      toast.error("Failed to reject special permit review", {
        description: getApiErrorMessage(rejectionError, "Rejection request failed"),
      })
    }
  }

  const handlePaymentStatus = async (permit: SpecialPermit, paymentStatus: "PAID" | "UNPAID") => {
    try {
      await paymentMutation.mutateAsync({
        permitId: permit.id,
        payload: {
          paymentStatus,
          updatedBy: await getCurrentApprover(),
        },
      })
      toast.success("Payment status updated", {
        description: `${permit.id} marked ${paymentStatus.toLowerCase()}.`,
      })
    } catch (paymentError) {
      toast.error("Failed to update payment status", {
        description: getApiErrorMessage(paymentError, "Payment status request failed"),
      })
    }
  }

  if (selectedPermitId) {
    const isDetailLoading = detailQuery.isLoading && !selectedPermit

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Button
              variant="ghost"
              onClick={() => setSelectedPermitId(null)}
              className="h-10 w-fit px-2 text-base"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to special permits
            </Button>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-semibold text-foreground">Special Permit</h1>
                {selectedPermit ? getStatusBadge(normalizeStatus(selectedPermit.status)) : null}
              </div>
              <p className="text-lg text-muted-foreground">{selectedPermit?.id ?? selectedPermitId}</p>
            </div>
          </div>
          {selectedPermit && normalizeStatus(selectedPermit.status) === "PENDING" && (
            <div className="flex flex-wrap gap-3">
              {selectedIsRouteRequest ? (
                <>
                  <Button
                    onClick={openRouteApproveDialog}
                    disabled={!canApprovePermits || routeReviewMutation.isPending}
                    className="text-base h-11 px-6 bg-green-600"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsRouteRejectOpen(true)}
                    disabled={!canApprovePermits || routeReviewMutation.isPending}
                    className="text-base h-11 px-6 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsApproveOpen(true)}
                  disabled={!canApprovePermits || approveMutation.isPending}
                  className="text-base h-11 px-6 bg-green-600"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              )}
            </div>
          )}
        </div>

        {detailQuery.error ? (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Failed to load special permit details</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getApiErrorMessage(detailQuery.error, "Permit detail request failed")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : isDetailLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : selectedPermit ? (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Permit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Type</Label>
                    <div className="mt-1">{getTypeBadge(getPermitType(selectedPermit))}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <div className="mt-1">{getStatusBadge(normalizeStatus(selectedPermit.status))}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{selectedIsRouteRequest ? "Payment Mode" : "Payment Status"}</Label>
                    <p className="text-base font-medium">
                      {selectedIsRouteRequest
                        ? firstString(selectedPermit.paymentMode) || "N/A"
                        : firstString(selectedPermit.paymentStatus) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Escort Reference</Label>
                    <p className="text-base font-medium">{firstString(selectedPermit.escortReference) || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vehicle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Registration Plate</Label>
                    <p className="text-base font-bold">{getPlateNumber(selectedPermit)}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">Class</Label>
                      <p className="text-base font-medium">{getVehicleClass(selectedPermit)}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Axles</Label>
                      <p className="text-base font-medium">{selectedPermit.axleCount ?? "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">GVW</Label>
                      <p className="text-base font-medium">{getWeight(selectedPermit)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Applicant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Company/Name</Label>
                    <p className="text-base font-bold">{getApplicant(selectedPermit)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Contact</Label>
                    <p className="text-base font-medium">{getContact(selectedPermit)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Submitted Date</Label>
                    <p className="text-base font-medium">{formatDate(selectedPermit.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Travel Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Reason</Label>
                  <p className="text-base font-medium">{getReason(selectedPermit)}</p>
                </div>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm text-muted-foreground">Travel Start</Label>
                    <p className="text-base font-medium">{formatDate(selectedPermit.requestedStartAt ?? selectedPermit.validFrom)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Travel End</Label>
                    <p className="text-base font-medium">{formatDate(selectedPermit.requestedEndAt ?? selectedPermit.validTo)}</p>
                  </div>
                </div>
                {selectedPermit.routeName || selectedPermit.expectedDurationDays ? (
                  <>
                    <Separator />
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm text-muted-foreground">Route Name</Label>
                        <p className="text-base font-medium">{firstString(selectedPermit.routeName) || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Expected Duration</Label>
                        <p className="text-base font-medium">
                          {selectedPermit.expectedDurationDays ? `${selectedPermit.expectedDurationDays} days` : "N/A"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            {!selectedIsRouteRequest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment</CardTitle>
                <CardDescription className="text-base">Update permit payment state</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handlePaymentStatus(selectedPermit, "PAID")}
                    disabled={paymentMutation.isPending}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Mark Paid
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePaymentStatus(selectedPermit, "UNPAID")}
                    disabled={paymentMutation.isPending}
                  >
                    Mark Unpaid
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        ) : null}

        <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
          <DialogContent className="text-base">
            <DialogHeader>
              <DialogTitle className="text-2xl">Approve Special Permit</DialogTitle>
              <DialogDescription className="text-base">
                Assign an escort and approve {selectedPermit?.id}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="escort-reference" className="text-base">Escort Officer *</Label>
              <div className="flex gap-2">
                <select
                  id="escort-reference"
                  value={escortReference}
                  onChange={(event) => setEscortReference(event.target.value)}
                  className="h-11 flex-1 rounded-md border border-input bg-background px-3 text-base text-foreground"
                >
                  <option value="">{officersLoading ? "Loading officers..." : "Select escort officer"}</option>
                  {escortOptions.map((officer) => (
                    <option key={officer.value} value={officer.value}>
                      {officer.label}
                    </option>
                  ))}
                </select>
                <Button type="button" variant="outline" onClick={refreshOfficers} disabled={officersLoading} className="h-11 px-4">
                  Refresh
                </Button>
              </div>
              {officersError ? (
                <p className="text-sm text-destructive">
                  {getApiErrorMessage(officersError, "Failed to load officers")}
                </p>
              ) : !officersLoading && escortOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No officer profiles were returned for this municipality.
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveOpen(false)} className="text-base h-11 px-6">
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={!escortReference.trim() || approveMutation.isPending} className="text-base h-11 px-6 bg-green-600">
                {approveMutation.isPending ? "Approving..." : "Confirm Approval"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRouteApproveOpen} onOpenChange={setIsRouteApproveOpen}>
          <DialogContent className="text-base">
            <DialogHeader>
              <DialogTitle className="text-2xl">Approve Special Permit Review</DialogTitle>
              <DialogDescription className="text-base">
                Confirm the route details for {selectedPermit?.id}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="route-code" className="text-base">Route Code *</Label>
                <Input
                  id="route-code"
                  value={routeApprovalForm.routeCode}
                  onChange={(event) => updateRouteApprovalForm("routeCode", event.target.value)}
                  placeholder="ROUTE-001"
                  className="h-11 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="road-type" className="text-base">Road Type *</Label>
                <Select
                  value={routeApprovalForm.roadType}
                  onValueChange={(value) => updateRouteApprovalForm("roadType", value)}
                >
                  <SelectTrigger id="road-type" className="h-11 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-base">
                    <SelectItem value="PRIMARY_ROAD" className="text-base">Primary Road</SelectItem>
                    <SelectItem value="SECONDARY_ROAD" className="text-base">Secondary Road</SelectItem>
                    <SelectItem value="LOCAL_ROAD" className="text-base">Local Road</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="route-escort-reference" className="text-base">Escort Officer *</Label>
                <div className="flex gap-2">
                  <select
                    id="route-escort-reference"
                    value={routeApprovalForm.escortReference}
                    onChange={(event) => updateRouteApprovalForm("escortReference", event.target.value)}
                    className="h-11 flex-1 rounded-md border border-input bg-background px-3 text-base text-foreground"
                  >
                    <option value="">{officersLoading ? "Loading officers..." : "Select escort officer"}</option>
                    {escortOptions.map((officer) => (
                      <option key={officer.value} value={officer.value}>
                        {officer.label}
                      </option>
                    ))}
                  </select>
                  <Button type="button" variant="outline" onClick={refreshOfficers} disabled={officersLoading} className="h-11 px-4">
                    Refresh
                  </Button>
                </div>
                {officersError ? (
                  <p className="text-sm text-destructive">
                    {getApiErrorMessage(officersError, "Failed to load officers")}
                  </p>
                ) : !officersLoading && escortOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No officer profiles were returned for this municipality.
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="route-approval-notes" className="text-base">Notes</Label>
                <Textarea
                  id="route-approval-notes"
                  value={routeApprovalForm.notes}
                  onChange={(event) => updateRouteApprovalForm("notes", event.target.value)}
                  className="min-h-24 text-base"
                  placeholder="Approved"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRouteApproveOpen(false)} className="text-base h-11 px-6">
                Cancel
              </Button>
              <Button
                onClick={handleRouteApproval}
                disabled={
                  !routeApprovalForm.routeCode.trim() ||
                  !routeApprovalForm.roadType.trim() ||
                  !routeApprovalForm.escortReference.trim() ||
                  routeReviewMutation.isPending
                }
                className="text-base h-11 px-6 bg-green-600"
              >
                {routeReviewMutation.isPending ? "Approving..." : "Confirm Approval"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRouteRejectOpen} onOpenChange={setIsRouteRejectOpen}>
          <DialogContent className="text-base">
            <DialogHeader>
              <DialogTitle className="text-2xl">Reject Special Permit Review</DialogTitle>
              <DialogDescription className="text-base">
                Add the rejection reason for {selectedPermit?.id}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="route-reject-notes" className="text-base">Reject Reason *</Label>
              <Textarea
                id="route-reject-notes"
                value={routeRejectNotes}
                onChange={(event) => setRouteRejectNotes(event.target.value)}
                className="min-h-28 text-base"
                placeholder="Rejected reason"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRouteRejectOpen(false)} className="text-base h-11 px-6">
                Cancel
              </Button>
              <Button
                onClick={handleRouteRejection}
                disabled={!routeRejectNotes.trim() || routeReviewMutation.isPending}
                className="text-base h-11 px-6 bg-red-600"
              >
                {routeReviewMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Special Permits</h1>
          <p className="text-lg text-muted-foreground">Review pending route submissions and manage special permits</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Special Permits</CardDescription>
            <CardTitle className="text-4xl">{isLoading ? <Skeleton className="h-10 w-16" /> : stats.total}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-base text-muted-foreground">Permits and pending reviews</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Pending Review</CardDescription>
            <CardTitle className="text-4xl text-yellow-600">{isLoading ? <Skeleton className="h-10 w-16" /> : stats.pending}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-base text-muted-foreground">Awaiting action</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Approved</CardDescription>
            <CardTitle className="text-4xl text-green-600">{isLoading ? <Skeleton className="h-10 w-16" /> : stats.approved}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-base text-muted-foreground">Approved permits</p></CardContent>
        </Card>
      </div>

      {error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-semibold">Failed to load special permits</p>
                <p className="text-sm text-muted-foreground mt-1">{getApiErrorMessage(error, "Special permits request failed")}</p>
              </div>
              <Button onClick={() => refetch()} variant="outline" size="sm">Retry</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-2xl">Special Permits</CardTitle>
              <CardDescription className="text-base">Special permits plus pending route submissions ready for review.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Label htmlFor="special-status-filter" className="text-base font-medium">Status:</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger id="special-status-filter" className="w-[180px] text-base h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="ALL" className="text-base">All Statuses</SelectItem>
                  <SelectItem value="PENDING" className="text-base">Pending</SelectItem>
                  <SelectItem value="APPROVED" className="text-base">Approved</SelectItem>
                  <SelectItem value="REJECTED" className="text-base">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => refetch()} className="text-base h-11 px-6">Refresh</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by permit ID, vehicle, applicant, or type..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setCurrentPage(1)
              }}
              className="pl-11 text-base h-12"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
            </div>
          ) : filteredPermits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Truck className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No special permits found</h3>
              <p className="text-base text-muted-foreground">Try refreshing or changing the status filter.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg font-semibold">Permit ID</TableHead>
                  <TableHead className="text-lg font-semibold">Type</TableHead>
                  <TableHead className="text-lg font-semibold">Vehicle</TableHead>
                  <TableHead className="text-lg font-semibold">Applicant</TableHead>
                  <TableHead className="text-lg font-semibold">Submitted</TableHead>
                  <TableHead className="text-lg font-semibold">Status</TableHead>
                  <TableHead className="text-right text-lg font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPermits.map(({ permit, status, plate, applicant, type, createdAt }) => (
                  <TableRow key={permit.id}>
                    <TableCell className="font-medium text-base">{permit.id}</TableCell>
                    <TableCell className="text-base">{getTypeBadge(type)}</TableCell>
                    <TableCell className="text-base">
                      <div>
                        <div className="font-bold">{plate}</div>
                        <div className="text-sm text-muted-foreground">
                          {getVehicleClass(permit)} • {permit.axleCount ?? "N/A"} axles • {getWeight(permit)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-base">
                      <div>
                        <div className="font-medium">{applicant}</div>
                        <div className="text-sm text-muted-foreground">{getContact(permit)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-base">{createdAt}</TableCell>
                    <TableCell className="text-base">{getStatusBadge(status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedPermitId(permit.id)}
                        className="h-10 w-10"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredPermits.length > 0 && (
            <div className="flex items-center justify-end mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                  disabled={normalizedCurrentPage === 1}
                  className="h-9 px-4"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {normalizedCurrentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((previous) => Math.min(totalPages, previous + 1))}
                  disabled={normalizedCurrentPage === totalPages}
                  className="h-9 px-4"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
