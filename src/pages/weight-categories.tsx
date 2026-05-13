import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Scale, Edit, Plus, Trash2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

// Mock weight categories data
const mockCategories = [
  {
    id: "cat-001",
    name: "Light Weight",
    description: "Light vehicles and small cargo",
    minWeight: 0,
    maxWeight: 3500,
    category: "Light",
    active: true,
    createdAt: "2026-01-01"
  },
  {
    id: "cat-002",
    name: "Medium Weight",
    description: "Medium cargo vehicles",
    minWeight: 3501,
    maxWeight: 12000,
    category: "Medium",
    active: true,
    createdAt: "2026-01-01"
  },
  {
    id: "cat-003",
    name: "Restricted Heavy",
    description: "Heavy vehicles requiring special permits",
    minWeight: 12001,
    maxWeight: 48000,
    category: "Restricted Heavy",
    active: true,
    createdAt: "2026-01-01"
  },
  {
    id: "cat-004",
    name: "Out of Scope",
    description: "Vehicles exceeding municipal limits",
    minWeight: 48001,
    maxWeight: 999999,
    category: "Out of Scope",
    active: true,
    createdAt: "2026-01-01"
  }
]

interface WeightCategory {
  id: string
  name: string
  description: string
  minWeight: number
  maxWeight: number
  category: string
  active: boolean
  createdAt: string
}

export function WeightCategoriesPage() {
  const [categories, setCategories] = useState<WeightCategory[]>(mockCategories)
  const [selectedCategory, setSelectedCategory] = useState<WeightCategory | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    minWeight: 0,
    maxWeight: 0,
    category: "Medium"
  })

  const categoryTypes = ["Light", "Medium", "Restricted Heavy", "Out of Scope"]

  const handleCreateCategory = () => {
    const newCategory: WeightCategory = {
      id: `cat-${categories.length + 1}`.padStart(7, '0'),
      name: categoryForm.name,
      description: categoryForm.description,
      minWeight: categoryForm.minWeight,
      maxWeight: categoryForm.maxWeight,
      category: categoryForm.category,
      active: false,
      createdAt: new Date().toISOString().split('T')[0]
    }
    setCategories([...categories, newCategory])
    setIsCreateOpen(false)
    setCategoryForm({ name: "", description: "", minWeight: 0, maxWeight: 0, category: "Medium" })
    toast.success("Weight category created successfully")
  }

  const handleUpdateCategory = () => {
    if (!selectedCategory) return
    setCategories(categories.map(c => 
      c.id === selectedCategory.id 
        ? { 
            ...c, 
            name: categoryForm.name,
            description: categoryForm.description,
            minWeight: categoryForm.minWeight,
            maxWeight: categoryForm.maxWeight,
            category: categoryForm.category
          }
        : c
    ))
    setIsEditOpen(false)
    setSelectedCategory(null)
    toast.success("Weight category updated successfully")
  }

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (category?.active) {
      toast.error("Cannot delete active weight category")
      return
    }
    setCategories(categories.filter(c => c.id !== categoryId))
    toast.success("Weight category deleted")
  }

  const handleToggleActive = (categoryId: string) => {
    setCategories(categories.map(c => 
      c.id === categoryId ? { ...c, active: !c.active } : c
    ))
    const category = categories.find(c => c.id === categoryId)
    toast.success(`Category ${category?.active ? 'deactivated' : 'activated'}`)
  }

  const handleEditClick = (category: WeightCategory) => {
    setSelectedCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description,
      minWeight: category.minWeight,
      maxWeight: category.maxWeight,
      category: category.category
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
          <h1 className="text-4xl font-semibold text-foreground">Weight Categories</h1>
          <p className="text-lg text-muted-foreground">Manage vehicle weight classification bands</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Category
        </Button>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Weight Categories</CardTitle>
          <CardDescription className="text-base">
            Configure weight bands for vehicle categorization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Category Name</TableHead>
                <TableHead className="text-base">Weight Range (kg)</TableHead>
                <TableHead className="text-base">Category Type</TableHead>
                <TableHead className="text-base">Status</TableHead>
                <TableHead className="text-right text-base">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium text-base">{category.name}</TableCell>
                  <TableCell className="text-base">
                    {category.minWeight.toLocaleString()} - {category.maxWeight.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.category}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(category.active)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={category.active ? "outline" : "default"}
                        onClick={() => handleToggleActive(category.id)}
                      >
                        {category.active ? "Deactivate" : "Activate"}
                      </Button>
                      {!category.active && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Category Modal */}
      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen} className="w-full max-w-2xl">
        <ModalHeader onClose={() => setIsCreateOpen(false)}>
          <ModalTitle>Create Weight Category</ModalTitle>
          <ModalDescription>Define a new weight classification band</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Category Name *</Label>
              <Input
                id="name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g., Medium Weight"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Input
                id="description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="e.g., Medium cargo vehicles"
                className="text-base h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minWeight" className="text-base">Min Weight (kg) *</Label>
                <Input
                  id="minWeight"
                  type="number"
                  value={categoryForm.minWeight}
                  onChange={(e) => setCategoryForm({ ...categoryForm, minWeight: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 3501"
                  className="text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxWeight" className="text-base">Max Weight (kg) *</Label>
                <Input
                  id="maxWeight"
                  type="number"
                  value={categoryForm.maxWeight}
                  onChange={(e) => setCategoryForm({ ...categoryForm, maxWeight: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 12000"
                  className="text-base h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Category Type *</Label>
              <div className="grid grid-cols-2 gap-2">
                {categoryTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, category: type })}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                      categoryForm.category === type
                        ? "border-[#5B8C5A] bg-[#5B8C5A]/10 text-[#5B8C5A]"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold text-sm">{type}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCategory}>Create Category</Button>
        </ModalFooter>
      </Modal>

      {/* Edit Category Modal */}
      <Modal open={isEditOpen} onOpenChange={setIsEditOpen} className="w-full max-w-2xl">
        <ModalHeader onClose={() => setIsEditOpen(false)}>
          <ModalTitle>Edit Weight Category</ModalTitle>
          <ModalDescription>Update weight classification band</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-base">Category Name *</Label>
              <Input
                id="edit-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g., Medium Weight"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-base">Description</Label>
              <Input
                id="edit-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="e.g., Medium cargo vehicles"
                className="text-base h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-minWeight" className="text-base">Min Weight (kg) *</Label>
                <Input
                  id="edit-minWeight"
                  type="number"
                  value={categoryForm.minWeight}
                  onChange={(e) => setCategoryForm({ ...categoryForm, minWeight: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 3501"
                  className="text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-maxWeight" className="text-base">Max Weight (kg) *</Label>
                <Input
                  id="edit-maxWeight"
                  type="number"
                  value={categoryForm.maxWeight}
                  onChange={(e) => setCategoryForm({ ...categoryForm, maxWeight: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 12000"
                  className="text-base h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Category Type *</Label>
              <div className="grid grid-cols-2 gap-2">
                {categoryTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, category: type })}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                      categoryForm.category === type
                        ? "border-[#5B8C5A] bg-[#5B8C5A]/10 text-[#5B8C5A]"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold text-sm">{type}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateCategory}>Save Changes</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
