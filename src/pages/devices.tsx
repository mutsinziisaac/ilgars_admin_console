import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Radio, MapPin, Navigation, Battery, BatteryLow, Signal, SignalHigh, SignalLow, Camera, Video, Eye, Search, MoreHorizontal, RefreshCw, PowerOff, Power, Plus, Trash2, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Mock GPS tracking devices data
const mockTrackingDevices = [
  {
    id: "GPS-001",
    plateNumber: "AAA-123-MP",
    vehicleType: "Cargo Truck",
    owner: "TransMoz Logistics",
    status: "Active",
    location: "Av. Julius Nyerere & Mao Tse Tung",
    coordinates: "-25.9655, 32.5892",
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
    coordinates: "-25.9612, 32.5731",
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
    coordinates: "-25.9588, 32.5823",
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
    speed: "N/A",
    battery: "12%",
    signal: "Weak",
    lastUpdate: "2 hours ago"
  },
]

// Mock camera data
const mockCameras = [
  {
    id: "CAM-001",
    name: "North Gate - Julius Nyerere",
    type: "ANPR",
    location: "Av. Julius Nyerere",
    coordinates: "-25.9655, 32.5892",
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
    coordinates: "-25.9612, 32.5731",
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
    coordinates: "-25.9588, 32.5823",
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
    status: "Online",
    resolution: "4K",
    fps: "30",
    detections: "1,567",
    lastDetection: "1 min ago"
  },
]

type TrackingDevice = typeof mockTrackingDevices[0]
type Camera = typeof mockCameras[0]

export function DevicesPage() {
  const [activeTab, setActiveTab] = useState("tracking")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMapOpen, setIsMapOpen] = useState(false)

  // Tracking device state
  const [trackingDevices, setTrackingDevices] = useState(mockTrackingDevices)
  const [selectedDevice, setSelectedDevice] = useState<TrackingDevice | null>(null)
  const [isDeviceDetailOpen, setIsDeviceDetailOpen] = useState(false)
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false)
  const [isToggleConfirmOpen, setIsToggleConfirmOpen] = useState(false)
  const [isDeleteDeviceOpen, setIsDeleteDeviceOpen] = useState(false)
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const [newDevice, setNewDevice] = useState({ id: "", plateNumber: "", vehicleType: "", owner: "" })

  // Camera state
  const [cameras, setCameras] = useState(mockCameras)
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null)
  const [isCameraDetailOpen, setIsCameraDetailOpen] = useState(false)
  const [isRestartCameraOpen, setIsRestartCameraOpen] = useState(false)
  const [isToggleCameraOpen, setIsToggleCameraOpen] = useState(false)
  const [isDeleteCameraOpen, setIsDeleteCameraOpen] = useState(false)

  // Device actions
  const handleRestartDevice = () => {
    setIsRestartConfirmOpen(false)
    toast.success(`Device ${selectedDevice?.id} restart command sent`)
  }

  const handleToggleDevice = () => {
    if (!selectedDevice) return
    const newStatus = selectedDevice.status === "Offline" ? "Active" : "Offline"
    setTrackingDevices(prev =>
      prev.map(d => d.id === selectedDevice.id ? { ...d, status: newStatus } : d)
    )
    setIsToggleConfirmOpen(false)
    toast.success(`Device ${selectedDevice.id} ${newStatus === "Offline" ? "deactivated" : "activated"}`)
  }

  const handleDeleteDevice = () => {
    if (!selectedDevice) return
    setTrackingDevices(prev => prev.filter(d => d.id !== selectedDevice.id))
    setIsDeleteDeviceOpen(false)
    toast.success(`Device ${selectedDevice.id} removed`)
  }

  const handleAddDevice = () => {
    if (!newDevice.id || !newDevice.plateNumber) return
    setTrackingDevices(prev => [...prev, {
      ...newDevice,
      status: "Offline",
      location: "Not yet assigned",
      coordinates: "N/A",
      speed: "N/A",
      battery: "N/A",
      signal: "Weak",
      lastUpdate: "Just added"
    }])
    setIsAddDeviceOpen(false)
    setNewDevice({ id: "", plateNumber: "", vehicleType: "", owner: "" })
    toast.success(`Device ${newDevice.id} added successfully`)
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

  const onlineCameras = cameras.filter(c => c.status === "Online").length
  const offlineCameras = cameras.filter(c => c.status === "Offline").length

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
                  <CardDescription className="text-base">Real-time vehicle location tracking</CardDescription>
                </div>
              <div className="flex items-center gap-3">
                <Button className="text-base h-11 px-6" onClick={() => setIsMapOpen(true)}>
                  <MapPin className="h-5 w-5 mr-2" />
                  View Map
                </Button>
                <Button className="text-base h-11 px-6" onClick={() => setIsAddDeviceOpen(true)}>
                  <Plus className="h-5 w-5 mr-2" />
                  Add Device
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-base">
                            <DropdownMenuItem
                              className="text-base cursor-pointer"
                              onClick={() => { setSelectedDevice(device); setIsDeviceDetailOpen(true) }}
                            >
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-base cursor-pointer"
                              onClick={() => { setSelectedDevice(device); setIsRestartConfirmOpen(true) }}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" /> Restart Device
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-base cursor-pointer"
                              onClick={() => { setSelectedDevice(device); setIsToggleConfirmOpen(true) }}
                            >
                              {device.status === "Offline"
                                ? <><Power className="h-4 w-4 mr-2" /> Activate</>
                                : <><PowerOff className="h-4 w-4 mr-2" /> Deactivate</>
                              }
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-base cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => { setSelectedDevice(device); setIsDeleteDeviceOpen(true) }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Remove Device
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

      {/* Map Modal */}
      <Modal open={isMapOpen} onOpenChange={setIsMapOpen} className="w-[90vw] max-w-7xl">
        <ModalHeader onClose={() => setIsMapOpen(false)}>
          <ModalTitle>Device Location Map - Maputo</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="relative w-full h-[70vh] bg-muted rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <svg className="absolute inset-0 w-full h-full opacity-20">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
              <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-blue-200 opacity-40 rounded-tl-full"></div>
              <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10">
                <h3 className="font-semibold text-sm mb-3">Device Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#5B8C5A]"></div><span className="text-sm">Active ({activeDevices})</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#DAA22A]"></div><span className="text-sm">Idle ({idleDevices})</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#E5533D]"></div><span className="text-sm">Offline ({offlineDevices})</span></div>
                </div>
              </div>
              {trackingDevices.map((device, index) => {
                const positions = [
                  { top: '35%', left: '45%' },
                  { top: '50%', left: '40%' },
                  { top: '45%', left: '55%' },
                  { top: '60%', left: '35%' },
                  { top: '40%', left: '50%' },
                ]
                const position = positions[index] || { top: '50%', left: '50%' }
                const markerColor = device.status === 'Active' ? 'bg-[#5B8C5A]' : device.status === 'Idle' ? 'bg-[#DAA22A]' : 'bg-[#E5533D]'
                const pulseColor = device.status === 'Active' ? 'bg-[#5B8C5A]' : device.status === 'Idle' ? 'bg-[#DAA22A]' : 'bg-[#E5533D]'
                return (
                  <div key={device.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer" style={{ top: position.top, left: position.left }}>
                    {device.status === 'Active' && (<div className={`absolute inset-0 ${pulseColor} rounded-full opacity-75 animate-ping`}></div>)}
                    <div className={`relative w-6 h-6 ${markerColor} rounded-full border-2 border-white shadow-lg z-10`}>
                      <div className="absolute inset-0 flex items-center justify-center"><Radio className="h-3 w-3 text-white" /></div>
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap text-sm">
                        <div className="font-bold">{device.plateNumber}</div>
                        <div className="text-xs text-muted-foreground">{device.vehicleType}</div>
                        <div className="text-xs mt-1">{device.location}</div>
                        <div className="text-xs font-semibold mt-1">Speed: {device.speed}</div>
                        <div className="text-xs">Battery: {device.battery} | Signal: {device.signal}</div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1"><div className="w-2 h-2 bg-white rotate-45"></div></div>
                    </div>
                  </div>
                )
              })}
              <div className="absolute top-[35%] left-[30%] text-xs font-semibold text-gray-600 bg-white/80 px-2 py-1 rounded">Av. Julius Nyerere</div>
              <div className="absolute top-[50%] left-[25%] text-xs font-semibold text-gray-600 bg-white/80 px-2 py-1 rounded">Av. 25 de Setembro</div>
              <div className="absolute top-[45%] left-[65%] text-xs font-semibold text-gray-600 bg-white/80 px-2 py-1 rounded">Marginal Avenue</div>
              <div className="absolute top-[60%] left-[20%] text-xs font-semibold text-gray-600 bg-white/80 px-2 py-1 rounded">Av. Eduardo Mondlane</div>
              <div className="absolute bottom-4 left-4 text-2xl font-bold text-gray-700 bg-white/90 px-4 py-2 rounded-lg shadow">Maputo, Mozambique</div>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* ── GPS Device: View Details ── */}
      <Modal open={isDeviceDetailOpen} onOpenChange={setIsDeviceDetailOpen} className="w-full max-w-lg">
        <ModalHeader onClose={() => setIsDeviceDetailOpen(false)}>
          <ModalTitle>Device Details</ModalTitle>
          <ModalDescription>{selectedDevice?.id} — {selectedDevice?.plateNumber}</ModalDescription>
        </ModalHeader>
        <ModalBody>
          {selectedDevice && (
            <div className="space-y-3 text-base">
              {[
                ["Device ID", selectedDevice.id],
                ["Plate Number", selectedDevice.plateNumber],
                ["Vehicle Type", selectedDevice.vehicleType],
                ["Owner", selectedDevice.owner],
                ["Location", selectedDevice.location],
                ["Coordinates", selectedDevice.coordinates],
                ["Speed", selectedDevice.speed],
                ["Battery", selectedDevice.battery],
                ["Signal", selectedDevice.signal],
                ["Last Update", selectedDevice.lastUpdate],
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
          <Button variant="outline" onClick={() => setIsDeviceDetailOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* ── GPS Device: Restart Confirm ── */}
      <Modal open={isRestartConfirmOpen} onOpenChange={setIsRestartConfirmOpen} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsRestartConfirmOpen(false)}>
          <ModalTitle>Restart Device</ModalTitle>
          <ModalDescription>Send a restart command to this GPS device.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <p className="text-base">Are you sure you want to restart <strong>{selectedDevice?.id}</strong> ({selectedDevice?.plateNumber})? The device will temporarily go offline.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsRestartConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleRestartDevice}><RefreshCw className="h-4 w-4 mr-2" />Restart</Button>
        </ModalFooter>
      </Modal>

      {/* ── GPS Device: Toggle Activate/Deactivate ── */}
      <Modal open={isToggleConfirmOpen} onOpenChange={setIsToggleConfirmOpen} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsToggleConfirmOpen(false)}>
          <ModalTitle>{selectedDevice?.status === "Offline" ? "Activate Device" : "Deactivate Device"}</ModalTitle>
          <ModalDescription>{selectedDevice?.id} — {selectedDevice?.plateNumber}</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <p className="text-base">
            {selectedDevice?.status === "Offline"
              ? `Activate device ${selectedDevice?.id}? It will resume tracking.`
              : `Deactivate device ${selectedDevice?.id}? It will stop transmitting data.`}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsToggleConfirmOpen(false)}>Cancel</Button>
          <Button
            variant={selectedDevice?.status === "Offline" ? "default" : "destructive"}
            onClick={handleToggleDevice}
          >
            {selectedDevice?.status === "Offline"
              ? <><Power className="h-4 w-4 mr-2" />Activate</>
              : <><PowerOff className="h-4 w-4 mr-2" />Deactivate</>}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── GPS Device: Delete Confirm ── */}
      <Modal open={isDeleteDeviceOpen} onOpenChange={setIsDeleteDeviceOpen} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsDeleteDeviceOpen(false)}>
          <ModalTitle>Remove Device</ModalTitle>
          <ModalDescription>This action cannot be undone.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-base">Permanently remove device <strong>{selectedDevice?.id}</strong> ({selectedDevice?.plateNumber}) from the system?</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsDeleteDeviceOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDeleteDevice}><Trash2 className="h-4 w-4 mr-2" />Remove</Button>
        </ModalFooter>
      </Modal>

      {/* ── GPS Device: Add New ── */}
      <Modal open={isAddDeviceOpen} onOpenChange={setIsAddDeviceOpen} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsAddDeviceOpen(false)}>
          <ModalTitle>Add GPS Device</ModalTitle>
          <ModalDescription>Register a new tracking device in the system.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Device ID</label>
              <Input placeholder="e.g. GPS-006" value={newDevice.id} onChange={e => setNewDevice(p => ({ ...p, id: e.target.value }))} className="h-11 text-base" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Plate Number</label>
              <Input placeholder="e.g. FFF-678-MP" value={newDevice.plateNumber} onChange={e => setNewDevice(p => ({ ...p, plateNumber: e.target.value }))} className="h-11 text-base" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Vehicle Type</label>
              <Input placeholder="e.g. Heavy Truck" value={newDevice.vehicleType} onChange={e => setNewDevice(p => ({ ...p, vehicleType: e.target.value }))} className="h-11 text-base" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Owner</label>
              <Input placeholder="e.g. Maputo Logistics" value={newDevice.owner} onChange={e => setNewDevice(p => ({ ...p, owner: e.target.value }))} className="h-11 text-base" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddDeviceOpen(false)}>Cancel</Button>
          <Button onClick={handleAddDevice} disabled={!newDevice.id || !newDevice.plateNumber}><Plus className="h-4 w-4 mr-2" />Add Device</Button>
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
