import { useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Building2, MapPin, Clock, Plus, Edit, CheckCircle, XCircle, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { MunicipalitiesApi } from "@/lib/api"
import type { BoundaryVersion, Municipality } from "@/lib/api"
import { ACTIVE_MUNICIPALITY_ID_STORAGE_KEY } from "@/lib/api/constants"

const defaultBoundaryData = "{\"type\":\"Polygon\",\"coordinates\":[[[32.45,-26.1],[32.75,-26.1],[32.75,-25.92],[32.64,-25.92],[32.64,-25.8],[32.45,-25.8],[32.45,-26.1]]]}"

export function MunicipalityPage() {
  const boundaryFileInputRef = useRef<HTMLInputElement | null>(null)
  const [municipality, setMunicipality] = useState<Municipality | null>(null)
  const [boundaries, setBoundaries] = useState<BoundaryVersion[]>([])
  const [isEditMunicipalityOpen, setIsEditMunicipalityOpen] = useState(false)
  const [isAddBoundaryOpen, setIsAddBoundaryOpen] = useState(false)
  const [isCreateMunicipalityOpen, setIsCreateMunicipalityOpen] = useState(false)
  const [isCreatingMunicipality, setIsCreatingMunicipality] = useState(false)
  const [isCreatingBoundary, setIsCreatingBoundary] = useState(false)
  const [activatingBoundaryId, setActivatingBoundaryId] = useState<string | null>(null)
  
  const [municipalityForm, setMunicipalityForm] = useState({
    code: "",
    name: "",
    timezone: "Africa/Maputo"
  })

  const [createMunicipalityForm, setCreateMunicipalityForm] = useState({
    code: "MAPUTO-UAT",
    name: "Maputo UAT",
    timezone: "Africa/Maputo"
  })

  const [boundaryForm, setBoundaryForm] = useState({
    version: "v1",
    displayName: "Maputo GeoJSON Boundary",
    format: "GEOJSON",
    boundaryData: defaultBoundaryData
  })

  const handleUpdateMunicipality = () => {
    if (!municipality) return

    setMunicipality({
      ...municipality,
      ...municipalityForm
    })
    setIsEditMunicipalityOpen(false)
    toast.success("Municipality updated successfully")
  }

  const handleAddBoundary = async () => {
    if (!municipality?.id) {
      toast.error("Create a municipality before adding a boundary")
      return
    }

    try {
      JSON.parse(boundaryForm.boundaryData)
    } catch {
      toast.error("Boundary data must be valid GeoJSON JSON")
      return
    }

    setIsCreatingBoundary(true)
    try {
      const response = await MunicipalitiesApi.createBoundaryVersion(municipality.id, {
        version: boundaryForm.version,
        displayName: boundaryForm.displayName,
        format: boundaryForm.format,
        boundaryData: boundaryForm.boundaryData,
      })
      setBoundaries([response.data, ...boundaries])
      setIsAddBoundaryOpen(false)
      setBoundaryForm({
        version: "v1",
        displayName: "Maputo GeoJSON Boundary",
        format: "GEOJSON",
        boundaryData: defaultBoundaryData,
      })
      toast.success("Boundary version created successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create boundary")
    } finally {
      setIsCreatingBoundary(false)
    }
  }

  const handleBoundaryFileUpload = async (file: File | undefined) => {
    if (!file) return

    try {
      const boundaryData = await file.text()
      JSON.parse(boundaryData)
      setBoundaryForm({
        ...boundaryForm,
        displayName: boundaryForm.displayName || file.name.replace(/\.(geo)?json$/i, ""),
        boundaryData,
      })
      toast.success("GeoJSON boundary loaded")
    } catch {
      toast.error("Upload a valid GeoJSON file")
    } finally {
      if (boundaryFileInputRef.current) {
        boundaryFileInputRef.current.value = ""
      }
    }
  }

  const handleActivateBoundary = async (boundaryId: string) => {
    setActivatingBoundaryId(boundaryId)
    try {
      const response = await MunicipalitiesApi.activateBoundaryVersion(boundaryId)
      setBoundaries(boundaries.map(b => ({
        ...b,
        active: b.id === boundaryId,
        activatedAt: b.id === boundaryId ? (response.data.activatedAt || new Date().toISOString().split('T')[0]) : b.activatedAt
      })))
      toast.success("Boundary version activated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to activate boundary")
    } finally {
      setActivatingBoundaryId(null)
    }
  }

  const handleCreateMunicipality = async () => {
    setIsCreatingMunicipality(true)
    try {
      const response = await MunicipalitiesApi.createMunicipality({
        code: createMunicipalityForm.code,
        name: createMunicipalityForm.name,
        timezone: createMunicipalityForm.timezone,
      })
      const newMunicipality = response.data
      localStorage.setItem(ACTIVE_MUNICIPALITY_ID_STORAGE_KEY, newMunicipality.id)
      setMunicipality(newMunicipality)
      setMunicipalityForm({
        code: newMunicipality.code,
        name: newMunicipality.name,
        timezone: newMunicipality.timezone
      })
      setIsCreateMunicipalityOpen(false)
      setBoundaries([])
      toast.success("Municipality created successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create municipality")
    } finally {
      setIsCreatingMunicipality(false)
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Municipality Configuration</h1>
          <p className="text-lg text-muted-foreground">Create municipalities and manage GeoJSON boundary versions</p>
        </div>
        <Button onClick={() => setIsCreateMunicipalityOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Municipality
        </Button>
      </div>

      {/* Municipality Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Municipality Information</CardTitle>
              <CardDescription className="text-base">Current municipality profile used for configuration requests</CardDescription>
            </div>
            <Button
              onClick={() => setIsEditMunicipalityOpen(true)}
              disabled={!municipality}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {municipality ? (
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
          ) : (
            <div className="rounded-md border border-dashed p-5">
              <div>
                <p className="font-medium">No municipality created in this session</p>
                <p className="text-sm text-muted-foreground">Create one first so boundary requests use a real backend ID.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boundary Versions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Boundary Versions</CardTitle>
              <CardDescription className="text-base">Create and activate boundary versions for this municipality</CardDescription>
            </div>
            <Button
              onClick={() => setIsAddBoundaryOpen(true)}
              disabled={!municipality}
            >
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
              {boundaries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Create a boundary version to activate it here.
                  </TableCell>
                </TableRow>
              )}
              {boundaries.map((boundary) => (
                <TableRow key={boundary.id}>
                  <TableCell className="font-medium text-base">{boundary.version}</TableCell>
                  <TableCell className="text-base">{boundary.displayName}</TableCell>
                  <TableCell className="text-base">{boundary.format}</TableCell>
                  <TableCell className="text-base">{boundary.createdAt}</TableCell>
                  <TableCell className="text-base">{boundary.activatedAt || "-"}</TableCell>
                  <TableCell>{getStatusBadge(!!boundary.active)}</TableCell>
                  <TableCell className="text-right">
                    {!boundary.active && (
                      <Button
                        size="sm"
                        onClick={() => handleActivateBoundary(boundary.id)}
                        disabled={activatingBoundaryId === boundary.id}
                      >
                        {activatingBoundaryId === boundary.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Activate"
                        )}
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
          <ModalDescription>Create a GeoJSON boundary version for {municipality?.name ?? "this municipality"}</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="version" className="text-base">Version Code *</Label>
              <Input
                id="version"
                value={boundaryForm.version}
                onChange={(e) => setBoundaryForm({ ...boundaryForm, version: e.target.value })}
                placeholder="e.g., v1"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-base">Display Name *</Label>
              <Input
                id="displayName"
                value={boundaryForm.displayName}
                onChange={(e) => setBoundaryForm({ ...boundaryForm, displayName: e.target.value })}
                placeholder="e.g., Maputo GeoJSON Boundary"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="boundaryData" className="text-base">GeoJSON Data *</Label>
              <Textarea
                id="boundaryData"
                value={boundaryForm.boundaryData}
                onChange={(e) => setBoundaryForm({ ...boundaryForm, boundaryData: e.target.value })}
                placeholder={defaultBoundaryData}
                className="text-base min-h-[200px] font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Paste a GeoJSON Polygon, MultiPolygon, Feature, or FeatureCollection, or upload a .geojson file.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={boundaryFileInputRef}
                type="file"
                accept=".geojson,.json,application/geo+json,application/json"
                className="hidden"
                onChange={(event) => handleBoundaryFileUpload(event.target.files?.[0])}
              />
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() => boundaryFileInputRef.current?.click()}
                disabled={isCreatingBoundary}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload GeoJSON File
              </Button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddBoundaryOpen(false)} disabled={isCreatingBoundary}>Cancel</Button>
          <Button onClick={handleAddBoundary} disabled={isCreatingBoundary}>
            {isCreatingBoundary ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Boundary"
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Create Municipality Modal */}
      <Modal open={isCreateMunicipalityOpen} onOpenChange={setIsCreateMunicipalityOpen} className="w-full max-w-2xl">
        <ModalHeader onClose={() => setIsCreateMunicipalityOpen(false)}>
          <ModalTitle>Create Municipality</ModalTitle>
          <ModalDescription>Use the deployed Core municipality contract</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="createCode" className="text-base">Municipality Code *</Label>
              <Input
                id="createCode"
                value={createMunicipalityForm.code}
                onChange={(e) => setCreateMunicipalityForm({ ...createMunicipalityForm, code: e.target.value })}
                placeholder="e.g., MAPUTO-UAT"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="createName" className="text-base">Municipality Name *</Label>
              <Input
                id="createName"
                value={createMunicipalityForm.name}
                onChange={(e) => setCreateMunicipalityForm({ ...createMunicipalityForm, name: e.target.value })}
                placeholder="e.g., Maputo UAT"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="createTimezone" className="text-base">Timezone *</Label>
              <Input
                id="createTimezone"
                value={createMunicipalityForm.timezone}
                onChange={(e) => setCreateMunicipalityForm({ ...createMunicipalityForm, timezone: e.target.value })}
                placeholder="e.g., Africa/Maputo"
                className="text-base h-11"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsCreateMunicipalityOpen(false)} disabled={isCreatingMunicipality}>Cancel</Button>
          <Button onClick={handleCreateMunicipality} disabled={isCreatingMunicipality}>
            {isCreatingMunicipality ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Municipality"
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
