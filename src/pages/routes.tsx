import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Route, MapPin, Plus, Upload, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useCreateMunicipalRoute, useMunicipalRoutesList } from "@/lib/api/municipal-routes/hooks"
import type { MunicipalRoute } from "@/lib/api/municipal-routes/schemas"
import { MUNICIPAL_ROUTES_STORAGE_KEY_PREFIX } from "@/lib/api/constants"
import {
  getMunicipalityDisplayName,
  getStoredMunicipalityId as getRegistryMunicipalityId,
} from "@/lib/municipality-registry"

const defaultRouteGeoJson =
  "{\"type\":\"Feature\",\"geometry\":{\"type\":\"LineString\",\"coordinates\":[[32.443,-25.965],[32.529,-25.951],[32.573,-25.961]]},\"properties\":{\"name\":\"EN4 Avenida de Mocambique to Port of Maputo\"}}"

const allowedUseOptions = [
  { label: "Special Permit", value: "SPECIAL_PERMIT" },
  { label: "Road Closure", value: "ROAD_CLOSURE" },
]

const roadTypeOptions = [
  { label: "Protocol Roads", value: "PRIMARY_ROAD" },
  { label: "Secondary Roads", value: "SECONDARY_ROAD" },
  { label: "Tertiary Roads", value: "TERTIARY_ROAD" },
]

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Special Permit", value: "SPECIAL_PERMIT" },
  { label: "Road Closure", value: "ROAD_CLOSURE" },
] as const

const getStoredMunicipalityId = () => {
  return getRegistryMunicipalityId()
}

const getRoutesStorageKey = (municipalityId: string) =>
  `${MUNICIPAL_ROUTES_STORAGE_KEY_PREFIX}.${municipalityId}`

const getStoredRoutes = (municipalityId: string): MunicipalRoute[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(getRoutesStorageKey(municipalityId))
    return stored ? (JSON.parse(stored) as MunicipalRoute[]) : []
  } catch {
    return []
  }
}

const storeRoutes = (municipalityId: string, routes: MunicipalRoute[]) => {
  if (typeof window === "undefined") return

  localStorage.setItem(getRoutesStorageKey(municipalityId), JSON.stringify(routes))
}

const mergeRoutes = (incoming: MunicipalRoute[], fallback: MunicipalRoute[] = []) => {
  const byId = new Map<string, MunicipalRoute>()

  fallback.forEach((route) => byId.set(route.id, route))
  incoming.forEach((route) => byId.set(route.id, route))

  return Array.from(byId.values())
}

const createDefaultRouteCode = () => `EN4-PORT-${Date.now()}`
const MAPUTO_CENTER: [number, number] = [-25.9655, 32.5832]

const compactJson = (value: string) => {
  try {
    return JSON.stringify(JSON.parse(value))
  } catch {
    return value
  }
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

const extractLineLatLngs = (geoJson: string): [number, number][] => {
  try {
    const coordinates = getLineCoordinates(JSON.parse(geoJson))
    if (!coordinates) return []

    return coordinates
      .map((coordinate) => {
        if (!Array.isArray(coordinate) || coordinate.length < 2) return null
        const [lng, lat] = coordinate
        if (typeof lat !== "number" || typeof lng !== "number") return null
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
        return [lat, lng] as [number, number]
      })
      .filter((point): point is [number, number] => Boolean(point))
  } catch {
    return []
  }
}

const createRouteGeoJson = (name: string, points: [number, number][]) =>
  JSON.stringify({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: points.map(([lat, lng]) => [Number(lng.toFixed(6)), Number(lat.toFixed(6))]),
    },
    properties: { name },
  })

const createRouteVertexIcon = (index: number) =>
  L.divIcon({
    html: `
      <div style="
        display:flex;height:24px;width:24px;align-items:center;justify-content:center;
        border-radius:999px;border:2px solid #ffffff;background:#DAA22A;color:#1C1C1C;
        font-size:11px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,.25);
      ">${index + 1}</div>
    `,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

export function RoutesPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const routeMapContainerRef = useRef<HTMLDivElement | null>(null)
  const routeMapRef = useRef<L.Map | null>(null)
  const routeLayerRef = useRef<L.LayerGroup | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [activeAllowedUse, setActiveAllowedUse] = useState<(typeof filterOptions)[number]["value"]>("all")
  const [activeMunicipalityId, setActiveMunicipalityId] = useState(getStoredMunicipalityId())
  const [cachedRoutes, setCachedRoutes] = useState<MunicipalRoute[]>(() =>
    getStoredRoutes(getStoredMunicipalityId()),
  )

  const [routeForm, setRouteForm] = useState({
    municipalityId: activeMunicipalityId,
    code: createDefaultRouteCode(),
    name: "EN4 Avenida de Mocambique to Port of Maputo",
    roadType: "PRIMARY_ROAD",
    distanceKm: "14.5",
    allowedUses: ["SPECIAL_PERMIT", "ROAD_CLOSURE"],
    geoJson: defaultRouteGeoJson,
  })
  const [routeDraftPoints, setRouteDraftPoints] = useState<[number, number][]>(() =>
    extractLineLatLngs(defaultRouteGeoJson),
  )

  const routeListParams = {
    municipalityId: activeMunicipalityId,
    active: true,
    ...(activeAllowedUse === "all" ? {} : { allowedUse: activeAllowedUse }),
  }

  const { data: routesResponse, isLoading, error, refetch } = useMunicipalRoutesList(routeListParams)
  const createMutation = useCreateMunicipalRoute()
  const apiRoutes = routesResponse?.data || routesResponse?.content || []
  const routes = useMemo(() => {
    const mergedRoutes = mergeRoutes(apiRoutes, cachedRoutes)
    return activeAllowedUse === "all"
      ? mergedRoutes
      : mergedRoutes.filter((route) => route.allowedUses.includes(activeAllowedUse))
  }, [activeAllowedUse, apiRoutes, cachedRoutes])

  useEffect(() => {
    const latestMunicipalityId = getStoredMunicipalityId()
    setActiveMunicipalityId(latestMunicipalityId)
    setCachedRoutes(getStoredRoutes(latestMunicipalityId))
    setRouteForm((current) => ({
      ...current,
      municipalityId: latestMunicipalityId,
    }))
  }, [])

  useEffect(() => {
    if (!apiRoutes.length) return

    const nextRoutes = mergeRoutes(apiRoutes, getStoredRoutes(activeMunicipalityId))
    setCachedRoutes(nextRoutes)
    storeRoutes(activeMunicipalityId, nextRoutes)
  }, [activeMunicipalityId, apiRoutes])

  const resetForm = () => {
    const municipalityId = getStoredMunicipalityId()
    setActiveMunicipalityId(municipalityId)
    setCachedRoutes(getStoredRoutes(municipalityId))
    setRouteForm({
      municipalityId,
      code: createDefaultRouteCode(),
      name: "EN4 Avenida de Mocambique to Port of Maputo",
      roadType: "PRIMARY_ROAD",
      distanceKm: "14.5",
      allowedUses: ["SPECIAL_PERMIT", "ROAD_CLOSURE"],
      geoJson: defaultRouteGeoJson,
    })
    setRouteDraftPoints(extractLineLatLngs(defaultRouteGeoJson))
  }

  useEffect(() => {
    if (!isCreateOpen || !routeMapContainerRef.current || routeMapRef.current) return

    const map = L.map(routeMapContainerRef.current, {
      center: MAPUTO_CENTER,
      zoom: 11,
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
      attribution: '&copy; <a href="https://www.google.com/maps">Google</a>',
      maxZoom: 20,
    }).addTo(map)

    routeLayerRef.current = L.layerGroup().addTo(map)
    routeMapRef.current = map
    map.on("click", (event: L.LeafletMouseEvent) => {
      setRouteDraftPoints((points) => [...points, [event.latlng.lat, event.latlng.lng]])
    })

    window.setTimeout(() => map.invalidateSize(), 100)

    return () => {
      map.remove()
      routeMapRef.current = null
      routeLayerRef.current = null
    }
  }, [isCreateOpen])

  useEffect(() => {
    const map = routeMapRef.current
    const layer = routeLayerRef.current
    if (!isCreateOpen || !map || !layer) return

    layer.clearLayers()

    routeDraftPoints.forEach((point, index) => {
      L.marker(point, {
        draggable: true,
        icon: createRouteVertexIcon(index),
      })
        .on("dragstart", () => map.dragging.disable())
        .on("dragend", (event) => {
          const marker = event.target as L.Marker
          const nextPoint = marker.getLatLng()
          map.dragging.enable()
          setRouteDraftPoints((points) =>
            points.map((currentPoint, currentIndex) =>
              currentIndex === index ? [nextPoint.lat, nextPoint.lng] : currentPoint
            )
          )
        })
        .addTo(layer)
    })

    if (routeDraftPoints.length >= 2) {
      L.polyline(routeDraftPoints, {
        color: "#DAA22A",
        weight: 4,
      }).addTo(layer)
    }

    if (routeDraftPoints.length) {
      map.fitBounds(L.latLngBounds(routeDraftPoints), { padding: [24, 24], maxZoom: 15 })
    }
  }, [isCreateOpen, routeDraftPoints])

  const openCreateRoute = () => {
    resetForm()
    setIsCreateOpen(true)
  }

  const handleCreateRoute = () => {
    const municipalityId = routeForm.municipalityId.trim()

    if (!municipalityId) {
      toast.error("Create a municipality before creating a route")
      return
    }

    if (!routeForm.code.trim() || !routeForm.name.trim() || !routeForm.roadType.trim()) {
      toast.error("Route code, name, and road type are required")
      return
    }

    try {
      JSON.parse(routeForm.geoJson)
    } catch {
      toast.error("GeoJSON route data must be valid JSON")
      return
    }

    const distanceKm = Number(routeForm.distanceKm)

    createMutation.mutate(
      {
        municipalityId,
        code: routeForm.code.trim(),
        name: routeForm.name.trim(),
        roadType: routeForm.roadType.trim(),
        geoJson: routeForm.geoJson,
        distanceKm: Number.isFinite(distanceKm) ? distanceKm : undefined,
        allowedUses: routeForm.allowedUses,
        active: true,
      },
      {
        onSuccess: (data) => {
          setActiveMunicipalityId(municipalityId)
          const nextRoutes = mergeRoutes([data.data], getStoredRoutes(municipalityId))
          setCachedRoutes(nextRoutes)
          storeRoutes(municipalityId, nextRoutes)
          setIsCreateOpen(false)
          resetForm()
          toast.success("Route created successfully")
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to create route")
        },
      },
    )
  }

  const handleRouteFileUpload = async (file: File | undefined) => {
    if (!file) return

    try {
      const geoJson = await file.text()
      JSON.parse(geoJson)
      setRouteForm({
        ...routeForm,
        name: routeForm.name || file.name.replace(/\.(geo)?json$/i, ""),
        geoJson: compactJson(geoJson),
      })
      setRouteDraftPoints(extractLineLatLngs(geoJson))
      toast.success("GeoJSON route loaded")
    } catch {
      toast.error("Upload a valid GeoJSON file")
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleLoadRouteGeoJsonOnMap = () => {
    const points = extractLineLatLngs(routeForm.geoJson)
    if (points.length < 2) {
      toast.error("GeoJSON route must include at least two line points")
      return
    }

    setRouteDraftPoints(points)
    toast.success("GeoJSON loaded on map")
  }

  const handleApplyDrawnRoute = () => {
    if (routeDraftPoints.length < 2) {
      toast.error("Add at least two points before applying the route")
      return
    }

    setRouteForm((current) => ({
      ...current,
      geoJson: createRouteGeoJson(current.name, routeDraftPoints),
    }))
    toast.success("Map route applied to GeoJSON data")
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

  const renderAllowedUse = (allowedUse: string) =>
    allowedUseOptions.find((option) => option.value === allowedUse)?.label || allowedUse

  if (isCreateOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCreateOpen(false)}
            disabled={createMutation.isPending}
            aria-label="Back to municipal routes"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Create Route</h1>
            <p className="text-base text-muted-foreground">
              Create a municipal route with GeoJSON LineString data.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Route Details</CardTitle>
            <CardDescription className="text-base">
              Set the route identity, road type, and distance for {getMunicipalityDisplayName(routeForm.municipalityId)}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base">Municipality</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-3 text-base font-medium">
                {getMunicipalityDisplayName(routeForm.municipalityId)}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-base">Route Code *</Label>
                <Input
                  id="code"
                  value={routeForm.code}
                  onChange={(event) => setRouteForm({ ...routeForm, code: event.target.value })}
                  placeholder="e.g., EN4-PORT-UAT"
                  className="text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roadType" className="text-base">Road Type *</Label>
                <Select
                  value={routeForm.roadType}
                  onValueChange={(roadType) => setRouteForm({ ...routeForm, roadType })}
                >
                  <SelectTrigger id="roadType" className="text-base h-11">
                    <SelectValue placeholder="Select road type" />
                  </SelectTrigger>
                  <SelectContent className="text-base">
                    {roadTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-base">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Route Name *</Label>
                <Input
                  id="name"
                  value={routeForm.name}
                  onChange={(event) => setRouteForm({ ...routeForm, name: event.target.value })}
                  placeholder="e.g., EN4 Avenida de Mocambique to Port of Maputo"
                  className="text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="distanceKm" className="text-base">Distance (km)</Label>
                <Input
                  id="distanceKm"
                  type="number"
                  value={routeForm.distanceKm}
                  onChange={(event) => setRouteForm({ ...routeForm, distanceKm: event.target.value })}
                  placeholder="e.g., 14.5"
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
                <CardTitle className="text-2xl">Route Map</CardTitle>
                <CardDescription className="text-base">
                  Click along the route, drag points to adjust, then apply the line to GeoJSON data.
                </CardDescription>
              </div>
              <Badge variant="outline" className="w-fit">
                {routeDraftPoints.length} points
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[420px] overflow-hidden rounded-md border border-border">
              <div ref={routeMapContainerRef} className="h-full w-full" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Button type="button" variant="outline" onClick={handleLoadRouteGeoJsonOnMap}>
                <MapPin className="mr-2 h-4 w-4" />
                Load GeoJSON
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRouteDraftPoints((points) => points.slice(0, -1))}
                disabled={!routeDraftPoints.length}
              >
                Undo Point
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRouteDraftPoints([])}
                disabled={!routeDraftPoints.length}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Clear Map
              </Button>
              <Button type="button" onClick={handleApplyDrawnRoute} disabled={routeDraftPoints.length < 2}>
                Apply Route
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">GeoJSON Route Data</CardTitle>
            <CardDescription className="text-base">
              Paste a GeoJSON Feature or LineString for the route, or upload a .geojson file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              id="geoJson"
              value={routeForm.geoJson}
              onChange={(event) => setRouteForm({ ...routeForm, geoJson: event.target.value })}
              onBlur={() => setRouteForm((current) => ({ ...current, geoJson: compactJson(current.geoJson) }))}
              placeholder={defaultRouteGeoJson}
              rows={1}
              wrap="off"
              className="h-11 min-h-11 resize-y overflow-x-auto whitespace-nowrap font-mono text-sm"
            />

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".geojson,.json,application/geo+json,application/json"
                className="hidden"
                onChange={(event) => handleRouteFileUpload(event.target.files?.[0])}
              />
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={createMutation.isPending}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload GeoJSON File
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4">
          <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleCreateRoute} disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Route"
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
          <h1 className="text-4xl font-semibold text-foreground">Municipal Routes</h1>
          <p className="text-lg text-muted-foreground">Create and list selectable backend routes</p>
        </div>
        <Button onClick={openCreateRoute} disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Create Route
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Routes</CardTitle>
            </div>
            <div className="flex rounded-md border p-1">
              {filterOptions.map((filter) => (
                <Button
                  key={filter.value}
                  variant={activeAllowedUse === filter.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveAllowedUse(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && routes.length === 0 ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load routes</h3>
              <p className="text-muted-foreground mb-4">{(error as Error)?.message || "An error occurred"}</p>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : routes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Route className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No routes found</h3>
              <p className="text-muted-foreground">Create an active municipal route to list it here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Route Code</TableHead>
                  <TableHead className="text-base">Route Name</TableHead>
                  <TableHead className="text-base">Road Type</TableHead>
                  <TableHead className="text-base">Distance</TableHead>
                  <TableHead className="text-base">Allowed Uses</TableHead>
                  <TableHead className="text-base">Status</TableHead>
                  <TableHead className="text-base">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route: MunicipalRoute) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium text-base">{route.code}</TableCell>
                    <TableCell className="text-base">{route.name}</TableCell>
                    <TableCell className="text-base">{route.roadType}</TableCell>
                    <TableCell className="text-base">{route.distanceKm ?? "-"} km</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {route.allowedUses.map((use) => (
                          <Badge key={use} variant="outline" className="text-xs">
                            {renderAllowedUse(use)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(route.active)}</TableCell>
                    <TableCell className="text-base">{route.createdAt?.split("T")[0] || "-"}</TableCell>
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
