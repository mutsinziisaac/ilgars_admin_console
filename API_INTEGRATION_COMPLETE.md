# API Integration Complete - 4 High-Priority Configuration Pages

## ✅ Completed API Integration (Following SSRA Pattern)

### 1. Tariff Plans (/v1/tariff-plans)
**Location**: `src/lib/api/tariff-plans/`

**Files Created**:
- `api.ts` - API client with all CRUD operations
- `schemas.ts` - Zod schemas for validation
- `queryKeys.ts` - React Query cache keys
- `hooks.ts` - React Query hooks (CRUD + activate)

**Available Hooks**:
```typescript
import {
  useTariffPlansList,
  useTariffPlanDetail,
  useCreateTariffPlan,
  useUpdateTariffPlan,
  useDeleteTariffPlan,
  useActivateTariffPlan,
} from "@/lib/api/tariff-plans/hooks"
```

**API Operations**:
- ✅ GET /v1/tariff-plans (list with filters)
- ✅ GET /v1/tariff-plans/{id} (get by ID)
- ✅ POST /v1/tariff-plans (create)
- ✅ PUT /v1/tariff-plans/{id} (update)
- ✅ POST /v1/tariff-plans/{id}/activate (activate)
- ✅ DELETE /v1/tariff-plans/{id} (delete)

---

### 2. RUC Policies (/v1/ruc-policies)
**Location**: `src/lib/api/ruc-policies/`

**Files Created**:
- `api.ts` - API client with all CRUD operations
- `schemas.ts` - Zod schemas for validation
- `queryKeys.ts` - React Query cache keys
- `hooks.ts` - React Query hooks (CRUD + activate)

**Available Hooks**:
```typescript
import {
  useRUCPoliciesList,
  useRUCPolicyDetail,
  useCreateRUCPolicy,
  useUpdateRUCPolicy,
  useDeleteRUCPolicy,
  useActivateRUCPolicy,
} from "@/lib/api/ruc-policies/hooks"
```

**API Operations**:
- ✅ GET /v1/ruc-policies (list with filters)
- ✅ GET /v1/ruc-policies/{id} (get by ID)
- ✅ POST /v1/ruc-policies (create)
- ✅ PUT /v1/ruc-policies/{id} (update)
- ✅ POST /v1/ruc-policies/{id}/activate (activate)
- ✅ DELETE /v1/ruc-policies/{id} (delete)

---

### 3. Road Closure Rates (/v1/road-closure-rates)
**Location**: `src/lib/api/road-closure-rates/`

**Files Created**:
- `api.ts` - API client with all CRUD operations
- `schemas.ts` - Zod schemas for validation
- `queryKeys.ts` - React Query cache keys
- `hooks.ts` - React Query hooks (CRUD + activate)

**Available Hooks**:
```typescript
import {
  useRoadClosureRatesList,
  useRoadClosureRateDetail,
  useCreateRoadClosureRate,
  useUpdateRoadClosureRate,
  useDeleteRoadClosureRate,
  useActivateRoadClosureRate,
} from "@/lib/api/road-closure-rates/hooks"
```

**API Operations**:
- ✅ GET /v1/road-closure-rates (list with filters)
- ✅ GET /v1/road-closure-rates/{id} (get by ID)
- ✅ POST /v1/road-closure-rates (create)
- ✅ PUT /v1/road-closure-rates/{id} (update)
- ✅ POST /v1/road-closure-rates/{id}/activate (activate)
- ✅ DELETE /v1/road-closure-rates/{id} (delete)

---

### 4. Vehicles (/v1/fleet-vehicles) - Read-Only
**Location**: `src/lib/api/vehicles/`

**Files Created**:
- `queryKeys.ts` - React Query cache keys
- `hooks.ts` - React Query hooks (read-only)

**Existing Files**:
- `api.ts` - Already existed
- `schemas.ts` - Already existed

**Available Hooks**:
```typescript
import {
  useVehiclesList,
  useVehicleDetail,
} from "@/lib/api/vehicles/hooks"
```

**API Operations**:
- ✅ GET /v1/fleet-vehicles (list with filters)
- ✅ GET /v1/fleet-vehicles/{id} (get by ID)

---

## 🏗️ Architecture Pattern (Following SSRA)

### Directory Structure
```
src/lib/api/
├── queryHooks.ts          # Factory functions for creating hooks
├── httpClient.ts          # Axios clients with auth interceptors
├── interceptors.ts        # Auth & error interceptors
├── errors.ts              # Error handling
├── types.ts               # Shared types
├── zod-utils.ts           # Zod validation utilities
│
├── tariff-plans/
│   ├── api.ts             # API client
│   ├── schemas.ts         # Zod schemas
│   ├── queryKeys.ts       # Cache keys
│   └── hooks.ts           # React Query hooks
│
├── ruc-policies/
│   ├── api.ts
│   ├── schemas.ts
│   ├── queryKeys.ts
│   └── hooks.ts
│
├── road-closure-rates/
│   ├── api.ts
│   ├── schemas.ts
│   ├── queryKeys.ts
│   └── hooks.ts
│
└── vehicles/
    ├── api.ts
    ├── schemas.ts
    ├── queryKeys.ts
    └── hooks.ts
```

### Key Components

#### 1. **queryHooks.ts** - Factory Functions
- `createCrudHooks()` - Creates full CRUD hooks (list, detail, create, update, delete)
- `createReadOnlyHooks()` - Creates read-only hooks (list, detail)
- `createMutationHook()` - Creates custom mutation hooks (e.g., activate)
- `createListQueryHook()` - Creates list query hook
- `createDetailQueryHook()` - Creates detail query hook

#### 2. **API Client Pattern**
```typescript
export const TariffPlansApi = {
  listTariffPlans: async (params?, signal?) => Promise<Response>
  getTariffPlan: async (id, signal?) => Promise<Response>
  createTariffPlan: (payload) => Promise<Response>
  updateTariffPlan: (id, payload) => Promise<Response>
  activateTariffPlan: (id) => Promise<void>
  deleteTariffPlan: (id) => Promise<void>
}
```

#### 3. **Schema Pattern**
```typescript
// Entity Schema
export const EntitySchema = z.object({...})

// List Response Schema
export const EntityListResponseSchema = z.object({
  data: z.array(EntitySchema).optional(),
  content: z.array(EntitySchema).optional(),
  meta: z.object({...}).optional(),
})

// Detail Response Schema
export const EntityDetailResponseSchema = z.object({
  data: EntitySchema,
})

// Request Schemas
export const CreateEntityRequestSchema = z.object({...})
export const UpdateEntityRequestSchema = z.object({...})
```

#### 4. **Query Keys Pattern**
```typescript
export const entityKeys = {
  all: () => ["entity"] as const,
  list: (filters?) => filters 
    ? (["entity", "list", filters] as const)
    : (["entity", "list"] as const),
  detail: (id) => ["entity", "detail", id] as const,
}
```

#### 5. **Hooks Pattern**
```typescript
// Use factory to create CRUD hooks
const {
  useList,
  useDetail,
  useCreate,
  useUpdate,
  useDelete,
} = createCrudHooks<...>({
  keys: entityKeys,
  listFn: EntityApi.list,
  detailFn: EntityApi.get,
  createFn: EntityApi.create,
  updateFn: EntityApi.update,
  deleteFn: EntityApi.delete,
  defaultListParams: {...},
})

// Create custom mutation hooks
const useActivateEntity = createMutationHook<...>({
  mutationFn: EntityApi.activate,
  invalidateKeys: [entityKeys.all()],
})
```

---

## 🔧 Configuration

### Municipality ID
All APIs use the default municipality ID:
```typescript
const MUNICIPALITY_ID = "aa73ac5e-4912-460f-a927-ba3ccbe57207"
```

### API Base URLs
- **Core API**: `https://ilgars.ayinza.dev/core/api/v1`
- **Motor Vehicle API**: `https://ilgars.ayinza.dev/motorvehicle/api/v1`
- **Devices API**: `https://ilgars.ayinza.dev/devices/api/v1`

### Authentication
- Uses Keycloak with `react-oidc-context`
- Auth interceptors automatically attach Bearer tokens
- Auto-refresh on 401 responses
- Redirects to login on unauthorized

---

## 📝 Usage Example

### In a Page Component

```typescript
import { useTariffPlansList, useCreateTariffPlan, useActivateTariffPlan } from "@/lib/api/tariff-plans/hooks"
import { toast } from "sonner"

export function TariffPlansPage() {
  // Fetch list
  const { data, isLoading, error } = useTariffPlansList({ status: "all" })
  
  // Create mutation
  const createMutation = useCreateTariffPlan({
    onSuccess: () => {
      toast.success("Tariff plan created successfully")
    },
    onError: (error) => {
      toast.error(`Failed to create: ${error.message}`)
    },
  })
  
  // Activate mutation
  const activateMutation = useActivateTariffPlan({
    onSuccess: () => {
      toast.success("Tariff plan activated")
    },
  })
  
  const handleCreate = () => {
    createMutation.mutate({
      code: "MAPUTO-2026",
      name: "Maputo Tariff Plan 2026",
      tariffType: "CIRCULATION_LICENCE",
      rates: [...]
    })
  }
  
  const handleActivate = (id: string) => {
    activateMutation.mutate(id)
  }
  
  // Access data
  const tariffPlans = data?.data || data?.content || []
  
  return (
    // Your UI here
  )
}
```

---

## ✨ Features

### Automatic Cache Invalidation
- Creating/updating/deleting automatically invalidates list queries
- Activating invalidates all related queries
- Detail queries are invalidated on update

### Type Safety
- Full TypeScript support
- Zod validation for runtime type checking
- IntelliSense for all API operations

### Error Handling
- Automatic error parsing
- Toast notifications on errors
- Retry logic for failed requests

### Loading States
- `isLoading` - Initial load
- `isFetching` - Background refetch
- `isError` - Error state
- `isSuccess` - Success state

---

## 🚀 Next Steps

### To Integrate a Page:
1. Import the hooks from the API module
2. Replace mock data with `useList()` hook
3. Replace create/update/delete handlers with mutation hooks
4. Add loading states and error handling
5. Test with real API endpoints

### Example Migration:
```typescript
// Before (mock data)
const [tariffPlans, setTariffPlans] = useState(mockData)

// After (real API)
const { data, isLoading } = useTariffPlansList()
const tariffPlans = data?.data || []
```

---

## 📚 References

- **SSRA Pattern**: `ssra-ref/src/features/business/`
- **ILGARS Existing**: `src/lib/api/vehicles/`
- **React Query Docs**: https://tanstack.com/query/latest
- **Zod Docs**: https://zod.dev

---

## ✅ Checklist for Page Integration

- [ ] Import hooks from API module
- [ ] Replace useState with useList hook
- [ ] Add loading spinner for isLoading state
- [ ] Add error message for error state
- [ ] Replace create handler with useCreate mutation
- [ ] Replace update handler with useUpdate mutation
- [ ] Replace delete handler with useDelete mutation
- [ ] Replace activate handler with useActivate mutation
- [ ] Add success/error toast notifications
- [ ] Test all CRUD operations
- [ ] Handle empty states
- [ ] Add pagination if needed
- [ ] Test with real API endpoints
