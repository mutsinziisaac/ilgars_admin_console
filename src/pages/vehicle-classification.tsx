import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Truck, Edit, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

// Mock vehicle classification data
const mockClassifications = {
  id: "class-001",
  lastUpdated: "2026-04-01",
  updatedBy: "Municipal Council",
  classifications: [
    { vehicleType: "Light Vehicle", minAxles: 2, maxAxles: 2, minWeight: 0, maxWeight: 3500, description: "Cars, vans, light trucks" },
    { vehicleType: "Medium Truck", minAxles: 2, maxAxles: 3, minWeight: 3501, maxWeight: 12000, description: "Delivery trucks, small cargo vehicles" },
    { vehicleType: "Heavy Truck - 2 Axles", minAxles: 2, maxAxles: 2, minWeight: 12001, maxWeight: 16000, description: "Heavy cargo trucks with 2 axles" },
    { vehicleType: "Heavy Truck - 3 Axles", minAxles: 3, maxAxles: 3, minWeight: 16001, maxWeight: 25000, description: "Heavy cargo trucks with 3 axles" },
    { vehicleType: "Heavy Truck - 4 Axles", minAxles: 4, maxAxles: 4, minWeight: 25001, maxWeight: 34000, description: "Heavy cargo trucks with 4 axles" },
    { vehicleType: "Heavy Truck - 5 Axles", minAxles: 5, maxAxles: 5, minWeight: 34001, maxWeight: 42000, description: "Heavy cargo trucks with 5 axles" },
    { vehicleType: "Heavy Truck - 6 Axles", minAxles: 6, maxAxles: 6, minWeight: 42001, maxWeight: 48000, description: "Heavy cargo trucks with 6 axles" },
    { vehicleType: "Heavy Truck - 7+ Axles", minAxles: 7, maxAxles: 99, minWeight: 48001, maxWeight: 56000, description: "Heavy cargo trucks with 7 or more axles" }
  ]
}

interface Classification {
  vehicleType: string
  minAxles: number
  maxAxles: number
  minWeight: number
  maxWeight: number
  description: string
}

export function VehicleClassificationPage() {
  const [classificationsData, setClassificationsData] = useState(mockClassifications)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingClassifications, setEditingClassifications] = useState<Classification[]>([])

  const [classificationForm, setClassificationForm] = useState({
    vehicleType: "",
    minAxles: 2,
    maxAxles: 2,
    minWeight: 0,
    maxWeight: 0,
    description: ""
  })

  const handleCreateClassification = () => {
    const newClassification: Classification = {
      vehicleType: classificationForm.vehicleType,
      minAxles: classificationForm.minAxles,
      maxAxles: classificationForm.maxAxles,
      minWeight: classificationForm.minWeight,
      maxWeight: classificationForm.maxWeight,
      description: classificationForm.description
    }
    setClassificationsData({
      ...classificationsData,
      classifications: [...classificationsData.classifications, newClassification],
      lastUpdated: new Date().toISOString().split('T')[0],
      updatedBy: "Joana Macavel"
    })
    setIsCreateOpen(false)
    setClassificationForm({ vehicleType: "", minAxles: 2, maxAxles: 2, minWeight: 0, maxWeight: 0, description: "" })
    toast.success("Vehicle classification created successfully")
  }

  const handleDeleteClassification = (index: number) => {
    setClassificationsData({
      ...classificationsData,
      classifications: classificationsData.classifications.filter((_, i) => i !== index),
      lastUpdated: new Date().toISOString().split('T')[0],
      updatedBy: "Joana Macavel"
    })
    toast.success("Classification deleted successfully")
  }

  const handleEditClick = () => {
    setEditingClassifications([...classificationsData.classifications])
    setIsEditOpen(true)
  }

  const handleUpdateClassifications = () => {
    setClassificationsData({
      ...classificationsData,
      classifications: editingClassifications,
      lastUpdated: new Date().toISOString().split('T')[0],
      updatedBy: "Joana Macavel"
    })
    setIsEditOpen(false)
    toast.success("Vehicle classifications updated successfully")
  }

  const updateClassification = (index: number, field: keyof Classification, value: string | number) => {
    const newClassifications = [...editingClassifications]
    newClassifications[index] = { ...newClassifications[index], [field]: value }
    setEditingClassifications(newClassifications)
  }

  const handleAddClassification = () => {
    const newClassification: Classification = {
      vehicleType: "New Vehicle Type",
      minAxles: 2,
      maxAxles: 2,
      minWeight: 0,
      maxWeight: 0,
      description: "Description of vehicle type"
    }
    setEditingClassifications([...editingClassifications, newClassification])
  }

  const handleRemoveClassification = (index: number) => {
    setEditingClassifications(editingClassifications.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Vehicle Classification</h1>
          <p className="text-lg text-muted-foreground">Configure vehicle types and axle thresholds</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Classification
          </Button>
          <Button variant="outline" onClick={handleEditClick}>
            <Edit className="h-4 w-4 mr-2" />
            Edit All
          </Button>
        </div>
      </div>

      {/* Classifications Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Vehicle Classifications</CardTitle>
          <CardDescription className="text-base">
            Vehicle types based on axle count and weight capacity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Vehicle Type</TableHead>
                <TableHead className="text-base">Axles</TableHead>
                <TableHead className="text-base">Weight Range (kg)</TableHead>
                <TableHead className="text-base">Description</TableHead>
                <TableHead className="text-right text-base">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classificationsData.classifications.map((classification, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-base">{classification.vehicleType}</TableCell>
                  <TableCell className="text-base">
                    {classification.minAxles === classification.maxAxles 
                      ? classification.minAxles 
                      : `${classification.minAxles}-${classification.maxAxles}`}
                  </TableCell>
                  <TableCell className="text-base">
                    {classification.minWeight.toLocaleString()} - {classification.maxWeight.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-base">{classification.description}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClassification(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <div className="text-sm text-muted-foreground">
              Last updated: {classificationsData.lastUpdated} by {classificationsData.updatedBy}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Classification Drawer */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent side="right" className="w-[560px] p-0 sm:max-w-[560px]">
          <SheetHeader className="border-b border-border bg-muted/40 px-6 py-4 pr-14">
            <SheetTitle>Create Vehicle Classification</SheetTitle>
            <SheetDescription>Add a new vehicle type classification</SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="vehicleType" className="text-base">Vehicle Type *</Label>
              <Input
                id="vehicleType"
                value={classificationForm.vehicleType}
                onChange={(e) => setClassificationForm({ ...classificationForm, vehicleType: e.target.value })}
                placeholder="e.g., Heavy Truck - 3 Axles"
                className="text-base h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAxles" className="text-base">Min Axles *</Label>
                <Input
                  id="minAxles"
                  type="number"
                  value={classificationForm.minAxles}
                  onChange={(e) => setClassificationForm({ ...classificationForm, minAxles: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 3"
                  className="text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAxles" className="text-base">Max Axles *</Label>
                <Input
                  id="maxAxles"
                  type="number"
                  value={classificationForm.maxAxles}
                  onChange={(e) => setClassificationForm({ ...classificationForm, maxAxles: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 3"
                  className="text-base h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minWeight" className="text-base">Min Weight (kg) *</Label>
                <Input
                  id="minWeight"
                  type="number"
                  value={classificationForm.minWeight}
                  onChange={(e) => setClassificationForm({ ...classificationForm, minWeight: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 16001"
                  className="text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxWeight" className="text-base">Max Weight (kg) *</Label>
                <Input
                  id="maxWeight"
                  type="number"
                  value={classificationForm.maxWeight}
                  onChange={(e) => setClassificationForm({ ...classificationForm, maxWeight: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 25000"
                  className="text-base h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Input
                id="description"
                value={classificationForm.description}
                onChange={(e) => setClassificationForm({ ...classificationForm, description: e.target.value })}
                placeholder="e.g., Heavy cargo trucks with 3 axles"
                className="text-base h-11"
              />
            </div>
          </div>
          <SheetFooter className="border-t border-border bg-background px-6 py-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateClassification}>Create Classification</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Edit Classifications Drawer */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="right" className="w-[720px] p-0 sm:max-w-[720px]">
          <SheetHeader className="border-b border-border bg-muted/40 px-6 py-4 pr-14">
            <SheetTitle>Edit Vehicle Classifications</SheetTitle>
            <SheetDescription>Update vehicle type definitions and thresholds</SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Vehicle Classifications</Label>
              <Button size="sm" onClick={handleAddClassification}>
                <Plus className="h-4 w-4 mr-2" />
                Add Classification
              </Button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {editingClassifications.map((classification, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Classification #{index + 1}</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveClassification(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`vehicleType-${index}`} className="text-sm">Vehicle Type *</Label>
                    <Input
                      id={`vehicleType-${index}`}
                      value={classification.vehicleType}
                      onChange={(e) => updateClassification(index, 'vehicleType', e.target.value)}
                      placeholder="e.g., Heavy Truck - 3 Axles"
                      className="text-base h-10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`minAxles-${index}`} className="text-sm">Min Axles *</Label>
                      <Input
                        id={`minAxles-${index}`}
                        type="number"
                        value={classification.minAxles}
                        onChange={(e) => updateClassification(index, 'minAxles', parseInt(e.target.value) || 0)}
                        className="text-base h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`maxAxles-${index}`} className="text-sm">Max Axles *</Label>
                      <Input
                        id={`maxAxles-${index}`}
                        type="number"
                        value={classification.maxAxles}
                        onChange={(e) => updateClassification(index, 'maxAxles', parseInt(e.target.value) || 0)}
                        className="text-base h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`minWeight-${index}`} className="text-sm">Min Weight (kg) *</Label>
                      <Input
                        id={`minWeight-${index}`}
                        type="number"
                        value={classification.minWeight}
                        onChange={(e) => updateClassification(index, 'minWeight', parseInt(e.target.value) || 0)}
                        className="text-base h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`maxWeight-${index}`} className="text-sm">Max Weight (kg) *</Label>
                      <Input
                        id={`maxWeight-${index}`}
                        type="number"
                        value={classification.maxWeight}
                        onChange={(e) => updateClassification(index, 'maxWeight', parseInt(e.target.value) || 0)}
                        className="text-base h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description-${index}`} className="text-sm">Description</Label>
                    <Input
                      id={`description-${index}`}
                      value={classification.description}
                      onChange={(e) => updateClassification(index, 'description', e.target.value)}
                      placeholder="e.g., Heavy cargo trucks with 3 axles"
                      className="text-base h-10"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        <SheetFooter className="border-t border-border bg-background px-6 py-4">
          <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateClassifications}>Save Changes</Button>
        </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
