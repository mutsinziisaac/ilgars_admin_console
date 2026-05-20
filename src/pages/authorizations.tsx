import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FileText, Clock, CheckCircle2, XCircle, Eye, Upload, Download } from "lucide-react"
import { toast } from "sonner"

// Mock authorization data
const mockAuthorizations = [
  // PENDING (4 entries)
  {
    id: 1,
    authorizationType: "NIGHT_RESTRICTED",
    vehiclePlate: "AAB-234-MP",
    vehicleClass: "ARTICULATED",
    axleCount: 5,
    grossWeight: 42000,
    applicantName: "Transportes Maputo Lda",
    applicantContact: "+258 84 123 4567",
    submittedDate: "2026-01-20",
    status: "PENDING",
    validFrom: "",
    validTo: "",
    approvedBy: "",
    approvedDate: "",
    travelReason: "Transporting construction materials to Matola",
    travelStartDate: "2026-01-25",
    travelEndDate: "2026-02-25",
    documents: ["livrete.pdf", "title.pdf"]
  },
  {
    id: 2,
    authorizationType: "EXCEPTIONAL_UNRESTRICTED",
    vehiclePlate: "BBB-456-MP",
    vehicleClass: "RIGID",
    axleCount: 3,
    grossWeight: 28000,
    applicantName: "Construções Moçambique SA",
    applicantContact: "+258 82 987 6543",
    submittedDate: "2026-01-18",
    status: "PENDING",
    validFrom: "",
    validTo: "",
    approvedBy: "",
    approvedDate: "",
    justification: "Emergency construction materials for hospital expansion",
    travelReason: "Urgent delivery of medical equipment to Hospital Central",
    travelStartDate: "2026-01-22",
    travelEndDate: "2026-01-22",
    escortRequired: true,
    escortAssigned: false,
    documents: ["livrete.pdf", "title.pdf", "justification.pdf"]
  },
  {
    id: 3,
    authorizationType: "NIGHT_RESTRICTED",
    vehiclePlate: "CCC-789-MP",
    vehicleClass: "ARTICULATED",
    axleCount: 6,
    grossWeight: 48000,
    applicantName: "Logística Porto SA",
    applicantContact: "+258 84 555 1234",
    submittedDate: "2026-01-19",
    status: "PENDING",
    validFrom: "",
    validTo: "",
    approvedBy: "",
    approvedDate: "",
    documents: ["livrete.pdf", "title.pdf"]
  },
  {
    id: 4,
    authorizationType: "EXCEPTIONAL_UNRESTRICTED",
    vehiclePlate: "DDD-321-MP",
    vehicleClass: "RIGID",
    axleCount: 2,
    grossWeight: 18000,
    applicantName: "Obras Públicas Maputo",
    applicantContact: "+258 86 777 8888",
    submittedDate: "2026-01-21",
    status: "PENDING",
    validFrom: "",
    validTo: "",
    approvedBy: "",
    approvedDate: "",
    justification: "Emergency road repair equipment transport",
    escortRequired: true,
    escortAssigned: false,
    documents: ["livrete.pdf", "title.pdf", "justification.pdf"]
  },
  // APPROVED (4 entries)
  {
    id: 5,
    authorizationType: "NIGHT_RESTRICTED",
    vehiclePlate: "EEE-111-MP",
    vehicleClass: "ARTICULATED",
    axleCount: 5,
    grossWeight: 42000,
    applicantName: "Transportes Nampula Lda",
    applicantContact: "+258 84 222 3333",
    submittedDate: "2026-01-10",
    status: "APPROVED",
    validFrom: "2026-01-15",
    validTo: "2026-07-15",
    approvedBy: "João Silva",
    approvedDate: "2026-01-12",
    documents: ["livrete.pdf", "title.pdf"]
  },
  {
    id: 6,
    authorizationType: "NIGHT_RESTRICTED",
    vehiclePlate: "FFF-222-MP",
    vehicleClass: "ARTICULATED",
    axleCount: 6,
    grossWeight: 48000,
    applicantName: "Cargo Express Moçambique",
    applicantContact: "+258 82 333 4444",
    submittedDate: "2026-01-08",
    status: "APPROVED",
    validFrom: "2026-01-12",
    validTo: "2026-07-12",
    approvedBy: "Maria Santos",
    approvedDate: "2026-01-10",
    documents: ["livrete.pdf", "title.pdf"]
  },
  {
    id: 7,
    authorizationType: "EXCEPTIONAL_UNRESTRICTED",
    vehiclePlate: "GGG-333-MP",
    vehicleClass: "RIGID",
    axleCount: 3,
    grossWeight: 28000,
    applicantName: "Infraestruturas Maputo SA",
    applicantContact: "+258 84 444 5555",
    submittedDate: "2026-01-05",
    status: "APPROVED",
    validFrom: "2026-01-08",
    validTo: "2026-07-08",
    approvedBy: "Carlos Mendes",
    approvedDate: "2026-01-07",
    justification: "Bridge construction materials - critical infrastructure",
    escortRequired: true,
    escortAssigned: true,
    documents: ["livrete.pdf", "title.pdf", "justification.pdf"]
  },
  {
    id: 8,
    authorizationType: "NIGHT_RESTRICTED",
    vehiclePlate: "HHH-444-MP",
    vehicleClass: "ARTICULATED",
    axleCount: 5,
    grossWeight: 42000,
    applicantName: "Distribuição Beira Lda",
    applicantContact: "+258 86 555 6666",
    submittedDate: "2026-01-12",
    status: "APPROVED",
    validFrom: "2026-01-16",
    validTo: "2026-07-16",
    approvedBy: "Ana Costa",
    approvedDate: "2026-01-14",
    documents: ["livrete.pdf", "title.pdf"]
  },
  // REJECTED (4 entries)
  {
    id: 9,
    authorizationType: "EXCEPTIONAL_UNRESTRICTED",
    vehiclePlate: "III-555-MP",
    vehicleClass: "RIGID",
    axleCount: 2,
    grossWeight: 16500,
    applicantName: "Eventos Maputo Lda",
    applicantContact: "+258 84 666 7777",
    submittedDate: "2026-01-03",
    status: "REJECTED",
    validFrom: "",
    validTo: "",
    approvedBy: "",
    approvedDate: "",
    rejectionReason: "Justification does not meet 'extreme necessity' criteria",
    documents: ["livrete.pdf", "title.pdf", "justification.pdf"]
  },
  {
    id: 10,
    authorizationType: "NIGHT_RESTRICTED",
    vehiclePlate: "JJJ-666-MP",
    vehicleClass: "ARTICULATED",
    axleCount: 5,
    grossWeight: 42000,
    applicantName: "Transportes Tete SA",
    applicantContact: "+258 82 777 8888",
    submittedDate: "2026-01-06",
    status: "REJECTED",
    validFrom: "",
    validTo: "",
    approvedBy: "",
    approvedDate: "",
    rejectionReason: "Vehicle does not have active GPS device installation",
    documents: ["livrete.pdf", "title.pdf"]
  },
  {
    id: 11,
    authorizationType: "EXCEPTIONAL_UNRESTRICTED",
    vehiclePlate: "KKK-777-MP",
    vehicleClass: "RIGID",
    axleCount: 3,
    grossWeight: 28000,
    applicantName: "Comércio Geral Moçambique",
    applicantContact: "+258 84 888 9999",
    submittedDate: "2026-01-04",
    status: "REJECTED",
    validFrom: "",
    validTo: "",
    approvedBy: "",
    approvedDate: "",
    rejectionReason: "Missing required documents: Title of Ownership not provided",
    documents: ["livrete.pdf", "justification.pdf"]
  },
  {
    id: 12,
    authorizationType: "NIGHT_RESTRICTED",
    vehiclePlate: "LLL-888-MP",
    vehicleClass: "ARTICULATED",
    axleCount: 6,
    grossWeight: 48000,
    applicantName: "Logística Zambézia Lda",
    applicantContact: "+258 86 999 0000",
    submittedDate: "2026-01-07",
    status: "REJECTED",
    validFrom: "",
    validTo: "",
    approvedBy: "",
    approvedDate: "",
    rejectionReason: "Vehicle has outstanding unpaid balance on existing transaction",
    documents: ["livrete.pdf", "title.pdf"]
  },
]

type EscortUnit = {
  id: string
  callSign: string
  officer: string
  vehicle: string
  zone: string
  status: "AVAILABLE" | "ON_DUTY"
}

type Authorization = (typeof mockAuthorizations)[number] & {
  escortRequired?: boolean
  escortAssigned?: boolean
  assignedEscorts?: EscortUnit[]
}

const escortUnits: EscortUnit[] = [
  {
    id: "ESC-01",
    callSign: "Escort Alpha",
    officer: "Sgt. Daniel Okello",
    vehicle: "UG-ECS-014",
    zone: "Kampala Central",
    status: "AVAILABLE",
  },
  {
    id: "ESC-02",
    callSign: "Escort Bravo",
    officer: "Cpl. Sarah Namukasa",
    vehicle: "UG-ECS-022",
    zone: "Northern Bypass",
    status: "AVAILABLE",
  },
  {
    id: "ESC-03",
    callSign: "Escort Charlie",
    officer: "Insp. Peter Lwanga",
    vehicle: "UG-ECS-031",
    zone: "Jinja Road",
    status: "AVAILABLE",
  },
  {
    id: "ESC-04",
    callSign: "Escort Delta",
    officer: "Cpl. Mercy Akello",
    vehicle: "UG-ECS-044",
    zone: "Entebbe Road",
    status: "ON_DUTY",
  },
]

export function AuthorizationsPage() {
  const [authorizations, setAuthorizations] = useState<Authorization[]>(mockAuthorizations)
  const [selectedAuth, setSelectedAuth] = useState<Authorization | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [selectedEscortIds, setSelectedEscortIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const itemsPerPage = 10

  // Filter authorizations by status
  const filteredAuthorizations =
    statusFilter === "ALL"
      ? authorizations
      : authorizations.filter((auth) => auth.status === statusFilter)

  // Pagination
  const totalPages = Math.ceil(filteredAuthorizations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAuthorizations = filteredAuthorizations.slice(startIndex, endIndex)

  // Reset to page 1 when filter changes
  const handleFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  // Status badge styling (matching permits page)
  const getStatusBadge = (status: string) => {
    if (status === "APPROVED")
      return (
        <Badge className="bg-[#D6F0E0] text-[#1C1C1C] text-sm px-3 py-1 gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approved
        </Badge>
      )
    if (status === "PENDING")
      return (
        <Badge className="bg-[#DAA22A] text-[#1C1C1C] text-sm px-3 py-1 gap-1">
          <Clock className="h-3.5 w-3.5" />
          Pending
        </Badge>
      )
    return (
      <Badge className="bg-[#E5533D] text-white text-sm px-3 py-1 gap-1">
        <XCircle className="h-3.5 w-3.5" />
        Rejected
      </Badge>
    )
  }

  // Type badge styling
  const getTypeBadge = (type: string) => {
    return type === "NIGHT_RESTRICTED" ? (
      <Badge variant="outline" className="!bg-[#4A90E2] !text-white !border-[#4A90E2]">
        Night Restricted
      </Badge>
    ) : (
      <Badge variant="outline" className="!bg-orange-600 !text-white !border-orange-600">
        Exceptional
      </Badge>
    )
  }

  // Open details modal
  const openDetailsModal = (auth: Authorization) => {
    setSelectedAuth(auth)
    setIsDetailsModalOpen(true)
  }

  const openApproveDialog = () => {
    if (!selectedAuth) return
    setSelectedEscortIds(selectedAuth.assignedEscorts?.map((escort) => escort.id) ?? [])
    setIsApproveDialogOpen(true)
  }

  const toggleEscort = (escortId: string) => {
    setSelectedEscortIds((current) =>
      current.includes(escortId)
        ? current.filter((id) => id !== escortId)
        : [...current, escortId]
    )
  }

  // Handle approval actions
  const handleApprove = () => {
    if (!selectedAuth) return
    if (selectedEscortIds.length === 0) {
      toast.error("Assign at least one escort before approval")
      return
    }

    const assignedEscorts = escortUnits.filter((escort) => selectedEscortIds.includes(escort.id))
    const validFrom = new Date().toISOString().split("T")[0]
    const validTo = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] // 6 months
    const approvedDate = new Date().toISOString().split("T")[0]
    const approvedAuthorization: Authorization = {
      ...selectedAuth,
      status: "APPROVED",
      validFrom,
      validTo,
      approvedBy: "Current User",
      approvedDate,
      escortRequired: true,
      escortAssigned: true,
      assignedEscorts,
    }

    setAuthorizations((currentAuthorizations) =>
      currentAuthorizations.map((authorization) =>
        authorization.id === selectedAuth.id ? approvedAuthorization : authorization
      )
    )
    setSelectedAuth(approvedAuthorization)
    toast.success("Authorization Approved", {
      description: `Authorization ${selectedAuth.id} approved with ${assignedEscorts.length} escort${assignedEscorts.length === 1 ? "" : "s"}.`,
    })
    setIsApproveDialogOpen(false)
    setSelectedEscortIds([])
    setIsDetailsModalOpen(false)
  }

  const handleReject = () => {
    if (!selectedAuth) return
    setAuthorizations(
      authorizations.map((a) =>
        a.id === selectedAuth.id
          ? { ...a, status: "REJECTED", rejectionReason: "Rejected by administrator" }
          : a
      )
    )
    toast.error("Authorization Rejected", {
      description: `Authorization ${selectedAuth.id} has been rejected.`,
    })
    setIsRejectDialogOpen(false)
    setIsDetailsModalOpen(false)
  }

  // Summary stats
  const stats = {
    total: authorizations.length,
    approved: authorizations.filter((a) => a.status === "APPROVED").length,
    pending: authorizations.filter((a) => a.status === "PENDING").length,
    rejected: authorizations.filter((a) => a.status === "REJECTED").length,
  }

  if (isDetailsModalOpen && selectedAuth) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Button
              variant="ghost"
              onClick={() => setIsDetailsModalOpen(false)}
              className="h-10 w-fit px-2 text-base"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to authorizations
            </Button>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-semibold text-foreground">Authorization Details #{selectedAuth.id}</h1>
                {getStatusBadge(selectedAuth.status)}
              </div>
              <p className="text-lg text-muted-foreground">Review and process authorization request</p>
            </div>
          </div>
          {selectedAuth.status === "PENDING" && (
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={() => setIsRejectDialogOpen(true)}
                className="text-base h-11 px-6"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={openApproveDialog} className="text-base h-11 px-6 bg-green-600">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Authorization Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Type</Label>
                    <div className="mt-1">{getTypeBadge(selectedAuth.authorizationType)}</div>
                  </div>
                  {selectedAuth.authorizationType === "EXCEPTIONAL_UNRESTRICTED" && (
                    <>
                      <div>
                        <Label className="text-sm text-muted-foreground">Escort Required</Label>
                        <p className="text-base font-medium">{selectedAuth.escortRequired ? "Yes" : "No"}</p>
                      </div>
                      {selectedAuth.escortRequired && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Escort Status</Label>
                          <p className="text-base font-medium">
                            {selectedAuth.escortAssigned ? (
                              <Badge variant="outline" className="!bg-green-100 !text-green-700">Assigned</Badge>
                            ) : (
                              <Badge variant="outline" className="!bg-yellow-100 !text-yellow-700">Pending</Badge>
                            )}
                          </p>
                        </div>
                      )}
                      {selectedAuth.assignedEscorts?.length ? (
                        <div>
                          <Label className="text-sm text-muted-foreground">Assigned Escorts</Label>
                          <div className="mt-2 space-y-2">
                            {selectedAuth.assignedEscorts.map((escort) => (
                              <div key={escort.id} className="rounded-md border bg-muted/30 px-3 py-2">
                                <p className="text-sm font-semibold">{escort.callSign}</p>
                                <p className="text-xs text-muted-foreground">{escort.officer} • {escort.vehicle}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Registration Plate</Label>
                    <p className="text-base font-bold">{selectedAuth.vehiclePlate}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">Class</Label>
                      <p className="text-base font-medium">{selectedAuth.vehicleClass}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Axles</Label>
                      <p className="text-base font-medium">{selectedAuth.axleCount}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">GVW (kg)</Label>
                      <p className="text-base font-medium">{selectedAuth.grossWeight.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Applicant Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                  <div>
                    <Label className="text-sm text-muted-foreground">Company/Name</Label>
                    <p className="text-base font-bold">{selectedAuth.applicantName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Contact</Label>
                    <p className="text-base font-medium">{selectedAuth.applicantContact}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Submitted Date</Label>
                    <p className="text-base font-medium">{selectedAuth.submittedDate}</p>
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
                  <Label className="text-sm text-muted-foreground">Reason for Travel</Label>
                  <p className="text-base font-medium">{selectedAuth.travelReason || "Not specified"}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm text-muted-foreground">Travel Start Date</Label>
                    <p className="text-base font-medium">{selectedAuth.travelStartDate || "Not specified"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Travel End Date</Label>
                    <p className="text-base font-medium">{selectedAuth.travelEndDate || "Not specified"}</p>
                  </div>
                </div>
              </CardContent>
          </Card>

          {selectedAuth.authorizationType === "EXCEPTIONAL_UNRESTRICTED" && selectedAuth.justification && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Justification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base">{selectedAuth.justification}</p>
                </CardContent>
              </Card>
          )}

          {selectedAuth.status === "APPROVED" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Approval Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm text-muted-foreground">Approved By</Label>
                      <p className="text-base font-medium">{selectedAuth.approvedBy}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Approved Date</Label>
                      <p className="text-base font-medium">{selectedAuth.approvedDate}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Valid From</Label>
                      <p className="text-base font-medium">{selectedAuth.validFrom}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Valid To</Label>
                      <p className="text-base font-medium">{selectedAuth.validTo}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}

          {selectedAuth.status === "REJECTED" && selectedAuth.rejectionReason && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-lg text-red-700">Rejection Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-red-600">{selectedAuth.rejectionReason}</p>
                </CardContent>
              </Card>
          )}
        </div>

        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent className="text-base">
            <DialogHeader>
              <DialogTitle className="text-2xl">Approve Authorization</DialogTitle>
              <DialogDescription className="text-base">
                Assign escort units to {selectedAuth.vehiclePlate} before approving authorization #{selectedAuth.id}. A 6-month validity window will be assigned.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Approval is locked until at least one escort unit is assigned to the vehicle.
              </div>
              <div className="grid gap-3">
                {escortUnits.map((escort) => {
                  const isSelected = selectedEscortIds.includes(escort.id)
                  const isUnavailable = escort.status !== "AVAILABLE" && !isSelected

                  return (
                    <button
                      key={escort.id}
                      type="button"
                      onClick={() => {
                        if (!isUnavailable) toggleEscort(escort.id)
                      }}
                      disabled={isUnavailable}
                      className={`rounded-md border p-4 text-left transition ${
                        isSelected
                          ? "border-green-600 bg-green-50"
                          : "border-border bg-background hover:bg-muted/50"
                      } ${isUnavailable ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold">{escort.callSign}</p>
                          <p className="text-sm text-muted-foreground">{escort.officer}</p>
                          <p className="text-sm text-muted-foreground">{escort.vehicle} • {escort.zone}</p>
                        </div>
                        <Badge className={isSelected ? "bg-green-600 text-white" : escort.status === "AVAILABLE" ? "bg-[#D6F0E0] text-[#1C1C1C]" : "bg-muted text-muted-foreground"}>
                          {isSelected ? "Selected" : escort.status === "AVAILABLE" ? "Available" : "On Duty"}
                        </Badge>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsApproveDialogOpen(false)
                  setSelectedEscortIds([])
                }}
                className="text-base h-11 px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={selectedEscortIds.length === 0}
                className="text-base h-11 px-6 bg-green-600"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent className="text-base">
            <DialogHeader>
              <DialogTitle className="text-2xl">Reject Authorization</DialogTitle>
              <DialogDescription className="text-base">
                Reject authorization #{selectedAuth.id} for {selectedAuth.applicantName}? This will mark the request as rejected.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} className="text-base h-11 px-6">Cancel</Button>
              <Button variant="destructive" onClick={handleReject} className="text-base h-11 px-6">
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Total Authorizations</CardDescription>
            <CardTitle className="text-4xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Approved</CardDescription>
            <CardTitle className="text-4xl text-green-600">{stats.approved}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Approved requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Pending Review</CardDescription>
            <CardTitle className="text-4xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Rejected</CardDescription>
            <CardTitle className="text-4xl text-red-600">{stats.rejected}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Not approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Authorizations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Authorization Requests</CardTitle>
              <CardDescription className="text-base">
                Review and approve heavy vehicle authorization applications
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="status-filter" className="text-base font-medium">
                Filter by Status:
              </Label>
              <Select value={statusFilter} onValueChange={handleFilterChange}>
                <SelectTrigger id="status-filter" className="w-[180px] text-base h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="ALL" className="text-base">All Statuses</SelectItem>
                  <SelectItem value="PENDING" className="text-base">Pending</SelectItem>
                  <SelectItem value="APPROVED" className="text-base">Approved</SelectItem>
                  <SelectItem value="REJECTED" className="text-base">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-lg font-semibold">ID</TableHead>
                <TableHead className="text-lg font-semibold">Type</TableHead>
                <TableHead className="text-lg font-semibold">Vehicle</TableHead>
                <TableHead className="text-lg font-semibold">Applicant</TableHead>
                <TableHead className="text-lg font-semibold">Submitted</TableHead>
                <TableHead className="text-lg font-semibold">Status</TableHead>
                <TableHead className="text-right text-lg font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAuthorizations.map((auth) => (
                <TableRow key={auth.id}>
                  <TableCell className="font-medium text-base">#{auth.id}</TableCell>
                  <TableCell className="text-base">{getTypeBadge(auth.authorizationType)}</TableCell>
                  <TableCell className="text-base">
                    <div>
                      <div className="font-bold">{auth.vehiclePlate}</div>
                      <div className="text-sm text-muted-foreground">
                        {auth.vehicleClass} • {auth.axleCount} axles • {auth.grossWeight.toLocaleString()} kg
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-base">
                    <div>
                      <div className="font-medium">{auth.applicantName}</div>
                      <div className="text-sm text-muted-foreground">{auth.applicantContact}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-base">{auth.submittedDate}</TableCell>
                  <TableCell className="text-base">{getStatusBadge(auth.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDetailsModal(auth)}
                      className="h-10 w-10"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filteredAuthorizations.length > 0 && (
            <div className="flex items-center justify-end mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 px-4"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* No results message */}
          {filteredAuthorizations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-base text-muted-foreground">
                No authorizations found with status: {statusFilter === "ALL" ? "All" : statusFilter}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authorization Details Modal */}
      <Modal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        className="w-[95vw] max-w-[1200px]"
      >
        <ModalHeader onClose={() => setIsDetailsModalOpen(false)}>
          <div className="flex items-center justify-between w-full pr-8">
            <div>
              <ModalTitle>Authorization Details #{selectedAuth?.id}</ModalTitle>
              <ModalDescription>
                Review and process authorization request
              </ModalDescription>
            </div>
            <div>{selectedAuth && getStatusBadge(selectedAuth.status)}</div>
          </div>
        </ModalHeader>

        <ModalBody>
          {selectedAuth && (
            <div className="space-y-6">
              {/* Authorization Type & Vehicle Info */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Authorization Type</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">Type</Label>
                      <div className="mt-1">{getTypeBadge(selectedAuth.authorizationType)}</div>
                    </div>
                    {selectedAuth.authorizationType === "EXCEPTIONAL_UNRESTRICTED" && (
                      <>
                        <div>
                          <Label className="text-sm text-muted-foreground">Escort Required</Label>
                          <p className="text-base font-medium">
                            {selectedAuth.escortRequired ? "Yes" : "No"}
                          </p>
                        </div>
                        {selectedAuth.escortRequired && (
                          <div>
                            <Label className="text-sm text-muted-foreground">Escort Status</Label>
                            <p className="text-base font-medium">
                              {selectedAuth.escortAssigned ? (
                                <Badge variant="outline" className="!bg-green-100 !text-green-700">
                                  Assigned
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="!bg-yellow-100 !text-yellow-700">
                                  Pending
                                </Badge>
                              )}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vehicle Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">Registration Plate</Label>
                      <p className="text-base font-bold">{selectedAuth.vehiclePlate}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-sm text-muted-foreground">Class</Label>
                        <p className="text-base font-medium">{selectedAuth.vehicleClass}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Axles</Label>
                        <p className="text-base font-medium">{selectedAuth.axleCount}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">GVW (kg)</Label>
                        <p className="text-base font-medium">
                          {selectedAuth.grossWeight.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Applicant Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Applicant Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Company/Name</Label>
                    <p className="text-base font-medium">{selectedAuth.applicantName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Contact</Label>
                    <p className="text-base font-medium">{selectedAuth.applicantContact}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Submitted Date</Label>
                    <p className="text-base font-medium">{selectedAuth.submittedDate}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Travel Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Travel Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Reason for Travel</Label>
                    <p className="text-base font-medium">{selectedAuth.travelReason || "Not specified"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Travel Start Date</Label>
                      <p className="text-base font-medium">{selectedAuth.travelStartDate || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Travel End Date</Label>
                      <p className="text-base font-medium">{selectedAuth.travelEndDate || "Not specified"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Justification (for EXCEPTIONAL) */}
              {selectedAuth.authorizationType === "EXCEPTIONAL_UNRESTRICTED" &&
                selectedAuth.justification && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Justification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base">{selectedAuth.justification}</p>
                    </CardContent>
                  </Card>
                )}

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attached Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedAuth.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="text-base font-medium">{doc}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Approval Information */}
              {selectedAuth.status === "APPROVED" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Approval Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Approved By</Label>
                        <p className="text-base font-medium">{selectedAuth.approvedBy}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Approved Date</Label>
                        <p className="text-base font-medium">{selectedAuth.approvedDate}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Valid From</Label>
                        <p className="text-base font-medium">{selectedAuth.validFrom}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Valid To</Label>
                        <p className="text-base font-medium">{selectedAuth.validTo}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rejection Reason */}
              {selectedAuth.status === "REJECTED" && selectedAuth.rejectionReason && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-700">Rejection Reason</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-red-600">{selectedAuth.rejectionReason}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={() => setIsDetailsModalOpen(false)}
              className="text-base h-11 px-6"
            >
              Close
            </Button>
            <div className="flex gap-2">
              {selectedAuth?.status === "PENDING" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    className="text-base h-11 px-6"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button onClick={handleApprove} className="text-base h-11 px-6 bg-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  )
}
