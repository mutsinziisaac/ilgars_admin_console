import { useMemo, useState } from "react"
import { formatRoleLabel, type IlgarsPermission, type IlgarsRole } from "@/lib/auth/authorization"

interface RoleDefinition {
  id: IlgarsRole
  permissions: IlgarsPermission[]
  color: string
  active?: boolean
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
  },
  {
    id: "revenue-officer",
    permissions: ["dashboard:read", "transactions:read", "vehicles:read", "permits:read", "reports:read"],
    color: "from-[#A77B18] to-[#DAA22A]",
  },
  {
    id: "enforcement-officer",
    permissions: ["dashboard:read", "vehicles:read", "violations:read", "violations:manage", "devices:read"],
    color: "from-[#6B2C1C] to-[#7E3F2B]",
  },
  {
    id: "permit-officer",
    permissions: ["dashboard:read", "vehicles:read", "permits:read", "permits:approve", "reports:read"],
    color: "from-[#2E5873] to-[#376B8A]",
  },
  {
    id: "device-operator",
    permissions: ["dashboard:read", "vehicles:read", "devices:read", "devices:assign"],
    color: "from-[#3F4D62] to-[#50617A]",
  },
  {
    id: "report-viewer",
    permissions: ["dashboard:read", "reports:read"],
    color: "from-[#5A5248] to-[#6B6255]",
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

const permissionCopy: Record<IlgarsPermission, string> = {
  "dashboard:read": "View dashboards",
  "transactions:read": "Read transaction records",
  "vehicles:read": "Read vehicle records",
  "permits:read": "Review permit requests",
  "permits:approve": "Approve permit requests",
  "violations:read": "Read violation queues",
  "violations:manage": "Manage violations",
  "devices:read": "View device registry",
  "devices:assign": "Assign GPS devices",
  "reports:read": "Generate reports",
  "configuration:read": "Read configuration",
  "configuration:manage": "Manage configuration",
}

const getRolePermissions = (assignedRoles: IlgarsRole[]) => {
  const permissionSet = new Set<IlgarsPermission>()
  assignedRoles.forEach((roleId) => {
    roles.find((role) => role.id === roleId)?.permissions.forEach((permission) => permissionSet.add(permission))
  })
  return Array.from(permissionSet).sort()
}

const groupPermissions = (permissions: IlgarsPermission[]) =>
  permissions.reduce<Record<string, IlgarsPermission[]>>((groups, permission) => {
    const [resource] = permission.split(":")
    groups[resource] = [...(groups[resource] ?? []), permission]
    return groups
  }, {})

export function RolesManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff)
  const [selectedStaffId, setSelectedStaffId] = useState(initialStaff[0].id)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedStaff = staff.find((member) => member.id === selectedStaffId) ?? staff[0]
  const selectedPermissions = useMemo(() => getRolePermissions(selectedStaff.roles), [selectedStaff.roles])
  const permissionGroups = useMemo(() => groupPermissions(selectedPermissions), [selectedPermissions])

  const filteredStaff = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return staff

    return staff.filter((member) =>
      [member.name, member.email, member.department, member.roles.map(formatRoleLabel).join(" ")].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [searchQuery, staff])

  const toggleRole = (roleId: IlgarsRole) => {
    setStaff((currentStaff) =>
      currentStaff.map((member) => {
        if (member.id !== selectedStaff.id) return member

        const hasRole = member.roles.includes(roleId)
        return {
          ...member,
          roles: hasRole ? member.roles.filter((role) => role !== roleId) : [...member.roles, roleId],
        }
      }),
    )
  }

  return (
    <div className="-m-6 min-h-screen bg-[#F4F6F8] p-8 text-[#111827]">
      <div className="mx-auto max-w-[1700px] space-y-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#315C46]">Access Control Center</p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">Roles & Permissions Management</h1>

            <p className="mt-3 max-w-3xl text-base text-zinc-500">
              Configure operational access, municipality administration privileges, enforcement permissions, and revenue
              oversight for all platform users.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md">
              Export Roles
            </button>

            <button className="rounded-2xl bg-[#203B2B] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#203B2B]/20 transition-all hover:-translate-y-[1px] hover:bg-[#17281E]">
              Add Staff Member
            </button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Total Staff",
              value: "124",
              desc: "Across all departments",
            },
            {
              title: "System Roles",
              value: String(roles.length),
              desc: "Core administrative roles",
            },
            {
              title: "Pending Reviews",
              value: "12",
              desc: "Awaiting permission approval",
            },
            {
              title: "Active Sessions",
              value: "89",
              desc: "Users currently online",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="space-y-3">
                <p className="text-sm font-medium text-zinc-500">{item.title}</p>

                <h2 className="text-4xl font-bold tracking-tight">{item.value}</h2>

                <p className="text-sm text-zinc-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)_380px]">
          <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Staff Directory</h2>

                <p className="mt-1 text-sm text-zinc-500">Search and manage assigned operational roles.</p>
              </div>

              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search staff members"
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-[#F8FAFB] px-4 text-sm outline-none transition-all focus:border-[#203B2B] focus:ring-4 focus:ring-[#203B2B]/10"
                />
              </div>

              <div className="space-y-3">
                {filteredStaff.map((member) => {
                  const selected = member.id === selectedStaff.id
                  const primaryRole = member.roles[0] ? formatRoleLabel(member.roles[0]) : "No role assigned"

                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setSelectedStaffId(member.id)}
                      className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md ${
                        selected
                          ? "border-[#203B2B]/30 bg-[#203B2B]/5 shadow-sm"
                          : "border-zinc-200 bg-white hover:border-[#315C46]/30"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#203B2B] to-[#315C46] text-sm font-semibold text-white shadow-sm">
                          {member.initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="truncate font-semibold text-[#111827]">{member.name}</h3>

                              <p className="text-sm text-zinc-500">{member.department}</p>
                            </div>

                            <div
                              className={`h-2.5 w-2.5 rounded-full ${
                                member.status === "Active" ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="truncate rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                              {primaryRole}
                            </span>

                            <span className="text-xs font-medium text-zinc-400">{member.status}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#315C46]">Role Assignment</p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight">Assigned Operational Roles</h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    Managing access for {selectedStaff.name} in {selectedStaff.department}.
                  </p>
                </div>

                <button className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium transition-all hover:shadow-sm">
                  Save Changes
                </button>
              </div>

              <div className="mt-8 grid gap-4">
                {roles.map((role) => {
                  const active = selectedStaff.roles.includes(role.id)

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={`rounded-3xl border p-5 text-left transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg ${
                        active
                          ? "border-[#203B2B]/30 bg-[#203B2B]/5 ring-1 ring-[#203B2B]/10"
                          : "border-zinc-200 bg-white hover:border-[#315C46]/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${role.color} text-lg font-bold text-white shadow-md`}
                          >
                            {formatRoleLabel(role.id).charAt(0)}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-semibold">{formatRoleLabel(role.id)}</h3>

                              {active && (
                                <span className="rounded-full bg-[#203B2B] px-3 py-1 text-xs font-semibold text-white">
                                  Active Role
                                </span>
                              )}
                            </div>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                              Controls municipality workflows, dashboard visibility, compliance management, and
                              operational oversight.
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-500">
                              <span>{role.permissions.length} Permissions</span>
                              <span>Last modified today</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm ${
                              active ? "border-[#203B2B] bg-[#203B2B] text-white" : "border-zinc-300 bg-white"
                            }`}
                          >
                            {active ? "OK" : ""}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

          </div>

          <div className="h-fit rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur xl:sticky xl:top-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#315C46]">Effective Permissions</p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight">Permission Inspector</h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Consolidated operational access generated from assigned user roles.
              </p>
            </div>

            <div className="mt-8 space-y-5">
              {Object.entries(permissionGroups).map(([resource, permissions]) => (
                <div key={resource} className="rounded-2xl border border-zinc-200 bg-[#FAFBFC] p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold capitalize">{resource}</h3>

                    <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                      {permissions.length}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {permissions.map((permission) => (
                      <div key={permission} className="flex items-center gap-3 text-sm text-zinc-600">
                        <div className="h-2 w-2 rounded-full bg-[#315C46]" />
                        {permissionCopy[permission]}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RolesManagementPage
