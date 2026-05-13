import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Radio, MapPin, Navigation, Battery, BatteryLow, Signal, SignalHigh, SignalLow, Eye, Search, Map, Plus } from "lucide-react"
import { toast } from "sonner"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Maputo center coordinates
const MAPUTO_CENTER: [number, number] = [-25.9692, 32.5732]
const DEFAULT_ZOOM = 14

// Mock GPS tracking devices data with real Maputo coordinates
const mockTrackingDevices = [
  {
    id: "GPS-001",
    plateNumber: "AAA-123-MP",
    vehicleType: "Cargo Truck",
    owner: "TransMoz Logistics",
    status: "Active",
    location: "Av. Julius Nyerere & Mao Tse Tung",
    coordinates: "-25.9612, 32.5823",
    latlng: [-25.9612, 32.5823] as [number, number],
    speed: "45 km/h",
    battery: "85%",
    signal: "Strong",
    lastUpdate: "2 mins ago"
  },
  {
    id: "GPS-002",
    plateNumber: "BBB-456-MP",
    vehicleType: "Heavy Truck",
    owner: "Cargo Express Ltd",
    status: "Active",
    location: "Av. 25 de Setembro",
    coordinates: "-25.9655, 32.5731",
    latlng: [-25.9655, 32.5731] as [number, number],
    speed: "32 km/h",
    battery: "92%",
    signal: "Strong",
    lastUpdate: "1 min ago"
  },
  {
    id: "GPS-003",
    plateNumber: "CCC-789-MP",
    vehicleType: "Tractor",
    owner: "Heavy Haul Services",
    status: "Idle",
    location: "Marginal Avenue",
    coordinates: "-25.9701, 32.5945",
    latlng: [-25.9701, 32.5945] as [number, number],
    speed: "0 km/h",
    battery: "67%",
    signal: "Medium",
    lastUpdate: "5 mins ago"
  },
  {
    id: "GPS-004",
    plateNumber: "DDD-012-MP",
    vehicleType: "Bus",
    owner: "Maputo Transport",
    status: "Active",
    location: "Av. Eduardo Mondlane",
    coordinates: "-25.9588, 32.5680",
    latlng: [-25.9588, 32.5680] as [number, number],
    speed: "28 km/h",
    battery: "78%",
    signal: "Strong",
    lastUpdate: "3 mins ago"
  },
  {
    id: "GPS-005",
    plateNumber: "EEE-345-MP",
    vehicleType: "Heavy Truck",
    owner: "Freight Masters",
    status: "Offline",
    location: "Last: Av. Acordos de Lusaka",
    coordinates: "-25.9723, 32.5834",
    latlng: [-25.9723, 32.5834] as [number, number],
    speed: "N/A",
    battery: "12%",
    signal: "Weak",
    lastUpdate: "2 hours ago"
  },
]

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

export function GPSTrackingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [trackingDevices, setTrackingDevices] = useState(mockTrackingDevices)
  
  const [deviceForm, setDeviceForm] = useState({
    deviceId: "",
    plateNumber: "",
    vehicleType: "",
    owner: "",
    imei: "",
    simCard: ""
  })

  const handleAddDevice = () => {
    const newDevice = {
      id: deviceForm.deviceId,
      plateNumber: deviceForm.plateNumber,
      vehicleType: deviceForm.vehicleType,
      owner: deviceForm.owner,
      status: "Offline" as const,
      location: "Not yet tracked",
      coordinates: "-25.9692, 32.5732",
      latlng: [-25.9692, 32.5732] as [number, number],
      speed: "N/A",
      battery: "N/A",
      signal: "N/A",
      lastUpdate: "Never"
    }
    
    setTrackingDevices([...trackingDevices, newDevice])
    setIsAddDeviceOpen(false)
    setDeviceForm({
      deviceId: "",
      plateNumber: "",
      vehicleType: "",
      owner: "",
      imei: "",
      simCard: ""
    })
    toast.success("GPS device added successfully")
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
      "Idle": "bg-[#DAA22A] text-[#1C1C1C]",
      "Offline": "bg-[#E5533D] text-white",
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

  // Initialize Leaflet map when modal opens
  useEffect(() => {
    if (!isMapOpen || !mapContainerRef.current || mapRef.current) return

    try {
      const map = L.map(mapContainerRef.current, {
        center: MAPUTO_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

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
        
        marker.on('mouseover', function() {
          this.openPopup()
        })
        marker.on('mouseout', function() {
          this.closePopup()
        })
        
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">GPS Tracking</h1>
          <p className="text-lg text-muted-foreground">Real-time vehicle location tracking</p>
        </div>
        <Button onClick={() => setIsAddDeviceOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Device
        </Button>
      </div>

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
              <CardDescription className="text-base">Real-time vehicle location tracking</CardDescription>
            </div>
            <Button className="text-base h-11 px-6" onClick={() => setIsMapOpen(true)}>
              <Map className="h-5 w-5 mr-2" />
              View Map
            </Button>
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
                <TableHead className="text-right text-base">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium text-base">{device.id}</TableCell>
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
                placeholder="e.g., TransMoz Logistics"
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
          <Button variant="outline" onClick={() => setIsAddDeviceOpen(false)}>Cancel</Button>
          <Button onClick={handleAddDevice}>Add Device</Button>
        </ModalFooter>
      </Modal>

      {/* Map Modal */}
      <Modal open={isMapOpen} onOpenChange={setIsMapOpen} className="w-[90vw] max-w-7xl">
        <ModalHeader onClose={() => setIsMapOpen(false)}>
          <ModalTitle>GPS Device Locations - Maputo</ModalTitle>
        </ModalHeader>
        
        <ModalBody>
          <div className="relative w-full h-[70vh] rounded-lg overflow-hidden">
            <div ref={mapContainerRef} className="w-full h-full" />
            
            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
              <h3 className="font-semibold text-sm mb-3">GPS Devices</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#5B8C5A]"></div>
                  <span className="text-sm">Active ({activeDevices})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#DAA22A]"></div>
                  <span className="text-sm">Idle ({idleDevices})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#E5533D]"></div>
                  <span className="text-sm">Offline ({offlineDevices})</span>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  )
}
