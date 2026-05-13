import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { MapPin, Plus, Edit, Trash2, Upload, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

// Mock geofencing zones data
const mockZones = [
  {
    id: "zone-001",
    name: "City Center Restricted Zone",
    description: "Heavy vehicle restriction in downtown area",
    zoneType: "Restricted Access",
    active: true,
    createdAt: "2026-01-15",
    geoJsonLength: 3456
  },
  {
    id: "zone-002",
    name: "Port Industrial Zone",
    description: "Designated area for heavy truck operations",
    zoneType: "Permitted Access",
    active: true,
    createdAt: "2026-02-10",
    geoJsonLength: 2890
  },
  {
    id: "zone-003",
    name: "Residential Area - Night Restriction",
    description: "No heavy vehicles between 22:00-06:00",
    zoneType: "Time-Based Restriction",
    active: false,
    createdAt: "2026-03-05",
    geoJsonLength: 4123
  }
]

interface Zone {
  id: string
  name: string
  description: string
  zoneType: string
  active: boolean
  createdAt: string
  geoJsonLength: number
}

export function GeofencingZonesPage() {
  const [zones, setZones] = useState<Zone[]>(mockZones)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const [zoneForm, setZoneForm] = useState({
    name: "",
    description: "",
    zoneType: "Restricted Access",
    geoJsonData: ""
  })

  const zoneTypes = ["Restricted Access", "Permitted Access", "Time-Based Restriction", "Weight Limit Zone"]

  const handleCreateZone = () => {
    const newZone: Zone = {
      id: `zone-${zones.length + 1}`.padStart(8, '0'),
      name: zoneForm.name,
      description: zoneForm.description,
      zoneType: zoneForm.zoneType,
      active: false,
      createdAt: new Date().toISOString().split('T')[0],
      geoJsonLength: zoneForm.geoJsonData.length
    }
    setZones([...zones, newZone])
    setIsCreateOpen(false)
    setZoneForm({ name: "", description: "", zoneType: "Restricted Access", geoJsonData: "" })
    toast.success("Geofencing zone created successfully")
  }

  const handleUpdateZone = () => {
    if (!selectedZone) return
    setZones(zones.map(z => 
      z.id === selectedZone.id 
        ? { 
            ...z, 
            name: zoneForm.name,
            description: zoneForm.description,
            zoneType: zoneForm.zoneType,
            geoJsonLength: zoneForm.geoJsonData.length || z.geoJsonLength
          }
        : z
    ))
    setIsEditOpen(false)
    setSelectedZone(null)
    toast.success("Geofencing zone updated successfully")
  }

  const handleDeleteZone = (zoneId: string) => {
    setZones(zones.filter(z => z.id !== zoneId))
    toast.success("Geofencing zone deleted")
  }

  const handleToggleActive = (zoneId: string) => {
    setZones(zones.map(z => 
      z.id === zoneId ? { ...z, active: !z.active } : z
    ))
    const zone = zones.find(z => z.id === zoneId)
    toast.success(`Zone ${zone?.active ? 'deactivated' : 'activated'}`)
  }

  const handleEditClick = (zone: Zone) => {
    setSelectedZone(zone)
    setZoneForm({
      name: zone.name,
      description: zone.description,
      zoneType: zone.zoneType,
      geoJsonData: ""
    })
    setIsEditOpen(true)
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Geofencing Zones</h1>
          <p className="text-lg text-muted-foreground">Manage municipal boundary zones and restrictions</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Zone
        </Button>
      </div>

      {/* Zones Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Geofencing Zones</CardTitle>
          <CardDescription className="text-base">
            Configure access control zones with GeoJSON boundaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Zone Name</TableHead>
                <TableHead className="text-base">Description</TableHead>
                <TableHead className="text-base">Zone Type</TableHead>
                <TableHead className="text-base">Status</TableHead>
                <TableHead className="text-right text-base">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium text-base">{zone.name}</TableCell>
                  <TableCell className="text-base">{zone.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{zone.zoneType}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(zone.active)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(zone)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={zone.active ? "outline" : "default"}
                        onClick={() => handleToggleActive(zone.id)}
                      >
                        {zone.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteZone(zone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Zone Modal */}
      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen} className="w-full max-w-3xl">
        <ModalHeader onClose={() => setIsCreateOpen(false)}>
          <ModalTitle>Create Geofencing Zone</ModalTitle>
          <ModalDescription>Define a new access control zone with GeoJSON boundary</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Zone Name *</Label>
              <Input
                id="name"
                value={zoneForm.name}
                onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                placeholder="e.g., City Center Restricted Zone"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Input
                id="description"
                value={zoneForm.description}
                onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
                placeholder="e.g., Heavy vehicle restriction in downtown area"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Zone Type *</Label>
              <div className="grid grid-cols-2 gap-2">
                {zoneTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setZoneForm({ ...zoneForm, zoneType: type })}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors text-left ${
                      zoneForm.zoneType === type
                        ? "border-[#5B8C5A] bg-[#5B8C5A]/10 text-[#5B8C5A]"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold text-sm">{type}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="geoJsonData" className="text-base">GeoJSON Boundary Data *</Label>
              <Textarea
                id="geoJsonData"
                value={zoneForm.geoJsonData}
                onChange={(e) => setZoneForm({ ...zoneForm, geoJsonData: e.target.value })}
                placeholder='{"type":"Polygon","coordinates":[[[...]]]}'
                className="text-base min-h-[200px] font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Paste GeoJSON Polygon or upload a .geojson file
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload GeoJSON File
              </Button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateZone}>Create Zone</Button>
        </ModalFooter>
      </Modal>

      {/* Edit Zone Modal */}
      <Modal open={isEditOpen} onOpenChange={setIsEditOpen} className="w-full max-w-3xl">
        <ModalHeader onClose={() => setIsEditOpen(false)}>
          <ModalTitle>Edit Geofencing Zone</ModalTitle>
          <ModalDescription>Update zone details and configuration</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-base">Zone Name *</Label>
              <Input
                id="edit-name"
                value={zoneForm.name}
                onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                placeholder="e.g., City Center Restricted Zone"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-base">Description</Label>
              <Input
                id="edit-description"
                value={zoneForm.description}
                onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
                placeholder="e.g., Heavy vehicle restriction in downtown area"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Zone Type *</Label>
              <div className="grid grid-cols-2 gap-2">
                {zoneTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setZoneForm({ ...zoneForm, zoneType: type })}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors text-left ${
                      zoneForm.zoneType === type
                        ? "border-[#5B8C5A] bg-[#5B8C5A]/10 text-[#5B8C5A]"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold text-sm">{type}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-geoJsonData" className="text-base">Update GeoJSON Boundary (Optional)</Label>
              <Textarea
                id="edit-geoJsonData"
                value={zoneForm.geoJsonData}
                onChange={(e) => setZoneForm({ ...zoneForm, geoJsonData: e.target.value })}
                placeholder='Leave empty to keep existing data or paste new GeoJSON'
                className="text-base min-h-[150px] font-mono text-sm"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateZone}>Save Changes</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
