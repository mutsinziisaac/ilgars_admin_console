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
import { UGANDA_CENTER } from "@/lib/map-region"

const defaultGeoJson = JSON.stringify(
  {
    type: "LineString",
    coordinates: [
      [32.5811, 0.3136],
      [32.6163, 0.3316],
      [32.6508, 0.3476],
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

const centerlineFromCorridor = (ring: [number, number][]) => {
  if (ring.length < 4) return []

  const openRing = ring.slice()
  const first = openRing[0]
  const last = openRing[openRing.length - 1]
  if (first[0] === last[0] && first[1] === last[1]) openRing.pop()

  const midpoint = Math.floor(openRing.length / 2)
  const leftSide = openRing.slice(0, midpoint)
  const rightSide = openRing.slice(midpoint).reverse()
  const pairCount = Math.min(leftSide.length, rightSide.length)

  return leftSide.slice(0, pairCount).map(([leftLat, leftLng], index) => {
    const [rightLat, rightLng] = rightSide[index]
    return [
      Number(((leftLat + rightLat) / 2).toFixed(6)),
      Number(((leftLng + rightLng) / 2).toFixed(6)),
    ] as [number, number]
  })
}

const extractRouteLatLngs = (boundaryData: string): [number, number][] => {
  try {
    const parsed = JSON.parse(boundaryData)
    const lineCoordinates = getLineCoordinates(parsed)
    if (lineCoordinates) {
      return lineCoordinates
        .map(toLatLngFromGeoJsonCoordinate)
        .filter((point): point is [number, number] => Boolean(point))
    }

    const polygonCoordinates = getPolygonCoordinates(parsed)
    if (!polygonCoordinates) return []

    const ring = polygonCoordinates
      .map(toLatLngFromGeoJsonCoordinate)
      .filter((point): point is [number, number] => Boolean(point))

    return centerlineFromCorridor(ring)
  } catch {
    return []
  }
}

const createRouteGeoJson = (points: [number, number][]) => {
  const corridorWidth = 0.0012
  const leftSide: [number, number][] = []
  const rightSide: [number, number][] = []

  points.forEach(([lat, lng], index) => {
    const previous = points[Math.max(0, index - 1)]
    const next = points[Math.min(points.length - 1, index + 1)]
    const deltaLat = next[0] - previous[0]
    const deltaLng = next[1] - previous[1]
    const length = Math.hypot(deltaLat, deltaLng) || 1
    const normalLat = -deltaLng / length
    const normalLng = deltaLat / length

    leftSide.push([
      Number((lat + normalLat * corridorWidth).toFixed(6)),
      Number((lng + normalLng * corridorWidth).toFixed(6)),
    ])
    rightSide.push([
      Number((lat - normalLat * corridorWidth).toFixed(6)),
      Number((lng - normalLng * corridorWidth).toFixed(6)),
    ])
  })

  const ring = [...leftSide, ...rightSide.reverse()]
  if (ring.length) ring.push(ring[0])

  return JSON.stringify({
    type: "Polygon",
    coordinates: [ring.map(([lat, lng]) => [lng, lat])],
  })
}

const createDefaultAreaCode = () => `UG-EXEMPT-${Date.now()}`

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
    boundaryData: "",
    active: true,
  })
  const [areaDraftPoints, setAreaDraftPoints] = useState<[number, number][]>([])

  const { data, isLoading, error, refetch } = useExemptAreasList({
    municipalityId: selectedMunicipalityId,
    active: true,
  })
  const createMutation = useCreateExemptArea()
  const updateMutation = useUpdateExemptArea()
  const areas = data?.data ?? data?.content ?? []

  const resetForm = (municipalityId = getStoredMunicipalityId()) => {
    setSelectedMunicipalityId(municipalityId)
    setAreaDraftPoints([])
    setAreaForm({
      municipalityId,
      code: createDefaultAreaCode(),
      name: "",
      description: "",
      format: "GEOJSON",
      boundaryData: "",
      active: true,
    })
  }

  const validateBoundaryData = () => {
    try {
      JSON.parse(areaForm.boundaryData)
      if (extractRouteLatLngs(areaForm.boundaryData).length < 2) {
        toast.error("GeoJSON route must contain at least two points")
        return false
      }
      return true
    } catch {
      toast.error("GeoJSON route must be valid JSON")
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
    setAreaDraftPoints(extractRouteLatLngs(boundaryData))
    setIsEditOpen(true)
  }

  const closeEditArea = () => {
    setIsEditOpen(false)
    setSelectedArea(null)
  }

  const handleApplyDrawnBoundary = () => {
    if (areaDraftPoints.length < 2) {
      toast.error("Add at least two points before applying the route")
      return
    }

    setAreaForm((current) => ({
      ...current,
      boundaryData: createRouteGeoJson(areaDraftPoints),
    }))
    toast.success("Map route applied to GeoJSON data")
  }

  const handleAreaDraftPointsChange = (points: [number, number][]) => {
    setAreaDraftPoints(points)
    setAreaForm((current) => ({ ...current, boundaryData: "" }))
  }

  const handleBoundaryDataChange = (boundaryData: string) => {
    setAreaForm((current) => ({ ...current, boundaryData }))

    const points = extractRouteLatLngs(boundaryData)
    if (points.length >= 2) {
      setAreaDraftPoints(points)
    }
  }

  const handleBoundaryDataBlur = () => {
    setAreaForm((current) => {
      const boundaryData = compactJson(current.boundaryData)
      const points = extractRouteLatLngs(boundaryData)

      if (points.length >= 2) {
        setAreaDraftPoints(points)
      }

      return { ...current, boundaryData }
    })
  }

  const isSavingArea = createMutation.isPending || updateMutation.isPending
  const canSaveArea =
    !isSavingArea &&
    Boolean(areaForm.name.trim()) &&
    Boolean(areaForm.code.trim()) &&
    extractRouteLatLngs(areaForm.boundaryData).length >= 2

  const handleCreateArea = () => {
    if (!validateBoundaryData()) return
    const routePoints = extractRouteLatLngs(areaForm.boundaryData)
    const boundaryData = createRouteGeoJson(routePoints)

    createMutation.mutate(
      {
        municipalityId: areaForm.municipalityId,
        code: areaForm.code.trim(),
        name: areaForm.name.trim(),
        description: areaForm.description.trim() || undefined,
        format: areaForm.format,
        boundaryData,
        active: areaForm.active,
      },
      {
        onSuccess: () => {
          toast.success("Exempt area created successfully")
          setIsCreateOpen(false)
          resetForm(areaForm.municipalityId)
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to create exempted route")
        },
      },
    )
  }

  const handleUpdateArea = () => {
    if (!selectedArea) return
    if (!validateBoundaryData()) return
    const routePoints = extractRouteLatLngs(areaForm.boundaryData)
    const boundaryData = createRouteGeoJson(routePoints)

    updateMutation.mutate(
      {
        id: selectedArea.id,
        payload: {
          municipalityId: selectedArea.municipalityId || areaForm.municipalityId,
          code: areaForm.code.trim(),
          name: areaForm.name.trim(),
          description: areaForm.description.trim() || undefined,
          format: areaForm.format,
          boundaryData,
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
          toast.error(error instanceof Error ? error.message : "Failed to update exempted route")
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

      <div className="grid gap-4">
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
          <Label htmlFor={`${isEdit ? "edit-" : ""}name`} className="text-base">Route Name *</Label>
          <Input
            id={`${isEdit ? "edit-" : ""}name`}
            value={areaForm.name}
            onChange={(event) => setAreaForm({ ...areaForm, name: event.target.value })}
            placeholder="e.g., Kampala Exempt Area"
            className="text-base h-11"
          />
        </div>
      </div>

      <div className="grid gap-4">
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
            placeholder="Short operational note for this route"
            className="text-base h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${isEdit ? "edit-" : ""}boundaryData`} className="text-base">GeoJSON Route Data *</Label>
        <p className="text-sm text-muted-foreground">
          Paste a GeoJSON route, or apply the map route to generate the backend-ready corridor.
        </p>
        <Textarea
          id={`${isEdit ? "edit-" : ""}boundaryData`}
          value={areaForm.boundaryData}
          onChange={(event) => handleBoundaryDataChange(event.target.value)}
          onBlur={handleBoundaryDataBlur}
          placeholder='{"type":"LineString","coordinates":[[...]]}'
          rows={1}
          wrap="off"
          className="h-11 min-h-11 resize-y overflow-x-auto whitespace-nowrap font-mono text-sm"
        />
      </div>

      <div className="flex justify-between gap-4 pt-2">
        <Button
          variant="outline"
          onClick={isEdit ? closeEditArea : () => setIsCreateOpen(false)}
          disabled={isSavingArea}
        >
          Cancel
        </Button>
        <Button
          onClick={isEdit ? handleUpdateArea : handleCreateArea}
          disabled={!canSaveArea}
        >
          {isSavingArea ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEdit ? "Saving..." : "Creating..."}
            </>
          ) : (
            isEdit ? "Save Changes" : "Create Exempt Area"
          )}
        </Button>
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
            <h1 className="text-4xl font-semibold text-foreground">Create Exempt Area</h1>
            <p className="text-lg text-muted-foreground">
              Define an exempted route with GeoJSON route data for {getMunicipalityDisplayName(areaForm.municipalityId)}.
            </p>
          </div>
        </div>

        <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(360px,0.9fr)_minmax(520px,1.1fr)]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl">Route Details</CardTitle>
              <CardDescription className="text-base">
                Capture the municipal route definition and exemption route data.
              </CardDescription>
            </CardHeader>
            <CardContent>{renderAreaForm()}</CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-2xl">Route Map</CardTitle>
                  <CardDescription className="text-base">
                    Click along the exempted route, drag points to adjust, then apply the route.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="w-fit">
                  {areaDraftPoints.length} points
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex h-[560px] flex-col gap-4">
              <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-border">
                <EditableGoogleMap
                  points={areaDraftPoints}
                  onPointsChange={handleAreaDraftPointsChange}
                  shape="line"
                  center={areaDraftPoints[0] ?? UGANDA_CENTER}
                  zoom={11}
                  height="100%"
                  markerColor="#5B8C5A"
                  strokeColor="#DAA22A"
                  fillColor="#5B8C5A"
                  fitToBounds={areaDraftPoints.length > 0}
                />
              </div>
              <div className="grid shrink-0 gap-2 sm:grid-cols-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAreaDraftPointsChange(areaDraftPoints.slice(0, -1))}
                  disabled={!areaDraftPoints.length}
                >
                  Undo Point
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAreaDraftPointsChange([])}
                  disabled={!areaDraftPoints.length}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Clear Map
                </Button>
                <Button type="button" onClick={handleApplyDrawnBoundary} disabled={areaDraftPoints.length < 2}>
                  Apply Route
                </Button>
              </div>
            </CardContent>
          </Card>
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
            <h1 className="text-4xl font-semibold text-foreground">Edit Exempt Area</h1>
            <p className="text-lg text-muted-foreground">
              Update the exempted route definition and GeoJSON route data for {getMunicipalityDisplayName(areaForm.municipalityId)}.
            </p>
          </div>
        </div>

        <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(360px,0.9fr)_minmax(520px,1.1fr)]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl">Route Details</CardTitle>
              <CardDescription className="text-base">
                Review the municipal route settings and exemption route data.
              </CardDescription>
            </CardHeader>
            <CardContent>{renderAreaForm(true)}</CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-2xl">Route Map</CardTitle>
                  <CardDescription className="text-base">
                    Click along the exempted route, drag points to adjust, then apply the route.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="w-fit">
                  {areaDraftPoints.length} points
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex h-[560px] flex-col gap-4">
              <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-border">
                <EditableGoogleMap
                  points={areaDraftPoints}
                  onPointsChange={handleAreaDraftPointsChange}
                  shape="line"
                  center={areaDraftPoints[0] ?? UGANDA_CENTER}
                  zoom={11}
                  height="100%"
                  markerColor="#5B8C5A"
                  strokeColor="#DAA22A"
                  fillColor="#5B8C5A"
                  fitToBounds={areaDraftPoints.length > 0}
                />
              </div>
              <div className="grid shrink-0 gap-2 sm:grid-cols-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAreaDraftPointsChange(areaDraftPoints.slice(0, -1))}
                  disabled={!areaDraftPoints.length}
                >
                  Undo Point
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAreaDraftPointsChange([])}
                  disabled={!areaDraftPoints.length}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Clear Map
                </Button>
                <Button type="button" onClick={handleApplyDrawnBoundary} disabled={areaDraftPoints.length < 2}>
                  Apply Route
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Exempt Areas</h1>
          <p className="text-lg text-muted-foreground">Manage exempted routes for {getMunicipalityDisplayName(selectedMunicipalityId)}</p>
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
            Configure GeoJSON boundaries for municipal exemptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
            <h3 className="mb-2 text-lg font-semibold">Failed to load exempted routes</h3>
              <p className="mb-4 text-muted-foreground">{(error as Error)?.message || "An error occurred"}</p>
              <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-3 rounded-md border border-dashed p-5 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading exempted routes...</span>
            </div>
          ) : areas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No exempted routes found</h3>
              <p className="text-muted-foreground">Create an exempted route for {getMunicipalityDisplayName(selectedMunicipalityId)}.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Route Name</TableHead>
                  <TableHead className="text-base">Code</TableHead>
                  <TableHead className="text-base">Format</TableHead>
                  <TableHead className="text-base">Route Data</TableHead>
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
