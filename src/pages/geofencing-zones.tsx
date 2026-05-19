import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertCircle, ArrowLeft, CheckCircle, Edit, Loader2, MoreHorizontal, Plus, XCircle } from "lucide-react"
import { toast } from "sonner"
import { EditableGoogleMap } from "@/components/ui/map"
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
)

const compactJson = (value: string) => {
  try {
    return JSON.stringify(JSON.parse(value))
  } catch {
    return value
  }
}

const toLatLngFromGeoJsonCoordinate = (coordinate: unknown): [number, number] | null => {
  if (!Array.isArray(coordinate) || coordinate.length < 2) return null
  const [lng, lat] = coordinate
  if (typeof lat !== "number" || typeof lng !== "number") return null
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  return [lat, lng]
}

const getPolygonCoordinates = (value: unknown): unknown[] | null => {
  if (!value || typeof value !== "object") return null

  const record = value as Record<string, unknown>
  if (record.type === "Feature") return getPolygonCoordinates(record.geometry)

  if (record.type === "FeatureCollection" && Array.isArray(record.features)) {
    const polygonFeature = record.features
      .map((feature) => getPolygonCoordinates(feature))
      .find((coordinates): coordinates is unknown[] => Boolean(coordinates))
    return polygonFeature ?? null
  }

  if (record.type === "Polygon" && Array.isArray(record.coordinates)) {
    const [outerRing] = record.coordinates
    return Array.isArray(outerRing) ? outerRing : null
  }

  if (record.type === "MultiPolygon" && Array.isArray(record.coordinates)) {
    const [firstPolygon] = record.coordinates
    if (!Array.isArray(firstPolygon)) return null
    const [outerRing] = firstPolygon
    return Array.isArray(outerRing) ? outerRing : null
  }

  return null
}

const extractPolygonLatLngs = (boundaryData: string): [number, number][] => {
  try {
    const parsed = JSON.parse(boundaryData)
    const coordinates = getPolygonCoordinates(parsed)
    if (!coordinates) return []

    const latLngs = coordinates
      .map(toLatLngFromGeoJsonCoordinate)
      .filter((point): point is [number, number] => Boolean(point))

    if (latLngs.length > 1) {
      const first = latLngs[0]
      const last = latLngs[latLngs.length - 1]
      if (first[0] === last[0] && first[1] === last[1]) return latLngs.slice(0, -1)
    }

    return latLngs
  } catch {
    return []
  }
}

const createBoundaryGeoJson = (points: [number, number][]) => {
  const coordinates = points.map(([lat, lng]) => [Number(lng.toFixed(6)), Number(lat.toFixed(6))])
  if (coordinates.length) {
    const first = coordinates[0]
    const last = coordinates[coordinates.length - 1]
    if (first[0] !== last[0] || first[1] !== last[1]) coordinates.push(first)
  }

  return JSON.stringify({
    type: "Polygon",
    coordinates: [coordinates],
  })
}

const createDefaultAreaCode = () => `PORT-EXEMPT-${Date.now()}`
const MAPUTO_CENTER: [number, number] = [-25.9655, 32.5832]

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
  const [areaDraftPoints, setAreaDraftPoints] = useState<[number, number][]>(() =>
    extractPolygonLatLngs(defaultGeoJson),
  )

  const { data, isLoading, error, refetch } = useExemptAreasList({
    municipalityId: selectedMunicipalityId,
    active: true,
  })
  const createMutation = useCreateExemptArea()
  const updateMutation = useUpdateExemptArea()
  const areas = data?.data ?? data?.content ?? []

  const resetForm = (municipalityId = getStoredMunicipalityId()) => {
    setSelectedMunicipalityId(municipalityId)
    setAreaDraftPoints(extractPolygonLatLngs(defaultGeoJson))
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
    const boundaryData = area.boundaryData || defaultGeoJson
    setSelectedArea(area)
    setAreaForm({
      municipalityId: area.municipalityId || selectedMunicipalityId,
      code: area.code || createDefaultAreaCode(),
      name: area.name,
      description: area.description || "",
      format: area.format || "GEOJSON",
      boundaryData,
      active: area.active,
    })
    setAreaDraftPoints(extractPolygonLatLngs(boundaryData))
    setIsEditOpen(true)
  }

  const closeEditArea = () => {
    setIsEditOpen(false)
    setSelectedArea(null)
  }

  const handleApplyDrawnBoundary = () => {
    if (areaDraftPoints.length < 3) {
      toast.error("Add at least three points before applying the polygon")
      return
    }

    setAreaForm((current) => ({
      ...current,
      boundaryData: createBoundaryGeoJson(areaDraftPoints),
    }))
    toast.success("Map polygon applied to boundary data")
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
          toast.success("Exempted area created successfully")
          setIsCreateOpen(false)
          resetForm(areaForm.municipalityId)
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to create exempted area")
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
          toast.success("Exempted area updated successfully")
          setIsEditOpen(false)
          setSelectedArea(null)
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to update exempted area")
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
            placeholder="e.g., Port Exempted Area"
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

      <div className="space-y-4 rounded-md border border-border p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <Label className="text-base font-semibold">Map Boundary</Label>
            <p className="text-sm text-muted-foreground">
              Click around the exempted area, drag points to adjust, then apply the polygon.
            </p>
          </div>
          <Badge variant="outline" className="w-fit">
            {areaDraftPoints.length} points
          </Badge>
        </div>
        <div className="h-[420px] overflow-hidden rounded-md border border-border">
          <EditableGoogleMap
            points={areaDraftPoints}
            onPointsChange={setAreaDraftPoints}
            shape="polygon"
            center={MAPUTO_CENTER}
            zoom={11}
            height="100%"
            markerColor="#5B8C5A"
            strokeColor="#DAA22A"
            fillColor="#5B8C5A"
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setAreaDraftPoints((points) => points.slice(0, -1))}
            disabled={!areaDraftPoints.length}
          >
            Undo Point
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setAreaDraftPoints([])}
            disabled={!areaDraftPoints.length}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Clear Map
          </Button>
          <Button type="button" onClick={handleApplyDrawnBoundary} disabled={areaDraftPoints.length < 3}>
            Apply Polygon
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${isEdit ? "edit-" : ""}boundaryData`} className="text-base">Boundary Data *</Label>
        <Textarea
          id={`${isEdit ? "edit-" : ""}boundaryData`}
          value={areaForm.boundaryData}
          onChange={(event) => setAreaForm({ ...areaForm, boundaryData: event.target.value })}
          onBlur={() => setAreaForm((current) => ({ ...current, boundaryData: compactJson(current.boundaryData) }))}
          placeholder='{"type":"Polygon","coordinates":[[[...]]]}'
          rows={1}
          wrap="off"
          className="h-11 min-h-11 resize-y overflow-x-auto whitespace-nowrap font-mono text-sm"
        />
      </div>
    </div>
  )

  if (isCreateOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCreateOpen(false)}
            disabled={createMutation.isPending}
            className="mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-semibold text-foreground">Create Exempted Area</h1>
            <p className="text-lg text-muted-foreground">
              Define an exempted area with GeoJSON boundary data for {getMunicipalityDisplayName(areaForm.municipalityId)}.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Area Details</CardTitle>
            <CardDescription className="text-base">
              Capture the municipal area definition and exemption boundary data.
            </CardDescription>
          </CardHeader>
          <CardContent>{renderAreaForm()}</CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleCreateArea} disabled={createMutation.isPending || !areaForm.name.trim() || !areaForm.code.trim()}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Exempted Area"
            )}
          </Button>
        </div>
      </div>
    )
  }

  if (isEditOpen && selectedArea) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={closeEditArea}
            disabled={updateMutation.isPending}
            className="mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-semibold text-foreground">Edit Exempted Area</h1>
            <p className="text-lg text-muted-foreground">
              Update the exempted area definition and GeoJSON boundary for {getMunicipalityDisplayName(areaForm.municipalityId)}.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Area Details</CardTitle>
            <CardDescription className="text-base">
              Review the municipal area settings and exemption boundary data.
            </CardDescription>
          </CardHeader>
          <CardContent>{renderAreaForm(true)}</CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={closeEditArea} disabled={updateMutation.isPending}>
            Cancel
          </Button>
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
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Exempted Areas</h1>
          <p className="text-lg text-muted-foreground">Manage exempted areas for {getMunicipalityDisplayName(selectedMunicipalityId)}</p>
        </div>
        <Button onClick={openCreateArea} disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Create Exempted Area
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Exempted Areas</CardTitle>
          <CardDescription className="text-base">
            Configure GeoJSON boundaries for municipal exemptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
              <h3 className="mb-2 text-lg font-semibold">Failed to load exempted areas</h3>
              <p className="mb-4 text-muted-foreground">{(error as Error)?.message || "An error occurred"}</p>
              <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-3 rounded-md border border-dashed p-5 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading exempted areas...</span>
            </div>
          ) : areas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No exempted areas found</h3>
              <p className="text-muted-foreground">Create an exempted area for {getMunicipalityDisplayName(selectedMunicipalityId)}.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Area Name</TableHead>
                  <TableHead className="text-base">Code</TableHead>
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
                    <TableCell className="text-base">{area.code || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{area.format || "GEOJSON"}</Badge>
                    </TableCell>
                    <TableCell className="text-base">{getBoundaryDataSize(area)}</TableCell>
                    <TableCell>{getStatusBadge(area.active)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" aria-label={`Actions for ${area.name}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onSelect={() => openEditArea(area)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
