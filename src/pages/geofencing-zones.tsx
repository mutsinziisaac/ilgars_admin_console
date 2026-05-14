import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { AlertCircle, CheckCircle, Edit, Loader2, Plus, XCircle } from "lucide-react"
import { toast } from "sonner"
import {
  useCreateExemptArea,
  useExemptAreasList,
  useUpdateExemptArea,
} from "@/lib/api/exempt-areas/hooks"
import type { ExemptArea } from "@/lib/api/exempt-areas/schemas"
import {
  getMunicipalityDisplayName,
  getStoredMunicipalityId,
} from "@/lib/municipality-registry"

const defaultGeoJson = JSON.stringify(
  {
    type: "Polygon",
    coordinates: [
      [
        [32.575, -25.965],
        [32.585, -25.965],
        [32.585, -25.955],
        [32.575, -25.955],
        [32.575, -25.965],
      ],
    ],
  },
  null,
  2,
)

const createDefaultAreaCode = () => `PORT-EXEMPT-${Date.now()}`

const getBoundaryDataSize = (area: ExemptArea) => {
  if (!area.boundaryData) return "-"

  return `${area.boundaryData.length.toLocaleString()} chars`
}

export function GeofencingZonesPage() {
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState(getStoredMunicipalityId())
  const [selectedArea, setSelectedArea] = useState<ExemptArea | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [areaForm, setAreaForm] = useState({
    municipalityId: selectedMunicipalityId,
    code: createDefaultAreaCode(),
    name: "",
    description: "",
    format: "GEOJSON",
    boundaryData: defaultGeoJson,
    active: true,
  })

  const { data, isLoading, error, refetch } = useExemptAreasList({
    municipalityId: selectedMunicipalityId,
    active: true,
  })
  const createMutation = useCreateExemptArea()
  const updateMutation = useUpdateExemptArea()
  const areas = data?.data ?? data?.content ?? []

  const resetForm = (municipalityId = getStoredMunicipalityId()) => {
    setSelectedMunicipalityId(municipalityId)
    setAreaForm({
      municipalityId,
      code: createDefaultAreaCode(),
      name: "",
      description: "",
      format: "GEOJSON",
      boundaryData: defaultGeoJson,
      active: true,
    })
  }

  const validateBoundaryData = () => {
    try {
      JSON.parse(areaForm.boundaryData)
      return true
    } catch {
      toast.error("GeoJSON boundary must be valid JSON")
      return false
    }
  }

  const openCreateArea = () => {
    resetForm()
    setIsCreateOpen(true)
  }

  const openEditArea = (area: ExemptArea) => {
    setSelectedArea(area)
    setAreaForm({
      municipalityId: area.municipalityId || selectedMunicipalityId,
      code: area.code || createDefaultAreaCode(),
      name: area.name,
      description: area.description || "",
      format: area.format || "GEOJSON",
      boundaryData: area.boundaryData || defaultGeoJson,
      active: area.active,
    })
    setIsEditOpen(true)
  }

  const handleCreateArea = () => {
    if (!validateBoundaryData()) return

    createMutation.mutate(
      {
        municipalityId: areaForm.municipalityId,
        code: areaForm.code.trim(),
        name: areaForm.name.trim(),
        description: areaForm.description.trim() || undefined,
        format: areaForm.format,
        boundaryData: areaForm.boundaryData,
        active: areaForm.active,
      },
      {
        onSuccess: () => {
          toast.success("Exempt area created successfully")
          setIsCreateOpen(false)
          resetForm(areaForm.municipalityId)
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to create exempt area")
        },
      },
    )
  }

  const handleUpdateArea = () => {
    if (!selectedArea) return
    if (!validateBoundaryData()) return

    updateMutation.mutate(
      {
        id: selectedArea.id,
        payload: {
          municipalityId: selectedArea.municipalityId || areaForm.municipalityId,
          code: areaForm.code.trim(),
          name: areaForm.name.trim(),
          description: areaForm.description.trim() || undefined,
          format: areaForm.format,
          boundaryData: areaForm.boundaryData,
          active: areaForm.active,
        },
      },
      {
        onSuccess: () => {
          toast.success("Exempt area updated successfully")
          setIsEditOpen(false)
          setSelectedArea(null)
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to update exempt area")
        },
      },
    )
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

  const renderAreaForm = (isEdit = false) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base">Municipality</Label>
        <div className="rounded-md border bg-muted/40 px-3 py-3 text-base font-medium">
          {getMunicipalityDisplayName(areaForm.municipalityId)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? "edit-" : ""}code`} className="text-base">Area Code *</Label>
          <Input
            id={`${isEdit ? "edit-" : ""}code`}
            value={areaForm.code}
            onChange={(event) => setAreaForm({ ...areaForm, code: event.target.value })}
            placeholder="e.g., PORT-EXEMPT-2026"
            className="text-base h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? "edit-" : ""}name`} className="text-base">Area Name *</Label>
          <Input
            id={`${isEdit ? "edit-" : ""}name`}
            value={areaForm.name}
            onChange={(event) => setAreaForm({ ...areaForm, name: event.target.value })}
            placeholder="e.g., Port Exempt Area"
            className="text-base h-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-base">Format</Label>
          <div className="rounded-md border bg-muted/40 px-3 py-3 text-base font-medium">
            {areaForm.format}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? "edit-" : ""}description`} className="text-base">Description</Label>
          <Input
            id={`${isEdit ? "edit-" : ""}description`}
            value={areaForm.description}
            onChange={(event) => setAreaForm({ ...areaForm, description: event.target.value })}
            placeholder="Short operational note for this area"
            className="text-base h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${isEdit ? "edit-" : ""}boundaryData`} className="text-base">Boundary Data *</Label>
        <Textarea
          id={`${isEdit ? "edit-" : ""}boundaryData`}
          value={areaForm.boundaryData}
          onChange={(event) => setAreaForm({ ...areaForm, boundaryData: event.target.value })}
          placeholder='{"type":"Polygon","coordinates":[[[...]]]}'
          className="text-base min-h-[220px] font-mono text-sm"
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Exempt Areas</h1>
          <p className="text-lg text-muted-foreground">Manage geofenced areas for {getMunicipalityDisplayName(selectedMunicipalityId)}</p>
        </div>
        <Button onClick={openCreateArea} disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Create Exempt Area
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Exempt Areas</CardTitle>
          <CardDescription className="text-base">
            Configure GeoJSON boundaries for municipality exemptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
              <h3 className="mb-2 text-lg font-semibold">Failed to load exempt areas</h3>
              <p className="mb-4 text-muted-foreground">{(error as Error)?.message || "An error occurred"}</p>
              <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-3 rounded-md border border-dashed p-5 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading exempt areas...</span>
            </div>
          ) : areas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No exempt areas found</h3>
              <p className="text-muted-foreground">Create an exempt area for {getMunicipalityDisplayName(selectedMunicipalityId)}.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Area Name</TableHead>
                  <TableHead className="text-base">Code</TableHead>
                  <TableHead className="text-base">Description</TableHead>
                  <TableHead className="text-base">Format</TableHead>
                  <TableHead className="text-base">Boundary</TableHead>
                  <TableHead className="text-base">Status</TableHead>
                  <TableHead className="text-right text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell className="font-medium text-base">{area.name}</TableCell>
                    <TableCell className="text-base font-mono">{area.code || "-"}</TableCell>
                    <TableCell className="text-base">{area.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{area.format || "GEOJSON"}</Badge>
                    </TableCell>
                    <TableCell className="text-base">{getBoundaryDataSize(area)}</TableCell>
                    <TableCell>{getStatusBadge(area.active)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditArea(area)}>
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

      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen} className="w-full max-w-3xl">
        <ModalHeader onClose={() => setIsCreateOpen(false)}>
          <ModalTitle>Create Exempt Area</ModalTitle>
          <ModalDescription>Define a geofenced exempt area with GeoJSON boundary data</ModalDescription>
        </ModalHeader>
        <ModalBody>{renderAreaForm()}</ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={createMutation.isPending}>Cancel</Button>
          <Button onClick={handleCreateArea} disabled={createMutation.isPending || !areaForm.name.trim() || !areaForm.code.trim()}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Exempt Area"
            )}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={isEditOpen} onOpenChange={setIsEditOpen} className="w-full max-w-3xl">
        <ModalHeader onClose={() => setIsEditOpen(false)}>
          <ModalTitle>Edit Exempt Area</ModalTitle>
          <ModalDescription>Update the exempt area definition and GeoJSON boundary</ModalDescription>
        </ModalHeader>
        <ModalBody>{renderAreaForm(true)}</ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={updateMutation.isPending}>Cancel</Button>
          <Button onClick={handleUpdateArea} disabled={updateMutation.isPending || !areaForm.name.trim() || !areaForm.code.trim()}>
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
    </div>
  )
}
