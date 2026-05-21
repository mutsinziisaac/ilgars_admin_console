# SSRA Role Assignment Reference

The SSRA reference repo is cloned at:

`ssra ref/drie-taxpayer-web-portal`

## How SSRA Assigns Roles

SSRA separates two concerns:

1. Staff role assignment
   - UI: `src/features/staff-mgt/presentation/pages/manage-roles-page.tsx`
   - Role picker: `src/features/staff-mgt/presentation/components/staff-role-selection.tsx`
   - API call: `src/features/staff-mgt/data/api/StaffApi.ts`
   - Assignment is done by updating the staff member with a full `roles` array:

```ts
StaffApi.updateStaff(id, {
  data: { roles },
})
```

2. Permission checks
   - Provider: `src/shared/context/PermissionsContext.tsx`
   - Hook: `src/shared/context/usePermissions.ts`
   - UI gate: `src/shared/components/auth/Can.tsx`
   - SSRA fetches current-user permissions from:

```txt
GET /authz/me/permissions
```

with the active tenant ID in the `X-Tenant-Id` header.

## What Was Added To ILGARS

ILGARS now has a lightweight version in:

`src/lib/auth/authorization.tsx`

It extracts Keycloak realm/client roles from the current OIDC user, normalizes them to ILGARS roles, maps those roles to permissions, and exposes:

```ts
useAuthorization()
Can
```

The provider is mounted in:

`src/main.tsx`

The sidebar now displays the signed-in user's resolved role instead of the hard-coded locale string:

`src/components/sidebar.tsx`

## Next Step For Full SSRA-Style Assignment

To match SSRA fully, ILGARS needs backend endpoints for staff/member role updates, for example:

```txt
GET /authz/roles
GET /authz/me/permissions
PUT /admin/staff/{id} body: { data: { roles: string[] } }
```

Once those endpoints exist, the SSRA `ManageRolesPage` pattern can be ported directly.
