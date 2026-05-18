import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, MapPin, Video, Eye, Search, Map as MapIcon } from "lucide-react"
import { Map as GoogleMap, type MapMarker } from "@/components/ui/map"

// Maputo center coordinates
const MAPUTO_CENTER: [number, number] = [-25.9692, 32.5732]
const DEFAULT_ZOOM = 14

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

const cameraStatusColor = (status: string) => status === "Online" ? "#5B8C5A" : "#E5533D"

export function CamerasPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [cameras] = useState(mockCameras)

  // Filter cameras
  const filteredCameras = cameras.filter(camera =>
    camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    camera.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get status badge
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "Online": "bg-[#5B8C5A] text-white",
      "Offline": "bg-[#E5533D] text-white"
    }
    return (
      <Badge className={`${colors[status] || "bg-secondary"} text-sm px-3 py-1`}>
        {status}
      </Badge>
    )
  }

  const onlineCameras = cameras.filter(c => c.status === "Online").length
  const offlineCameras = cameras.filter(c => c.status === "Offline").length

  const mapMarkers: MapMarker[] = cameras.map((camera) => {
    const color = cameraStatusColor(camera.status)
    return {
      position: camera.latlng,
      label: camera.name,
      color,
      glyph: "C",
      popupHtml: `
        <div style="width:280px;font-family:Outfit,system-ui,sans-serif">
          <div style="background:${color};color:white;padding:10px 12px">
            <strong style="font-size:14px;line-height:1.1">${camera.name}</strong>
          </div>
          <div style="padding:12px">
            <div style="font-size:14px;font-weight:700;margin-bottom:8px">${camera.type} Camera</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;font-size:12px;color:#555;margin-bottom:8px">
              <div><span style="color:#999">Resolution</span><br/>${camera.resolution}</div>
              <div><span style="color:#999">FPS</span><br/>${camera.fps}</div>
              <div><span style="color:#999">Detections</span><br/>${camera.detections}</div>
              <div><span style="color:#999">Last</span><br/>${camera.lastDetection}</div>
            </div>
            <div style="font-size:12px;color:#555;margin-bottom:8px">${camera.location}</div>
            <span style="display:inline-block;background:${color}22;color:${color};padding:3px 8px;border-radius:5px;font-size:11px;font-weight:700">${camera.status}</span>
          </div>
        </div>
      `,
    }
  })

  if (isMapOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsMapOpen(false)} className="mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-semibold text-foreground">Camera Locations - Maputo</h1>
            <p className="text-lg text-muted-foreground">View installed ANPR and traffic monitoring cameras on the map.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="relative h-[calc(100vh-220px)] min-h-[560px] w-full overflow-hidden rounded-lg">
              <GoogleMap
                center={MAPUTO_CENTER}
                zoom={DEFAULT_ZOOM}
                markers={mapMarkers}
                height="100%"
                className="h-full w-full"
                defaultView="street"
              />

              <div className="absolute top-4 right-4 z-[1000] rounded-lg bg-white p-4 shadow-lg">
                <h3 className="mb-3 text-sm font-semibold">Cameras</h3>
                <div className="space-y-2">
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
        <h1 className="text-4xl font-semibold text-foreground">Cameras</h1>
        <p className="text-lg text-muted-foreground">ANPR and traffic monitoring cameras</p>
      </div>

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
            <div className="flex gap-3">
              <Button className="text-base h-11 px-6" onClick={() => setIsMapOpen(true)}>
                <MapIcon className="h-5 w-5 mr-2" />
                View Map
              </Button>
              <Button className="text-base h-11 px-6">
                <Video className="h-5 w-5 mr-2" />
                Live Feed
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

    </div>
  )
}
