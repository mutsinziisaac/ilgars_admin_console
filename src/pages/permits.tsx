import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { FileText, Search, Eye, CheckCircle, XCircle, Clock, Plus, Receipt } from "lucide-react"
import { toast } from "sonner"

const TARIFFS: Record<string, Record<string, number>> = {
  "Construction Works": { "Protocol Roads": 10000, "Secondary Roads": 5000,  "Tertiary Roads": 3500  },
  "Filming":            { "Protocol Roads": 40000, "Secondary Roads": 30000, "Tertiary Roads": 20000 },
  "Sporting Events":    { "Protocol Roads": 5000,  "Secondary Roads": 3500,  "Tertiary Roads": 1800  },
  "Fairs":              { "Protocol Roads": 2000,  "Secondary Roads": 1000,  "Tertiary Roads": 0     },
  "For-Profit Events":  { "Protocol Roads": 20000, "Secondary Roads": 10000, "Tertiary Roads": 5000  },
}

const PURPOSES = Object.keys(TARIFFS)
const ROAD_TYPES = ["Protocol Roads", "Secondary Roads", "Tertiary Roads"]

function calcFee(purpose: string, roadType: string, hours: number): number {
  return (TARIFFS[purpose]?.[roadType] ?? 0) * hours
}

interface Permit {
  id: string
  applicant: string
  contactEmail: string
  contactPhone: string
  purpose: string
  roadType: string
  location: string
  hours: number
  hourlyRate: number
  totalFee: number
  status: "Pending" | "Approved" | "Rejected"
  submittedDate: string
  eventDate: string
  paymentDeadline: string
  rejectionReason?: string
  notes?: string
}

const mockPermits: Permit[] = [
  { id: "PRM-2026-001", applicant: "Maputo Film Productions", contactEmail: "info@maputofilm.co.mz", contactPhone: "+258 84 111 2222", purpose: "Filming", roadType: "Protocol Roads", location: "Av. Julius Nyerere, between Rua da Imprensa and Rua dos Desportistas", hours: 3, hourlyRate: 40000, totalFee: 120000, status: "Pending", submittedDate: "2026-05-01", eventDate: "2026-05-15", paymentDeadline: "2026-05-10", notes: "Feature film production. Road closure 06:00-09:00." },
  { id: "PRM-2026-002", applicant: "Construtora Nacional Lda", contactEmail: "obras@construtora.co.mz", contactPhone: "+258 82 333 4444", purpose: "Construction Works", roadType: "Secondary Roads", location: "Av. 25 de Setembro, near Praca dos Trabalhadores", hours: 8, hourlyRate: 5000, totalFee: 40000, status: "Approved", submittedDate: "2026-04-20", eventDate: "2026-05-05", paymentDeadline: "2026-04-30", notes: "Water pipe replacement works." },
  { id: "PRM-2026-003", applicant: "Maputo Sports Federation", contactEmail: "events@maputo-sports.co.mz", contactPhone: "+258 86 555 6666", purpose: "Sporting Events", roadType: "Protocol Roads", location: "Marginal Avenue, full stretch", hours: 5, hourlyRate: 5000, totalFee: 25000, status: "Approved", submittedDate: "2026-04-25", eventDate: "2026-05-10", paymentDeadline: "2026-05-05" },
  { id: "PRM-2026-004", applicant: "Feira de Maputo Org.", contactEmail: "feira@maputo.co.mz", contactPhone: "+258 84 777 8888", purpose: "Fairs", roadType: "Secondary Roads", location: "Av. Eduardo Mondlane, block between Rua 1389 and Rua Consiglieri Pedroso", hours: 12, hourlyRate: 1000, totalFee: 12000, status: "Pending", submittedDate: "2026-05-03", eventDate: "2026-05-20", paymentDeadline: "2026-05-13", notes: "Annual trade fair. Partial road closure required." },
  { id: "PRM-2026-005", applicant: "Sunset Events Lda", contactEmail: "hello@sunsetevents.co.mz", contactPhone: "+258 82 999 0000", purpose: "For-Profit Events", roadType: "Tertiary Roads", location: "Rua da Mesquita, Sommerschield", hours: 6, hourlyRate: 5000, totalFee: 30000, status: "Rejected", submittedDate: "2026-04-28", eventDate: "2026-05-08", paymentDeadline: "2026-05-03", rejectionReason: "Incomplete documentation. Missing municipal approval letter." },
  { id: "PRM-2026-006", applicant: "TeleMaputo Broadcasting", contactEmail: "producao@telemaputo.co.mz", contactPhone: "+258 84 123 9876", purpose: "Filming", roadType: "Secondary Roads", location: "Av. Samora Machel, central section", hours: 4, hourlyRate: 30000, totalFee: 120000, status: "Pending", submittedDate: "2026-05-04", eventDate: "2026-05-18", paymentDeadline: "2026-05-14", notes: "TV commercial shoot. Night filming 22:00-02:00." },
  { id: "PRM-2026-007", applicant: "Maputo Marathon Committee", contactEmail: "marathon@maputo.gov.mz", contactPhone: "+258 86 321 6543", purpose: "Sporting Events", roadType: "Protocol Roads", location: "City centre circuit - Av. Julius Nyerere, Marginal, Av. Acordos de Lusaka", hours: 6, hourlyRate: 5000, totalFee: 30000, status: "Approved", submittedDate: "2026-04-15", eventDate: "2026-05-25", paymentDeadline: "2026-04-25" },
  { id: "PRM-2026-008", applicant: "Infraestrutura Mocambique EP", contactEmail: "projetos@infra.gov.mz", contactPhone: "+258 82 456 7890", purpose: "Construction Works", roadType: "Tertiary Roads", location: "Rua dos Desportistas, Polana", hours: 10, hourlyRate: 3500, totalFee: 35000, status: "Pending", submittedDate: "2026-05-05", eventDate: "2026-05-22", paymentDeadline: "2026-05-15", notes: "Fibre optic cable installation." },
]

export function PermitsPage() {
  const [permits, setPermits] = useState<Permit[]>(mockPermits)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [form, setForm] = useState({ applicant: "", contactEmail: "", contactPhone: "", purpose: "", roadType: "", location: "", hours: "", eventDate: "", notes: "" })

  const previewRate = form.purpose && form.roadType ? (TARIFFS[form.purpose]?.[form.roadType] ?? 0) : 0
  const previewFee  = previewRate * (Number(form.hours) || 0)

  const pendingCount  = permits.filter(p => p.status === "Pending").length
  const approvedCount = permits.filter(p => p.status === "Approved").length
  const rejectedCount = permits.filter(p => p.status === "Rejected").length
  const totalRevenue  = permits.filter(p => p.status === "Approved").reduce((s, p) => s + p.totalFee, 0)

  const filtered = permits.filter(p => {
    const q = searchQuery.toLowerCase()
    const matchSearch = p.id.toLowerCase().includes(q) || p.applicant.toLowerCase().includes(q) || p.purpose.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    return matchSearch && (statusFilter === "all" || p.status === statusFilter)
  })

  const handleApprove = () => {
    if (!selectedPermit) return
    setPermits(prev => prev.map(p => p.id === selectedPermit.id ? { ...p, status: "Approved" as const } : p))
    setIsApproveOpen(false); setIsDetailsOpen(false)
    toast.success("Permit approved", { description: `${selectedPermit.id} is now active.` })
  }

  const handleReject = () => {
    if (!selectedPermit || !rejectionReason.trim()) return
    setPermits(prev => prev.map(p => p.id === selectedPermit.id ? { ...p, status: "Rejected" as const, rejectionReason } : p))
    setIsRejectOpen(false); setIsDetailsOpen(false); setRejectionReason("")
    toast.error("Permit rejected", { description: `${selectedPermit.id} has been rejected.` })
  }

  const handleAddPermit = () => {
    const rate  = TARIFFS[form.purpose]?.[form.roadType] ?? 0
    const hours = Number(form.hours)
    const today    = new Date().toISOString().split("T")[0]
    const deadline = new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0]
    const np: Permit = {
      id: `PRM-2026-${String(permits.length + 1).padStart(3, "0")}`,
      applicant: form.applicant, contactEmail: form.contactEmail, contactPhone: form.contactPhone,
      purpose: form.purpose, roadType: form.roadType, location: form.location,
      hours, hourlyRate: rate, totalFee: rate * hours,
      status: "Pending", submittedDate: today, eventDate: form.eventDate, paymentDeadline: deadline,
      notes: form.notes || undefined,
    }
    setPermits(prev => [np, ...prev])
    setIsAddOpen(false)
    setForm({ applicant: "", contactEmail: "", contactPhone: "", purpose: "", roadType: "", location: "", hours: "", eventDate: "", notes: "" })
    toast.success("Permit submitted", { description: `${np.id} is pending review.` })
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => { setIsLoading(false); toast.info("Refreshed") }, 1500)
  }

  const isFormValid = !!(form.applicant && form.contactEmail && form.purpose && form.roadType && form.location && Number(form.hours) > 0 && form.eventDate)

  const statusBadge = (status: string) => {
    if (status === "Approved") return <Badge className="bg-[#D6F0E0] text-[#1C1C1C] text-sm px-3 py-1 gap-1"><CheckCircle className="h-3.5 w-3.5" />{status}</Badge>
    if (status === "Pending")  return <Badge className="bg-[#FFF306] text-[#1C1C1C] text-sm px-3 py-1 gap-1"><Clock className="h-3.5 w-3.5" />{status}</Badge>
    return <Badge className="bg-[#E5533D] text-white text-sm px-3 py-1 gap-1"><XCircle className="h-3.5 w-3.5" />{status}</Badge>
  }

  const purposeBadge = (purpose: string) => {
    const colors: Record<string, string> = {
      "Filming":            "bg-primary text-primary-foreground",
      "Construction Works": "bg-[#6B6B6B] text-white",
      "Sporting Events":    "bg-[#4FAF7C] text-white",
      "Fairs":              "bg-[#DAA22A] text-[#1C1C1C]",
      "For-Profit Events":  "bg-[#9B59B6] text-white",
    }
    return <Badge className={`${colors[purpose] ?? "bg-secondary text-secondary-foreground"} text-sm px-3 py-1`}>{purpose}</Badge>
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Permits</h1>
          <p className="text-lg text-muted-foreground">Road usage permit applications</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 text-base h-11 px-6">
          <Plus className="h-5 w-5" />New Permit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card><CardHeader className="pb-3"><CardDescription className="text-base">Total Permits</CardDescription><CardTitle className="text-4xl">{permits.length}</CardTitle></CardHeader><CardContent><p className="text-base text-muted-foreground">All applications</p></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardDescription className="text-base">Pending Review</CardDescription><CardTitle className="text-4xl text-[#DAA22A]">{pendingCount}</CardTitle></CardHeader><CardContent><Badge className="bg-[#FFF306] text-[#1C1C1C] text-sm">Requires action</Badge></CardContent></Card>
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
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="all" className="text-base">All ({permits.length})</TabsTrigger>
              <TabsTrigger value="Pending" className="text-base">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="Approved" className="text-base">Approved ({approvedCount})</TabsTrigger>
              <TabsTrigger value="Rejected" className="text-base">Rejected ({rejectedCount})</TabsTrigger>
            </TabsList>
          </Tabs>

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
                {filtered.map(permit => (
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
                        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => { setSelectedPermit(permit); setIsDetailsOpen(true) }}><Eye className="h-5 w-5" /></Button>
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
        </CardContent>
      </Card>


      {/* ── Details Dialog ── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl text-base">
          <DialogHeader>
            <DialogTitle className="text-2xl">Permit Details</DialogTitle>
            <DialogDescription className="text-base">{selectedPermit?.id}</DialogDescription>
          </DialogHeader>
          {selectedPermit && (
            <div className="space-y-5 py-2">
              <div className="flex items-center justify-between">{statusBadge(selectedPermit.status)}<span className="text-sm text-muted-foreground">Submitted {selectedPermit.submittedDate}</span></div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm text-muted-foreground">Applicant</Label><p className="text-base font-semibold">{selectedPermit.applicant}</p></div>
                <div><Label className="text-sm text-muted-foreground">Contact Email</Label><p className="text-base">{selectedPermit.contactEmail}</p></div>
                <div><Label className="text-sm text-muted-foreground">Phone</Label><p className="text-base">{selectedPermit.contactPhone}</p></div>
                <div><Label className="text-sm text-muted-foreground">Purpose</Label><div className="mt-1">{purposeBadge(selectedPermit.purpose)}</div></div>
                <div><Label className="text-sm text-muted-foreground">Road Type</Label><p className="text-base font-medium">{selectedPermit.roadType}</p></div>
                <div><Label className="text-sm text-muted-foreground">Duration</Label><p className="text-base font-medium">{selectedPermit.hours} hours</p></div>
                <div className="col-span-2"><Label className="text-sm text-muted-foreground">Location</Label><p className="text-base">{selectedPermit.location}</p></div>
                <div><Label className="text-sm text-muted-foreground">Event Date</Label><p className="text-base font-medium">{selectedPermit.eventDate}</p></div>
                <div><Label className="text-sm text-muted-foreground">Payment Deadline</Label><p className="text-base font-medium">{selectedPermit.paymentDeadline}</p></div>
              </div>
              <Separator />
              <div className="rounded-lg bg-muted/40 p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Fee Calculation</p>
                <p className="text-base">{selectedPermit.hourlyRate.toLocaleString()} MZN/hr × {selectedPermit.hours} hrs</p>
                <p className="text-2xl font-bold text-primary">= {selectedPermit.totalFee.toLocaleString()} MZN</p>
              </div>
              {selectedPermit.notes && <div><Label className="text-sm text-muted-foreground">Notes</Label><p className="text-base mt-1">{selectedPermit.notes}</p></div>}
              {selectedPermit.rejectionReason && <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3"><Label className="text-sm text-destructive">Rejection Reason</Label><p className="text-base mt-1">{selectedPermit.rejectionReason}</p></div>}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="text-base h-11 px-6">Close</Button>
            {selectedPermit?.status === "Pending" && (
              <>
                <Button variant="outline" onClick={() => setIsRejectOpen(true)} className="text-base h-11 px-6 text-destructive border-destructive/30 hover:bg-destructive/10"><XCircle className="h-4 w-4 mr-2" />Reject</Button>
                <Button onClick={() => setIsApproveOpen(true)} className="text-base h-11 px-6 bg-[#D6F0E0] text-[#1C1C1C] hover:bg-[#D6F0E0]/80"><CheckCircle className="h-4 w-4 mr-2" />Approve</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Approve Dialog ── */}
      <AlertDialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <AlertDialogContent className="text-base">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Approve Permit</AlertDialogTitle>
            <AlertDialogDescription className="text-base">Approve <strong>{selectedPermit?.id}</strong> for <strong>{selectedPermit?.applicant}</strong>? The permit will become active and an invoice for <strong>{selectedPermit?.totalFee.toLocaleString()} MZN</strong> will be issued.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-base h-11 px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="bg-[#D6F0E0] text-[#1C1C1C] hover:bg-[#D6F0E0]/80 text-base h-11 px-6">Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Reject Dialog ── */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="text-base">
          <DialogHeader><DialogTitle className="text-2xl">Reject Permit</DialogTitle><DialogDescription className="text-base">Provide a reason for rejecting {selectedPermit?.id}</DialogDescription></DialogHeader>
          <div className="py-4 space-y-2">
            <Label className="text-base">Rejection Reason *</Label>
            <Textarea placeholder="Enter reason..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={4} className="text-base" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)} className="text-base h-11 px-6">Cancel</Button>
            <Button disabled={!rejectionReason.trim()} onClick={handleReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-base h-11 px-6">Reject Permit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* ── New Permit Dialog ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl text-base">
          <DialogHeader>
            <DialogTitle className="text-2xl">New Permit Application</DialogTitle>
            <DialogDescription className="text-base">Submit a road usage permit request. Fee is calculated automatically.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-base">Applicant / Organisation *</Label>
                <Input placeholder="e.g. Maputo Film Productions" value={form.applicant} onChange={e => setForm({...form, applicant: e.target.value})} className="text-base h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Contact Email *</Label>
                <Input type="email" placeholder="email@example.co.mz" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} className="text-base h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Contact Phone</Label>
                <Input placeholder="+258 84 000 0000" value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} className="text-base h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Purpose *</Label>
                <Select value={form.purpose} onValueChange={v => setForm({...form, purpose: v, roadType: ""})}>
                  <SelectTrigger className="text-base h-11"><SelectValue placeholder="Select purpose" /></SelectTrigger>
                  <SelectContent>{PURPOSES.map(p => <SelectItem key={p} value={p} className="text-base">{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-base">Road Type *</Label>
                <Select value={form.roadType} onValueChange={v => setForm({...form, roadType: v})} disabled={!form.purpose}>
                  <SelectTrigger className="text-base h-11"><SelectValue placeholder="Select road type" /></SelectTrigger>
                  <SelectContent>{ROAD_TYPES.map(r => <SelectItem key={r} value={r} className="text-base">{r} — {form.purpose ? (TARIFFS[form.purpose]?.[r] ?? 0).toLocaleString() : "—"} MZN/hr</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-base">Duration (hours) *</Label>
                <Input type="number" min="1" placeholder="e.g. 3" value={form.hours} onChange={e => setForm({...form, hours: e.target.value})} className="text-base h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Event Date *</Label>
                <Input type="date" value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} className="text-base h-11" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-base">Location / Road Section *</Label>
                <Input placeholder="e.g. Av. Julius Nyerere, between Rua A and Rua B" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="text-base h-11" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-base">Notes (optional)</Label>
                <Textarea placeholder="Any additional details..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="text-base" />
              </div>
            </div>
            {previewFee > 0 && (
              <div className="rounded-lg bg-muted/40 border p-4 space-y-1">
                <p className="text-sm text-muted-foreground">Fee Preview</p>
                <p className="text-base">{previewRate.toLocaleString()} MZN/hr × {form.hours || 0} hrs</p>
                <p className="text-2xl font-bold text-primary">= {previewFee.toLocaleString()} MZN</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="text-base h-11 px-6">Cancel</Button>
            <Button disabled={!isFormValid} onClick={handleAddPermit} className="text-base h-11 px-6">Submit Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
