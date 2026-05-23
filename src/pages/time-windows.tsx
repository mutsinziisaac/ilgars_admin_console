import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Edit, Plus, Trash2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

// Mock time windows data
const mockTimeWindows = [
  {
    id: "tw-001",
    name: "Night Shift Restriction",
    description: "Heavy vehicle restriction during night hours",
    startTime: "22:00",
    endTime: "06:00",
    daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    restrictionType: "Heavy Vehicles Only",
    active: true,
    createdAt: "2026-01-01"
  },
  {
    id: "tw-002",
    name: "Peak Hour Restriction",
    description: "Morning rush hour restrictions",
    startTime: "07:00",
    endTime: "09:00",
    daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    restrictionType: "All Commercial Vehicles",
    active: true,
    createdAt: "2026-01-01"
  },
  {
    id: "tw-003",
    name: "Evening Peak Restriction",
    description: "Evening rush hour restrictions",
    startTime: "17:00",
    endTime: "19:00",
    daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    restrictionType: "All Commercial Vehicles",
    active: true,
    createdAt: "2026-01-01"
  },
  {
    id: "tw-004",
    name: "Weekend Delivery Window",
    description: "Permitted delivery hours on weekends",
    startTime: "08:00",
    endTime: "18:00",
    daysOfWeek: ["Saturday", "Sunday"],
    restrictionType: "Delivery Vehicles Permitted",
    active: false,
    createdAt: "2026-02-15"
  }
]

interface TimeWindow {
  id: string
  name: string
  description: string
  startTime: string
  endTime: string
  daysOfWeek: string[]
  restrictionType: string
  active: boolean
  createdAt: string
}

export function TimeWindowsPage() {
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>(mockTimeWindows)
  const [selectedWindow, setSelectedWindow] = useState<TimeWindow | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const [windowForm, setWindowForm] = useState({
    name: "",
    description: "",
    startTime: "00:00",
    endTime: "00:00",
    daysOfWeek: [] as string[],
    restrictionType: "Heavy Vehicles Only"
  })

  const restrictionTypes = ["Heavy Vehicles Only", "All Commercial Vehicles", "Delivery Vehicles Permitted", "No Restrictions"]
  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const handleCreateWindow = () => {
    const newWindow: TimeWindow = {
      id: `tw-${timeWindows.length + 1}`.padStart(7, '0'),
      name: windowForm.name,
      description: windowForm.description,
      startTime: windowForm.startTime,
      endTime: windowForm.endTime,
      daysOfWeek: windowForm.daysOfWeek,
      restrictionType: windowForm.restrictionType,
      active: false,
      createdAt: new Date().toISOString().split('T')[0]
    }
    setTimeWindows([...timeWindows, newWindow])
    setIsCreateOpen(false)
    setWindowForm({ name: "", description: "", startTime: "00:00", endTime: "00:00", daysOfWeek: [], restrictionType: "Heavy Vehicles Only" })
    toast.success("Time window created successfully")
  }

  const handleUpdateWindow = () => {
    if (!selectedWindow) return
    setTimeWindows(timeWindows.map(w => 
      w.id === selectedWindow.id 
        ? { 
            ...w, 
            name: windowForm.name,
            description: windowForm.description,
            startTime: windowForm.startTime,
            endTime: windowForm.endTime,
            daysOfWeek: windowForm.daysOfWeek,
            restrictionType: windowForm.restrictionType
          }
        : w
    ))
    setIsEditOpen(false)
    setSelectedWindow(null)
    toast.success("Time window updated successfully")
  }

  const handleDeleteWindow = (windowId: string) => {
    const window = timeWindows.find(w => w.id === windowId)
    if (window?.active) {
      toast.error("Cannot delete active time window")
      return
    }
    setTimeWindows(timeWindows.filter(w => w.id !== windowId))
    toast.success("Time window deleted")
  }

  const handleToggleActive = (windowId: string) => {
    setTimeWindows(timeWindows.map(w => 
      w.id === windowId ? { ...w, active: !w.active } : w
    ))
    const window = timeWindows.find(w => w.id === windowId)
    toast.success(`Time window ${window?.active ? 'deactivated' : 'activated'}`)
  }

  const handleEditClick = (window: TimeWindow) => {
    setSelectedWindow(window)
    setWindowForm({
      name: window.name,
      description: window.description,
      startTime: window.startTime,
      endTime: window.endTime,
      daysOfWeek: [...window.daysOfWeek],
      restrictionType: window.restrictionType
    })
    setIsEditOpen(true)
  }

  const toggleDay = (day: string) => {
    const newDays = windowForm.daysOfWeek.includes(day)
      ? windowForm.daysOfWeek.filter(d => d !== day)
      : [...windowForm.daysOfWeek, day]
    setWindowForm({ ...windowForm, daysOfWeek: newDays })
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
          <h1 className="text-4xl font-semibold text-foreground">Time Windows</h1>
          <p className="text-lg text-muted-foreground">Configure operational time windows and restrictions</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Time Window
        </Button>
      </div>

      {/* Time Windows Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Time Windows</CardTitle>
          <CardDescription className="text-base">
            Manage time-based access restrictions and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Window Name</TableHead>
                <TableHead className="text-base">Time Range</TableHead>
                <TableHead className="text-base">Days</TableHead>
                <TableHead className="text-base">Restriction Type</TableHead>
                <TableHead className="text-base">Status</TableHead>
                <TableHead className="text-right text-base">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeWindows.map((window) => (
                <TableRow key={window.id}>
                  <TableCell className="font-medium text-base">{window.name}</TableCell>
                  <TableCell className="text-base">{window.startTime} - {window.endTime}</TableCell>
                  <TableCell className="text-base text-sm">
                    {window.daysOfWeek.length === 7 ? "All Days" : window.daysOfWeek.join(", ")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{window.restrictionType}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(window.active)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(window)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={window.active ? "outline" : "default"}
                        onClick={() => handleToggleActive(window.id)}
                      >
                        {window.active ? "Deactivate" : "Activate"}
                      </Button>
                      {!window.active && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteWindow(window.id)}
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

      {/* Create Time Window Modal */}
      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen} className="w-full max-w-3xl">
        <ModalHeader onClose={() => setIsCreateOpen(false)}>
          <ModalTitle>Create Time Window</ModalTitle>
          <ModalDescription>Define a new time-based restriction or permission</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Window Name *</Label>
              <Input
                id="name"
                value={windowForm.name}
                onChange={(e) => setWindowForm({ ...windowForm, name: e.target.value })}
                placeholder="e.g., Night Shift Restriction"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Input
                id="description"
                value={windowForm.description}
                onChange={(e) => setWindowForm({ ...windowForm, description: e.target.value })}
                placeholder="e.g., Heavy vehicle restriction during night hours"
                className="text-base h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-base">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={windowForm.startTime}
                  onChange={(e) => setWindowForm({ ...windowForm, startTime: e.target.value })}
                  className="text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-base">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={windowForm.endTime}
                  onChange={(e) => setWindowForm({ ...windowForm, endTime: e.target.value })}
                  className="text-base h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Days of Week *</Label>
              <div className="grid grid-cols-4 gap-2">
                {allDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-2 rounded-lg border-2 transition-colors text-sm ${
                      windowForm.daysOfWeek.includes(day)
                        ? "border-[#5B8C5A] bg-[#5B8C5A]/10 text-[#5B8C5A]"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Restriction Type *</Label>
              <div className="grid grid-cols-2 gap-2">
                {restrictionTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setWindowForm({ ...windowForm, restrictionType: type })}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors text-left ${
                      windowForm.restrictionType === type
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
          <Button onClick={handleCreateWindow}>Create Window</Button>
        </ModalFooter>
      </Modal>

      {/* Edit Time Window Modal */}
      <Modal open={isEditOpen} onOpenChange={setIsEditOpen} className="w-full max-w-3xl">
        <ModalHeader onClose={() => setIsEditOpen(false)}>
          <ModalTitle>Edit Time Window</ModalTitle>
          <ModalDescription>Update time-based restriction or permission</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-base">Window Name *</Label>
              <Input
                id="edit-name"
                value={windowForm.name}
                onChange={(e) => setWindowForm({ ...windowForm, name: e.target.value })}
                placeholder="e.g., Night Shift Restriction"
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-base">Description</Label>
              <Input
                id="edit-description"
                value={windowForm.description}
                onChange={(e) => setWindowForm({ ...windowForm, description: e.target.value })}
                placeholder="e.g., Heavy vehicle restriction during night hours"
                className="text-base h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startTime" className="text-base">Start Time *</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={windowForm.startTime}
                  onChange={(e) => setWindowForm({ ...windowForm, startTime: e.target.value })}
                  className="text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-endTime" className="text-base">End Time *</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={windowForm.endTime}
                  onChange={(e) => setWindowForm({ ...windowForm, endTime: e.target.value })}
                  className="text-base h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Days of Week *</Label>
              <div className="grid grid-cols-4 gap-2">
                {allDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-2 rounded-lg border-2 transition-colors text-sm ${
                      windowForm.daysOfWeek.includes(day)
                        ? "border-[#5B8C5A] bg-[#5B8C5A]/10 text-[#5B8C5A]"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Restriction Type *</Label>
              <div className="grid grid-cols-2 gap-2">
                {restrictionTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setWindowForm({ ...windowForm, restrictionType: type })}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors text-left ${
                      windowForm.restrictionType === type
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
          <Button onClick={handleUpdateWindow}>Save Changes</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
