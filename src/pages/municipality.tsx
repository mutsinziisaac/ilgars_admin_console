import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Building2, MapPin, Clock, Plus, Edit, CheckCircle, XCircle, Upload } from "lucide-react"
import { toast } from "sonner"

// Mock municipality data
const mockMunicipality = {
  id: "mun-001",
  code: "MAPUTO-UAT",
  name: "Maputo UAT",
  timezone: "Africa/Maputo",
  createdAt: "2026-01-15",
  status: "Active"
}

// Mock boundary versions
const mockBoundaries = [
  {
    id: "bnd-001",
    version: "maputo-v1",
    displayName: "Maputo Boundary",
    format: "GEOJSON",
    active: true,
    createdAt: "2026-01-15",
    activatedAt: "2026-01-15"
  },
  {
    id: "bnd-002",
    version: "maputo-v2",
    displayName: "Maputo Boundary Updated",
    format: "GEOJSON",
    active: false,
    createdAt: "2026-03-10",
    activatedAt: null
  }
]

export function MunicipalityPage() {
  const [municipality, setMunicipality] = useState(mockMunicipality)
  const [boundaries, setBoundaries] = useState(mockBoundaries)
  const [isEditMunicipalityOpen, setIsEditMunicipalityOpen] = useState(false)
  const [isAddBoundaryOpen, setIsAddBoundaryOpen] = useState(false)
  
  const [municipalityForm, setMunicipalityForm] = useState({
    code: municipality.code,
    name: municipality.name,
    timezone: municipality.timezone
  })

  const [boundaryForm, setBoundaryForm] = useState({
    version: "",
    displayName: "",
    format: "GEOJSON",
    boundaryData: ""
  })

  const handleUpdateMunicipality = () => {
    setMunicipality({
      ...municipality,
      ...municipalityForm
    })
    setIsEditMunicipalityOpen(false)
    toast.success("Municipality updated successfully")
  }

  const handleAddBoundary = () => {
    const newBoundary = {
      id: `bnd-${boundaries.length + 1}`,
      version: boundaryForm.version,
      displayName: boundaryForm.displayName,
      format: boundaryForm.format,
      active: false,
      createdAt: new Date().toISOString().split('T')[0],
      activatedAt: null
    }
    setBoundaries([...boundaries, newBoundary])
    setIsAddBoundaryOpen(false)
    setBoundaryForm({ version: "", displayName: "", format: "GEOJSON", boundaryData: "" })
    toast.success("Boundary version created successfully")
  }

  const handleActivateBoundary = (boundaryId: string) => {
    setBoundaries(boundaries.map(b => ({
      ...b,
      active: b.id === boundaryId,
      activatedAt: b.id === boundaryId ? new Date().toISOString().split('T')[0] : b.activatedAt
    })))
    toast.success("Boundary version activated")
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
      <div>
        <h1 className="text-4xl font-semibold text-foreground">Municipality Configuration</h1>
        <p className="text-lg text-muted-foreground">Manage municipality settings and boundaries</p>
      </div>

      {/* Municipality Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Municipality Information</CardTitle>
              <CardDescription className="text-base">Basic municipality configuration</CardDescription>
            </div>
            <Button onClick={() => setIsEditMunicipalityOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Municipality Code</p>
                  <p className="text-base font-semibold">{municipality.code}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Municipality Name</p>
                  <p className="text-base font-semibold">{municipality.name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Timezone</p>
                  <p className="text-base font-semibold">{municipality.timezone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-[#5B8C5A] mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="bg-[#5B8C5A] text-white">{municipality.status}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boundary Versions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Boundary Versions</CardTitle>
              <CardDescription className="text-base">Manage municipality boundary GeoJSON versions</CardDescription>
            </div>
            <Button onClick={() => setIsAddBoundaryOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Boundary
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Version</TableHead>
                <TableHead className="text-base">Display Name</TableHead>
                <TableHead className="text-base">Format</TableHead>
                <TableHead className="text-base">Created</TableHead>
                <TableHead className="text-base">Activated</TableHead>
                <TableHead className="text-base">Status</TableHead>
                <TableHead className="text-right text-base">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boundaries.map((boundary) => (
                <TableRow key={boundary.id}>
                  <TableCell className="font-medium text-base">{boundary.version}</TableCell>
                  <TableCell className="text-base">{boundary.displayName}</TableCell>
                  <TableCell className="text-base">{boundary.format}</TableCell>
                  <TableCell className="text-base">{boundary.createdAt}</TableCell>
                  <TableCell className="text-base">{boundary.activatedAt || "-"}</TableCell>
                  <TableCell>{getStatusBadge(boundary.active)}</TableCell>
                  <TableCell className="text-right">
                    {!boundary.active && (
                      <Button
                        size="sm"
                        onClick={() => handleActivateBoundary(boundary.id)}
                      >
                        Activate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Municipality Modal */}
      <Modal open={isEditMunicipalityOpen} onOpenChange={setIsEditMunicipalityOpen} className="w-full max-w-2xl">
        <ModalHeader onClose={() => setIsEditMunicipalityOpen(false)}>
          <ModalTitle>Edit Municipality</ModalTitle>
          <ModalDescription>Update municipality configuration</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-base">Municipality Code *</Label>
              <Input
                id="code"
                value={municipalityForm.code}
                onChange={(e) => setMunicipalityForm({ ...municipalityForm, code: e.target.value })}
                placeholder="e.g., MAPUTO-UAT"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Municipality Name *</Label>
              <Input
                id="name"
                value={municipalityForm.name}
                onChange={(e) => setMunicipalityForm({ ...municipalityForm, name: e.target.value })}
                placeholder="e.g., Maputo UAT"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-base">Timezone *</Label>
              <Input
                id="timezone"
                value={municipalityForm.timezone}
                onChange={(e) => setMunicipalityForm({ ...municipalityForm, timezone: e.target.value })}
                placeholder="e.g., Africa/Maputo"
                className="text-base h-11"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditMunicipalityOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateMunicipality}>Save Changes</Button>
        </ModalFooter>
      </Modal>

      {/* Add Boundary Modal */}
      <Modal open={isAddBoundaryOpen} onOpenChange={setIsAddBoundaryOpen} className="w-full max-w-3xl">
        <ModalHeader onClose={() => setIsAddBoundaryOpen(false)}>
          <ModalTitle>Add Boundary Version</ModalTitle>
          <ModalDescription>Upload a new GeoJSON boundary version</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="version" className="text-base">Version Code *</Label>
              <Input
                id="version"
                value={boundaryForm.version}
                onChange={(e) => setBoundaryForm({ ...boundaryForm, version: e.target.value })}
                placeholder="e.g., maputo-v3"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-base">Display Name *</Label>
              <Input
                id="displayName"
                value={boundaryForm.displayName}
                onChange={(e) => setBoundaryForm({ ...boundaryForm, displayName: e.target.value })}
                placeholder="e.g., Maputo Boundary 2026"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="boundaryData" className="text-base">GeoJSON Data *</Label>
              <Textarea
                id="boundaryData"
                value={boundaryForm.boundaryData}
                onChange={(e) => setBoundaryForm({ ...boundaryForm, boundaryData: e.target.value })}
                placeholder='{"type":"FeatureCollection","features":[...]}'
                className="text-base min-h-[200px] font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Paste GeoJSON FeatureCollection or upload a .geojson file
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload GeoJSON File
              </Button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddBoundaryOpen(false)}>Cancel</Button>
          <Button onClick={handleAddBoundary}>Create Boundary</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
