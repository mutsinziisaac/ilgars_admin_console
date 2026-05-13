import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { AlertCircle, Edit, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

// Mock fines configuration data
const mockFines = {
  id: "fines-001",
  lastUpdated: "2026-04-01",
  updatedBy: "Municipal Council",
  fines: [
    { violationType: "Overweight - 0-10%", fineAmount: 5000, description: "Vehicle exceeds permitted weight by up to 10%" },
    { violationType: "Overweight - 11-20%", fineAmount: 10000, description: "Vehicle exceeds permitted weight by 11-20%" },
    { violationType: "Overweight - 21-30%", fineAmount: 20000, description: "Vehicle exceeds permitted weight by 21-30%" },
    { violationType: "Overweight - Over 30%", fineAmount: 50000, description: "Vehicle exceeds permitted weight by more than 30%" },
    { violationType: "No Circulation Licence", fineAmount: 15000, description: "Operating without valid circulation licence" },
    { violationType: "Expired Circulation Licence", fineAmount: 8000, description: "Operating with expired circulation licence" },
    { violationType: "Unauthorized Route", fineAmount: 12000, description: "Operating on unauthorized routes" },
    { violationType: "Time Restriction Violation", fineAmount: 7000, description: "Operating outside permitted time windows" },
    { violationType: "No Road Closure Permit", fineAmount: 25000, description: "Road closure without valid permit" },
    { violationType: "Permit Condition Violation", fineAmount: 10000, description: "Violating conditions of issued permit" }
  ]
}

interface Fine {
  violationType: string
  fineAmount: number
  description: string
}

export function FinesConfigurationPage() {
  const [finesData, setFinesData] = useState(mockFines)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingFines, setEditingFines] = useState<Fine[]>([])
  
  const [fineForm, setFineForm] = useState({
    violationType: "",
    fineAmount: 0,
    description: ""
  })

  const handleCreateFine = () => {
    const newFine: Fine = {
      violationType: fineForm.violationType,
      fineAmount: fineForm.fineAmount,
      description: fineForm.description
    }
    setFinesData({
      ...finesData,
      fines: [...finesData.fines, newFine],
      lastUpdated: new Date().toISOString().split('T')[0],
      updatedBy: "Joana Macavel"
    })
    setIsCreateOpen(false)
    setFineForm({ violationType: "", fineAmount: 0, description: "" })
    toast.success("Fine created successfully")
  }

  const handleDeleteFine = (index: number) => {
    setFinesData({
      ...finesData,
      fines: finesData.fines.filter((_, i) => i !== index),
      lastUpdated: new Date().toISOString().split('T')[0],
      updatedBy: "Joana Macavel"
    })
    toast.success("Fine deleted successfully")
  }

  const handleEditClick = () => {
    setEditingFines([...finesData.fines])
    setIsEditOpen(true)
  }

  const handleUpdateFines = () => {
    setFinesData({
      ...finesData,
      fines: editingFines,
      lastUpdated: new Date().toISOString().split('T')[0],
      updatedBy: "Joana Macavel"
    })
    setIsEditOpen(false)
    toast.success("Fines configuration updated successfully")
  }

  const updateFineAmount = (index: number, value: string) => {
    const newFines = [...editingFines]
    newFines[index].fineAmount = parseFloat(value) || 0
    setEditingFines(newFines)
  }

  const handleAddFine = () => {
    const newFine: Fine = {
      violationType: "New Violation Type",
      fineAmount: 0,
      description: "Description of violation"
    }
    setEditingFines([...editingFines, newFine])
  }

  const handleRemoveFine = (index: number) => {
    setEditingFines(editingFines.filter((_, i) => i !== index))
  }

  const updateFineField = (index: number, field: keyof Fine, value: string | number) => {
    const newFines = [...editingFines]
    newFines[index] = { ...newFines[index], [field]: value }
    setEditingFines(newFines)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">Fines Configuration</h1>
          <p className="text-lg text-muted-foreground">Configure violation fines and penalties</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Fine
          </Button>
          <Button variant="outline" onClick={handleEditClick}>
            <Edit className="h-4 w-4 mr-2" />
            Edit All
          </Button>
        </div>
      </div>

      {/* Fines Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Violation Fines</CardTitle>
          <CardDescription className="text-base">
            Fine amounts (MZN) for various violation types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Violation Type</TableHead>
                <TableHead className="text-base">Description</TableHead>
                <TableHead className="text-base text-right">Fine Amount (MZN)</TableHead>
                <TableHead className="text-right text-base">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finesData.fines.map((fine, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-base">{fine.violationType}</TableCell>
                  <TableCell className="text-base">{fine.description}</TableCell>
                  <TableCell className="text-base text-right font-semibold">
                    {fine.fineAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteFine(index)}
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
              Last updated: {finesData.lastUpdated} by {finesData.updatedBy}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Fine Modal */}
      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen} className="w-full max-w-2xl">
        <ModalHeader onClose={() => setIsCreateOpen(false)}>
          <ModalTitle>Create Fine</ModalTitle>
          <ModalDescription>Add a new violation fine type</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="violationType" className="text-base">Violation Type *</Label>
              <Input
                id="violationType"
                value={fineForm.violationType}
                onChange={(e) => setFineForm({ ...fineForm, violationType: e.target.value })}
                placeholder="e.g., Overweight - 0-10%"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Input
                id="description"
                value={fineForm.description}
                onChange={(e) => setFineForm({ ...fineForm, description: e.target.value })}
                placeholder="e.g., Vehicle exceeds permitted weight by up to 10%"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fineAmount" className="text-base">Fine Amount (MZN) *</Label>
              <Input
                id="fineAmount"
                type="number"
                value={fineForm.fineAmount}
                onChange={(e) => setFineForm({ ...fineForm, fineAmount: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 5000"
                className="text-base h-11"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFine}>Create Fine</Button>
        </ModalFooter>
      </Modal>

      {/* Edit Fines Modal */}
      <Modal open={isEditOpen} onOpenChange={setIsEditOpen} className="w-full max-w-4xl">
        <ModalHeader onClose={() => setIsEditOpen(false)}>
          <ModalTitle>Edit Fines Configuration</ModalTitle>
          <ModalDescription>Update fine amounts for violation types</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Fine Entries</Label>
              <Button size="sm" onClick={handleAddFine}>
                <Plus className="h-4 w-4 mr-2" />
                Add Fine
              </Button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {editingFines.map((fine, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Fine #{index + 1}</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveFine(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`violationType-${index}`} className="text-sm">Violation Type *</Label>
                    <Input
                      id={`violationType-${index}`}
                      value={fine.violationType}
                      onChange={(e) => updateFineField(index, 'violationType', e.target.value)}
                      placeholder="e.g., Overweight - 0-10%"
                      className="text-base h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description-${index}`} className="text-sm">Description</Label>
                    <Input
                      id={`description-${index}`}
                      value={fine.description}
                      onChange={(e) => updateFineField(index, 'description', e.target.value)}
                      placeholder="e.g., Vehicle exceeds permitted weight by up to 10%"
                      className="text-base h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`fineAmount-${index}`} className="text-sm">Fine Amount (MZN) *</Label>
                    <Input
                      id={`fineAmount-${index}`}
                      type="number"
                      value={fine.fineAmount}
                      onChange={(e) => updateFineField(index, 'fineAmount', parseFloat(e.target.value) || 0)}
                      placeholder="e.g., 5000"
                      className="text-base h-10"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Important</p>
                  <p className="text-sm text-amber-800 mt-1">
                    Updated fines will apply to all new violations immediately. Existing unpaid fines 
                    will retain their original amounts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateFines}>Save Changes</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
