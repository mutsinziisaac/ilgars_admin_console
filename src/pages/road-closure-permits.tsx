import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FileText, Search, Eye, CheckCircle, XCircle, Clock, Receipt, MapPin, Calendar } from "lucide-react"
import { toast } from "sonner"
import { Map, type LatLngTuple } from "@/components/ui/map"
import {
  ApiError,
  MunicipalRoutesApi,
  RoadClosurePermitsApi,
  getApiErrorMessage,
  type RoadClosurePermit,
  type RoadClosurePermitListResponse,
} from "@/lib/api"
import {
  removeRoadClosurePermitFromListResponse,
  roadClosurePermitKeys,
  usePendingRoadClosurePermits,
} from "@/lib/api/permits/hooks"
import { useAuthorization } from "@/lib/auth/authorization"
import { userManager } from "@/lib/userManager"

interface Permit {
  id: string
  approvalId: string
  routeId?: string
  applicant: string
  contactEmail: string
  contactPhone: string
  purpose: string
  roadType: string
  location: string
  hours: number
  hourlyRate: number
  totalFee: number
  status: "Awaiting Admin Approval" | "Approved" | "Rejected"
  submittedDate: string
  eventDate: string
  paymentDeadline: string
  rejectionReason?: string
  notes?: string
  routePoints?: LatLngTuple[]
}

const getLineCoordinates = (value: unknown): unknown[] | null => {
  if (!value || typeof value !== "object") return null

  const record = value as Record<string, unknown>
  if (record.type === "Feature") return getLineCoordinates(record.geometry)

  if (record.type === "FeatureCollection" && Array.isArray(record.features)) {
    const lineFeature = record.features
      .map((feature) => getLineCoordinates(feature))
      .find((coordinates): coordinates is unknown[] => Boolean(coordinates))
    return lineFeature ?? null
  }

  if (record.type === "LineString" && Array.isArray(record.coordinates)) return record.coordinates

  if (record.type === "MultiLineString" && Array.isArray(record.coordinates)) {
    const [firstLine] = record.coordinates
    return Array.isArray(firstLine) ? firstLine : null
  }

  return null
}

const extractLineLatLngs = (geoJson: unknown): LatLngTuple[] => {
  if (!geoJson) return []

  try {
    const parsedGeoJson = typeof geoJson === "string" ? JSON.parse(geoJson) : geoJson
    const coordinates = getLineCoordinates(parsedGeoJson)
    if (!coordinates) return []

    return coordinates
      .map((coordinate) => {
        if (!Array.isArray(coordinate) || coordinate.length < 2) return null
        const [lng, lat] = coordinate
        if (typeof lat !== "number" || typeof lng !== "number") return null
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
        return [lat, lng] as LatLngTuple
      })
      .filter((point): point is LatLngTuple => Boolean(point))
  } catch {
    return []
  }
}

const normalizePermitStatus = (status: string): Permit["status"] => {
  const normalized = status.toUpperCase()
  if (normalized === "APPROVED") return "Approved"
  if (normalized === "REJECTED") return "Rejected"
  return "Awaiting Admin Approval"
}

const isApprovedPermitStatus = (status: string) => normalizePermitStatus(status) === "Approved"
const isRejectedPermitStatus = (status: string) => normalizePermitStatus(status) === "Rejected"

const getPermitDecisionErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError && error.status === 403) {
    return "Your account is authenticated, but it is not authorized to approve or reject road closure permits."
  }

  return getApiErrorMessage(error, fallback)
}

const calculateHours = (startAt: string, endAt: string) => {
  const start = new Date(startAt).getTime()
  const end = new Date(endAt).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0

  return Math.max(1, Math.ceil((end - start) / 3600000))
}

const firstString = (...values: unknown[]) =>
  values.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim()

const toPermitRow = (permit: RoadClosurePermit): Permit => {
  const extra = permit as RoadClosurePermit & {
    approvalId?: string | null
    roadClosurePermitId?: string | null
    roadClosurePermitRequestId?: string | null
    permitId?: string | null
    requestId?: string | null
    applicationId?: string | null
    applicantEmail?: string | null
    roadType?: string | null
    location?: string | null
    routeName?: string | null
    hourlyRate?: number | null
    totalFee?: number | null
    rejectionReason?: string | null
    notes?: string | null
    geoJson?: unknown
    routeGeoJson?: unknown
    requestedRouteGeoJson?: unknown
    geometry?: unknown
    route?: {
      geoJson?: unknown
      geometry?: unknown
      name?: string | null
    } | null
  }
  const hours = calculateHours(permit.requestedStartAt, permit.requestedEndAt)
  const hourlyRate = extra.hourlyRate ?? 0
  const routePoints = extractLineLatLngs(
    extra.route?.geoJson ??
      extra.route?.geometry ??
      extra.routeGeoJson ??
      extra.requestedRouteGeoJson ??
      extra.geoJson ??
      extra.geometry,
  )
  const approvalId =
    firstString(
      extra.approvalId,
      extra.roadClosurePermitId,
      extra.roadClosurePermitRequestId,
      extra.permitId,
      extra.requestId,
      extra.applicationId,
      permit.id,
    ) ?? permit.id

  return {
    id: permit.id,
    approvalId,
    routeId: permit.routeId ?? undefined,
    applicant: permit.applicantName,
    contactEmail: extra.applicantEmail ?? "",
    contactPhone: permit.applicantPhone ?? "",
    purpose: permit.purpose,
    roadType: extra.roadType ?? "Road Closure",
    location: extra.location ?? extra.routeName ?? permit.routeId ?? "N/A",
    hours,
    hourlyRate,
    totalFee: extra.totalFee ?? hourlyRate * hours,
    status: normalizePermitStatus(permit.status),
    submittedDate: permit.createdAt?.split("T")[0] ?? "N/A",
    eventDate: permit.requestedStartAt?.split("T")[0] ?? "N/A",
    paymentDeadline: permit.approvedAt?.split("T")[0] ?? "N/A",
    rejectionReason: extra.rejectionReason ?? undefined,
    notes: extra.notes ?? permit.conditions ?? undefined,
    routePoints,
  }
}

export function RoadClosurePermitsContent() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuthorization()
  const canApprovePermits = hasPermission("permits:approve")
  const pendingPermitsQuery = usePendingRoadClosurePermits()
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Awaiting Admin Approval")
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
  const [isDecidingPermit, setIsDecidingPermit] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const permits = (pendingPermitsQuery.data?.data ?? pendingPermitsQuery.data?.content ?? []).map(toPermitRow)
  const isLoading = pendingPermitsQuery.isLoading

  const pendingCount  = permits.filter(p => p.status === "Awaiting Admin Approval").length
  const approvedCount = permits.filter(p => p.status === "Approved").length
  const rejectedCount = permits.filter(p => p.status === "Rejected").length
  const totalRevenue  = permits.filter(p => p.status === "Approved").reduce((s, p) => s + p.totalFee, 0)

  const filtered = permits.filter(p => {
    const q = searchQuery.toLowerCase()
    const matchSearch = p.id.toLowerCase().includes(q) || p.applicant.toLowerCase().includes(q) || p.purpose.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    return matchSearch && (statusFilter === "all" || p.status === statusFilter)
  })

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPermits = filtered.slice(startIndex, endIndex)

  const handleViewDetails = async (permit: Permit) => {
    setSelectedPermit(permit)
    setIsDetailsOpen(true)
    setIsDetailLoading(true)

    try {
      const response = await RoadClosurePermitsApi.getRoadClosurePermit(permit.id)
      const permitRow = toPermitRow(response.data)

      if (permitRow.routeId && !permitRow.routePoints?.length) {
        try {
          const routeResponse = await MunicipalRoutesApi.getMunicipalRoute(permitRow.routeId)
          const routeExtra = routeResponse.data as typeof routeResponse.data & {
            geometry?: unknown
            routeGeoJson?: unknown
          }
          permitRow.routePoints = extractLineLatLngs(
            routeExtra.geoJson ?? routeExtra.routeGeoJson ?? routeExtra.geometry,
          )
          permitRow.location = routeResponse.data.name || permitRow.location
          permitRow.roadType = routeResponse.data.roadType || permitRow.roadType
        } catch (routeError) {
          toast.error("Failed to load permit route", {
            description: getApiErrorMessage(routeError, "Route detail request failed"),
          })
        }
      }

      setSelectedPermit(permitRow)
    } catch (error) {
      if (typeof error === "object" && error !== null && "status" in error && error.status === 404) {
        return
      }

      toast.error("Failed to load permit details", {
        description: getApiErrorMessage(error, "Permit detail request failed"),
      })
    } finally {
      setIsDetailLoading(false)
    }
  }

  const getCurrentApprover = async () => {
    let user = await userManager.getUser()

    if (!user?.access_token?.trim()) {
      user = await userManager.signinSilent()
    }

    if (!user?.access_token?.trim()) {
      throw new Error("Your session token is missing. Sign in again before approving permits.")
    }

    const profile = user?.profile

    return (
      profile?.sub ||
      profile?.name ||
      profile?.preferred_username ||
      profile?.email ||
      "SystemAdmin"
    )
  }

  const getFreshPermitForDecision = async (permit: Permit) => {
    try {
      const response = await RoadClosurePermitsApi.getRoadClosurePermit(permit.id)
      return toPermitRow(response.data)
    } catch {
      return permit
    }
  }

  const removePendingPermitFromCache = (permit: Permit) => {
    queryClient.setQueryData<RoadClosurePermitListResponse | undefined>(
      roadClosurePermitKeys.pending(),
      (current) =>
        removeRoadClosurePermitFromListResponse(
          removeRoadClosurePermitFromListResponse(current, permit.id),
          permit.approvalId,
        ),
    )
  }

  const handleApprove = async () => {
    if (!selectedPermit) return
    if (!canApprovePermits) {
      toast.error("Approval unavailable", {
        description: "Your role does not include permits:approve.",
      })
      return
    }

    try {
      setIsDecidingPermit(true)
      const freshPermit = await getFreshPermitForDecision(selectedPermit)
      const response = await RoadClosurePermitsApi.decideRoadClosurePermit(
        freshPermit.approvalId,
        {
          decision: "APPROVED",
          approvedBy: await getCurrentApprover(),
        },
        undefined,
        freshPermit.id,
      )

      if (!isApprovedPermitStatus(response.data.status)) {
        await queryClient.invalidateQueries({ queryKey: roadClosurePermitKeys.lists() })
        toast.error("Permit approval was not persisted", {
          description: `${selectedPermit.id} is still ${response.data.status}. Refreshing pending permits.`,
        })
        return
      }

      removePendingPermitFromCache(freshPermit)
      void queryClient.invalidateQueries({ queryKey: roadClosurePermitKeys.lists() })
      setIsApproveOpen(false); setIsDetailsOpen(false)
      toast.success("Permit approved", { description: `${selectedPermit.id} is now active.` })
    } catch (error) {
      toast.error("Failed to approve permit", {
        description: getPermitDecisionErrorMessage(error, "Approval request failed"),
      })
    } finally {
      setIsDecidingPermit(false)
    }
  }

  const handleReject = async () => {
    if (!selectedPermit || !rejectionReason.trim()) return
    if (!canApprovePermits) {
      toast.error("Rejection unavailable", {
        description: "Your role does not include permits:approve.",
      })
      return
    }

    try {
      setIsDecidingPermit(true)
      const freshPermit = await getFreshPermitForDecision(selectedPermit)
      const response = await RoadClosurePermitsApi.decideRoadClosurePermit(
        freshPermit.approvalId,
        {
          decision: "REJECTED",
          approvedBy: await getCurrentApprover(),
          notes: rejectionReason.trim(),
        },
        undefined,
        freshPermit.id,
      )

      if (!isRejectedPermitStatus(response.data.status)) {
        await queryClient.invalidateQueries({ queryKey: roadClosurePermitKeys.lists() })
        toast.error("Permit rejection was not persisted", {
          description: `${selectedPermit.id} is still ${response.data.status}. Refreshing pending permits.`,
        })
        return
      }

      removePendingPermitFromCache(freshPermit)
      void queryClient.invalidateQueries({ queryKey: roadClosurePermitKeys.lists() })
      setIsRejectOpen(false); setIsDetailsOpen(false); setRejectionReason("")
      toast.error("Permit rejected", { description: `${selectedPermit.id} has been rejected.` })
    } catch (error) {
      toast.error("Failed to reject permit", {
        description: getPermitDecisionErrorMessage(error, "Rejection request failed"),
      })
    } finally {
      setIsDecidingPermit(false)
    }
  }

  const handleRefresh = () => {
    void pendingPermitsQuery.refetch()
  }

  const statusBadge = (status: string) => {
    if (status === "Approved") return <Badge className="bg-[#D6F0E0] text-[#1C1C1C] text-sm px-3 py-1 gap-1"><CheckCircle className="h-3.5 w-3.5" />{status}</Badge>
    if (status === "Awaiting Admin Approval")  return <Badge className="bg-[#DAA22A] text-[#1C1C1C] text-sm px-3 py-1 gap-1"><Clock className="h-3.5 w-3.5" />{status}</Badge>
    return <Badge className="bg-[#E5533D] text-white text-sm px-3 py-1 gap-1"><XCircle className="h-3.5 w-3.5" />{status}</Badge>
  }

  const purposeBadge = (purpose: string) => {
    return <Badge className="bg-[#4FAF7C] text-white text-sm px-3 py-1">{purpose}</Badge>
  }

  const approveConfirmation = selectedPermit && isApproveOpen ? (
    <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
      <DialogContent className="text-base">
        <DialogHeader>
          <DialogTitle className="text-2xl">Approve Permit</DialogTitle>
          <DialogDescription className="text-base">
            Confirm approval for <strong className="text-foreground">{selectedPermit.id}</strong>. An invoice for <strong className="text-foreground">{selectedPermit.totalFee.toLocaleString()} MZN</strong> will be issued to {selectedPermit.applicant}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={isDecidingPermit} onClick={() => setIsApproveOpen(false)} className="text-base h-11 px-6">Cancel</Button>
          <Button disabled={isDecidingPermit || !canApprovePermits} onClick={handleApprove} className="bg-[#D6F0E0] text-[#1C1C1C] hover:bg-[#D6F0E0]/80 text-base h-11 px-6">
            {isDecidingPermit ? "Approving..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null

  if (isDetailsOpen && selectedPermit) {
    const routePoints = selectedPermit.routePoints ?? []
    const startPoint = routePoints[0]
    const endPoint = routePoints[routePoints.length - 1]

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Button variant="ghost" onClick={() => setIsDetailsOpen(false)} className="h-10 w-fit px-2 text-base">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to permits
            </Button>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-semibold text-foreground">{selectedPermit.id}</h1>
                {statusBadge(selectedPermit.status)}
              </div>
              <p className="text-lg text-muted-foreground">{selectedPermit.purpose} — {selectedPermit.applicant}</p>
            </div>
          </div>
          {selectedPermit.status === "Awaiting Admin Approval" && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsRejectOpen(true)}
                disabled={!canApprovePermits}
                title={!canApprovePermits ? "Requires permits:approve" : undefined}
                className="text-base h-11 px-6 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => setIsApproveOpen(true)}
                disabled={!canApprovePermits}
                title={!canApprovePermits ? "Requires permits:approve" : undefined}
                className="text-base h-11 px-6 bg-[#4FAF7C] text-white hover:bg-[#4FAF7C]/90"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          )}
        </div>

        {isDetailLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[440px] w-full" />
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Route Map</CardTitle>
                    <CardDescription className="text-base">
                      {routePoints.length >= 2
                        ? "Requested road closure route"
                        : "Route geometry has not been provided by the permit response"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {routePoints.length >= 2 && startPoint && endPoint ? (
                      <Map
                        center={startPoint}
                        zoom={15}
                        route={routePoints}
                        markers={[
                          {
                            position: startPoint,
                            label: "Closure start",
                            description: selectedPermit.location,
                          },
                          {
                            position: endPoint,
                            label: "Closure end",
                            description: `${selectedPermit.hours} hour booking`,
                          },
                        ]}
                        height="430px"
                        className="border"
                        defaultView="satellite"
                        fitToBounds
                      />
                    ) : (
                      <div className="flex min-h-[430px] items-center justify-center rounded-md border bg-muted/20 p-6 text-center">
                        <div className="max-w-md space-y-3">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold">Route map unavailable</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              The approval page loaded the permit, but no drawable GeoJSON route was returned.
                            </p>
                          </div>
                          <div className="rounded-md bg-background p-3 text-left text-sm">
                            <p className="font-medium">Requested section</p>
                            <p className="mt-1 text-muted-foreground">{selectedPermit.location}</p>
                            {selectedPermit.routeId && (
                              <p className="mt-2 break-all text-xs text-muted-foreground">Route ID: {selectedPermit.routeId}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs uppercase">Applicant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-lg font-bold mb-1">{selectedPermit.applicant}</p>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground break-all">{selectedPermit.contactEmail || "No email on file"}</p>
                    <p className="text-muted-foreground">{selectedPermit.contactPhone || "No phone on file"}</p>
                  </div>
                </CardContent>
                </Card>
              </div>
            </div>

            <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Permit Details</CardTitle>
              <CardDescription className="text-base">Submitted {selectedPermit.submittedDate}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Road Class</Label>
                  <p className="mt-1 text-lg font-semibold">{selectedPermit.roadType}</p>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Hourly Rate</Label>
                  <p className="mt-1 text-lg font-semibold">{selectedPermit.hourlyRate.toLocaleString()} MZN</p>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Duration</Label>
                  <p className="mt-1 text-lg font-semibold">{selectedPermit.hours}h</p>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Total Fee</Label>
                  <p className="mt-1 text-lg font-semibold text-[#4FAF7C]">{selectedPermit.totalFee.toLocaleString()} MZN</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground">Event Date</Label>
                  <div className="flex items-center gap-2 text-base font-medium">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {selectedPermit.eventDate}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground">Requested Section</Label>
                  <div className="flex items-start gap-2 text-base font-medium">
                    <MapPin className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{selectedPermit.location}</span>
                  </div>
                </div>
              </div>
              {selectedPermit.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground">Justification</Label>
                    <p className="rounded-md bg-muted/40 p-4 text-base leading-relaxed">{selectedPermit.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
            </Card>
          </div>
        )}

        {approveConfirmation}

        <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
          <DialogContent className="text-base">
            <DialogHeader><DialogTitle className="text-2xl">Reject Permit</DialogTitle><DialogDescription className="text-base">Provide a reason for rejecting {selectedPermit.id}</DialogDescription></DialogHeader>
            <div className="py-4 space-y-2">
              <Label className="text-base">Rejection Reason *</Label>
              <Textarea placeholder="Enter reason..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={4} className="text-base" />
            </div>
            <DialogFooter>
              <Button variant="outline" disabled={isDecidingPermit} onClick={() => setIsRejectOpen(false)} className="text-base h-11 px-6">Cancel</Button>
              <Button disabled={!rejectionReason.trim() || isDecidingPermit || !canApprovePermits} onClick={handleReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-base h-11 px-6">
                {isDecidingPermit ? "Rejecting..." : "Reject Permit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card><CardHeader className="pb-3"><CardDescription className="text-base">Total Permits</CardDescription><CardTitle className="text-4xl">{permits.length}</CardTitle></CardHeader><CardContent><p className="text-base text-muted-foreground">All applications</p></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardDescription className="text-base">Pending Review</CardDescription><CardTitle className="text-4xl text-[#DAA22A]">{pendingCount}</CardTitle></CardHeader><CardContent><Badge className="bg-[#DAA22A] text-[#1C1C1C] text-sm">Requires action</Badge></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardDescription className="text-base">Approved</CardDescription><CardTitle className="text-4xl text-[#4FAF7C]">{approvedCount}</CardTitle></CardHeader><CardContent><p className="text-base text-muted-foreground">Active permits</p></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardDescription className="text-base">Revenue Collected</CardDescription><CardTitle className="text-4xl">{totalRevenue.toLocaleString()} <span className="text-xl font-normal text-muted-foreground">MZN</span></CardTitle></CardHeader><CardContent><p className="text-base text-muted-foreground">From approved permits</p></CardContent></Card>
      </div>

      {/* Table card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle className="text-2xl">Permit Applications</CardTitle><CardDescription className="text-base">Review and manage all road usage permit requests</CardDescription></div>
            <Button variant="outline" onClick={handleRefresh} className="text-base h-11 px-6">Refresh</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center justify-end gap-3">
            <Label htmlFor="status-filter" className="text-base font-medium">
              Filter by Status:
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="w-[200px] text-base h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-base">
                <SelectItem value="all" className="text-base">All ({permits.length})</SelectItem>
                <SelectItem value="Awaiting Admin Approval" className="text-base">Awaiting Admin Approval ({pendingCount})</SelectItem>
                <SelectItem value="Approved" className="text-base">Approved ({approvedCount})</SelectItem>
                <SelectItem value="Rejected" className="text-base">Rejected ({rejectedCount})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by ID, applicant, purpose or location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-11 text-base h-12" />
          </div>

          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4"><FileText className="h-10 w-10 text-muted-foreground" /></div>
              <h3 className="text-2xl font-semibold mb-2">No permits found</h3>
              <p className="text-base text-muted-foreground">Try adjusting your search or filter</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Permit ID</TableHead>
                  <TableHead className="text-base">Applicant</TableHead>
                  <TableHead className="text-base">Purpose</TableHead>
                  <TableHead className="text-base">Road Type</TableHead>
                  <TableHead className="text-base">Duration</TableHead>
                  <TableHead className="text-base">Total Fee</TableHead>
                  <TableHead className="text-base">Event Date</TableHead>
                  <TableHead className="text-base">Status</TableHead>
                  <TableHead className="text-right text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPermits.map(permit => (
                  <TableRow key={permit.id}>
                    <TableCell className="font-mono font-medium text-base">{permit.id}</TableCell>
                    <TableCell className="text-base font-medium">{permit.applicant}</TableCell>
                    <TableCell>{purposeBadge(permit.purpose)}</TableCell>
                    <TableCell className="text-base text-muted-foreground">{permit.roadType}</TableCell>
                    <TableCell className="text-base">{permit.hours}h</TableCell>
                    <TableCell className="text-base font-bold">{permit.totalFee.toLocaleString()} MZN</TableCell>
                    <TableCell className="text-base">{permit.eventDate}</TableCell>
                    <TableCell>{statusBadge(permit.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => handleViewDetails(permit)}><Eye className="h-5 w-5" /></Button>
                        {permit.status === "Approved" && (
                          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => { setSelectedPermit(permit); setIsInvoiceOpen(true) }}><Receipt className="h-5 w-5" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {!isLoading && filtered.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} permits
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

      {/* ── Invoice Dialog ── */}
      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="max-w-lg text-base">
          <DialogHeader>
            <DialogTitle className="text-2xl">Invoice</DialogTitle>
            <DialogDescription className="text-base">{selectedPermit?.id}</DialogDescription>
          </DialogHeader>
          {selectedPermit && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">Maputo RUC</p>
                    <p className="text-sm text-muted-foreground">Road Usage Charge System</p>
                  </div>
                  <Badge className="bg-[#D6F0E0] text-[#1C1C1C] text-sm px-3 py-1">PAID</Badge>
                </div>
                <Separator />
                <div className="space-y-2 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Applicant</span><span className="font-medium">{selectedPermit.applicant}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Purpose</span><span className="font-medium">{selectedPermit.purpose}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Road Type</span><span className="font-medium">{selectedPermit.roadType}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">{selectedPermit.hours} hours</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Hourly Rate</span><span className="font-medium">{selectedPermit.hourlyRate.toLocaleString()} MZN</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Event Date</span><span className="font-medium">{selectedPermit.eventDate}</span></div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Payable</span>
                  <span className="text-2xl font-bold text-primary">{selectedPermit.totalFee.toLocaleString()} MZN</span>
                </div>
                <p className="text-sm text-muted-foreground">Payment deadline: {selectedPermit.paymentDeadline}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvoiceOpen(false)} className="text-base h-11 px-6">Close</Button>
            <Button onClick={() => { toast.success("Invoice downloaded"); setIsInvoiceOpen(false) }} className="text-base h-11 px-6">Download PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
