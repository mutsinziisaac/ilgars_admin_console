import { useMemo, useState, type FormEvent } from "react"
import {
  Check,
  ChevronLeft,
  Copy,
  Download,
  Eye,
  Grid3X3,
  Import,
  List,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  UserX,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatRoleLabel, type IlgarsPermission, type IlgarsRole } from "@/lib/auth/authorization"

interface RoleDefinition {
  id: IlgarsRole
  permissions: IlgarsPermission[]
  color: string
  memberCount?: number
  system?: boolean
  description?: string
  accentClass?: string
}

interface StaffMember {
  id: string
  initials: string
  name: string
  email: string
  department: string
  status: "Active" | "Review"
  roles: IlgarsRole[]
}

interface StaffFormState {
  firstName: string
  lastName: string
  email: string
  department: string
  status: StaffMember["status"]
  roles: IlgarsRole[]
}

interface RoleFormState {
  name: string
  description: string
  permissions: IlgarsPermission[]
}

const roles: RoleDefinition[] = [
  {
    id: "municipality-admin",
    permissions: [
      "dashboard:read",
      "transactions:read",
      "vehicles:read",
      "permits:read",
      "permits:approve",
      "violations:read",
      "violations:manage",
      "devices:read",
      "devices:assign",
      "reports:read",
      "configuration:read",
      "configuration:manage",
    ],
    color: "from-[#203B2B] to-[#315C46]",
    memberCount: 0,
    system: true,
    description: "Municipality administration role",
    accentClass: "border-t-[#315C46]/30",
  },
  {
    id: "revenue-officer",
    permissions: ["dashboard:read", "transactions:read", "vehicles:read", "permits:read", "reports:read"],
    color: "from-[#A77B18] to-[#DAA22A]",
    memberCount: 2,
    system: true,
    description: "Revenue operations role",
    accentClass: "border-t-[#A77B18]/30",
  },
  {
    id: "enforcement-officer",
    permissions: ["dashboard:read", "vehicles:read", "violations:read", "violations:manage", "devices:read"],
    color: "from-[#6B2C1C] to-[#7E3F2B]",
    memberCount: 1,
    system: true,
    description: "Enforcement operations role",
    accentClass: "border-t-[#6B2C1C]/30",
  },
  {
    id: "permit-officer",
    permissions: ["dashboard:read", "vehicles:read", "permits:read", "permits:approve", "reports:read"],
    color: "from-[#2E5873] to-[#376B8A]",
    memberCount: 1,
    system: true,
    description: "Permit review and approval role",
    accentClass: "border-t-[#2E5873]/30",
  },
  {
    id: "device-operator",
    permissions: ["dashboard:read", "vehicles:read", "devices:read", "devices:assign"],
    color: "from-[#3F4D62] to-[#50617A]",
    memberCount: 0,
    system: true,
    description: "Device operations role",
    accentClass: "border-t-[#3F4D62]/30",
  },
  {
    id: "report-viewer",
    permissions: ["dashboard:read", "reports:read"],
    color: "from-[#5A5248] to-[#6B6255]",
    memberCount: 0,
    system: true,
    description: "Reporting access role",
    accentClass: "border-t-[#5A5248]/30",
  },
]

const initialStaff: StaffMember[] = [
  {
    id: "USR-001",
    initials: "JM",
    name: "Joana Macavel",
    email: "joana.macavel@maputo.gov.mz",
    department: "Revenue",
    status: "Active",
    roles: ["revenue-officer"],
  },
  {
    id: "USR-002",
    initials: "MC",
    name: "Mateus Cambaza",
    email: "mateus.cambaza@maputo.gov.mz",
    department: "Enforcement",
    status: "Active",
    roles: ["enforcement-officer"],
  },
  {
    id: "USR-003",
    initials: "AL",
    name: "Amina Langa",
    email: "amina.langa@maputo.gov.mz",
    department: "Permits",
    status: "Review",
    roles: ["permit-officer"],
  },
  {
    id: "USR-004",
    initials: "CM",
    name: "Carlos Mucavel",
    email: "carlos.mucavel@maputo.gov.mz",
    department: "Administration",
    status: "Active",
    roles: ["municipality-admin"],
  },
]

const emptyStaffForm: StaffFormState = {
  firstName: "",
  lastName: "",
  email: "",
  department: "",
  status: "Active",
  roles: [],
}

const emptyRoleForm: RoleFormState = {
  name: "",
  description: "",
  permissions: [],
}

const availablePermissions: Array<{ id: IlgarsPermission; label: string; group: string }> = [
  { id: "dashboard:read", label: "View dashboards", group: "Dashboard" },
  { id: "transactions:read", label: "Read transaction records", group: "Transactions" },
  { id: "vehicles:read", label: "Read vehicle records", group: "Vehicles" },
  { id: "permits:read", label: "Review permit requests", group: "Permits" },
  { id: "permits:approve", label: "Approve permit requests", group: "Permits" },
  { id: "violations:read", label: "Read violation queues", group: "Violations" },
  { id: "violations:manage", label: "Manage violations", group: "Violations" },
  { id: "devices:read", label: "View device registry", group: "Devices" },
  { id: "devices:assign", label: "Assign GPS devices", group: "Devices" },
  { id: "reports:read", label: "Generate reports", group: "Reports" },
  { id: "configuration:read", label: "Read configuration", group: "Configuration" },
  { id: "configuration:manage", label: "Manage configuration", group: "Configuration" },
]

const roleDescriptions: Record<IlgarsRole, string> = {
  "ilgars-admin": "Full ILGARS platform administration and configuration access.",
  "municipality-admin": "Controls municipality setup, platform configuration, and operational oversight.",
  "revenue-officer": "Reviews revenue activity, permit payments, transaction history, and reports.",
  "enforcement-officer": "Manages enforcement queues, vehicle checks, violation records, and field devices.",
  "permit-officer": "Reviews permit requests, approves applications, and monitors permit records.",
  "device-operator": "Views device inventory and assigns GPS or camera equipment to field workflows.",
  "report-viewer": "Reads dashboards and operational reports without write-level access.",
}

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

interface RolesManagementPageProps {
  view?: "staff" | "roles" | "create-role"
  onManageRoles?: () => void
  onCreateRole?: () => void
}

export function RolesManagementPage({ view = "staff", onManageRoles, onCreateRole }: RolesManagementPageProps) {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff)
  const [, setSelectedStaffId] = useState(initialStaff[0].id)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleSearchQuery, setRoleSearchQuery] = useState("")
  const [roleTypeFilter, setRoleTypeFilter] = useState<"all" | "system" | "custom">("all")
  const [roleSortOrder, setRoleSortOrder] = useState<"name-asc" | "name-desc" | "permissions-desc">("name-asc")
  const [roleViewMode, setRoleViewMode] = useState<"grid" | "list">("grid")
  const [staffSheetOpen, setStaffSheetOpen] = useState(false)
  const [viewRole, setViewRole] = useState<RoleDefinition | null>(null)
  const [staffForm, setStaffForm] = useState<StaffFormState>(emptyStaffForm)
  const [roleForm, setRoleForm] = useState<RoleFormState>(emptyRoleForm)

  const activeStaffCount = useMemo(() => staff.filter((member) => member.status === "Active").length, [staff])
  const reviewStaffCount = staff.length - activeStaffCount
  const totalPermissionAssignments = useMemo(
    () => roles.reduce((total, role) => total + role.permissions.length, 0),
    [],
  )
  const customRoleCount = useMemo(() => roles.filter((role) => !role.system).length, [])

  const filteredStaff = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return staff

    return staff.filter((member) =>
      [member.name, member.email, member.department, member.roles.map(formatRoleLabel).join(" ")].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [searchQuery, staff])

  const filteredRoles = useMemo(() => {
    const query = roleSearchQuery.trim().toLowerCase()

    return roles
      .filter((role) => {
        if (roleTypeFilter === "system" && !role.system) return false
        if (roleTypeFilter === "custom" && role.system) return false

        if (!query) return true
        return [formatRoleLabel(role.id), role.description ?? "", role.id].some((value) =>
          value.toLowerCase().includes(query),
        )
      })
      .sort((a, b) => {
        if (roleSortOrder === "name-desc") {
          return formatRoleLabel(b.id).localeCompare(formatRoleLabel(a.id))
        }

        if (roleSortOrder === "permissions-desc") {
          return b.permissions.length - a.permissions.length
        }

        return formatRoleLabel(a.id).localeCompare(formatRoleLabel(b.id))
      })
  }, [roleSearchQuery, roleSortOrder, roleTypeFilter])

  const toggleFormRole = (roleId: IlgarsRole) => {
    setStaffForm((current) => {
      const hasRole = current.roles.includes(roleId)
      return {
        ...current,
        roles: hasRole ? current.roles.filter((role) => role !== roleId) : [...current.roles, roleId],
      }
    })
  }

  const toggleRoleFormPermission = (permission: IlgarsPermission) => {
    setRoleForm((current) => {
      const hasPermission = current.permissions.includes(permission)
      return {
        ...current,
        permissions: hasPermission
          ? current.permissions.filter((item) => item !== permission)
          : [...current.permissions, permission],
      }
    })
  }

  const handleAddStaff = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextStaff: StaffMember = {
      id: `USR-${String(staff.length + 1).padStart(3, "0")}`,
      initials: getInitials(staffForm.firstName, staffForm.lastName),
      name: `${staffForm.firstName.trim()} ${staffForm.lastName.trim()}`.trim(),
      email: staffForm.email.trim(),
      department: staffForm.department.trim(),
      status: staffForm.status,
      roles: staffForm.roles,
    }

    setStaff((current) => [nextStaff, ...current])
    setSelectedStaffId(nextStaff.id)
    setStaffForm(emptyStaffForm)
    setStaffSheetOpen(false)
  }

  const handleCreateRole = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRoleForm(emptyRoleForm)
    onManageRoles?.()
  }

  const handleDuplicateRole = (role: RoleDefinition) => {
    setRoleForm({
      name: `${formatRoleLabel(role.id)} Copy`,
      description: role.description ?? roleDescriptions[role.id],
      permissions: [...role.permissions],
    })
    onCreateRole?.()
  }

  const handleEditRole = (role: RoleDefinition) => {
    setRoleForm({
      name: formatRoleLabel(role.id),
      description: role.description ?? roleDescriptions[role.id],
      permissions: [...role.permissions],
    })
    onCreateRole?.()
  }

  return (
    <div className="-m-6 min-h-screen bg-[#F4F6F8] text-[#111827]">
      <div className="border-b border-zinc-200 bg-white">
        <div className="px-6 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {view === "create-role" ? (
              <>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Create New Role</h1>
                  <p className="mt-1 max-w-3xl text-sm text-zinc-500">
                    Design a custom role with specific permissions for municipality staff.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={onManageRoles}
                  className="rounded-lg border-zinc-200 bg-white text-[#111827] hover:bg-zinc-50"
                >
                  Back to Roles
                </Button>
              </>
            ) : view === "roles" ? (
              <>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">User Roles & Permissions Management</h1>
                  <p className="mt-1 max-w-3xl text-sm text-zinc-500">
                    Define granular permissions for each user role to control access to system features and data.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={onCreateRole} className="gap-2 rounded-lg bg-[#203B2B] text-white shadow-sm hover:bg-[#17281E]">
                    <UserPlus className="size-4" />
                    Create New Role
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 rounded-lg border-[#2E5873]/40 bg-white text-[#2E5873] hover:bg-[#2E5873]/5"
                  >
                    <Import className="size-4" />
                    Import
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 rounded-lg border-[#2E5873]/40 bg-white text-[#2E5873] hover:bg-[#2E5873]/5"
                  >
                    <Download className="size-4" />
                    Export
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Manage Staff</h1>
                  <p className="mt-1 max-w-3xl text-sm text-zinc-500">
                    Create staff members, review team access, and hand off to role management when permissions change.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    className="gap-2 rounded-lg border-zinc-200 bg-white text-[#111827] hover:bg-zinc-50"
                  >
                    <Download className="size-4" />
                    Export Staff
                  </Button>
                  <Button
                    onClick={() => setStaffSheetOpen(true)}
                    className="gap-2 rounded-lg bg-[#203B2B] text-white shadow-sm hover:bg-[#17281E]"
                  >
                    <UserPlus className="size-4" />
                    Add Staff
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <main className="px-6 py-6">
        {view !== "create-role" && (
          <div className={`grid grid-cols-1 gap-4 ${view === "roles" ? "lg:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-4"}`}>
            {(view === "roles"
              ? [
                  {
                    label: "Total Roles",
                    value: roles.length,
                    icon: Shield,
                    tone: "bg-[#2E5873]/10 text-[#2E5873]",
                  },
                  {
                    label: "Custom Roles",
                    value: customRoleCount,
                    icon: UserPlus,
                    tone: "bg-[#203B2B]/10 text-[#203B2B]",
                  },
                  {
                    label: "Permissions",
                    value: totalPermissionAssignments,
                    icon: ShieldCheck,
                    tone: "bg-[#2E5873]/10 text-[#2E5873]",
                  },
                ]
              : [
                  {
                    label: "Total Staff",
                    value: staff.length,
                    icon: Users,
                    tone: "bg-[#203B2B]/10 text-[#203B2B]",
                  },
                  {
                    label: "Active Staff",
                    value: activeStaffCount,
                    icon: UserCheck,
                    tone: "bg-[#315C46]/10 text-[#315C46]",
                  },
                  {
                    label: "Pending Review",
                    value: reviewStaffCount,
                    icon: UserX,
                    tone: "bg-[#A77B18]/15 text-[#A77B18]",
                  },
                  {
                    label: "System Roles",
                    value: roles.length,
                    icon: Shield,
                    tone: "bg-[#2E5873]/10 text-[#2E5873]",
                  },
                ]).map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                      <div className="mt-1 text-sm font-medium text-zinc-600">{stat.label}</div>
                    </div>
                    <div className={`flex size-10 items-center justify-center rounded-lg ${stat.tone}`}>
                      <Icon className="size-5" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {view === "create-role" ? (
          <form id="create-role-form" onSubmit={handleCreateRole} className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Role Details</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Name the role, describe its responsibility, and select the permissions it should grant.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onManageRoles}
                  className="w-fit gap-2 rounded-lg border-zinc-200 bg-white text-[#111827] hover:bg-zinc-50"
                >
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
              </div>
            </div>

            <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Role Name</Label>
                    <Input
                      id="role-name"
                      required
                      value={roleForm.name}
                      onChange={(event) => setRoleForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Warehouse supervisor"
                      className="h-11 rounded-lg border-zinc-200 bg-white focus-visible:border-[#203B2B] focus-visible:ring-[#203B2B]/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role-description">Description</Label>
                    <Input
                      id="role-description"
                      required
                      value={roleForm.description}
                      onChange={(event) => setRoleForm((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Controls inventory workflows and reports"
                      className="h-11 rounded-lg border-zinc-200 bg-white focus-visible:border-[#203B2B] focus-visible:ring-[#203B2B]/10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Permissions</Label>
                    <p className="mt-1 text-sm text-zinc-500">Select at least one permission for this role.</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {availablePermissions.map((permission) => {
                      const active = roleForm.permissions.includes(permission.id)

                      return (
                        <button
                          key={permission.id}
                          type="button"
                          onClick={() => toggleRoleFormPermission(permission.id)}
                          className={`rounded-lg border p-3 text-left transition-all ${
                            active
                              ? "border-[#2E5873]/40 bg-[#2E5873]/5"
                              : "border-zinc-200 bg-white hover:border-[#2E5873]/30"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium">{permission.label}</div>
                              <div className="mt-1 text-xs text-zinc-500">{permission.group}</div>
                            </div>
                            <span
                              className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                                active
                                  ? "border-[#2E5873] bg-[#2E5873] text-white"
                                  : "border-zinc-300 bg-white text-transparent"
                              }`}
                            >
                              <Check className="size-3.5" />
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <aside className="h-fit rounded-lg border border-zinc-200 bg-[#FAFBFC] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold">Role Preview</h3>
                    <p className="mt-1 text-sm text-zinc-500">This is how the role will be summarized in the catalog.</p>
                  </div>
                  <span className="flex size-10 items-center justify-center rounded-lg bg-[#2E5873]/10 text-[#2E5873]">
                    <ShieldCheck className="size-5" />
                  </span>
                </div>

                <div className="mt-5 rounded-lg border border-t-4 border-zinc-200 border-t-[#2E5873]/30 bg-white p-4">
                  <h4 className="text-lg font-semibold">{roleForm.name.trim() || "New custom role"}</h4>
                  <Badge className="mt-2 bg-[#203B2B]/10 text-[#203B2B] hover:bg-[#203B2B]/10">
                    Custom Role
                  </Badge>
                  <p className="mt-4 min-h-12 text-sm leading-6 text-zinc-500">
                    {roleForm.description.trim() || "Role description will appear here."}
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-sm text-zinc-500">
                    <Shield className="size-4" />
                    {roleForm.permissions.length} permissions selected
                  </div>
                </div>
              </aside>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 p-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onManageRoles} className="rounded-lg">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!roleForm.name.trim() || roleForm.permissions.length === 0}
                className="gap-2 rounded-lg bg-[#203B2B] text-white hover:bg-[#17281E]"
              >
                <UserPlus className="size-4" />
                Create Role
              </Button>
            </div>
          </form>
        ) : view === "staff" ? (
          <div className="mt-6">
            <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-100 p-5">
                <div>
                  <h2 className="text-lg font-semibold">Manage Staff</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Add staff members and review their current departments, statuses, and assigned roles.
                  </p>
                </div>
              </div>

              <div className="p-5">
                <div className="relative max-w-xl">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search staff by name, email, department or role"
                    className="h-10 rounded-lg border-zinc-200 bg-[#F8FAFB] pl-9 focus-visible:border-[#203B2B] focus-visible:ring-[#203B2B]/10"
                  />
                </div>

                <div className="mt-5 overflow-hidden rounded-lg border border-zinc-200">
                  <div className="grid grid-cols-[minmax(260px,1.4fr)_180px_140px_minmax(220px,1fr)_120px] bg-[#FAFBFC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    <span>Staff</span>
                    <span>Department</span>
                    <span>Status</span>
                    <span>Roles</span>
                    <span className="text-right">Action</span>
                  </div>

                  <div className="divide-y divide-zinc-200 bg-white">
                    {filteredStaff.map((member) => (
                      <div
                        key={member.id}
                        className="grid grid-cols-[minmax(260px,1.4fr)_180px_140px_minmax(220px,1fr)_120px] items-center gap-4 px-4 py-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#203B2B] to-[#315C46] text-sm font-semibold text-white">
                            {member.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{member.name}</div>
                            <div className="truncate text-sm text-zinc-500">{member.email}</div>
                          </div>
                        </div>
                        <div className="text-sm text-zinc-600">{member.department}</div>
                        <div>
                          <Badge
                            variant="outline"
                            className={
                              member.status === "Active"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-[#A77B18]/20 bg-[#A77B18]/10 text-[#A77B18]"
                            }
                          >
                            {member.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {member.roles.length > 0 ? (
                            member.roles.slice(0, 2).map((role) => (
                              <Badge key={role} variant="outline" className="border-zinc-200 bg-zinc-50 text-zinc-600">
                                {formatRoleLabel(role)}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-zinc-400">No roles assigned</span>
                          )}
                          {member.roles.length > 2 && (
                            <Badge variant="outline" className="border-zinc-200 text-zinc-500">
                              +{member.roles.length - 2}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 rounded-lg border-zinc-200"
                            onClick={() => {
                              setSelectedStaffId(member.id)
                              onManageRoles?.()
                            }}
                          >
                            <UserCog className="size-3.5" />
                            Roles
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    value={roleSearchQuery}
                    onChange={(event) => setRoleSearchQuery(event.target.value)}
                    placeholder="Search roles by name or description..."
                    className="h-11 rounded-lg border-zinc-200 bg-white pl-9 focus-visible:border-[#2E5873] focus-visible:ring-[#2E5873]/10"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Select value={roleTypeFilter} onValueChange={(value) => setRoleTypeFilter(value as typeof roleTypeFilter)}>
                    <SelectTrigger className="h-11 w-[170px] rounded-lg border-zinc-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="system">System Roles</SelectItem>
                      <SelectItem value="custom">Custom Roles</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={roleSortOrder} onValueChange={(value) => setRoleSortOrder(value as typeof roleSortOrder)}>
                    <SelectTrigger className="h-11 w-[170px] rounded-lg border-zinc-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="permissions-desc">Most permissions</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex h-11 items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant={roleViewMode === "grid" ? "secondary" : "ghost"}
                      className={roleViewMode === "grid" ? "bg-[#2E5873]/10 text-[#2E5873]" : "text-zinc-500"}
                      onClick={() => setRoleViewMode("grid")}
                    >
                      <Grid3X3 className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant={roleViewMode === "list" ? "secondary" : "ghost"}
                      className={roleViewMode === "list" ? "bg-[#2E5873]/10 text-[#2E5873]" : "text-zinc-500"}
                      onClick={() => setRoleViewMode("list")}
                    >
                      <List className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section
              className={
                roleViewMode === "grid"
                  ? "grid gap-4 md:grid-cols-2 2xl:grid-cols-4"
                  : "grid gap-3"
              }
            >
              {filteredRoles.map((role) => (
                <article
                  key={role.id}
                  className={`rounded-lg border border-t-4 border-zinc-200 ${role.accentClass ?? "border-t-[#2E5873]/30"} bg-white p-5 shadow-sm`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">{formatRoleLabel(role.id)}</h2>
                      <Badge className="mt-2 bg-[#2E5873]/10 text-[#2E5873] hover:bg-[#2E5873]/10">
                        System Role
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="text-zinc-500">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onSelect={() => setViewRole(role)}>
                          <Eye className="size-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDuplicateRole(role)}>
                          <Copy className="size-4" />
                          Duplicate role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={role.system} onSelect={() => handleEditRole(role)}>
                          <Pencil className="size-4" />
                          Edit permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={role.system} variant="destructive">
                          <Trash2 className="size-4" />
                          Delete role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="mt-4 min-h-10 text-sm leading-6 text-zinc-500">
                    {role.description ?? roleDescriptions[role.id]}
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-500">
                    <span className="inline-flex items-center gap-2">
                      <Shield className="size-4" />
                      {role.permissions.length} permissions
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Users className="size-4" />
                      {role.memberCount ?? 0} members
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setViewRole(role)}
                    className="mt-5 h-9 w-full gap-2 rounded-md border-[#2E5873] text-[#2E5873] hover:bg-[#2E5873]/5"
                  >
                    <Eye className="size-4" />
                    View
                  </Button>
                </article>
              ))}

              <button
                type="button"
                onClick={onCreateRole}
                className="flex min-h-[245px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center transition-colors hover:border-[#2E5873]/50 hover:bg-[#2E5873]/5"
              >
                <span className="flex size-16 items-center justify-center rounded-full bg-[#2E5873]/10 text-[#2E5873]">
                  <Plus className="size-8" />
                </span>
                <span className="mt-5 text-base font-semibold">Create New Role</span>
                <span className="mt-3 text-sm text-zinc-500">Design a custom role with specific permissions</span>
              </button>
            </section>
          </div>
        )}
      </main>

      <Sheet open={staffSheetOpen} onOpenChange={setStaffSheetOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader className="border-b border-zinc-100 p-6 pr-12">
            <SheetTitle className="text-xl">Add Staff Member</SheetTitle>
            <SheetDescription>
              Create a staff profile and assign initial ILGARS operational roles.
            </SheetDescription>
          </SheetHeader>

          <form id="add-staff-form" onSubmit={handleAddStaff} className="space-y-6 px-6 py-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  required
                  value={staffForm.firstName}
                  onChange={(event) => setStaffForm((current) => ({ ...current, firstName: event.target.value }))}
                  placeholder="Sarah"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  required
                  value={staffForm.lastName}
                  onChange={(event) => setStaffForm((current) => ({ ...current, lastName: event.target.value }))}
                  placeholder="Mabunda"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-email">Email Address</Label>
                <Input
                  id="staff-email"
                  required
                  type="email"
                  value={staffForm.email}
                  onChange={(event) => setStaffForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="sarah.mabunda@maputo.gov.mz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  required
                  value={staffForm.department}
                  onChange={(event) => setStaffForm((current) => ({ ...current, department: event.target.value }))}
                  placeholder="Revenue"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Initial Roles</Label>
              <div className="grid gap-3 md:grid-cols-2">
                {roles.map((role) => {
                  const active = staffForm.roles.includes(role.id)

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleFormRole(role.id)}
                      className={`rounded-lg border p-3 text-left transition-all ${
                        active
                          ? "border-[#203B2B]/30 bg-[#203B2B]/5"
                          : "border-zinc-200 bg-white hover:border-[#315C46]/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium">{formatRoleLabel(role.id)}</div>
                          <div className="mt-1 text-xs text-zinc-500">{role.permissions.length} permissions</div>
                        </div>
                        <span
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                            active
                              ? "border-[#203B2B] bg-[#203B2B] text-white"
                              : "border-zinc-300 bg-white text-transparent"
                          }`}
                        >
                          <Check className="size-3.5" />
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Status</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["Active", "Review"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStaffForm((current) => ({ ...current, status }))}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      staffForm.status === status
                        ? "border-[#203B2B]/30 bg-[#203B2B]/5"
                        : "border-zinc-200 bg-white hover:border-[#315C46]/30"
                    }`}
                  >
                    <div className="font-medium">{status}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {status === "Active" ? "Can access assigned modules immediately." : "Requires access review."}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </form>

          <SheetFooter className="border-t border-zinc-100 p-6">
            <Button variant="outline" onClick={() => setStaffSheetOpen(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-staff-form"
              disabled={staffForm.roles.length === 0}
              className="gap-2 rounded-lg bg-[#203B2B] text-white hover:bg-[#17281E]"
            >
              <UserPlus className="size-4" />
              Create Staff
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(viewRole)} onOpenChange={(open) => !open && setViewRole(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader className="border-b border-zinc-100 p-6 pr-12">
            <SheetTitle className="text-xl">{viewRole ? formatRoleLabel(viewRole.id) : "Role Details"}</SheetTitle>
            <SheetDescription>
              View role metadata, member count, and assigned permissions.
            </SheetDescription>
          </SheetHeader>

          {viewRole && (
            <div className="space-y-6 px-6 py-2">
              <div className={`rounded-lg border border-t-4 border-zinc-200 ${viewRole.accentClass ?? "border-t-[#2E5873]/30"} bg-white p-5`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{formatRoleLabel(viewRole.id)}</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {viewRole.description ?? roleDescriptions[viewRole.id]}
                    </p>
                  </div>
                  <Badge className="bg-[#2E5873]/10 text-[#2E5873] hover:bg-[#2E5873]/10">
                    {viewRole.system ? "System Role" : "Custom Role"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-zinc-200 bg-[#FAFBFC] p-4">
                  <div className="text-sm font-medium text-zinc-500">Permissions</div>
                  <div className="mt-2 text-2xl font-bold">{viewRole.permissions.length}</div>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-[#FAFBFC] p-4">
                  <div className="text-sm font-medium text-zinc-500">Members</div>
                  <div className="mt-2 text-2xl font-bold">{viewRole.memberCount ?? 0}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">Assigned Permissions</h3>
                  <p className="mt-1 text-sm text-zinc-500">Permissions granted to users with this role.</p>
                </div>

                <div className="grid gap-2">
                  {viewRole.permissions.map((permission) => {
                    const permissionMeta = availablePermissions.find((item) => item.id === permission)

                    return (
                      <div key={permission} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3">
                        <div>
                          <div className="font-medium">{permissionMeta?.label ?? permission}</div>
                          <div className="mt-1 text-xs text-zinc-500">{permissionMeta?.group ?? permission.split(":")[0]}</div>
                        </div>
                        <Badge variant="outline" className="border-zinc-200 text-zinc-600">
                          {permission}
                        </Badge>
                      </div>
                    )
                  })}

                  {viewRole.permissions.length === 0 && (
                    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
                      No permissions assigned.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <SheetFooter className="border-t border-zinc-100 p-6">
            <Button variant="outline" onClick={() => setViewRole(null)} className="rounded-lg">
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default RolesManagementPage
