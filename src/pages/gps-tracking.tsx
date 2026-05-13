import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Eye, Search, Plus, Loader2 } from "lucide-react"
import { useQueries, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { DevicesApi } from "@/lib/api/devices/api"
import { useRegisterDevice } from "@/lib/api/devices/hooks"
import { devicesKeys } from "@/lib/api/devices/queryKeys"
import type { ActiveDeviceResponse, Device, RegisterDeviceRequest } from "@/lib/api/devices/schemas"
import { VehiclesApi } from "@/lib/api/vehicles/api"
import { useVehiclesList } from "@/lib/api/vehicles/hooks"
import type { Vehicle } from "@/lib/api/vehicles/schemas"
import { ApiError } from "@/lib/api/errors"

type TrackingDevice = {
  id: string
  plateNumber: string
  vehicleType: string
  owner: string
  status: string
  lastUpdate: string
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
    lastUpdate: formatDeviceTimestamp(assignment?.assignedAt || tracker?.updatedAt || tracker?.createdAt || vehicle.updatedAt),
  }
}

function buildRegisterDevicePayload(form: {
  deviceId: string
  imei: string
  simCard: string
}): RegisterDeviceRequest {
  const timestamp = Date.now()
  const deviceUid = form.deviceId.trim()
  const simMsisdn = form.simCard.trim().replace(/\s+/g, "") || `+25884${String(timestamp).slice(-7)}`

  return {
    deviceUid,
    serialNumber: `SER-${deviceUid || timestamp}`,
    imei: form.imei.trim() || `356000${timestamp}`,
    simIccid: `892580${timestamp}`,
    simMsisdn,
    vendor: "BMC",
    model: "A1000",
    providerKey: "bmc",
    providerDeviceRef: `BMC-${deviceUid || timestamp}`,
    protocol: "TCP",
    firmwareVersion: "uat-1.0",
    status: "REGISTERED",
  }
}

export function GPSTrackingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const queryClient = useQueryClient()
  const registerDeviceMutation = useRegisterDevice()
  const {
    data: vehiclesResponse,
    isLoading: isVehiclesLoading,
    error: vehiclesError,
    refetch: refetchVehicles,
  } = useVehiclesList({ page: 0, size: 100 })
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
      staleTime: 30_000,
    })),
  })
  const [locallyAddedDevices, setLocallyAddedDevices] = useState<TrackingDevice[]>([])
  const trackingDevices = useMemo<TrackingDevice[]>(
    () => [
      ...vehicles
        .map((vehicle, index) =>
          mapVehicleToTrackingDevice(
            vehicle,
            activeDeviceQueries[index]?.data ?? null,
          )
        )
        .filter((device): device is TrackingDevice => Boolean(device)),
      ...locallyAddedDevices,
    ],
    [activeDeviceQueries, locallyAddedDevices, vehicles],
  )
  
  const [deviceForm, setDeviceForm] = useState({
    deviceId: "",
    vehicleId: "",
    plateNumber: "",
    vehicleType: "",
    owner: "",
    imei: "",
    simCard: ""
  })

  const handleAddDevice = () => {
    if (!deviceForm.deviceId.trim() || !deviceForm.plateNumber.trim()) {
      toast.error("Device ID and plate number are required")
      return
    }

    registerDeviceMutation.mutate(buildRegisterDevicePayload(deviceForm), {
      onSuccess: async (registeredDevice: Device) => {
        const backendDeviceId = registeredDevice.id || registeredDevice.deviceUid || deviceForm.deviceId.trim()
        const deviceId = registeredDevice.deviceUid || backendDeviceId
        const plateNumber = deviceForm.plateNumber.trim()
        let vehicleId = deviceForm.vehicleId.trim()
        let resolvedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId || vehicle.plateNumber === plateNumber)
        let assignmentSucceeded = false

        if (!vehicleId) {
          try {
            const vehicleResponse = await VehiclesApi.lookupByPlate(plateNumber)
            const vehicle = vehicleResponse.data as Vehicle
            resolvedVehicle = vehicle
            vehicleId = vehicle.id ?? ""
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Device registered, but no vehicle was found for that plate")
          }
        }

        if (vehicleId) {
          try {
            await DevicesApi.assignDevice(backendDeviceId, {
              vehicleId,
              vehiclePlateSnapshot: plateNumber,
              vehicleTruckNumberSnapshot: `TRK-${plateNumber}`,
              assignedBy: "admin-console",
              reason: "Tracker assignment from admin console",
            })
            assignmentSucceeded = true
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Device registered, but assignment failed")
          }
        }

        if (vehicleId) {
          await queryClient.invalidateQueries({ queryKey: devicesKeys.activeByVehicle(vehicleId) })
          await refetchVehicles()
        }
        if (vehicleId && assignmentSucceeded) {
          const newDevice = {
            id: deviceId,
            backendDeviceId,
            vehicleId,
            plateNumber,
            vehicleType: resolvedVehicle ? toVehicleDisplayName(resolvedVehicle) : deviceForm.vehicleType.trim() || "Vehicle",
            owner: resolvedVehicle ? toVehicleOwner(resolvedVehicle) : deviceForm.owner.trim() || "Unknown owner",
            status: "ACTIVE",
            lastUpdate: formatDeviceTimestamp(new Date().toISOString()),
          }

          setLocallyAddedDevices((currentDevices) => [...currentDevices, newDevice])
        }
        setIsAddDeviceOpen(false)
        setDeviceForm({
          deviceId: "",
          vehicleId: "",
          plateNumber: "",
          vehicleType: "",
          owner: "",
          imei: "",
          simCard: ""
        })
        toast.success(vehicleId && assignmentSucceeded ? "GPS device registered and assigned successfully" : "GPS device registered. Assign it to a vehicle to show it here.")
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to register GPS device")
      },
    })
  }

  // Filter tracking devices
  const filteredDevices = trackingDevices.filter(device =>
    device.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.owner.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const activeDeviceLookupError = activeDeviceQueries.find((query) => query.isError)?.error

  // Get status badge
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "Active": "bg-[#5B8C5A] text-white",
      "ACTIVE": "bg-[#5B8C5A] text-white",
      "REGISTERED": "bg-[#5B8C5A] text-white",
      "Idle": "bg-[#DAA22A] text-[#1C1C1C]",
      "Offline": "bg-[#E5533D] text-white",
    }
    return (
      <Badge className={`${colors[status] || "bg-secondary"} text-sm px-3 py-1`}>
        {status}
      </Badge>
    )
  }

  const activeDevices = trackingDevices.length
  const checkedVehicles = vehicles.length
  const assignmentLookupsLoading = activeDeviceQueries.some((query) => query.isLoading || query.isFetching)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">GPS Tracking</h1>
          <p className="text-lg text-muted-foreground">Vehicles with active GPS tracker assignments</p>
        </div>
        <Button onClick={() => setIsAddDeviceOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Device
        </Button>
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
              <CardDescription className="text-base">Vehicles enriched with active tracker assignments</CardDescription>
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
                <TableHead className="text-base">Assigned At</TableHead>
                <TableHead className="text-base">Status</TableHead>
                <TableHead className="text-right text-base">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isVehiclesLoading || assignmentLookupsLoading) && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-base text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading active tracker assignments
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isVehiclesLoading && Boolean(vehiclesError) && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-base text-destructive">
                    Failed to load vehicles for device tracking
                  </TableCell>
                </TableRow>
              )}
              {!isVehiclesLoading && !vehiclesError && Boolean(activeDeviceLookupError) && (
                <TableRow>
                  <TableCell colSpan={7} className="py-4 text-center text-sm text-[#B7791F]">
                    Some tracker assignments could not be loaded.
                  </TableCell>
                </TableRow>
              )}
              {!isVehiclesLoading && !assignmentLookupsLoading && !vehiclesError && filteredDevices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-base text-muted-foreground">
                    No active tracker assignments found.
                  </TableCell>
                </TableRow>
              )}
              {filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium text-base">{device.id}</TableCell>
                  <TableCell className="font-mono font-bold text-base">{device.plateNumber}</TableCell>
                  <TableCell className="text-base">{device.vehicleType}</TableCell>
                  <TableCell className="text-base">{device.owner}</TableCell>
                  <TableCell className="text-base">{device.lastUpdate}</TableCell>
                  <TableCell>{getStatusBadge(device.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <Eye className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Device Modal */}
      <Modal open={isAddDeviceOpen} onOpenChange={setIsAddDeviceOpen} className="w-full max-w-2xl">
        <ModalHeader onClose={() => setIsAddDeviceOpen(false)}>
          <ModalTitle>Add GPS Device</ModalTitle>
          <ModalDescription>Register a new GPS tracking device</ModalDescription>
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
              <Label htmlFor="vehicleId" className="text-base">Vehicle ID</Label>
              <Input
                id="vehicleId"
                value={deviceForm.vehicleId}
                onChange={(e) => setDeviceForm({ ...deviceForm, vehicleId: e.target.value })}
                placeholder="Optional backend vehicle ID for assignment"
                className="text-base h-11"
              />
              <p className="text-sm text-muted-foreground">Fill this when you want to assign the tracker immediately</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plateNumber" className="text-base">Plate Number *</Label>
              <Input
                id="plateNumber"
                value={deviceForm.plateNumber}
                onChange={(e) => setDeviceForm({ ...deviceForm, plateNumber: e.target.value })}
                placeholder="e.g., FFF-678-MP"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType" className="text-base">Vehicle Type *</Label>
              <Input
                id="vehicleType"
                value={deviceForm.vehicleType}
                onChange={(e) => setDeviceForm({ ...deviceForm, vehicleType: e.target.value })}
                placeholder="e.g., Cargo Truck"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner" className="text-base">Owner *</Label>
              <Input
                id="owner"
                value={deviceForm.owner}
                onChange={(e) => setDeviceForm({ ...deviceForm, owner: e.target.value })}
                placeholder="e.g., Maputo Logistics"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imei" className="text-base">IMEI Number</Label>
              <Input
                id="imei"
                value={deviceForm.imei}
                onChange={(e) => setDeviceForm({ ...deviceForm, imei: e.target.value })}
                placeholder="e.g., 123456789012345"
                className="text-base h-11"
              />
              <p className="text-sm text-muted-foreground">15-digit device identifier</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="simCard" className="text-base">SIM Card Number</Label>
              <Input
                id="simCard"
                value={deviceForm.simCard}
                onChange={(e) => setDeviceForm({ ...deviceForm, simCard: e.target.value })}
                placeholder="e.g., +258 84 123 4567"
                className="text-base h-11"
              />
              <p className="text-sm text-muted-foreground">Mobile number for device connectivity</p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddDeviceOpen(false)} disabled={registerDeviceMutation.isPending}>Cancel</Button>
          <Button onClick={handleAddDevice} disabled={registerDeviceMutation.isPending || !deviceForm.deviceId.trim() || !deviceForm.plateNumber.trim()}>
            {registerDeviceMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Registering
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
