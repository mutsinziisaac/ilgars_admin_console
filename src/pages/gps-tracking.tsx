import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MapPin, Search, Plus, Loader2, Link2, Unlink2 } from "lucide-react"
import { useQueries, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { DevicesApi } from "@/lib/api/devices/api"
import { useRegisterDevice } from "@/lib/api/devices/hooks"
import { devicesKeys } from "@/lib/api/devices/queryKeys"
import type { ActiveDeviceResponse, Device } from "@/lib/api/devices/schemas"
import { useVehiclesList } from "@/lib/api/vehicles/hooks"
import type { Vehicle } from "@/lib/api/vehicles/schemas"
import { ApiError, getApiErrorMessage } from "@/lib/api/errors"
import { buildDeviceAssignmentPayload } from "@/lib/api/devices/assignmentPayload"
import { buildDefaultRegisterDevicePayload } from "@/lib/api/devices/registerPayload"
import { getCurrentUsername } from "@/lib/auth/currentUser"
import { useLiveMap } from "@/lib/api/analytics/hooks"
import { Map as AppMap, type MapMarker } from "@/components/ui/map"

type TrackingDevice = {
  id: string
  plateNumber: string
  vehicleType: string
  owner: string
  status: string
  health: string
  location: string
  speed: string
  battery: string
  signal: string
  lastUpdate: string
  vehicleId?: string
  backendDeviceId?: string
  assignmentId?: string
  kind?: "assigned" | "registered"
}

const TRACKER_LOOKUP_PAGE_SIZE = 25
const TRACKER_LOOKUP_STALE_MS = 5 * 60 * 1000
const MAPUTO_CENTER: [number, number] = [-25.9692, 32.5732]
const DEFAULT_ZOOM = 14

type JsonRecord = Record<string, unknown>

const asRecord = (value: unknown): JsonRecord | null =>
  value && typeof value === "object" ? value as JsonRecord : null

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return null
}

const findNumberByKeys = (source: unknown, keys: string[]): number | null => {
  const record = asRecord(source)
  if (!record) return null

  for (const key of keys) {
    const value = toNumber(record[key])
    if (value !== null) return value
  }

  for (const nestedKey of [
    "data",
    "properties",
    "metrics",
    "summary",
    "health",
    "location",
    "position",
    "telemetry",
    "lastTelemetry",
    "latestTelemetry",
    "gps",
    "gpsFix",
    "deviceState",
    "lastPing",
  ]) {
    const nestedValue = findNumberByKeys(record[nestedKey], keys)
    if (nestedValue !== null) return nestedValue
  }

  return null
}

const findStringByKeys = (source: unknown, keys: string[]): string | null => {
  const record = asRecord(source)
  if (!record) return null

  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim()) return value.trim()
    if (typeof value === "number" && Number.isFinite(value)) return String(value)
    if (typeof value === "boolean") return value ? "Yes" : "No"
  }

  for (const nestedKey of [
    "data",
    "properties",
    "metrics",
    "summary",
    "health",
    "location",
    "position",
    "telemetry",
    "lastTelemetry",
    "latestTelemetry",
    "gps",
    "gpsFix",
    "deviceState",
    "lastPing",
  ]) {
    const nestedValue = findStringByKeys(record[nestedKey], keys)
    if (nestedValue) return nestedValue
  }

  return null
}

const formatPercent = (value: number | null) =>
  value === null ? null : `${Math.round(value)}%`

const formatSpeed = (value: number | null) =>
  value === null ? null : `${Math.round(value)} km/h`

type LiveDevicePosition = {
  latlng: [number, number]
  location?: string
  speed?: string
  battery?: string
  signal?: string
  status?: string
  lastUpdate?: string
}

const findLiveLatLng = (source: unknown): [number, number] | null => {
  const lat = findNumberByKeys(source, ["lat", "latitude"])
  const lng = findNumberByKeys(source, ["lng", "lon", "longitude"])

  if (lat !== null && lng !== null) return [lat, lng]

  const record = asRecord(source)
  const coordinates = record?.coordinates
  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    const first = toNumber(coordinates[0])
    const second = toNumber(coordinates[1])
    if (first !== null && second !== null) {
      return Math.abs(first) > 30 && Math.abs(second) <= 30 ? [second, first] : [first, second]
    }
  }

  return null
}

const liveMapKeysForPoint = (point: unknown) =>
  [
    findStringByKeys(point, ["vehicleId", "vehicleID", "vehicle_id"]),
    findStringByKeys(point, ["plateNumber", "vehiclePlate", "plate", "registrationNumber"]),
    findStringByKeys(point, ["deviceId", "deviceID", "deviceUid", "deviceUID", "trackerId", "imei"]),
  ].filter((value, index, values): value is string =>
    Boolean(value) && values.indexOf(value) === index
  )

const buildLivePositionIndex = (points: unknown[]) => {
  const index = new globalThis.Map<string, LiveDevicePosition>()

  for (const point of points) {
    const latlng = findLiveLatLng(point)
    if (!latlng) continue

    const livePosition: LiveDevicePosition = {
      latlng,
      location: findStringByKeys(point, ["address", "locationName", "street", "roadName", "placeName", "description"]) ?? undefined,
      speed: formatSpeed(findNumberByKeys(point, ["speed", "speedKmh", "speedKmH", "speedKph", "velocity"])) ?? undefined,
      battery: formatPercent(findNumberByKeys(point, ["battery", "batteryLevel", "batteryPercent", "batteryPercentage", "batteryPct"])) ?? undefined,
      signal: findStringByKeys(point, ["signal", "signalStrength", "gsmSignal", "networkSignal", "rssi"]) ?? undefined,
      status: findStringByKeys(point, ["status", "vehicleStatus", "deviceStatus", "state"]) ?? undefined,
      lastUpdate: findStringByKeys(point, ["lastUpdate", "updatedAt", "timestamp", "recordedAt", "receivedAt", "lastSeenAt"]) ?? undefined,
    }

    for (const key of liveMapKeysForPoint(point)) {
      index.set(key, livePosition)
    }
  }

  return index
}

const findLivePositionForDevice = (
  device: TrackingDevice,
  livePositions: globalThis.Map<string, LiveDevicePosition>,
) => {
  const keys = [
    device.vehicleId,
    device.plateNumber,
    device.backendDeviceId,
    device.id,
  ].filter((value, index, values): value is string =>
    Boolean(value) && values.indexOf(value) === index
  )

  for (const key of keys) {
    const livePosition = livePositions.get(key)
    if (livePosition) return livePosition
  }

  return null
}

const resolveDeviceField = (keys: string[], fallback: string, ...sources: Array<unknown>) => {
  for (const source of sources) {
    const value = findStringByKeys(source, keys)
    if (value) return value
  }

  return fallback
}

const resolveDeviceNumberField = (
  keys: string[],
  formatter: (value: number | null) => string | null,
  fallback: string,
  ...sources: Array<unknown>
) => {
  for (const source of sources) {
    const value = formatter(findNumberByKeys(source, keys))
    if (value) return value
  }

  return fallback
}

const isTrackerStatusActive = (status: string) =>
  ["ACTIVE", "Active", "REGISTERED"].includes(status)

const formatDeviceTimestamp = (value?: string | null) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString()
}

const toSortTimestamp = (value: string) => {
  if (value === "Detached locally") return Date.now()
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

const toVehicleDisplayName = (vehicle: Vehicle) =>
  vehicle.vehicleType ||
  [vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
  vehicle.serviceType ||
  "Vehicle"

const toVehicleOwner = (vehicle: Vehicle) =>
  vehicle.ownerName || vehicle.operatorName || vehicle.ownerId || "Unknown owner"

const mapVehicleToTrackingDevice = (
  vehicle: Vehicle,
  activeDevice?: ActiveDeviceResponse | null,
): TrackingDevice | null => {
  const tracker = activeDevice?.device
  const assignment = activeDevice?.assignment
  const trackerId = tracker?.deviceUid || tracker?.id
  const hasActiveTracker = Boolean(trackerId && assignment)

  if (!hasActiveTracker || !trackerId) {
    return null
  }

  return {
    id: trackerId,
    backendDeviceId: tracker?.id || tracker?.deviceUid || undefined,
    assignmentId: assignment?.id || undefined,
    vehicleId: vehicle.id,
    plateNumber: vehicle.plateNumber,
    vehicleType: toVehicleDisplayName(vehicle),
    owner: toVehicleOwner(vehicle),
    status: assignment?.status || tracker?.status || "ACTIVE",
    health: resolveDeviceField(
      ["health", "healthStatus", "deviceHealth", "condition", "state"],
      "N/A",
      activeDevice,
      tracker,
      assignment,
    ),
    location: resolveDeviceField(
      ["address", "locationName", "street", "roadName", "placeName", "description"],
      "N/A",
      activeDevice,
      tracker,
      assignment,
    ),
    speed: resolveDeviceNumberField(
      ["speed", "speedKmh", "speedKmH", "speedKph", "velocity"],
      formatSpeed,
      "N/A",
      activeDevice,
      tracker,
      assignment,
    ),
    battery: resolveDeviceNumberField(
      ["battery", "batteryLevel", "batteryPercent", "batteryPercentage", "batteryPct"],
      formatPercent,
      "N/A",
      activeDevice,
      tracker,
      assignment,
    ),
    signal: resolveDeviceField(
      ["signal", "signalStrength", "gsmSignal", "networkSignal", "rssi"],
      "N/A",
      activeDevice,
      tracker,
      assignment,
    ),
    lastUpdate: formatDeviceTimestamp(assignment?.assignedAt || tracker?.updatedAt || tracker?.createdAt || vehicle.updatedAt),
    kind: "assigned",
  }
}

export function GPSTrackingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const [isAssignTrackerOpen, setIsAssignTrackerOpen] = useState(false)
  const [isAssigningTracker, setIsAssigningTracker] = useState(false)
  const queryClient = useQueryClient()
  const registerDeviceMutation = useRegisterDevice()
  const {
    data: vehiclesResponse,
    isLoading: isVehiclesLoading,
    error: vehiclesError,
    refetch: refetchVehicles,
  } = useVehiclesList({ page: 0, size: TRACKER_LOOKUP_PAGE_SIZE })
  const {
    data: liveMapPoints = [],
    isFetching: isLiveMapFetching,
    error: liveMapError,
  } = useLiveMap()
  const vehicles = useMemo(() => vehiclesResponse?.data ?? [], [vehiclesResponse])
  const livePositionIndex = useMemo(
    () => buildLivePositionIndex(liveMapPoints),
    [liveMapPoints],
  )
  const activeDeviceQueries = useQueries({
    queries: vehicles.map((vehicle) => ({
      queryKey: vehicle.id
        ? devicesKeys.activeByVehicle(vehicle.id)
        : ["devices", "active-by-vehicle", "missing-id", vehicle.plateNumber],
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        if (!vehicle.id) return null

        try {
          return await DevicesApi.getActiveDeviceByVehicle(vehicle.id, signal)
        } catch (error) {
          if (error instanceof ApiError && error.status === 404) {
            return null
          }

          throw error
        }
      },
      enabled: Boolean(vehicle.id),
      staleTime: TRACKER_LOOKUP_STALE_MS,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
    })),
  })
  const [locallyAddedDevices, setLocallyAddedDevices] = useState<TrackingDevice[]>([])
  const [locallyDetachedVehicleIds, setLocallyDetachedVehicleIds] = useState<Set<string>>(new Set())
  const trackingDevices = useMemo<TrackingDevice[]>(
    () => {
      const localDevicesByVehicle = new Map(
        locallyAddedDevices
          .filter((device) => device.vehicleId)
          .map((device) => [device.vehicleId, device])
      )

      const vehicleRows = vehicles
        .map((vehicle, index) => {
        const localDevice = vehicle.id ? localDevicesByVehicle.get(vehicle.id) : undefined
        if (localDevice) return localDevice

        const activeTracker = mapVehicleToTrackingDevice(
          vehicle,
          activeDeviceQueries[index]?.data ?? null,
        )

        if (activeTracker && vehicle.id && locallyDetachedVehicleIds.has(vehicle.id)) {
          return {
            ...activeTracker,
            status: "INACTIVE",
            lastUpdate: "Detached locally",
          }
        }

        return activeTracker
      })
        .filter((device): device is TrackingDevice => Boolean(device))

      const localRowsWithoutVehicle = locallyAddedDevices.filter((device) => !device.vehicleId)
      return [...vehicleRows, ...localRowsWithoutVehicle].map((device) => {
        const livePosition = findLivePositionForDevice(device, livePositionIndex)
        if (!livePosition) return device

        return {
          ...device,
          location: livePosition.location ?? device.location,
          speed: livePosition.speed ?? device.speed,
          battery: livePosition.battery ?? device.battery,
          signal: livePosition.signal ?? device.signal,
          status: livePosition.status ?? device.status,
          lastUpdate: formatDeviceTimestamp(livePosition.lastUpdate) || device.lastUpdate,
        }
      }).sort(
        (first, second) => toSortTimestamp(second.lastUpdate) - toSortTimestamp(first.lastUpdate),
      )
    },
    [activeDeviceQueries, livePositionIndex, locallyAddedDevices, locallyDetachedVehicleIds, vehicles],
  )
  
  const [deviceForm, setDeviceForm] = useState({
    deviceId: "",
    imei: "",
  })
  const [assignmentForm, setAssignmentForm] = useState({
    deviceId: "",
    vehicleId: "",
  })

  const handleAddDevice = () => {
    if (!deviceForm.deviceId.trim()) {
      toast.error("Device ID is required")
      return
    }
    const submittedDeviceUid = deviceForm.deviceId.trim()
    registerDeviceMutation.mutate(
      buildDefaultRegisterDevicePayload({
        deviceUid: submittedDeviceUid,
        imei: deviceForm.imei,
      }),
      {
        onSuccess: async (registeredDevice: Device) => {
          const backendDeviceId = registeredDevice.id || registeredDevice.deviceUid || submittedDeviceUid
          const deviceId = registeredDevice.deviceUid || submittedDeviceUid || backendDeviceId
          const registeredAt = registeredDevice.createdAt || registeredDevice.updatedAt || new Date().toISOString()
          setIsAddDeviceOpen(false)
          setDeviceForm({
            deviceId: "",
            imei: "",
          })
          setAssignmentForm((current) => ({ ...current, deviceId: backendDeviceId }))
          setLocallyAddedDevices((currentDevices) => [
            ...currentDevices.filter((device) => device.id !== deviceId && device.backendDeviceId !== backendDeviceId),
            {
              id: deviceId,
              backendDeviceId,
              plateNumber: "Unassigned",
              vehicleType: registeredDevice.model || "GPS Tracker",
              owner: registeredDevice.vendor || "Unassigned",
              status: registeredDevice.status || "REGISTERED",
              health: resolveDeviceField(
                ["health", "healthStatus", "deviceHealth", "condition", "state"],
                "Not attached",
                registeredDevice,
              ),
              location: "N/A",
              speed: "N/A",
              battery: resolveDeviceNumberField(
                ["battery", "batteryLevel", "batteryPercent", "batteryPercentage", "batteryPct"],
                formatPercent,
                "N/A",
                registeredDevice,
              ),
              signal: resolveDeviceField(
                ["signal", "signalStrength", "gsmSignal", "networkSignal", "rssi"],
                "N/A",
                registeredDevice,
              ),
              lastUpdate: formatDeviceTimestamp(registeredAt),
              kind: "registered",
            },
          ])
          toast.success("Tracker registered successfully")
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, "Failed to register GPS device"))
        },
      },
    )
  }

  const handleAssignTracker = async () => {
    const trackerId = assignmentForm.deviceId.trim()
    const vehicleId = assignmentForm.vehicleId.trim()
    const resolvedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId)

    if (!trackerId || !vehicleId) {
      toast.error("Tracker ID and vehicle are required")
      return
    }

    if (!resolvedVehicle?.plateNumber) {
      toast.error("Select a vehicle from the loaded backend vehicle list")
      return
    }

    setIsAssigningTracker(true)
    try {
      const plateNumber = resolvedVehicle.plateNumber
      const assignedBy = await getCurrentUsername()
      const assignmentPayload = buildDeviceAssignmentPayload({
        vehicleId,
        plateNumber,
        assignedBy,
        mode: "assign",
      })

      const matchingLocalDevice = locallyAddedDevices.find(
        (device) => device.id === trackerId || device.backendDeviceId === trackerId,
      )
      const trackerIdCandidates = [
        matchingLocalDevice?.backendDeviceId,
        trackerId,
        matchingLocalDevice?.id,
      ].filter((candidate, index, candidates): candidate is string =>
        Boolean(candidate) && candidates.indexOf(candidate) === index
      )

      let assignedTrackerId = trackerId
      let lastAssignError: unknown
      for (const candidate of trackerIdCandidates) {
        try {
          await DevicesApi.assignDevice(candidate, assignmentPayload)
          assignedTrackerId = candidate
          lastAssignError = undefined
          break
        } catch (error) {
          lastAssignError = error
          if (!(error instanceof ApiError) || error.status !== 404) {
            throw error
          }
        }
      }

      if (lastAssignError) {
        throw lastAssignError
      }

      setLocallyDetachedVehicleIds((currentIds) => {
        const nextIds = new Set(currentIds)
        nextIds.delete(vehicleId)
        return nextIds
      })
      await queryClient.invalidateQueries({ queryKey: devicesKeys.activeByVehicle(vehicleId) })
      await refetchVehicles()
      setLocallyAddedDevices((currentDevices) => [
        ...currentDevices.filter((device) => device.id !== trackerId && device.backendDeviceId !== trackerId && device.vehicleId !== vehicleId),
        {
          id: matchingLocalDevice?.id || assignedTrackerId,
          backendDeviceId: matchingLocalDevice?.backendDeviceId || assignedTrackerId,
          vehicleId,
          plateNumber,
          vehicleType: resolvedVehicle ? toVehicleDisplayName(resolvedVehicle) : "Vehicle",
          owner: resolvedVehicle ? toVehicleOwner(resolvedVehicle) : "Unknown owner",
          status: "ACTIVE",
          health: "N/A",
          location: "N/A",
          speed: "N/A",
          battery: "N/A",
          signal: "N/A",
          lastUpdate: formatDeviceTimestamp(new Date().toISOString()),
          kind: "assigned",
        },
      ])
      setIsAssignTrackerOpen(false)
      setAssignmentForm({ deviceId: "", vehicleId: "" })
      toast.success("Tracker attached successfully")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to assign tracker"))
    } finally {
      setIsAssigningTracker(false)
    }
  }

  const isActiveTracker = (device: TrackingDevice) =>
    device.kind !== "registered" && isTrackerStatusActive(device.status) && Boolean(device.backendDeviceId || device.id)

  const handleAttachTrackerClick = (device: TrackingDevice) => {
    setAssignmentForm({
      deviceId: device.backendDeviceId || device.id,
      vehicleId: device.kind === "registered" ? "" : device.vehicleId || "",
    })
    setIsAssignTrackerOpen(true)
  }

  const handleDetachTrackerClick = async (device: TrackingDevice) => {
    if (!device.vehicleId) {
      toast.error("Backend vehicle reference is missing for this tracker")
      return
    }

    setLocallyDetachedVehicleIds((currentIds) => {
      const nextIds = new Set(currentIds)
      nextIds.add(device.vehicleId as string)
      return nextIds
    })
    setLocallyAddedDevices((currentDevices) =>
      currentDevices.filter((currentDevice) => currentDevice.vehicleId !== device.vehicleId)
    )
    await queryClient.invalidateQueries({ queryKey: devicesKeys.activeByVehicle(device.vehicleId) })
    toast.success("Tracker detached from vehicle", {
      description: `${device.id} is now inactive for ${device.plateNumber}.`,
    })
  }

  // Filter tracking devices
  const filteredDevices = trackingDevices.filter(device =>
    device.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.owner.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get status badge
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "Active": "bg-[#5B8C5A] text-white",
      "ACTIVE": "bg-[#5B8C5A] text-white",
      "REGISTERED": "bg-[#5B8C5A] text-white",
      "INACTIVE": "bg-muted text-muted-foreground",
      "Idle": "bg-[#DAA22A] text-[#1C1C1C]",
      "Offline": "bg-[#E5533D] text-white",
    }
    return (
      <Badge className={`${colors[status] || "bg-secondary"} text-sm px-3 py-1`}>
        {status}
      </Badge>
    )
  }

  const getHealthBadge = (health: string) => {
    const normalizedHealth = health.toUpperCase()
    const isHealthy = ["HEALTHY", "GOOD", "OK", "ONLINE", "YES"].includes(normalizedHealth)
    const isWarning = ["WARNING", "WARN", "DEGRADED", "LOW_BATTERY", "LOW BATTERY"].includes(normalizedHealth)
    const isCritical = ["CRITICAL", "UNHEALTHY", "OFFLINE", "FAULT", "ERROR", "NO"].includes(normalizedHealth)
    const className = isHealthy
      ? "bg-[#5B8C5A] text-white"
      : isWarning
      ? "bg-[#DAA22A] text-[#1C1C1C]"
      : isCritical
      ? "bg-[#E5533D] text-white"
      : "bg-muted text-muted-foreground"

    return (
      <Badge className={`${className} text-sm px-3 py-1`}>
        {health}
      </Badge>
    )
  }

  const activeDevices = trackingDevices.filter(isActiveTracker).length
  const checkedVehicles = vehicles.length
  const assignmentLookupsLoading = activeDeviceQueries.some((query) => query.isLoading || query.isFetching)
  const livePositionCount = livePositionIndex.size
  const mapMarkers: MapMarker[] = trackingDevices
    .flatMap((device): MapMarker[] => {
      const livePosition = findLivePositionForDevice(device, livePositionIndex)
      if (!livePosition) return []

      const color = isTrackerStatusActive(device.status) ? "#5B8C5A" : "#E5533D"
      return [{
        position: livePosition.latlng,
        label: device.plateNumber,
        color,
        glyph: "T",
        popupHtml: `
          <div style="width:280px;font-family:Outfit,system-ui,sans-serif">
            <div style="background:${color};color:white;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:12px">
              <strong style="font-size:14px;line-height:1.1">${device.plateNumber}</strong>
              <span style="font-size:11px;opacity:.85">${device.lastUpdate}</span>
            </div>
            <div style="padding:12px">
              <div style="font-size:14px;font-weight:700;margin-bottom:8px">${device.vehicleType}</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;font-size:12px;color:#555;margin-bottom:8px">
                <div><span style="color:#999">Owner</span><br/>${device.owner}</div>
                <div><span style="color:#999">Speed</span><br/>${device.speed}</div>
                <div><span style="color:#999">Battery</span><br/>${device.battery}</div>
                <div><span style="color:#999">Signal</span><br/>${device.signal}</div>
              </div>
              <div style="font-size:12px;color:#555;margin-bottom:8px">${device.location}</div>
              <span style="display:inline-block;background:${color}22;color:${color};padding:3px 8px;border-radius:5px;font-size:11px;font-weight:700">${device.status}</span>
            </div>
          </div>
        `,
      }]
    })

  if (isMapOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsMapOpen(false)} className="mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-semibold text-foreground">GPS Live Map</h1>
            <p className="text-lg text-muted-foreground">
              Tracker markers refresh automatically from the admin live-map endpoint.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isLiveMapFetching && (
              <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating live map
              </Badge>
            )}
            {liveMapError && (
              <Badge variant="destructive" className="px-3 py-1.5 text-sm">
                Live map unavailable
              </Badge>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="relative h-[calc(100vh-220px)] min-h-[560px] w-full overflow-hidden rounded-lg">
              <AppMap
                center={MAPUTO_CENTER}
                zoom={DEFAULT_ZOOM}
                markers={mapMarkers}
                height="100%"
                className="h-full w-full"
                defaultView="street"
              />

              <div className="absolute top-4 right-4 z-[1000] rounded-lg bg-white p-4 shadow-lg">
                <h3 className="mb-3 text-sm font-semibold">Legend</h3>
                <div className="space-y-2">
                  <div className="mb-2 text-xs text-gray-500">Live positions: {livePositionCount}</div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[#5B8C5A]" />
                    <span className="text-sm">Active ({activeDevices})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[#E5533D]" />
                    <span className="text-sm">Inactive ({trackingDevices.length - activeDevices})</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">GPS Tracking</h1>
          <p className="text-lg text-muted-foreground">Backend GPS tracker assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsMapOpen(true)}>
            <MapPin className="h-4 w-4 mr-2" />
            View Map
          </Button>
          <Button onClick={() => setIsAddDeviceOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Register Tracker
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Active Tracker Assignments</CardDescription>
            <CardTitle className="text-4xl text-[#5B8C5A]">{activeDevices}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Devices assigned to vehicles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Vehicles Checked</CardDescription>
            <CardTitle className="text-4xl">{checkedVehicles}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">From Motorvehicle API</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-base">Lookup Status</CardDescription>
            <CardTitle className="text-4xl text-[#DAA22A]">{assignmentLookupsLoading ? "Loading" : "Ready"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">Devices active-assignment API</p>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Devices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">GPS Tracking Devices</CardTitle>
              <CardDescription className="text-base">Vehicles enriched with tracker assignment and device health</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by plate number or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-base h-11"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Device ID</TableHead>
                <TableHead className="text-base">Plate Number</TableHead>
                <TableHead className="text-base">Vehicle Type</TableHead>
                <TableHead className="text-base">Owner</TableHead>
                <TableHead className="text-base">Health</TableHead>
                <TableHead className="text-base">Battery</TableHead>
                <TableHead className="text-base">Signal</TableHead>
                <TableHead className="text-base">Assigned At</TableHead>
                <TableHead className="text-base">Assignment Status</TableHead>
                <TableHead className="text-right text-base">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isVehiclesLoading && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-base text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading vehicles
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isVehiclesLoading && assignmentLookupsLoading && (
                <TableRow>
                  <TableCell colSpan={10} className="py-3 text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Syncing tracker assignments
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isVehiclesLoading && Boolean(vehiclesError) && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-base text-destructive">
                    Failed to load vehicles for device tracking
                  </TableCell>
                </TableRow>
              )}
              {!isVehiclesLoading && !assignmentLookupsLoading && !vehiclesError && filteredDevices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-base text-muted-foreground">
                    No backend tracker assignments found.
                  </TableCell>
                </TableRow>
              )}
              {filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium text-base">
                    {device.id}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-base">{device.plateNumber}</TableCell>
                  <TableCell className="text-base">{device.vehicleType}</TableCell>
                  <TableCell className="text-base">{device.owner}</TableCell>
                  <TableCell>{getHealthBadge(device.health)}</TableCell>
                  <TableCell className="text-base">{device.battery}</TableCell>
                  <TableCell className="text-base">{device.signal}</TableCell>
                  <TableCell className="text-base">{device.lastUpdate}</TableCell>
                  <TableCell>{getStatusBadge(device.status)}</TableCell>
                  <TableCell className="text-right">
                    {isActiveTracker(device) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={() => handleDetachTrackerClick(device)}
                      >
                        <Unlink2 className="mr-2 h-4 w-4" />
                        Detach
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={() => handleAttachTrackerClick(device)}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Attach
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Register Tracker Modal */}
      <Modal open={isAddDeviceOpen} onOpenChange={setIsAddDeviceOpen} className="w-full max-w-2xl">
        <ModalHeader onClose={() => setIsAddDeviceOpen(false)}>
          <ModalTitle>Register Tracker</ModalTitle>
          <ModalDescription>Create the tracker record in the devices service</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deviceId" className="text-base">Device ID *</Label>
              <Input
                id="deviceId"
                value={deviceForm.deviceId}
                onChange={(e) => setDeviceForm({ ...deviceForm, deviceId: e.target.value })}
                placeholder="e.g., GPS-006"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imei" className="text-base">IMEI Number</Label>
              <Input
                id="imei"
                value={deviceForm.imei}
                onChange={(e) => setDeviceForm({ ...deviceForm, imei: e.target.value })}
                placeholder="e.g., 3560001715600000000"
                className="text-base h-11"
              />
            </div>

          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddDeviceOpen(false)} disabled={registerDeviceMutation.isPending}>Cancel</Button>
          <Button onClick={handleAddDevice} disabled={registerDeviceMutation.isPending || !deviceForm.deviceId.trim()}>
            {registerDeviceMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Registering
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Register Tracker
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={isAssignTrackerOpen} onOpenChange={setIsAssignTrackerOpen} className="w-full max-w-2xl">
        <ModalHeader onClose={() => setIsAssignTrackerOpen(false)}>
          <ModalTitle>Attach Tracker</ModalTitle>
          <ModalDescription>Link this registered tracker back to the selected vehicle</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignDeviceId" className="text-base">Tracker ID *</Label>
              <Input
                id="assignDeviceId"
                value={assignmentForm.deviceId}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, deviceId: e.target.value })}
                placeholder="e.g., TRK-1715600000000"
                className="text-base h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignVehicleId" className="text-base">Vehicle *</Label>
              <Select
                value={assignmentForm.vehicleId}
                onValueChange={(value) => setAssignmentForm({ ...assignmentForm, vehicleId: value })}
              >
                <SelectTrigger id="assignVehicleId" className="h-11 w-full text-base">
                  <SelectValue placeholder="Select a backend vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id || vehicle.plateNumber} value={vehicle.id || vehicle.plateNumber}>
                      {vehicle.plateNumber} {toVehicleDisplayName(vehicle) ? `- ${toVehicleDisplayName(vehicle)}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Only vehicles loaded from the backend can be attached.</p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAssignTrackerOpen(false)} disabled={isAssigningTracker}>Cancel</Button>
          <Button onClick={handleAssignTracker} disabled={isAssigningTracker || !assignmentForm.deviceId.trim() || !assignmentForm.vehicleId.trim()}>
            {isAssigningTracker ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Attaching
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-2" />
                Attach Tracker
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
