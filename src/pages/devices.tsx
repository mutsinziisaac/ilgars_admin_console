import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MapPin, Navigation, Battery, BatteryLow, Signal, SignalHigh, SignalLow, Search, Plus, Loader2, Link2 } from "lucide-react"
import { useQueries, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { DevicesApi } from "@/lib/api/devices/api"
import { useDevicesList, useRegisterDevice } from "@/lib/api/devices/hooks"
import { devicesKeys } from "@/lib/api/devices/queryKeys"
import type { ActiveDeviceResponse, Device } from "@/lib/api/devices/schemas"
import { VehiclesApi } from "@/lib/api/vehicles/api"
import { useVehiclesList } from "@/lib/api/vehicles/hooks"
import type { Vehicle } from "@/lib/api/vehicles/schemas"
import { ApiError, getApiErrorMessage } from "@/lib/api/errors"
import { buildDeviceAssignmentPayload } from "@/lib/api/devices/assignmentPayload"
import { buildDefaultRegisterDevicePayload } from "@/lib/api/devices/registerPayload"
import { getCurrentUsername } from "@/lib/auth/currentUser"
import { Map as AppMap, type MapMarker } from "@/components/ui/map"
import { useLiveMap } from "@/lib/api/analytics/hooks"
import { isUgandaCoordinate, UGANDA_CENTER, UGANDA_OVERVIEW_ZOOM } from "@/lib/map-region"

const DEFAULT_ZOOM = UGANDA_OVERVIEW_ZOOM
const TRACKER_LOOKUP_PAGE_SIZE = 25
const TRACKER_LOOKUP_STALE_MS = 5 * 60 * 1000

type TrackingDevice = {
  id: string
  plateNumber: string
  vehicleType: string
  owner: string
  status: string
  location: string
  coordinates: string
  latlng: [number, number]
  speed: string
  battery: string
  signal: string
  lastUpdate: string
}

type AdminTrackingDevice = TrackingDevice & {
  vehicleId?: string
  backendDeviceId?: string
  assignmentId?: string
  kind?: "assigned" | "registered"
}

const formatDeviceTimestamp = (value?: string | null) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString()
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
  activeLookupLoading = false,
): AdminTrackingDevice => {
  const tracker = activeDevice?.device
  const assignment = activeDevice?.assignment
  const trackerId = tracker?.deviceUid || tracker?.id
  const hasActiveTracker = Boolean(trackerId && assignment)
  const status = activeLookupLoading ? "Idle" : hasActiveTracker ? "Active" : "Offline"
  const vehicleId = vehicle.id

  return {
    id: trackerId || `NO-TRACKER-${vehicle.plateNumber}`,
    backendDeviceId: tracker?.id || tracker?.deviceUid || undefined,
    assignmentId: assignment?.id || undefined,
    vehicleId,
    plateNumber: vehicle.plateNumber,
    vehicleType: toVehicleDisplayName(vehicle),
    owner: toVehicleOwner(vehicle),
    status,
    location: activeLookupLoading
      ? "Checking tracker assignment"
      : hasActiveTracker
        ? "Active tracker assigned"
        : "No active tracker assigned",
    coordinates: `${UGANDA_CENTER[0]}, ${UGANDA_CENTER[1]}`,
    latlng: UGANDA_CENTER,
    speed: "N/A",
    battery: "N/A",
    signal: hasActiveTracker ? "Strong" : activeLookupLoading ? "Medium" : "Weak",
    lastUpdate: formatDeviceTimestamp(assignment?.assignedAt || tracker?.updatedAt || tracker?.createdAt || vehicle.updatedAt),
    kind: hasActiveTracker ? "assigned" : undefined,
  }
}

const mapRegisteredDeviceToTrackingDevice = (device: Device): AdminTrackingDevice => {
  const id = device.deviceUid || device.id || device.imei || "REGISTERED-TRACKER"

  return {
    id,
    backendDeviceId: device.id || device.deviceUid || undefined,
    plateNumber: "Unassigned",
    vehicleType: device.model || device.vendor || "Registered tracker",
    owner: device.vendor || "Unassigned",
    status: device.status || "REGISTERED",
    location: "Registered tracker inventory",
    coordinates: `${UGANDA_CENTER[0]}, ${UGANDA_CENTER[1]}`,
    latlng: UGANDA_CENTER,
    speed: "N/A",
    battery: "N/A",
    signal: "N/A",
    lastUpdate: formatDeviceTimestamp(device.updatedAt || device.createdAt),
    kind: "registered",
  }
}

const deviceStatusColor = (status: string) =>
  status === "Active" ? "#5B8C5A" : status === "Idle" ? "#DAA22A" : "#E5533D"

type JsonRecord = Record<string, unknown>
type LiveDevicePosition = {
  latlng: [number, number]
  location?: string
  speed?: string
  battery?: string
  signal?: string
  status?: string
  lastUpdate?: string
}

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
    "location",
    "position",
    "telemetry",
    "lastTelemetry",
    "latestTelemetry",
    "gps",
    "gpsFix",
    "device",
    "vehicle",
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
    "location",
    "position",
    "telemetry",
    "lastTelemetry",
    "latestTelemetry",
    "gps",
    "gpsFix",
    "device",
    "vehicle",
  ]) {
    const nestedValue = findStringByKeys(record[nestedKey], keys)
    if (nestedValue) return nestedValue
  }

  return null
}

const formatPercent = (value: number | null) =>
  value === null ? undefined : `${Math.round(value)}%`

const formatSpeed = (value: number | null) =>
  value === null ? undefined : `${Math.round(value)} km/h`

const findLiveLatLng = (source: unknown): [number, number] | null => {
  const lat = findNumberByKeys(source, ["lat", "latitude"])
  const lng = findNumberByKeys(source, ["lng", "lon", "longitude"])

  if (lat !== null && lng !== null) {
    const latlng: [number, number] = [lat, lng]
    return isUgandaCoordinate(latlng) ? latlng : null
  }

  const record = asRecord(source)
  const coordinates = record?.coordinates
  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    const first = toNumber(coordinates[0])
    const second = toNumber(coordinates[1])
    if (first !== null && second !== null) {
      const latlng: [number, number] =
        Math.abs(first) > 30 && Math.abs(second) <= 30 ? [second, first] : [first, second]
      return isUgandaCoordinate(latlng) ? latlng : null
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
      speed: formatSpeed(findNumberByKeys(point, ["speed", "speedKmh", "speedKmH", "speedKph", "velocity"])),
      battery: formatPercent(findNumberByKeys(point, ["battery", "batteryLevel", "batteryPercent", "batteryPercentage", "batteryPct"])),
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
  device: AdminTrackingDevice,
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

export function DevicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [devicePage, setDevicePage] = useState(1)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const registerDeviceMutation = useRegisterDevice()
  const queryClient = useQueryClient()
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
  const {
    data: registeredDevicesResponse,
    isLoading: isRegisteredDevicesLoading,
  } = useDevicesList({ status: "REGISTERED", page: 0, size: 100 })
  const vehicles = useMemo(() => vehiclesResponse?.data ?? [], [vehiclesResponse])
  const registeredDevices = useMemo(() => registeredDevicesResponse?.data ?? [], [registeredDevicesResponse])
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
      refetchOnWindowFocus: false,
    })),
  })

  // Tracking device state
  const [locallyAddedDevices, setLocallyAddedDevices] = useState<AdminTrackingDevice[]>([])
  const trackingDevices = useMemo<AdminTrackingDevice[]>(
    () => {
      const baseDevices = [
        ...vehicles.map((vehicle, index) =>
          mapVehicleToTrackingDevice(
            vehicle,
            activeDeviceQueries[index]?.data ?? null,
            Boolean(activeDeviceQueries[index]?.isLoading || activeDeviceQueries[index]?.isFetching),
          )
        ),
      ]
      const assignedTrackerKeys = new Set(
        baseDevices
          .flatMap((device) => [device.id, device.backendDeviceId])
          .filter((value): value is string => Boolean(value)),
      )
      const registeredRows = registeredDevices
        .filter((device) => {
          const keys = [device.id, device.deviceUid].filter((value): value is string => Boolean(value))
          return keys.every((key) => !assignedTrackerKeys.has(key))
        })
        .map(mapRegisteredDeviceToTrackingDevice)
      const localRows = locallyAddedDevices.filter((device) =>
        [device.id, device.backendDeviceId].filter(Boolean).every((key) => !assignedTrackerKeys.has(String(key)))
      )

      return [...baseDevices, ...registeredRows, ...localRows].map((device) => {
        const livePosition = findLivePositionForDevice(device, livePositionIndex)
        if (!livePosition) return device

        return {
          ...device,
          latlng: livePosition.latlng,
          coordinates: `${livePosition.latlng[0]}, ${livePosition.latlng[1]}`,
          location: livePosition.location ?? device.location,
          speed: livePosition.speed ?? device.speed,
          battery: livePosition.battery ?? device.battery,
          signal: livePosition.signal ?? device.signal,
          status: livePosition.status ?? device.status,
          lastUpdate: formatDeviceTimestamp(livePosition.lastUpdate) || device.lastUpdate,
        }
      })
    },
    [activeDeviceQueries, livePositionIndex, locallyAddedDevices, registeredDevices, vehicles],
  )
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const [isAssignTrackerOpen, setIsAssignTrackerOpen] = useState(false)
  const [isAssigningTracker, setIsAssigningTracker] = useState(false)
  const [newDevice, setNewDevice] = useState({
    id: "",
    imei: "",
    simCard: "",
  })
  const [assignmentForm, setAssignmentForm] = useState({
    deviceId: "",
    vehicleId: "",
    plateNumber: "",
    assignmentMode: "assign" as "assign" | "replace",
  })

  const handleAddDevice = () => {
    if (!newDevice.id.trim()) return

    registerDeviceMutation.mutate(buildDefaultRegisterDevicePayload({
      deviceUid: newDevice.id,
      imei: newDevice.imei,
      simMsisdn: newDevice.simCard,
    }), {
      onSuccess: async (registeredDevice: Device) => {
        const backendDeviceId = registeredDevice.id || registeredDevice.deviceUid || newDevice.id.trim()
        const deviceId = registeredDevice.deviceUid || backendDeviceId
        setIsAddDeviceOpen(false)
        setNewDevice({ id: "", imei: "", simCard: "" })
        setAssignmentForm((current) => ({ ...current, deviceId: backendDeviceId || deviceId }))
        toast.success(`Tracker ${deviceId} registered successfully`)
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Failed to register GPS device"))
      },
    })
  }

  const handleAssignTracker = async () => {
    const trackerId = assignmentForm.deviceId.trim()
    const plateNumber = assignmentForm.plateNumber.trim()
    let vehicleId = assignmentForm.vehicleId.trim()
    let resolvedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId || vehicle.plateNumber === plateNumber)

    if (!trackerId || !plateNumber) {
      toast.error("Tracker ID and plate number are required")
      return
    }

    setIsAssigningTracker(true)
    try {
      if (!vehicleId) {
        const vehicleResponse = await VehiclesApi.lookupByPlate(plateNumber)
        const vehicle = vehicleResponse.data as Vehicle
        resolvedVehicle = vehicle
        vehicleId = vehicle.id ?? ""
      }

      if (!vehicleId) {
        toast.error("No vehicle was found for that plate")
        return
      }

      const assignedBy = await getCurrentUsername()
      const assignmentPayload = buildDeviceAssignmentPayload({
        vehicleId,
        plateNumber,
        assignedBy,
        mode: assignmentForm.assignmentMode,
      })

      if (assignmentForm.assignmentMode === "replace") {
        await DevicesApi.replaceDeviceAssignment(trackerId, assignmentPayload)
      } else {
        await DevicesApi.assignDevice(trackerId, assignmentPayload)
      }

      await queryClient.invalidateQueries({ queryKey: devicesKeys.activeByVehicle(vehicleId) })
      await queryClient.invalidateQueries({ queryKey: devicesKeys.list({ status: "REGISTERED", page: 0, size: 100 }) })
      await refetchVehicles()
      setLocallyAddedDevices(prev => [
        ...prev.filter((device) => device.id !== trackerId && device.vehicleId !== vehicleId),
        {
          id: trackerId,
          backendDeviceId: trackerId,
          vehicleId,
          plateNumber,
          vehicleType: resolvedVehicle ? toVehicleDisplayName(resolvedVehicle) : "Unassigned vehicle",
          owner: resolvedVehicle ? toVehicleOwner(resolvedVehicle) : "Unassigned owner",
          status: "Active",
          location: "Active tracker assigned",
          coordinates: `${UGANDA_CENTER[0]}, ${UGANDA_CENTER[1]}`,
          latlng: UGANDA_CENTER,
          speed: "N/A",
          battery: "N/A",
          signal: "Strong",
          lastUpdate: "Just assigned"
        },
      ])
      setIsAssignTrackerOpen(false)
      setAssignmentForm({ deviceId: "", vehicleId: "", plateNumber: "", assignmentMode: "assign" })
      toast.success(assignmentForm.assignmentMode === "replace" ? "Tracker assignment replaced successfully" : "Tracker assigned successfully")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to assign tracker"))
    } finally {
      setIsAssigningTracker(false)
    }
  }

  // Filter tracking devices
  const filteredDevices = trackingDevices.filter(device =>
    device.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.owner.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const devicesPerPage = 10
  const totalDevicePages = Math.max(1, Math.ceil(filteredDevices.length / devicesPerPage))
  const normalizedDevicePage = Math.min(devicePage, totalDevicePages)
  const devicePageStartIndex = (normalizedDevicePage - 1) * devicesPerPage
  const paginatedDevices = filteredDevices.slice(devicePageStartIndex, devicePageStartIndex + devicesPerPage)

  // Get status badge
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "Active": "bg-[#5B8C5A] text-white",
      "REGISTERED": "bg-[#5B8C5A] text-white",
      "Idle": "bg-[#DAA22A] text-[#1C1C1C]",
      "Offline": "bg-[#E5533D] text-white",
      "Online": "bg-[#5B8C5A] text-white"
    }
    return (
      <Badge className={`${colors[status] || "bg-secondary"} text-sm px-3 py-1`}>
        {status}
      </Badge>
    )
  }

  // Get signal icon
  const getSignalIcon = (signal: string) => {
    if (signal === "Strong") return <SignalHigh className="h-5 w-5 text-[#5B8C5A]" />
    if (signal === "Medium") return <Signal className="h-5 w-5 text-[#DAA22A]" />
    return <SignalLow className="h-5 w-5 text-[#E5533D]" />
  }

  // Get battery icon
  const getBatteryIcon = (battery: string) => {
    const level = parseInt(battery)
    if (level > 50) return <Battery className="h-5 w-5 text-[#5B8C5A]" />
    return <BatteryLow className="h-5 w-5 text-[#E5533D]" />
  }

  const activeDevices = trackingDevices.filter(d => d.status === "Active").length
  const idleDevices = trackingDevices.filter(d => d.status === "Idle").length
  const offlineDevices = trackingDevices.filter(d => d.status === "Offline").length
  const lowBatteryDevices = trackingDevices.filter(d => parseInt(d.battery) < 20).length
  const assignmentLookupsLoading =
    activeDeviceQueries.some((query) => query.isLoading || query.isFetching) ||
    isRegisteredDevicesLoading

  const livePositionCount = livePositionIndex.size
  const mapMarkers: MapMarker[] = trackingDevices.map((device) => {
      const color = deviceStatusColor(device.status)
      return {
        position: device.latlng,
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
      } satisfies MapMarker
    })

  if (isMapOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsMapOpen(false)} className="mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-semibold text-foreground">Device Location Map - Uganda</h1>
            <p className="text-lg text-muted-foreground">
              Live tracker positions refresh automatically from the admin live-map endpoint.
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
                center={UGANDA_CENTER}
                zoom={DEFAULT_ZOOM}
                markers={mapMarkers}
                height="100%"
                className="h-full w-full"
                defaultView="street"
              />

              <div className="absolute top-4 right-4 z-[1000] rounded-lg bg-white p-4 shadow-lg">
                <h3 className="mb-3 text-sm font-semibold">Legend</h3>
                <div className="space-y-2">
                  <div className="mb-1 text-xs font-semibold text-gray-600">GPS Devices</div>
                  <div className="mb-2 text-xs text-gray-500">Live positions: {livePositionCount}</div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[#5B8C5A]" />
                    <span className="text-sm">Active ({activeDevices})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[#DAA22A]" />
                    <span className="text-sm">Idle ({idleDevices})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[#E5533D]" />
                    <span className="text-sm">Offline ({offlineDevices})</span>
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
      <div>
        <h1 className="text-4xl font-semibold text-foreground">Devices</h1>
        <p className="text-lg text-muted-foreground">GPS tracking devices and assignment management</p>
      </div>

      <div className="mt-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Active Tracking</CardDescription>
                <CardTitle className="text-4xl text-[#5B8C5A]">{activeDevices}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">Vehicles moving</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Idle</CardDescription>
                <CardTitle className="text-4xl text-[#DAA22A]">{idleDevices}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">Stationary</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Offline</CardDescription>
                <CardTitle className="text-4xl text-[#E5533D]">{offlineDevices}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">No signal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Low Battery</CardDescription>
                <CardTitle className="text-4xl text-[#E5533D]">{lowBatteryDevices}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">Need charging</p>
              </CardContent>
            </Card>
          </div>

          {/* Tracking Devices Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">GPS Tracking Devices</CardTitle>
                  <CardDescription className="text-base">Vehicles enriched with active tracker assignments</CardDescription>
                </div>
              <div className="flex items-center gap-3">
                {assignmentLookupsLoading && (
                  <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing tracker assignments
                  </Badge>
                )}
                <Button className="text-base h-11 px-6" onClick={() => setIsMapOpen(true)}>
                  <MapPin className="h-5 w-5 mr-2" />
                  View Map
                </Button>
                <Button variant="outline" className="text-base h-11 px-6" onClick={() => setIsAssignTrackerOpen(true)}>
                  <Link2 className="h-5 w-5 mr-2" />
                  Assign Tracker
                </Button>
                <Button className="text-base h-11 px-6" onClick={() => setIsAddDeviceOpen(true)}>
                  <Plus className="h-5 w-5 mr-2" />
                  Register Tracker
                </Button>
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
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setDevicePage(1)
                    }}
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
                    <TableHead className="text-base">Location</TableHead>
                    <TableHead className="text-base">Speed</TableHead>
                    <TableHead className="text-base">Battery</TableHead>
                    <TableHead className="text-base">Signal</TableHead>
                    <TableHead className="text-base">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isVehiclesLoading && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-base text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Loading vehicles and tracker assignments
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!isVehiclesLoading && assignmentLookupsLoading && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-3 text-center text-sm text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Syncing tracker assignments
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!isVehiclesLoading && Boolean(vehiclesError) && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-base text-destructive">
                        Failed to load vehicles for device tracking
                      </TableCell>
                    </TableRow>
                  )}
                  {!isVehiclesLoading && !vehiclesError && filteredDevices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-base text-muted-foreground">
                        No vehicles found for the current search.
                      </TableCell>
                    </TableRow>
                  )}
                  {paginatedDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium text-base">
                        {device.backendDeviceId || !device.id.startsWith("NO-TRACKER-") ? device.id : "Unassigned"}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-base">{device.plateNumber}</TableCell>
                      <TableCell className="text-base">{device.vehicleType}</TableCell>
                      <TableCell className="text-base max-w-[200px]">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <span>{device.location}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-base">
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-muted-foreground" />
                          {device.speed}
                        </div>
                      </TableCell>
                      <TableCell className="text-base">
                        <div className="flex items-center gap-2">
                          {getBatteryIcon(device.battery)}
                          {device.battery}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSignalIcon(device.signal)}
                          <span className="text-sm">{device.signal}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(device.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {!isVehiclesLoading && !vehiclesError && filteredDevices.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {devicePageStartIndex + 1} to {devicePageStartIndex + paginatedDevices.length} of {filteredDevices.length} devices
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDevicePage(prev => Math.max(1, prev - 1))}
                      disabled={normalizedDevicePage === 1}
                      className="h-9 px-4"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {normalizedDevicePage} of {totalDevicePages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDevicePage(prev => Math.min(totalDevicePages, prev + 1))}
                      disabled={normalizedDevicePage === totalDevicePages}
                      className="h-9 px-4"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
      </div>

      {/* ── GPS Device: Add New ── */}
      <Modal open={isAddDeviceOpen} onOpenChange={setIsAddDeviceOpen} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsAddDeviceOpen(false)}>
          <ModalTitle>Register Tracker</ModalTitle>
          <ModalDescription>Create the tracker record in the devices service.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Device ID</label>
              <Input placeholder="e.g. GPS-006" value={newDevice.id} onChange={e => setNewDevice(p => ({ ...p, id: e.target.value }))} className="h-11 text-base" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">IMEI Number</label>
              <Input placeholder="e.g. 3560001715600000000" value={newDevice.imei} onChange={e => setNewDevice(p => ({ ...p, imei: e.target.value }))} className="h-11 text-base" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">SIM Card Number</label>
              <Input placeholder="e.g. +258 84 123 4567" value={newDevice.simCard} onChange={e => setNewDevice(p => ({ ...p, simCard: e.target.value }))} className="h-11 text-base" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddDeviceOpen(false)} disabled={registerDeviceMutation.isPending}>Cancel</Button>
          <Button onClick={handleAddDevice} disabled={registerDeviceMutation.isPending || !newDevice.id.trim()}>
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

      <Modal open={isAssignTrackerOpen} onOpenChange={setIsAssignTrackerOpen} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsAssignTrackerOpen(false)}>
          <ModalTitle>Assign Tracker</ModalTitle>
          <ModalDescription>Link a registered tracker to a vehicle, or replace the active tracker assignment.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Tracker ID</label>
              <Input placeholder="e.g. TRK-1715600000000" value={assignmentForm.deviceId} onChange={e => setAssignmentForm(p => ({ ...p, deviceId: e.target.value }))} className="h-11 text-base" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Vehicle ID</label>
              <Input placeholder="Optional backend vehicle ID" value={assignmentForm.vehicleId} onChange={e => setAssignmentForm(p => ({ ...p, vehicleId: e.target.value }))} className="h-11 text-base" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Plate Number</label>
              <Input placeholder="e.g. FFF-678-MP" value={assignmentForm.plateNumber} onChange={e => setAssignmentForm(p => ({ ...p, plateNumber: e.target.value }))} className="h-11 text-base" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Assignment Action</label>
              <Select
                value={assignmentForm.assignmentMode}
                onValueChange={(value) => setAssignmentForm(p => ({ ...p, assignmentMode: value as "assign" | "replace" }))}
              >
                <SelectTrigger className="h-11 w-full text-base">
                  <SelectValue placeholder="Choose assignment action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assign">Assign tracker to vehicle</SelectItem>
                  <SelectItem value="replace">Replace active tracker assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAssignTrackerOpen(false)} disabled={isAssigningTracker}>Cancel</Button>
          <Button onClick={handleAssignTracker} disabled={isAssigningTracker || !assignmentForm.deviceId.trim() || !assignmentForm.plateNumber.trim()}>
            {isAssigningTracker ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-2" />
                Assign Tracker
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

    </div>
  )
}
