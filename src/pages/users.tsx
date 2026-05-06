import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { toast } from "sonner"

// Mock user data
const mockUsers = [
  { id: 1, name: "João Silva", email: "joao@maputo.gov.mz", role: "Admin", status: "Active" },
  { id: 2, name: "Maria Santos", email: "maria@maputo.gov.mz", role: "Officer", status: "Active" },
  { id: 3, name: "Pedro Costa", email: "pedro@maputo.gov.mz", role: "Officer", status: "Inactive" },
  { id: 4, name: "Ana Ferreira", email: "ana@maputo.gov.mz", role: "Viewer", status: "Active" },
]

export function UsersPage() {
  const [users, setUsers] = useState(mockUsers)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    notes: ""
  })

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle add user
  const handleAddUser = () => {
    const newUser = {
      id: users.length + 1,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: "Active"
    }
    setUsers([...users, newUser])
    setIsAddDialogOpen(false)
    setFormData({ name: "", email: "", role: "", notes: "" })
    toast.success("User added successfully!", {
      description: `${formData.name} has been added to the system.`
    })
  }

  // Handle edit user
  const handleEditUser = () => {
    if (!selectedUser) return
    
    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, name: formData.name, email: formData.email, role: formData.role }
        : user
    ))
    setIsEditDialogOpen(false)
    setSelectedUser(null)
    setFormData({ name: "", email: "", role: "", notes: "" })
    toast.success("User updated successfully!", {
      description: `${formData.name}'s information has been updated.`
    })
  }

  // Handle delete user
  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId)
    setUsers(users.filter(u => u.id !== userId))
    toast.error("User deleted", {
      description: `${user?.name} has been removed from the system.`
    })
  }

  // Open edit dialog
  const openEditDialog = (user: typeof mockUsers[0]) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      notes: ""
    })
    setIsEditDialogOpen(true)
  }

  // Simulate loading
  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.info("Data refreshed", {
        description: "User list has been updated."
      })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-foreground">User Management</h1>
          <p className="text-lg text-muted-foreground">Manage system users and their permissions</p>
        </div>
        
        {/* Add User Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 text-base h-11 px-6">
              <Plus className="h-5 w-5" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="text-base">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add New User</DialogTitle>
              <DialogDescription className="text-base">
                Create a new user account. Fill in all required fields.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-base h-11"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@maputo.gov.mz"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-base h-11"
                />
              </div>

              {/* Role Select */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-base">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="text-base h-11">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="text-base">
                    <SelectItem value="Admin" className="text-base">Admin</SelectItem>
                    <SelectItem value="Officer" className="text-base">Officer</SelectItem>
                    <SelectItem value="Viewer" className="text-base">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes Textarea */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="text-base"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="text-base h-11 px-6">
                Cancel
              </Button>
              <Button onClick={handleAddUser} disabled={!formData.name || !formData.email || !formData.role} className="text-base h-11 px-6">
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Users</CardTitle>
              <CardDescription className="text-base">A list of all users in the system</CardDescription>
            </div>
            <Button variant="outline" onClick={handleRefresh} className="text-base h-11 px-6">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 text-base h-12"
              />
            </div>
          </div>

          {/* Data Table with Loading State */}
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredUsers.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No users found</h3>
              <p className="text-base text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search query" : "Get started by adding your first user"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="text-base h-11 px-6">
                  <Plus className="h-5 w-5 mr-2" />
                  Add User
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Name</TableHead>
                  <TableHead className="text-base">Email</TableHead>
                  <TableHead className="text-base">Role</TableHead>
                  <TableHead className="text-base">Status</TableHead>
                  <TableHead className="text-right text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-base">{user.name}</TableCell>
                    <TableCell className="text-base">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "Admin" ? "default" : "secondary"} className="text-sm px-3 py-1">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "Active" ? "default" : "secondary"} className="text-sm px-3 py-1">
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(user)}
                          className="h-10 w-10"
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        
                        {/* Delete Confirmation Dialog */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                              <Trash2 className="h-5 w-5 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="text-base">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-2xl">Delete User</AlertDialogTitle>
                              <AlertDialogDescription className="text-base">
                                Are you sure you want to delete <strong>{user.name}</strong>? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="text-base h-11 px-6">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-base h-11 px-6"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="text-base">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit User</DialogTitle>
            <DialogDescription className="text-base">
              Update user information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-base">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-base">Email Address *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-base">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="text-base h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="Admin" className="text-base">Admin</SelectItem>
                  <SelectItem value="Officer" className="text-base">Officer</SelectItem>
                  <SelectItem value="Viewer" className="text-base">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="text-base h-11 px-6">
              Cancel
            </Button>
            <Button onClick={handleEditUser} className="text-base h-11 px-6">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
