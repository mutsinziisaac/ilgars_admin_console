import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Radio, MapPin, Navigation, Battery, BatteryLow, Signal, SignalHigh, SignalLow, Camera, Video, Eye, Search, MoreHorizontal, RefreshCw, PowerOff, Power, Plus, Trash2, AlertTriangle, Loader2, Link2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useQueries, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { DevicesApi } from "@/lib/api/devices/api"
import { useRegisterDevice } from "@/lib/api/devices/hooks"
import { devicesKeys } from "@/lib/api/devices/queryKeys"
import type { ActiveDeviceResponse, Device } from "@/lib/api/devices/schemas"
import { VehiclesApi } from "@/lib/api/vehicles/api"
import { useVehiclesList } from "@/lib/api/vehicles/hooks"
import type { Vehicle } from "@/lib/api/vehicles/schemas"
import { ApiError, getApiErrorMessage } from "@/lib/api/errors"
import { buildDeviceAssignmentPayload } from "@/lib/api/devices/assignmentPayload"
import { buildDefaultRegisterDevicePayload } from "@/lib/api/devices/registerPayload"
import { getCurrentUsername } from "@/lib/auth/currentUser"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Maputo center coordinates
const MAPUTO_CENTER: [number, number] = [-25.9692, 32.5732]
const DEFAULT_ZOOM = 14
const TRACKER_LOOKUP_PAGE_SIZE = 25
const TRACKER_LOOKUP_STALE_MS = 5 * 60 * 1000

// Mock camera data with real Maputo coordinates
const mockCameras = [
  {
    id: "CAM-001",
    name: "North Gate - Julius Nyerere",
    type: "ANPR",
    location: "Av. Julius Nyerere",
    coordinates: "-25.9612, 32.5823",
    latlng: [-25.9612, 32.5823] as [number, number],
    status: "Online",
    resolution: "4K",
    fps: "30",
    detections: "1,234",
    lastDetection: "2 mins ago"
  },
  {
    id: "CAM-002",
    name: "South Gate - 25 de Setembro",
    type: "ANPR",
    location: "Av. 25 de Setembro",
    coordinates: "-25.9655, 32.5731",
    latlng: [-25.9655, 32.5731] as [number, number],
    status: "Online",
    resolution: "4K",
    fps: "30",
    detections: "987",
    lastDetection: "1 min ago"
  },
  {
    id: "CAM-003",
    name: "East Gate - Marginal",
    type: "ANPR",
    location: "Marginal Avenue",
    coordinates: "-25.9701, 32.5945",
    latlng: [-25.9701, 32.5945] as [number, number],
    status: "Offline",
    resolution: "4K",
    fps: "0",
    detections: "756",
    lastDetection: "1 hour ago"
  },
  {
    id: "CAM-004",
    name: "West Gate - Eduardo Mondlane",
    type: "Traffic",
    location: "Av. Eduardo Mondlane",
    coordinates: "-25.9588, 32.5680",
    latlng: [-25.9588, 32.5680] as [number, number],
    status: "Online",
    resolution: "1080p",
    fps: "25",
    detections: "2,145",
    lastDetection: "30 secs ago"
  },
  {
    id: "CAM-005",
    name: "Central - Vladimir Lenine",
    type: "ANPR",
    location: "Av. Vladimir Lenine",
    coordinates: "-25.9634, 32.5789",
    latlng: [-25.9634, 32.5789] as [number, number],
    status: "Online",
    resolution: "4K",
    fps: "30",
    detections: "1,567",
    lastDetection: "1 min ago"
  },
]

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
type Camera = typeof mockCameras[0]

type AdminTrackingDevice = TrackingDevice & {
  vehicleId?: string
  backendDeviceId?: string
  assignmentId?: string
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
    coordinates: `${MAPUTO_CENTER[0]}, ${MAPUTO_CENTER[1]}`,
    latlng: MAPUTO_CENTER,
    speed: "N/A",
    battery: "N/A",
    signal: hasActiveTracker ? "Strong" : activeLookupLoading ? "Medium" : "Weak",
    lastUpdate: formatDeviceTimestamp(assignment?.assignedAt || tracker?.updatedAt || tracker?.createdAt || vehicle.updatedAt),
  }
}

// Helper function to create device icon for Leaflet
function deviceIcon(status: string) {
  const color = status === "Active" ? "#5B8C5A" : status === "Idle" ? "#DAA22A" : "#E5533D"
  const pulse = status === "Active"
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      ${pulse ? `<circle cx="14" cy="14" r="13" fill="${color}" opacity="0.25">
        <animate attributeName="r" values="10;14;10" dur="1.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.6s" repeatCount="indefinite"/>
      </circle>` : ""}
      <circle cx="14" cy="14" r="9" fill="${color}" stroke="white" stroke-width="2.5"/>
      <circle cx="14" cy="14" r="4" fill="white" opacity="0.8"/>
    </svg>`
  
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

// Helper function to create camera icon for Leaflet
function cameraIcon(status: string) {
  const color = status === "Online" ? "#5B8C5A" : "#E5533D"
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="9" fill="${color}" stroke="white" stroke-width="2.5"/>
      <path d="M10 11h4l1-2h2l1 2h4v6H10v-6z" fill="white" opacity="0.9"/>
      <circle cx="16" cy="14" r="2" fill="${color}"/>
    </svg>`
  
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

export function DevicesPage() {
  const [activeTab, setActiveTab] = useState("tracking")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMapOpen, setIsMapOpen] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const registerDeviceMutation = useRegisterDevice()
  const queryClient = useQueryClient()
  const {
    data: vehiclesResponse,
    isLoading: isVehiclesLoading,
    error: vehiclesError,
    refetch: refetchVehicles,
  } = useVehiclesList({ page: 0, size: TRACKER_LOOKUP_PAGE_SIZE })
  const vehicles = useMemo(() => vehiclesResponse?.data ?? [], [vehiclesResponse])
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
    () => [
      ...vehicles.map((vehicle, index) =>
        mapVehicleToTrackingDevice(
          vehicle,
          activeDeviceQueries[index]?.data ?? null,
          Boolean(activeDeviceQueries[index]?.isLoading || activeDeviceQueries[index]?.isFetching),
        )
      ),
      ...locallyAddedDevices,
    ],
    [activeDeviceQueries, locallyAddedDevices, vehicles],
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

  // Camera state
  const [cameras, setCameras] = useState(mockCameras)
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null)
  const [isCameraDetailOpen, setIsCameraDetailOpen] = useState(false)
  const [isRestartCameraOpen, setIsRestartCameraOpen] = useState(false)
  const [isToggleCameraOpen, setIsToggleCameraOpen] = useState(false)
  const [isDeleteCameraOpen, setIsDeleteCameraOpen] = useState(false)

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
          coordinates: `${MAPUTO_CENTER[0]}, ${MAPUTO_CENTER[1]}`,
          latlng: MAPUTO_CENTER,
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

  // Camera actions
  const handleRestartCamera = () => {
    setIsRestartCameraOpen(false)
    toast.success(`Camera ${selectedCamera?.id} restart command sent`)
  }

  const handleToggleCamera = () => {
    if (!selectedCamera) return
    const newStatus = selectedCamera.status === "Offline" ? "Online" : "Offline"
    setCameras(prev =>
      prev.map(c => c.id === selectedCamera.id ? { ...c, status: newStatus, fps: newStatus === "Offline" ? "0" : "30" } : c)
    )
    setIsToggleCameraOpen(false)
    toast.success(`Camera ${selectedCamera.id} ${newStatus === "Offline" ? "deactivated" : "activated"}`)
  }

  const handleDeleteCamera = () => {
    if (!selectedCamera) return
    setCameras(prev => prev.filter(c => c.id !== selectedCamera.id))
    setIsDeleteCameraOpen(false)
    toast.success(`Camera ${selectedCamera.id} removed`)
  }

  // Filter tracking devices
  const filteredDevices = trackingDevices.filter(device =>
    device.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.owner.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter cameras
  const filteredCameras = cameras.filter(camera =>
    camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    camera.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get status badge
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "Active": "bg-[#5B8C5A] text-white",
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
  const assignmentLookupsLoading = activeDeviceQueries.some((query) => query.isLoading || query.isFetching)

  const onlineCameras = cameras.filter(c => c.status === "Online").length
  const offlineCameras = cameras.filter(c => c.status === "Offline").length

  // Initialize Leaflet map when map page opens
  useEffect(() => {
    if (!isMapOpen || !mapContainerRef.current || mapRef.current) return

    try {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: MAPUTO_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: true,
      })

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Add GPS device markers
      trackingDevices.forEach((device) => {
        const marker = L.marker(device.latlng, { icon: deviceIcon(device.status) })
        
        const color = device.status === "Active" ? "#5B8C5A" : device.status === "Idle" ? "#DAA22A" : "#E5533D"
        
        marker.bindPopup(`
          <div style="min-width:220px;font-family:inherit">
            <div style="background:${color};color:white;padding:6px 10px;border-radius:6px 6px 0 0;margin:-10px -10px 8px -10px">
              <strong>${device.plateNumber}</strong>
              <span style="float:right;font-size:11px;opacity:.85">${device.lastUpdate}</span>
            </div>
            <div style="font-size:13px;font-weight:600;margin-bottom:4px">${device.vehicleType}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;color:#555;margin-bottom:6px">
              <div><span style="color:#999">Owner</span><br/>${device.owner}</div>
              <div><span style="color:#999">Speed</span><br/>${device.speed}</div>
              <div><span style="color:#999">Battery</span><br/>${device.battery}</div>
              <div><span style="color:#999">Signal</span><br/>${device.signal}</div>
            </div>
            <div style="font-size:11px;color:#555;margin-bottom:6px">📍 ${device.location}</div>
            <div style="margin-top:6px">
              <span style="background:${color}22;color:${color};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600">${device.status}</span>
            </div>
          </div>
        `, { maxWidth: 280 })
        
        // Show popup on hover instead of click
        marker.on('mouseover', () => marker.openPopup())
        marker.on('mouseout', () => marker.closePopup())
        
        marker.addTo(map)
      })

      // Add camera markers
      cameras.forEach((camera) => {
        const marker = L.marker(camera.latlng, { icon: cameraIcon(camera.status) })
        
        const color = camera.status === "Online" ? "#5B8C5A" : "#E5533D"
        
        marker.bindPopup(`
          <div style="min-width:220px;font-family:inherit">
            <div style="background:${color};color:white;padding:6px 10px;border-radius:6px 6px 0 0;margin:-10px -10px 8px -10px">
              <strong>${camera.name}</strong>
            </div>
            <div style="font-size:13px;font-weight:600;margin-bottom:4px">${camera.type} Camera</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;color:#555;margin-bottom:6px">
              <div><span style="color:#999">Resolution</span><br/>${camera.resolution}</div>
              <div><span style="color:#999">FPS</span><br/>${camera.fps}</div>
              <div><span style="color:#999">Detections</span><br/>${camera.detections}</div>
              <div><span style="color:#999">Last</span><br/>${camera.lastDetection}</div>
            </div>
            <div style="font-size:11px;color:#555;margin-bottom:6px">📍 ${camera.location}</div>
            <div style="margin-top:6px">
              <span style="background:${color}22;color:${color};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600">${camera.status}</span>
            </div>
          </div>
        `, { maxWidth: 280 })
        
        // Show popup on hover instead of click
        marker.on('mouseover', () => marker.openPopup())
        marker.on('mouseout', () => marker.closePopup())
        
        marker.addTo(map)
      })

      mapRef.current = map
    } catch (error) {
      console.error("Error initializing map:", error)
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove()
          mapRef.current = null
        } catch (error) {
          console.error("Error removing map:", error)
        }
      }
    }
  }, [isMapOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isMapOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsMapOpen(false)} className="mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-semibold text-foreground">Device Location Map - Maputo</h1>
            <p className="text-lg text-muted-foreground">View GPS tracking devices and cameras across Maputo.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="relative h-[calc(100vh-220px)] min-h-[560px] w-full overflow-hidden rounded-lg">
              <div ref={mapContainerRef} className="h-full w-full" />

              <div className="absolute top-4 right-4 z-[1000] rounded-lg bg-white p-4 shadow-lg">
                <h3 className="mb-3 text-sm font-semibold">Legend</h3>
                <div className="space-y-2">
                  <div className="mb-1 text-xs font-semibold text-gray-600">GPS Devices</div>
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
                  <div className="my-2 border-t border-gray-200" />
                  <div className="mb-1 text-xs font-semibold text-gray-600">Cameras</div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[#5B8C5A]" />
                    <span className="text-sm">Online ({onlineCameras})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[#E5533D]" />
                    <span className="text-sm">Offline ({offlineCameras})</span>
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
        <p className="text-lg text-muted-foreground">GPS tracking devices and camera management</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 h-14">
          <TabsTrigger value="tracking" className="text-base relative">
            <Radio className="h-5 w-5 mr-2" />
            GPS Tracking
          </TabsTrigger>
          <TabsTrigger value="cameras" className="text-base relative">
            <Camera className="h-5 w-5 mr-2" />
            Cameras
          </TabsTrigger>
        </TabsList>

        {/* GPS Tracking Tab */}
        <TabsContent value="tracking" className="mt-6 space-y-6">
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
                  {filteredDevices.map((device) => (
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cameras Tab */}
        <TabsContent value="cameras" className="mt-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Total Cameras</CardDescription>
                <CardTitle className="text-4xl">{cameras.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">Installed cameras</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Online</CardDescription>
                <CardTitle className="text-4xl text-[#5B8C5A]">{onlineCameras}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">Active cameras</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Offline</CardDescription>
                <CardTitle className="text-4xl text-[#E5533D]">{offlineCameras}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Today's Detections</CardDescription>
                <CardTitle className="text-4xl">6,689</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground">Plate readings</p>
              </CardContent>
            </Card>
          </div>

          {/* Cameras Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Camera Management</CardTitle>
                  <CardDescription className="text-base">ANPR and traffic monitoring cameras</CardDescription>
                </div>
                <Button className="text-base h-11 px-6">
                  <Video className="h-5 w-5 mr-2" />
                  Live Feed
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by camera name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-base h-11"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base">Camera ID</TableHead>
                    <TableHead className="text-base">Name</TableHead>
                    <TableHead className="text-base">Type</TableHead>
                    <TableHead className="text-base">Location</TableHead>
                    <TableHead className="text-base">Resolution</TableHead>
                    <TableHead className="text-base">FPS</TableHead>
                    <TableHead className="text-base">Detections</TableHead>
                    <TableHead className="text-base">Status</TableHead>
                    <TableHead className="text-right text-base">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCameras.map((camera) => (
                    <TableRow key={camera.id}>
                      <TableCell className="font-medium text-base">{camera.id}</TableCell>
                      <TableCell className="text-base font-medium">{camera.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-sm">
                          {camera.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-base max-w-[200px]">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <span>{camera.location}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-base">{camera.resolution}</TableCell>
                      <TableCell className="text-base">{camera.fps}</TableCell>
                      <TableCell className="text-base font-medium">{camera.detections}</TableCell>
                      <TableCell>{getStatusBadge(camera.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-base">
                            <DropdownMenuItem
                              className="text-base cursor-pointer"
                              onClick={() => { setSelectedCamera(camera); setIsCameraDetailOpen(true) }}
                            >
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-base cursor-pointer"
                              onClick={() => { setSelectedCamera(camera); setIsRestartCameraOpen(true) }}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" /> Restart Camera
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-base cursor-pointer"
                              onClick={() => { setSelectedCamera(camera); setIsToggleCameraOpen(true) }}
                            >
                              {camera.status === "Offline"
                                ? <><Power className="h-4 w-4 mr-2" /> Activate</>
                                : <><PowerOff className="h-4 w-4 mr-2" /> Deactivate</>
                              }
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-base cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => { setSelectedCamera(camera); setIsDeleteCameraOpen(true) }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Remove Camera
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

      {/* ── Camera: View Details ── */}
      <Modal open={isCameraDetailOpen} onOpenChange={setIsCameraDetailOpen} className="w-full max-w-lg">
        <ModalHeader onClose={() => setIsCameraDetailOpen(false)}>
          <ModalTitle>Camera Details</ModalTitle>
          <ModalDescription>{selectedCamera?.id} — {selectedCamera?.name}</ModalDescription>
        </ModalHeader>
        <ModalBody>
          {selectedCamera && (
            <div className="space-y-3 text-base">
              {[
                ["Camera ID", selectedCamera.id],
                ["Name", selectedCamera.name],
                ["Type", selectedCamera.type],
                ["Location", selectedCamera.location],
                ["Coordinates", selectedCamera.coordinates],
                ["Resolution", selectedCamera.resolution],
                ["FPS", selectedCamera.fps],
                ["Total Detections", selectedCamera.detections],
                ["Last Detection", selectedCamera.lastDetection],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsCameraDetailOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* ── Camera: Restart Confirm ── */}
      <Modal open={isRestartCameraOpen} onOpenChange={setIsRestartCameraOpen} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsRestartCameraOpen(false)}>
          <ModalTitle>Restart Camera</ModalTitle>
          <ModalDescription>Send a restart command to this camera.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <p className="text-base">Restart <strong>{selectedCamera?.id}</strong> ({selectedCamera?.name})? The feed will be briefly interrupted.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsRestartCameraOpen(false)}>Cancel</Button>
          <Button onClick={handleRestartCamera}><RefreshCw className="h-4 w-4 mr-2" />Restart</Button>
        </ModalFooter>
      </Modal>

      {/* ── Camera: Toggle Activate/Deactivate ── */}
      <Modal open={isToggleCameraOpen} onOpenChange={setIsToggleCameraOpen} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsToggleCameraOpen(false)}>
          <ModalTitle>{selectedCamera?.status === "Offline" ? "Activate Camera" : "Deactivate Camera"}</ModalTitle>
          <ModalDescription>{selectedCamera?.id} — {selectedCamera?.name}</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <p className="text-base">
            {selectedCamera?.status === "Offline"
              ? `Activate camera ${selectedCamera?.id}? It will resume recording.`
              : `Deactivate camera ${selectedCamera?.id}? It will stop recording.`}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsToggleCameraOpen(false)}>Cancel</Button>
          <Button
            variant={selectedCamera?.status === "Offline" ? "default" : "destructive"}
            onClick={handleToggleCamera}
          >
            {selectedCamera?.status === "Offline"
              ? <><Power className="h-4 w-4 mr-2" />Activate</>
              : <><PowerOff className="h-4 w-4 mr-2" />Deactivate</>}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Camera: Delete Confirm ── */}
      <Modal open={isDeleteCameraOpen} onOpenChange={setIsDeleteCameraOpen} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsDeleteCameraOpen(false)}>
          <ModalTitle>Remove Camera</ModalTitle>
          <ModalDescription>This action cannot be undone.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-base">Permanently remove camera <strong>{selectedCamera?.id}</strong> ({selectedCamera?.name}) from the system?</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsDeleteCameraOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDeleteCamera}><Trash2 className="h-4 w-4 mr-2" />Remove</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
