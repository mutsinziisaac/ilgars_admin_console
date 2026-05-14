import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Route, Plus, Upload, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
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

export function RoutesPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
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
  }

  const openCreateRoute = () => {
    resetForm()
    setIsCreateOpen(true)
  }

  const toggleAllowedUse = (allowedUse: string) => {
    const allowedUses = routeForm.allowedUses.includes(allowedUse)
      ? routeForm.allowedUses.filter((use) => use !== allowedUse)
      : [...routeForm.allowedUses, allowedUse]

    setRouteForm({ ...routeForm, allowedUses })
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

    if (routeForm.allowedUses.length === 0) {
      toast.error("Select at least one allowed use")
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
        geoJson,
      })
      toast.success("GeoJSON route loaded")
    } catch {
      toast.error("Upload a valid GeoJSON file")
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
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

  const renderAllowedUse = (allowedUse: string) =>
    allowedUseOptions.find((option) => option.value === allowedUse)?.label || allowedUse

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

      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen} className="w-full max-w-3xl">
        <ModalHeader onClose={() => setIsCreateOpen(false)}>
          <ModalTitle>Create Route</ModalTitle>
          <ModalDescription>POST /municipal-routes with GeoJSON LineString data</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base">Municipality</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-3 text-base font-medium">
                {getMunicipalityDisplayName(routeForm.municipalityId)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label className="text-base">Allowed Uses *</Label>
              <div className="flex flex-wrap gap-2">
                {allowedUseOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleAllowedUse(option.value)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      routeForm.allowedUses.includes(option.value)
                        ? "border-[#5B8C5A] bg-[#5B8C5A]/10 text-[#5B8C5A]"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="geoJson" className="text-base">GeoJSON Route Data *</Label>
              <Textarea
                id="geoJson"
                value={routeForm.geoJson}
                onChange={(event) => setRouteForm({ ...routeForm, geoJson: event.target.value })}
                placeholder={defaultRouteGeoJson}
                className="text-base min-h-[200px] font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Paste a GeoJSON Feature or LineString for the route.
              </p>
            </div>

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
          </div>
        </ModalBody>
        <ModalFooter>
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
        </ModalFooter>
      </Modal>
    </div>
  )
}
