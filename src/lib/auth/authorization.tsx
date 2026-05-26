import { createContext, useContext, useMemo, type ReactNode } from "react"
import { useAuth } from "react-oidc-context"
import type { User } from "oidc-client-ts"

export type IlgarsRole =
  | "ilgars-admin"
  | "municipality-admin"
  | "revenue-officer"
  | "enforcement-officer"
  | "permit-officer"
  | "device-operator"
  | "report-viewer"

export type IlgarsPermission =
  | "dashboard:read"
  | "transactions:read"
  | "vehicles:read"
  | "permits:read"
  | "permits:approve"
  | "violations:read"
  | "violations:manage"
  | "devices:read"
  | "devices:assign"
  | "reports:read"
  | "configuration:read"
  | "configuration:manage"

const ROLE_PERMISSIONS: Record<IlgarsRole, IlgarsPermission[]> = {
  "ilgars-admin": [
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
  "municipality-admin": [
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
  "revenue-officer": [
    "dashboard:read",
    "transactions:read",
    "vehicles:read",
    "permits:read",
    "reports:read",
  ],
  "enforcement-officer": [
    "dashboard:read",
    "vehicles:read",
    "violations:read",
    "violations:manage",
    "devices:read",
  ],
  "permit-officer": [
    "dashboard:read",
    "vehicles:read",
    "permits:read",
    "permits:approve",
    "reports:read",
  ],
  "device-operator": [
    "dashboard:read",
    "vehicles:read",
    "devices:read",
    "devices:assign",
  ],
  "report-viewer": ["dashboard:read", "reports:read"],
}

const ROLE_ALIASES: Record<string, IlgarsRole> = {
  admin: "ilgars-admin",
  systemadmin: "ilgars-admin",
  "system-admin": "ilgars-admin",
  "system_admin": "ilgars-admin",
  "ilgars_admin": "ilgars-admin",
  "ilgars-admin": "ilgars-admin",
  "municipal_admin": "municipality-admin",
  "municipal-admin": "municipality-admin",
  "municipality_admin": "municipality-admin",
  "municipality-admin": "municipality-admin",
  "revenue_officer": "revenue-officer",
  "revenue-officer": "revenue-officer",
  "enforcement_officer": "enforcement-officer",
  "enforcement-officer": "enforcement-officer",
  "permit_officer": "permit-officer",
  "permit-officer": "permit-officer",
  "device_operator": "device-operator",
  "device-operator": "device-operator",
  "report_viewer": "report-viewer",
  "report-viewer": "report-viewer",
}

interface AuthorizationContextValue {
  roles: IlgarsRole[]
  rawRoles: string[]
  permissions: IlgarsPermission[]
  hasRole: (role: IlgarsRole) => boolean
  hasAnyRole: (roles: IlgarsRole[]) => boolean
  hasPermission: (permission: IlgarsPermission) => boolean
  hasAnyPermission: (permissions: IlgarsPermission[]) => boolean
  primaryRoleLabel: string
}

const AuthorizationContext = createContext<AuthorizationContextValue | undefined>(undefined)

const decodeJwtPayload = (token?: string): Record<string, unknown> => {
  if (!token) return {}

  try {
    const [, payload] = token.split(".")
    if (!payload) return {}
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    return JSON.parse(window.atob(padded)) as Record<string, unknown>
  } catch {
    return {}
  }
}

const collectStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

const extractRolesFromClaims = (claims: Record<string, unknown>, clientId: string) => {
  const realmAccess = claims.realm_access as { roles?: unknown } | undefined
  const resourceAccess = claims.resource_access as Record<string, { roles?: unknown }> | undefined
  const clientAccess = resourceAccess?.[clientId]

  return [
    ...collectStringArray(realmAccess?.roles),
    ...collectStringArray(clientAccess?.roles),
    ...collectStringArray(claims.roles),
    ...collectStringArray(claims.groups),
  ]
}

const normalizeRole = (role: string): IlgarsRole | null => {
  const normalized = role.trim().toLowerCase().replace(/\s+/g, "-")
  return ROLE_ALIASES[normalized] ?? null
}

const unique = <T,>(items: T[]) => Array.from(new Set(items))

export const getAuthorizationFromUser = (user?: User | null) => {
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "ilgars-ui"
  const profileClaims = user?.profile as Record<string, unknown> | undefined
  const accessTokenClaims = decodeJwtPayload(user?.access_token)
  const idTokenClaims = decodeJwtPayload(user?.id_token)
  const rawRoles = unique([
    ...extractRolesFromClaims(profileClaims ?? {}, clientId),
    ...extractRolesFromClaims(accessTokenClaims, clientId),
    ...extractRolesFromClaims(idTokenClaims, clientId),
  ])
  const roles = unique(rawRoles.map(normalizeRole).filter((role): role is IlgarsRole => Boolean(role)))
  const permissions = unique(roles.flatMap((role) => ROLE_PERMISSIONS[role]))

  return { roles, rawRoles, permissions }
}

export const formatRoleLabel = (role?: string) => {
  if (!role) return "Revenue officer"
  return role
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function AuthorizationProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  const value = useMemo<AuthorizationContextValue>(() => {
    const { roles, rawRoles, permissions } = getAuthorizationFromUser(auth.user)
    const roleSet = new Set(roles)
    const permissionSet = new Set(permissions)
    const primaryRoleLabel = formatRoleLabel(roles[0] ?? rawRoles[0])

    return {
      roles,
      rawRoles,
      permissions,
      primaryRoleLabel,
      hasRole: (role) => roleSet.has(role),
      hasAnyRole: (requiredRoles) => requiredRoles.some((role) => roleSet.has(role)),
      hasPermission: (permission) => permissionSet.has(permission),
      hasAnyPermission: (requiredPermissions) =>
        requiredPermissions.some((permission) => permissionSet.has(permission)),
    }
  }, [auth.user])

  return <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>
}

export const useAuthorization = () => {
  const context = useContext(AuthorizationContext)
  if (!context) {
    throw new Error("useAuthorization must be used within AuthorizationProvider")
  }
  return context
}

interface CanProps {
  role?: IlgarsRole
  anyRole?: IlgarsRole[]
  permission?: IlgarsPermission
  anyPermission?: IlgarsPermission[]
  fallback?: ReactNode
  children: ReactNode
}

export function Can({
  role,
  anyRole,
  permission,
  anyPermission,
  fallback = null,
  children,
}: CanProps) {
  const { hasRole, hasAnyRole, hasPermission, hasAnyPermission } = useAuthorization()

  if (role && !hasRole(role)) return <>{fallback}</>
  if (anyRole && !hasAnyRole(anyRole)) return <>{fallback}</>
  if (permission && !hasPermission(permission)) return <>{fallback}</>
  if (anyPermission && !hasAnyPermission(anyPermission)) return <>{fallback}</>

  return <>{children}</>
}
