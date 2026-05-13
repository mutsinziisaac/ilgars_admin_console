import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Route, Plus, Edit, Trash2, Upload, MapPin, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

// Mock routes data
const mockRoutes = [
  {
    id: "route-001",
    code: "ROUTE-MAIN-01",
    name: "Main Avenue Route",
    description: "Primary route through city center",
    allowedUses: ["Heavy Truck Permit", "Road Closure Permit"],
    active: true,
    createdAt: "2026-01-10",
    geoJsonLength: 2456 // characters
  },
  {
    id: "route-002",
    code: "ROUTE-IND-01",
    name: "Industrial Zone Route",
    description: "Route connecting industrial areas",
    allowedUses: ["Heavy Truck Permit"],
    active: true,
    createdAt: "2026-02-05",
    geoJsonLength: 3124
  },
  {
    id: "route-003",
    code: "ROUTE-PORT-01",
    name: "Port Access Route",
    description: "Direct route to port facilities",
    allowedUses: ["Heavy Truck Permit", "Road Closure Permit"],
    active: false,
    createdAt: "2026-03-12",
    geoJsonLength: 1876
  }
]

interface RouteData {
  id: string
  code: string
  name: string
  description: string
  allowedUses: string[]
  active: boolean
  createdAt: string
  geoJsonLength: number
}

export function RoutesPage() {
  const [routes, setRoutes] = useState<RouteData[]>(mockRoutes)
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const [routeForm, setRouteForm] = useState({
    code: "",
    name: "",
    description: "",
    allowedUses: [] as string[],
    geoJsonData: ""
  })

  const permitTypes = ["Heavy Truck Permit", "Road Closure Permit"]

  const handleCreateRoute = () => {
    const newRoute: RouteData = {
      id: `route-${routes.length + 1}`.padStart(10, '0'),
      code: routeForm.code,
      name: routeForm.name,
      description: routeForm.description,
      allowedUses: routeForm.allowedUses,
      active: false,
      createdAt: new Date().toISOString().split('T')[0],
      geoJsonLength: routeForm.geoJsonData.length
    }
    setRoutes([...routes, newRoute])
    setIsCreateOpen(false)
    setRouteForm({ code: "", name: "", description: "", allowedUses: [], geoJsonData: "" })
    toast.success("Route created successfully")
  }

  const handleUpdateRoute = () => {
    if (!selectedRoute) return
    setRoutes(routes.map(r => 
      r.id === selectedRoute.id 
        ? { 
            ...r, 
            code: routeForm.code,
            name: routeForm.name,
            description: routeForm.description,
            allowedUses: routeForm.allowedUses,
            geoJsonLength: routeForm.geoJsonData.length || r.geoJsonLength
          }
        : r
    ))
    setIsEditOpen(false)
    setSelectedRoute(null)
    toast.success("Route updated successfully")
  }

  const handleDeleteRoute = (routeId: string) => {
    setRoutes(routes.filter(r => r.id !== routeId))
    toast.success("Route deleted")
  }

  const handleToggleActive = (routeId: string) => {
    setRoutes(routes.map(r => 
      r.id === routeId ? { ...r, active: !r.active } : r
    ))
    const route = routes.find(r => r.id === routeId)
    toast.success(`Route ${route?.active ? 'deactivated' : 'activated'}`)
  }

  const handleEditClick = (route: RouteData) => {
    setSelectedRoute(route)
    setRouteForm({
      code: route.code,
      name: route.name,
      description: route.description,
      allowedUses: [...route.allowedUses],
      geoJsonData: ""
    })
    setIsEditOpen(true)
  }

  const toggleAllowedUse = (permitType: string) => {
    const newAllowedUses = routeForm.allowedUses.includes(permitType)
      ? routeForm.allowedUses.filter(u => u !== permitType)
      : [...routeForm.allowedUses, permitType]
    setRouteForm({ ...routeForm, allowedUses: newAllowedUses })
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
          <h1 className="text-4xl font-semibold text-foreground">Municipal Routes</h1>
          <p className="text-lg text-muted-foreground">Manage routes for permits and road closures</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Route
        </Button>
      </div>

      {/* Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Routes</CardTitle>
          <CardDescription className="text-base">
            Configure municipal routes with GeoJSON data and permitted uses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Route Code</TableHead>
                <TableHead className="text-base">Route Name</TableHead>
                <TableHead className="text-base">Description</TableHead>
                <TableHead className="text-base">Allowed Uses</TableHead>
                <TableHead className="text-base">Status</TableHead>
                <TableHead className="text-right text-base">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium text-base">{route.code}</TableCell>
                  <TableCell className="text-base">{route.name}</TableCell>
                  <TableCell className="text-base">{route.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {route.allowedUses.map((use) => (
                        <Badge key={use} variant="outline" className="text-xs">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(route.active)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(route)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={route.active ? "outline" : "default"}
                        onClick={() => handleToggleActive(route.id)}
                      >
                        {route.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteRoute(route.id)}
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

      {/* Create Route Modal */}
      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen} className="w-full max-w-3xl">
        <ModalHeader onClose={() => setIsCreateOpen(false)}>
          <ModalTitle>Create Route</ModalTitle>
          <ModalDescription>Define a new municipal route with GeoJSON data</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-base">Route Code *</Label>
              <Input
                id="code"
                value={routeForm.code}
                onChange={(e) => setRouteForm({ ...routeForm, code: e.target.value })}
                placeholder="e.g., ROUTE-MAIN-01"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Route Name *</Label>
              <Input
                id="name"
                value={routeForm.name}
                onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                placeholder="e.g., Main Avenue Route"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Input
                id="description"
                value={routeForm.description}
                onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })}
                placeholder="e.g., Primary route through city center"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Allowed Permit Uses *</Label>
              <div className="flex flex-wrap gap-2">
                {permitTypes.map((permitType) => (
                  <button
                    key={permitType}
                    type="button"
                    onClick={() => toggleAllowedUse(permitType)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      routeForm.allowedUses.includes(permitType)
                        ? "border-[#5B8C5A] bg-[#5B8C5A]/10 text-[#5B8C5A]"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    {permitType}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Select which permit types can use this route
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="geoJsonData" className="text-base">GeoJSON Route Data *</Label>
              <Textarea
                id="geoJsonData"
                value={routeForm.geoJsonData}
                onChange={(e) => setRouteForm({ ...routeForm, geoJsonData: e.target.value })}
                placeholder='{"type":"LineString","coordinates":[[...]]}'
                className="text-base min-h-[200px] font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Paste GeoJSON LineString or upload a .geojson file
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
          <Button onClick={handleCreateRoute}>Create Route</Button>
        </ModalFooter>
      </Modal>

      {/* Edit Route Modal */}
      <Modal open={isEditOpen} onOpenChange={setIsEditOpen} className="w-full max-w-3xl">
        <ModalHeader onClose={() => setIsEditOpen(false)}>
          <ModalTitle>Edit Route</ModalTitle>
          <ModalDescription>Update route details and configuration</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code" className="text-base">Route Code *</Label>
              <Input
                id="edit-code"
                value={routeForm.code}
                onChange={(e) => setRouteForm({ ...routeForm, code: e.target.value })}
                placeholder="e.g., ROUTE-MAIN-01"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-base">Route Name *</Label>
              <Input
                id="edit-name"
                value={routeForm.name}
                onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                placeholder="e.g., Main Avenue Route"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-base">Description</Label>
              <Input
                id="edit-description"
                value={routeForm.description}
                onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })}
                placeholder="e.g., Primary route through city center"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Allowed Permit Uses *</Label>
              <div className="flex flex-wrap gap-2">
                {permitTypes.map((permitType) => (
                  <button
                    key={permitType}
                    type="button"
                    onClick={() => toggleAllowedUse(permitType)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      routeForm.allowedUses.includes(permitType)
                        ? "border-[#5B8C5A] bg-[#5B8C5A]/10 text-[#5B8C5A]"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    {permitType}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-geoJsonData" className="text-base">Update GeoJSON Route Data (Optional)</Label>
              <Textarea
                id="edit-geoJsonData"
                value={routeForm.geoJsonData}
                onChange={(e) => setRouteForm({ ...routeForm, geoJsonData: e.target.value })}
                placeholder='Leave empty to keep existing data or paste new GeoJSON'
                className="text-base min-h-[150px] font-mono text-sm"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateRoute}>Save Changes</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
