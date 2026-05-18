import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ArrowLeft, Building2, MapPin, Clock, Plus, Edit, CheckCircle, XCircle, Loader2, AlertCircle, Search } from "lucide-react"
import { EditableGoogleMap } from "@/components/ui/map"
import { toast } from "sonner"
import { MunicipalitiesApi } from "@/lib/api"
import type { BoundaryVersion, Municipality } from "@/lib/api"
import { BOUNDARY_VERSIONS_STORAGE_KEY_PREFIX } from "@/lib/api/constants"
import {
  getStoredMunicipalities,
  getStoredMunicipality,
  getStoredMunicipalityId,
  mergeMunicipalities,
  setActiveMunicipality,
  storeMunicipalities,
  upsertStoredMunicipality,
} from "@/lib/municipality-registry"

const defaultBoundaryData = "{\"type\":\"Polygon\",\"coordinates\":[[[32.45,-26.1],[32.75,-26.1],[32.75,-25.92],[32.64,-25.92],[32.64,-25.8],[32.45,-25.8],[32.45,-26.1]]]}"
const MAPUTO_CENTER: [number, number] = [-25.9655, 32.5832]

const getBoundaryVersionsStorageKey = (municipalityId: string) =>
  `${BOUNDARY_VERSIONS_STORAGE_KEY_PREFIX}.${municipalityId}`

const getStoredBoundaryVersions = (municipalityId: string): BoundaryVersion[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(getBoundaryVersionsStorageKey(municipalityId))
    return stored ? (JSON.parse(stored) as BoundaryVersion[]) : []
  } catch {
    return []
  }
}

const storeBoundaryVersions = (municipalityId: string, boundaryVersions: BoundaryVersion[]) => {
  if (typeof window === "undefined") return

  localStorage.setItem(
    getBoundaryVersionsStorageKey(municipalityId),
    JSON.stringify(boundaryVersions),
  )
}

const compactJson = (value: string) => {
  try {
    return JSON.stringify(JSON.parse(value))
  } catch {
    return value
  }
}

const isMunicipality = (value: unknown): value is Municipality => {
  if (!value || typeof value !== "object") return false

  const candidate = value as Partial<Municipality>
  return Boolean(candidate.id && candidate.code && candidate.name && candidate.timezone)
}

const getBoundaryVersions = async (municipalityId: string, signal?: AbortSignal) => {
  const response = await MunicipalitiesApi.listBoundaryVersions(municipalityId, signal)
  return response.data ?? response.content ?? response.items ?? []
}

type LocallyTrackedBoundaryVersion = BoundaryVersion & {
  activationConfirmed?: boolean
}

const hasConfirmedBoundaryActivation = (boundary: BoundaryVersion) =>
  Boolean((boundary as LocallyTrackedBoundaryVersion).activationConfirmed)

const mergeBoundaryVersions = (
  incoming: BoundaryVersion[],
  fallback: BoundaryVersion[] = [],
) => {
  const byId = new Map<string, BoundaryVersion>()

  fallback.forEach((boundary) => {
    byId.set(boundary.id, boundary)
  })

  incoming.forEach((boundary) => {
    const cachedBoundary = byId.get(boundary.id)
    const activationConfirmed =
      hasConfirmedBoundaryActivation(cachedBoundary ?? boundary) ||
      hasConfirmedBoundaryActivation(boundary)

    byId.set(boundary.id, {
      ...cachedBoundary,
      ...boundary,
      active: activationConfirmed,
      activatedAt: activationConfirmed
        ? (cachedBoundary?.activatedAt ?? boundary.activatedAt ?? new Date().toISOString().split("T")[0])
        : null,
      activationConfirmed,
    } as LocallyTrackedBoundaryVersion)
  })

  return Array.from(byId.values())
}

const isBoundaryVersionActivated = (boundary: BoundaryVersion) =>
  hasConfirmedBoundaryActivation(boundary)

const isCancelledRequest = (error: unknown, signal?: AbortSignal) => {
  if (signal?.aborted) return true
  if (!(error instanceof Error)) return false

  return error.message.toLowerCase().includes("cancelled")
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
  if (record.type === "Feature") {
    return getPolygonCoordinates(record.geometry)
  }

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
      const [firstLat, firstLng] = latLngs[0]
      const [lastLat, lastLng] = latLngs[latLngs.length - 1]
      if (firstLat === lastLat && firstLng === lastLng) {
        return latLngs.slice(0, -1)
      }
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
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coordinates.push(first)
    }
  }

  return JSON.stringify({
    type: "Polygon",
    coordinates: [coordinates],
  })
}

const normalizeConfiguration = (
  response: Awaited<ReturnType<typeof MunicipalitiesApi.getMunicipalityConfiguration>>,
): { municipality?: Municipality; boundaryVersions: BoundaryVersion[] } => {
  const data = response.data as Record<string, unknown>
  const nestedMunicipality = data.municipality
  const municipality = isMunicipality(nestedMunicipality)
    ? nestedMunicipality
    : isMunicipality(data)
      ? data
      : null

  const boundaryVersions =
    Array.isArray(data.boundaryVersions)
      ? (data.boundaryVersions as BoundaryVersion[])
      : Array.isArray(data.boundaries)
        ? (data.boundaries as BoundaryVersion[])
        : data.activeBoundaryVersion
          ? [data.activeBoundaryVersion as BoundaryVersion]
          : []

  return {
    municipality: municipality ?? undefined,
    boundaryVersions,
  }
}

export function MunicipalityPage() {
  const [municipality, setMunicipality] = useState<Municipality | null>(() => getStoredMunicipality())
  const [municipalities, setMunicipalities] = useState<Municipality[]>(() => getStoredMunicipalities())
  const [municipalitySearch, setMunicipalitySearch] = useState("")
  const [boundaries, setBoundaries] = useState<BoundaryVersion[]>(() =>
    getStoredBoundaryVersions(getStoredMunicipalityId()),
  )
  const [isLoadingMunicipality, setIsLoadingMunicipality] = useState(false)
  const [municipalityError, setMunicipalityError] = useState<string | null>(null)
  const [isEditMunicipalityOpen, setIsEditMunicipalityOpen] = useState(false)
  const [isAddBoundaryOpen, setIsAddBoundaryOpen] = useState(false)
  const [isCreateMunicipalityOpen, setIsCreateMunicipalityOpen] = useState(false)
  const [isCreatingMunicipality, setIsCreatingMunicipality] = useState(false)
  const [isCreatingBoundary, setIsCreatingBoundary] = useState(false)
  const [editingBoundaryId, setEditingBoundaryId] = useState<string | null>(null)
  const [activatingBoundaryId, setActivatingBoundaryId] = useState<string | null>(null)
  const [boundaryDraftPoints, setBoundaryDraftPoints] = useState<[number, number][]>([])
  
  const [municipalityForm, setMunicipalityForm] = useState({
    code: municipality?.code ?? "",
    name: municipality?.name ?? "",
    timezone: municipality?.timezone ?? "Africa/Maputo"
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

  const storeActiveMunicipality = useCallback((nextMunicipality: Municipality) => {
    setActiveMunicipality(nextMunicipality)
    setMunicipalities(upsertStoredMunicipality(nextMunicipality))
    setMunicipality(nextMunicipality)
    setMunicipalityForm({
      code: nextMunicipality.code,
      name: nextMunicipality.name,
      timezone: nextMunicipality.timezone,
    })
  }, [])

  const loadMunicipalityFromDb = useCallback(
    async (
      municipalityId = getStoredMunicipalityId(),
      signal?: AbortSignal,
      fallbackBoundaries: BoundaryVersion[] = [],
    ) => {
      setIsLoadingMunicipality(true)
      setMunicipalityError(null)

      try {
        const [municipalityResponse, boundaryVersions] = await Promise.all([
          MunicipalitiesApi.getMunicipality(municipalityId, signal),
          getBoundaryVersions(municipalityId, signal),
        ])
        storeActiveMunicipality(municipalityResponse.data)
        setBoundaries((current) => {
          const merged = mergeBoundaryVersions(
            boundaryVersions,
            fallbackBoundaries.length ? fallbackBoundaries : current,
          )
          storeBoundaryVersions(municipalityResponse.data.id, merged)
          return merged
        })
      } catch (directReadError) {
        if (isCancelledRequest(directReadError, signal)) return

        try {
          const configurationResponse = await MunicipalitiesApi.getMunicipalityConfiguration(municipalityId, signal)
          const configuration = normalizeConfiguration(configurationResponse)
          if (configuration.municipality) {
            storeActiveMunicipality(configuration.municipality)
          }
          setBoundaries((current) => {
            const merged = mergeBoundaryVersions(
              configuration.boundaryVersions,
              fallbackBoundaries.length ? fallbackBoundaries : current,
            )
            storeBoundaryVersions(municipalityId, merged)
            return merged
          })
          return
        } catch (configurationError) {
          if (isCancelledRequest(configurationError, signal)) return

          // The deployed API currently returns 405 for /configuration in UAT,
          // so fall back to the municipality list before surfacing an error.
        }

        try {
          const listResponse = await MunicipalitiesApi.listMunicipalities(signal)
          const municipalities =
            listResponse.data ??
            listResponse.content ??
            listResponse.items ??
            []
          if (municipalities.length) {
            const nextMunicipalities = mergeMunicipalities(getStoredMunicipalities(), municipalities)
            setMunicipalities(nextMunicipalities)
            storeMunicipalities(nextMunicipalities)
          }
          const nextMunicipality =
            municipalities.find((item) => item.id === municipalityId) ??
            getStoredMunicipalities().find((item) => item.id === municipalityId) ??
            getStoredMunicipality()

          if (nextMunicipality) {
            storeActiveMunicipality(nextMunicipality)
            try {
              const boundaryVersions = await getBoundaryVersions(nextMunicipality.id, signal)
              setBoundaries((current) => {
                const merged = mergeBoundaryVersions(
                  boundaryVersions,
                  fallbackBoundaries.length ? fallbackBoundaries : current,
                )
                storeBoundaryVersions(nextMunicipality.id, merged)
                return merged
              })
            } catch {
              setBoundaries((current) => {
                const stored = getStoredBoundaryVersions(nextMunicipality.id)
                const merged = fallbackBoundaries.length
                  ? mergeBoundaryVersions(fallbackBoundaries, current)
                  : mergeBoundaryVersions(stored, current)
                storeBoundaryVersions(nextMunicipality.id, merged)
                return merged
              })
            }
            return
          }

          throw directReadError
        } catch (listError) {
          if (isCancelledRequest(listError, signal)) return

          const storedMunicipality = getStoredMunicipality()
          const storedBoundaries = getStoredBoundaryVersions(municipalityId)

          if (storedMunicipality || storedBoundaries.length || fallbackBoundaries.length) {
            if (storedMunicipality) {
              storeActiveMunicipality(storedMunicipality)
            }

            setBoundaries((current) => {
              const cachedBoundaries = fallbackBoundaries.length ? fallbackBoundaries : storedBoundaries
              const merged = mergeBoundaryVersions(cachedBoundaries, current)
              if (merged.length) {
                storeBoundaryVersions(municipalityId, merged)
              }
              return merged
            })
            setMunicipalityError(null)
            return
          }

          setMunicipalityError(
            listError instanceof Error
              ? listError.message
              : "Failed to load municipality from database",
          )
        }
      } finally {
        setIsLoadingMunicipality(false)
      }
    },
    [storeActiveMunicipality],
  )

  useEffect(() => {
    const controller = new AbortController()
    void Promise.resolve().then(() => {
      void loadMunicipalityFromDb(getStoredMunicipalityId(), controller.signal)
    })

    return () => controller.abort()
  }, [loadMunicipalityFromDb])

  useEffect(() => {
    const controller = new AbortController()

    MunicipalitiesApi.listMunicipalities(controller.signal)
      .then((response) => {
        const dbMunicipalities = response.data ?? response.content ?? response.items ?? []
        if (!dbMunicipalities.length) return

        const nextMunicipalities = mergeMunicipalities(getStoredMunicipalities(), dbMunicipalities)
        setMunicipalities(nextMunicipalities)
        storeMunicipalities(nextMunicipalities)
      })
      .catch((error) => {
        if (!isCancelledRequest(error, controller.signal)) {
          setMunicipalities(getStoredMunicipalities())
        }
      })

    return () => controller.abort()
  }, [])

  const handleUpdateMunicipality = () => {
    if (!municipality) return

    const updatedMunicipality = {
      ...municipality,
      ...municipalityForm
    }
    storeActiveMunicipality(updatedMunicipality)
    setIsEditMunicipalityOpen(false)
    toast.success("Municipality updated successfully")
  }

  const handleSelectMunicipality = async (nextMunicipality: Municipality) => {
    storeActiveMunicipality(nextMunicipality)
    const storedBoundaries = getStoredBoundaryVersions(nextMunicipality.id)
    setBoundaries(storedBoundaries)
    await loadMunicipalityFromDb(nextMunicipality.id, undefined, storedBoundaries)
  }

  const getNextBoundaryVersion = () => {
    const usedVersions = new Set(boundaries.map((boundary) => boundary.version.toLowerCase()))
    let nextIndex = boundaries.length + 1
    let nextVersion = `v${nextIndex}`

    while (usedVersions.has(nextVersion.toLowerCase())) {
      nextIndex += 1
      nextVersion = `v${nextIndex}`
    }

    return nextVersion
  }

  const getBoundaryData = (boundary?: BoundaryVersion) => {
    if (!boundary) return ""

    return (boundary as BoundaryVersion & { boundaryData?: string }).boundaryData ?? ""
  }

  const openNewBoundaryModal = () => {
    const nextVersion = getNextBoundaryVersion()
    const sourceBoundary = boundaries.find(isBoundaryVersionActivated) ?? boundaries[0]
    const sourceBoundaryData = getBoundaryData(sourceBoundary)

    setEditingBoundaryId(null)
    setBoundaryForm({
      version: nextVersion,
      displayName: `${municipality?.name ?? "Municipality"} Boundary ${nextVersion.toUpperCase()}`,
      format: sourceBoundary?.format ?? "GEOJSON",
      boundaryData: sourceBoundaryData,
    })
    setBoundaryDraftPoints(sourceBoundaryData ? extractPolygonLatLngs(sourceBoundaryData) : [])
    setIsAddBoundaryOpen(true)
  }

  const openEditBoundaryModal = (boundary: BoundaryVersion) => {
    const boundaryData = getBoundaryData(boundary) || defaultBoundaryData

    setEditingBoundaryId(boundary.id)
    setBoundaryForm({
      version: boundary.version,
      displayName: boundary.displayName,
      format: boundary.format,
      boundaryData,
    })
    setBoundaryDraftPoints(extractPolygonLatLngs(boundaryData))
    setIsAddBoundaryOpen(true)
  }

  const handleApplyDrawnBoundary = () => {
    if (boundaryDraftPoints.length < 3) {
      toast.error("Add at least 3 map points before applying the boundary")
      return
    }

    setBoundaryForm((current) => ({
      ...current,
      boundaryData: createBoundaryGeoJson(boundaryDraftPoints),
    }))
    toast.success("Drawn polygon copied to GeoJSON data")
  }

  const handleAddBoundary = async (activateAfterCreate = false) => {
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

    if (editingBoundaryId) {
      const nextBoundaries = boundaries.map((boundary) =>
        boundary.id === editingBoundaryId
          ? {
              ...boundary,
              version: boundaryForm.version,
              displayName: boundaryForm.displayName,
              format: boundaryForm.format,
              boundaryData: boundaryForm.boundaryData,
            }
          : boundary,
      )
      setBoundaries(nextBoundaries)
      storeBoundaryVersions(municipality.id, nextBoundaries)
      setEditingBoundaryId(null)
      setIsAddBoundaryOpen(false)
      toast.success("Boundary updated successfully")
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
      let createdBoundary: LocallyTrackedBoundaryVersion = {
        ...response.data,
        active: false,
        activatedAt: null,
        activationConfirmed: false,
      }

      if (activateAfterCreate) {
        const activationResponse = await MunicipalitiesApi.activateBoundaryVersion(createdBoundary.id)
        createdBoundary = {
          ...createdBoundary,
          ...activationResponse.data,
          active: true,
          activatedAt: activationResponse.data.activatedAt || new Date().toISOString().split('T')[0],
          activationConfirmed: true,
        }
      }

      const nextBoundaries = activateAfterCreate
        ? mergeBoundaryVersions(
            [createdBoundary],
          boundaries.map((boundary) => ({
            ...boundary,
            active: false,
            activatedAt: null,
            activationConfirmed: false,
          })),
        )
        : mergeBoundaryVersions([createdBoundary], boundaries)
      setBoundaries(nextBoundaries)
      storeBoundaryVersions(municipality.id, nextBoundaries)
      setIsAddBoundaryOpen(false)
      setBoundaryForm({
        version: "v1",
        displayName: "Maputo GeoJSON Boundary",
        format: "GEOJSON",
        boundaryData: defaultBoundaryData,
      })
      toast.success(activateAfterCreate ? "Boundary version created and activated" : "Boundary version created successfully")
      await loadMunicipalityFromDb(municipality.id, undefined, nextBoundaries)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create boundary")
    } finally {
      setIsCreatingBoundary(false)
    }
  }

  const handleActivateBoundary = async (boundaryId: string) => {
    setActivatingBoundaryId(boundaryId)
    try {
      const response = await MunicipalitiesApi.activateBoundaryVersion(boundaryId)
      const nextBoundaries = boundaries.map(b => ({
        ...b,
        active: b.id === boundaryId,
        activatedAt: b.id === boundaryId ? (response.data.activatedAt || new Date().toISOString().split('T')[0]) : null,
        activationConfirmed: b.id === boundaryId,
      }))
      setBoundaries(nextBoundaries)
      storeBoundaryVersions(municipality?.id ?? getStoredMunicipalityId(), nextBoundaries)
      if (municipality?.id) {
        await loadMunicipalityFromDb(municipality.id, undefined, nextBoundaries)
      }
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
      storeActiveMunicipality(newMunicipality)
      setMunicipalities((current) => {
        const nextMunicipalities = mergeMunicipalities(current, getStoredMunicipalities())
        storeMunicipalities(nextMunicipalities)
        return nextMunicipalities
      })
      setIsCreateMunicipalityOpen(false)
      setBoundaries([])
      await loadMunicipalityFromDb(newMunicipality.id)
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

  const normalizedSearch = municipalitySearch.trim().toLowerCase()
  const filteredMunicipalities = normalizedSearch
    ? municipalities.filter((item) =>
        [item.name, item.code, item.status]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch)),
      )
    : municipalities
  const hasBoundary = boundaries.length > 0
  const hasActivatedBoundary = boundaries.some(isBoundaryVersionActivated)
  const isCreatingInitialBoundary = !editingBoundaryId && !hasBoundary
  const getMunicipalityActiveStatus = (item: Municipality) => {
    if (item.id === municipality?.id) {
      return hasActivatedBoundary
    }

    return getStoredBoundaryVersions(item.id).some(isBoundaryVersionActivated)
  }

  if (isAddBoundaryOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingBoundaryId(null)
              setIsAddBoundaryOpen(false)
            }}
            disabled={isCreatingBoundary}
            aria-label="Back to municipality configuration"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              {editingBoundaryId
                ? "Edit Boundary"
                : isCreatingInitialBoundary
                  ? "Add New Boundary"
                  : "Add Boundary Version"}
            </h1>
            <p className="text-base text-muted-foreground">
              {editingBoundaryId
                ? `Update the displayed boundary details for ${municipality?.name ?? "this municipality"}`
                : isCreatingInitialBoundary
                  ? `Create a GeoJSON boundary for ${municipality?.name ?? "this municipality"}`
                  : `Create a new GeoJSON boundary version for ${municipality?.name ?? "this municipality"}`}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Boundary Details</CardTitle>
              <CardDescription className="text-base">
                {editingBoundaryId
                  ? "Update this saved boundary version without changing which version is active."
                  : isCreatingInitialBoundary
                    ? "Draw the first boundary for this municipality. Activate it when ready."
                    : "Save a separate boundary version. Activate it when it should replace the current active boundary."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-2xl">Map Boundary</CardTitle>
                  <CardDescription className="text-base">
                    Start with point A, click point B, then keep clicking around the municipality. Drag points to adjust.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="w-fit">
                  {boundaryDraftPoints.length} points
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[480px] overflow-hidden rounded-md border border-border">
                <EditableGoogleMap
                  points={boundaryDraftPoints}
                  onPointsChange={setBoundaryDraftPoints}
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
                  onClick={() => setBoundaryDraftPoints((points) => points.slice(0, -1))}
                  disabled={!boundaryDraftPoints.length}
                >
                  Undo Point
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBoundaryDraftPoints([])}
                  disabled={!boundaryDraftPoints.length}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Clear Map
                </Button>
                <Button
                  type="button"
                  onClick={handleApplyDrawnBoundary}
                  disabled={boundaryDraftPoints.length < 3}
                >
                  Apply Polygon
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">GeoJSON Data</CardTitle>
              <CardDescription className="text-base">
                Paste a GeoJSON Polygon, MultiPolygon, Feature, or FeatureCollection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                id="boundaryData"
                value={boundaryForm.boundaryData}
                onChange={(e) => setBoundaryForm({ ...boundaryForm, boundaryData: e.target.value })}
                onBlur={() => setBoundaryForm((current) => ({ ...current, boundaryData: compactJson(current.boundaryData) }))}
                placeholder={defaultBoundaryData}
                rows={1}
                wrap="off"
                className="h-11 min-h-11 resize-y overflow-x-auto whitespace-nowrap font-mono text-sm"
              />
            </CardContent>
          </Card>

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setEditingBoundaryId(null)
                setIsAddBoundaryOpen(false)
              }}
              disabled={isCreatingBoundary}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              {!editingBoundaryId && (
                <Button
                  variant="outline"
                  onClick={() => handleAddBoundary(false)}
                  disabled={isCreatingBoundary}
                >
                  {isCreatingBoundary ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    isCreatingInitialBoundary ? "Save Boundary" : "Save as Inactive"
                  )}
                </Button>
              )}
              <Button onClick={() => handleAddBoundary(!editingBoundaryId)} disabled={isCreatingBoundary}>
                {isCreatingBoundary ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  editingBoundaryId ? "Save Boundary" : "Create & Activate"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Municipalities</CardTitle>
              <CardDescription className="text-base">Search and select the municipality to configure</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={municipalitySearch}
                onChange={(event) => setMunicipalitySearch(event.target.value)}
                placeholder="Search municipalities"
                className="h-11 pl-9 text-base"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Name</TableHead>
                <TableHead className="text-base">Code</TableHead>
                <TableHead className="text-base">Timezone</TableHead>
                <TableHead className="text-base">Status</TableHead>
                <TableHead className="text-right text-base">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMunicipalities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    {municipalitySearch ? "No municipalities match your search." : "Create a municipality to list it here."}
                  </TableCell>
                </TableRow>
              )}
              {filteredMunicipalities.map((item) => {
                const isSelected = item.id === municipality?.id
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-base font-semibold">{item.name}</TableCell>
                    <TableCell className="text-base">{item.code}</TableCell>
                    <TableCell className="text-base">{item.timezone}</TableCell>
                    <TableCell>{getStatusBadge(getMunicipalityActiveStatus(item))}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={isSelected ? "outline" : "default"}
                        onClick={() => handleSelectMunicipality(item)}
                        disabled={isSelected}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Municipality Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Municipality Information</CardTitle>
              <CardDescription className="text-base">Current municipality profile used for configuration requests</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsEditMunicipalityOpen(true)}
                disabled={!municipality}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {municipalityError && !municipality ? (
            <div className="mb-5 flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Failed to load municipality from database</p>
                <p className="mt-1 text-muted-foreground">{municipalityError}</p>
              </div>
            </div>
          ) : null}

          {isLoadingMunicipality && !municipality ? (
            <div className="flex items-center gap-3 rounded-md border border-dashed p-5 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading municipality from database...</span>
            </div>
          ) : municipality ? (
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
                  {hasActivatedBoundary ? (
                    <CheckCircle className="h-5 w-5 text-[#5B8C5A] mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(hasActivatedBoundary)}
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
              <CardDescription className="text-base">
                {hasActivatedBoundary
                  ? "Create versions, then activate the version that should be used. Activation makes the previous version inactive."
                  : hasBoundary
                    ? "Edit and activate the saved boundary before creating another version."
                    : "Create the first boundary for this municipality."}
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                if (!hasBoundary || hasActivatedBoundary) {
                  openNewBoundaryModal()
                  return
                }

                const draftBoundary = boundaries[0]
                if (draftBoundary) {
                  openEditBoundaryModal(draftBoundary)
                }
              }}
              disabled={!municipality}
            >
              {hasActivatedBoundary || !hasBoundary ? (
                <Plus className="h-4 w-4 mr-2" />
              ) : (
                <Edit className="h-4 w-4 mr-2" />
              )}
              {hasBoundary
                ? hasActivatedBoundary
                  ? "Add Boundary Version"
                  : "Edit Boundary"
                : "Add New Boundary"}
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
                  <TableCell>{getStatusBadge(isBoundaryVersionActivated(boundary))}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditBoundaryModal(boundary)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      {!isBoundaryVersionActivated(boundary) && (
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Municipality Drawer */}
      <Sheet open={isEditMunicipalityOpen} onOpenChange={setIsEditMunicipalityOpen}>
        <SheetContent side="right" className="w-[520px] p-0 sm:max-w-[520px]">
          <SheetHeader className="border-b border-border bg-muted/40 px-6 py-4 pr-14">
            <SheetTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#5B8C5A]" />
              Edit Municipality
            </SheetTitle>
            <SheetDescription>Update municipality configuration</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto bg-muted/20 px-6 py-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Municipality Profile</p>
                <p className="text-sm text-muted-foreground">
                  Update the active municipality details used for configuration requests.
                </p>
              </div>
            </div>

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

        <SheetFooter className="border-t border-border bg-background px-6 py-4">
          <Button variant="outline" onClick={() => setIsEditMunicipalityOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateMunicipality}>Save Changes</Button>
        </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet
        open={isCreateMunicipalityOpen}
        onOpenChange={(open) => {
          if (!open && isCreatingMunicipality) return
          setIsCreateMunicipalityOpen(open)
        }}
      >
        <SheetContent side="right" className="w-[520px] p-0 sm:max-w-[520px]">
          <SheetHeader className="border-b border-border bg-muted/40 px-6 py-4 pr-14">
            <SheetTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#5B8C5A]" />
              Create Municipality
            </SheetTitle>
            <SheetDescription>
              Use the deployed Core municipality contract to create a configuration record.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto bg-muted/20 px-6 py-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Municipality Profile</p>
                <p className="text-sm text-muted-foreground">
                  These details become the active municipality for configuration requests.
                </p>
              </div>
            </div>

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

          <SheetFooter className="border-t border-border bg-background px-6 py-4">
            <Button variant="outline" onClick={() => setIsCreateMunicipalityOpen(false)} disabled={isCreatingMunicipality}>
              Cancel
            </Button>
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
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
