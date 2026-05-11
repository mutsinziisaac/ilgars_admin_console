import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalBody } from "@/components/ui/modal"
import { Radio, MapPin, Navigation, Battery, BatteryLow, Signal, SignalHigh, SignalLow, Camera, Video, Eye, Search } from "lucide-react"

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

export function DevicesPage() {
  const [activeTab, setActiveTab] = useState("tracking")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMapOpen, setIsMapOpen] = useState(false)

  // Filter tracking devices
  const filteredDevices = mockTrackingDevices.filter(device =>
    device.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.owner.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter cameras
  const filteredCameras = mockCameras.filter(camera =>
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

  const activeDevices = mockTrackingDevices.filter(d => d.status === "Active").length
  const idleDevices = mockTrackingDevices.filter(d => d.status === "Idle").length
  const offlineDevices = mockTrackingDevices.filter(d => d.status === "Offline").length
  const lowBatteryDevices = mockTrackingDevices.filter(d => parseInt(d.battery) < 20).length

  const onlineCameras = mockCameras.filter(c => c.status === "Online").length
  const offlineCameras = mockCameras.filter(c => c.status === "Offline").length

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
                <Button className="text-base h-11 px-6" onClick={() => setIsMapOpen(true)}>
                  <MapPin className="h-5 w-5 mr-2" />
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
        </TabsContent>

        {/* Cameras Tab */}
        <TabsContent value="cameras" className="mt-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-base">Total Cameras</CardDescription>
                <CardTitle className="text-4xl">{mockCameras.length}</CardTitle>
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
        </TabsContent>
      </Tabs>

      {/* Map Modal */}
      <Modal open={isMapOpen} onOpenChange={setIsMapOpen} className="w-[90vw] max-w-7xl">
        <ModalHeader onClose={() => setIsMapOpen(false)}>
          <ModalTitle>Device Location Map - Maputo</ModalTitle>
        </ModalHeader>
        
        <ModalBody>
          <div className="relative w-full h-[70vh] bg-muted rounded-lg overflow-hidden">
            {/* Mock Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100">
              {/* Map Grid Lines */}
              <svg className="absolute inset-0 w-full h-full opacity-20">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Maputo Bay Area (simplified) */}
              <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-blue-200 opacity-40 rounded-tl-full"></div>

              {/* Legend */}
              <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10">
                <h3 className="font-semibold text-sm mb-3">Device Status</h3>
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

              {/* Device Markers */}
              {mockTrackingDevices.map((device, index) => {
                // Position devices across the map
                const positions = [
                  { top: '35%', left: '45%' },  // GPS-001 - Julius Nyerere
                  { top: '50%', left: '40%' },  // GPS-002 - 25 de Setembro
                  { top: '45%', left: '55%' },  // GPS-003 - Marginal
                  { top: '60%', left: '35%' },  // GPS-004 - Eduardo Mondlane
                  { top: '40%', left: '50%' },  // GPS-005 - Acordos de Lusaka
                ]
                
                const position = positions[index] || { top: '50%', left: '50%' }
                
                const markerColor = 
                  device.status === 'Active' ? 'bg-[#5B8C5A]' :
                  device.status === 'Idle' ? 'bg-[#DAA22A]' :
                  'bg-[#E5533D]'
                
                const pulseColor = 
                  device.status === 'Active' ? 'bg-[#5B8C5A]' :
                  device.status === 'Idle' ? 'bg-[#DAA22A]' :
                  'bg-[#E5533D]'

                return (
                  <div
                    key={device.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                    style={{ top: position.top, left: position.left }}
                  >
                    {/* Pulse Animation for Active devices */}
                    {device.status === 'Active' && (
                      <div className={`absolute inset-0 ${pulseColor} rounded-full opacity-75 animate-ping`}></div>
                    )}
                    
                    {/* Marker */}
                    <div className={`relative w-6 h-6 ${markerColor} rounded-full border-2 border-white shadow-lg z-10`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Radio className="h-3 w-3 text-white" />
                      </div>
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap text-sm">
                        <div className="font-bold">{device.plateNumber}</div>
                        <div className="text-xs text-muted-foreground">{device.vehicleType}</div>
                        <div className="text-xs mt-1">{device.location}</div>
                        <div className="text-xs font-semibold mt-1">
                          Speed: {device.speed}
                        </div>
                        <div className="text-xs">
                          Battery: {device.battery} | Signal: {device.signal}
                        </div>
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="w-2 h-2 bg-white rotate-45"></div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Street Labels (Mock) */}
              <div className="absolute top-[35%] left-[30%] text-xs font-semibold text-gray-600 bg-white/80 px-2 py-1 rounded">
                Av. Julius Nyerere
              </div>
              <div className="absolute top-[50%] left-[25%] text-xs font-semibold text-gray-600 bg-white/80 px-2 py-1 rounded">
                Av. 25 de Setembro
              </div>
              <div className="absolute top-[45%] left-[65%] text-xs font-semibold text-gray-600 bg-white/80 px-2 py-1 rounded">
                Marginal Avenue
              </div>
              <div className="absolute top-[60%] left-[20%] text-xs font-semibold text-gray-600 bg-white/80 px-2 py-1 rounded">
                Av. Eduardo Mondlane
              </div>

              {/* Maputo Label */}
              <div className="absolute bottom-4 left-4 text-2xl font-bold text-gray-700 bg-white/90 px-4 py-2 rounded-lg shadow">
                Maputo, Mozambique
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  )
}
