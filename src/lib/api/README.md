# ILGARS API Layer

This directory contains the API layer for the ILGARS Admin Console, following the SSRA architecture pattern.

## Architecture

The API layer is organized into:

1. **HTTP Clients** (`httpClient.ts`) - Axios instances with auth interceptors
2. **Interceptors** (`interceptors.ts`) - Request/response interceptors for auth and error handling
3. **Error Handling** (`errors.ts`) - Custom error classes and error parsing
4. **Types** (`types.ts`) - Shared TypeScript types
5. **Feature APIs** - Organized by domain (vehicles, tariffs, permits)

## Available APIs

### 1. Vehicles API (`vehicles/api.ts`)

```typescript
import { VehiclesApi } from "@/lib/api";

// Search vehicles
const vehicles = await VehiclesApi.searchVehicles({
  page: 1,
  pageSize: 20,
  plateNumber: "AAA-123-MP",
});

// Lookup by plate number
const vehicle = await VehiclesApi.lookupByPlate("AAA-123-MP");
```

### 2. Tariff Plans API (`tariffs/api.ts`)

```typescript
import { TariffPlansApi } from "@/lib/api";

// List tariff plans
const tariffs = await TariffPlansApi.listTariffPlans({
  type: "CIRCULATION",
  status: "ACTIVE",
});

// Get specific tariff plan
const tariff = await TariffPlansApi.getTariffPlan("tariff-id");

// Create tariff plan
const newTariff = await TariffPlansApi.createTariffPlan({
  name: "Heavy Cargo 25,001-38,000 kg",
  type: "CIRCULATION",
  weightMin: 25001,
  weightMax: 38000,
  dailyRate: 3000,
  monthlyRate: 20000,
  currency: "MZN",
});

// Update tariff plan
const updated = await TariffPlansApi.updateTariffPlan("tariff-id", {
  dailyRate: 3500,
});

// Activate tariff plan
const activated = await TariffPlansApi.activateTariffPlan("tariff-id");
```

### 3. Road Closure Rates API (`permits/api.ts`)

```typescript
import { RoadClosureRatesApi } from "@/lib/api";

// List road closure rates
const rates = await RoadClosureRatesApi.listRoadClosureRates({
  status: "ACTIVE",
});

// Create road closure rate
const newRate = await RoadClosureRatesApi.createRoadClosureRate({
  name: "Full Road Closure - 1 Day",
  roadType: "MAIN",
  duration: "1_DAY",
  rate: 5000,
  currency: "MZN",
});
```

### 4. Road Closure Permits API (`permits/api.ts`)

```typescript
import { RoadClosurePermitsApi } from "@/lib/api";
import { DEFAULT_MUNICIPALITY_ID } from "@/lib/api/constants";

// List permits
const permits = await RoadClosurePermitsApi.listRoadClosurePermits({
  municipalityId: DEFAULT_MUNICIPALITY_ID,
  status: "PENDING_ADMIN_APPROVAL",
  page: 1,
  pageSize: 20,
});

// Get specific permit
const permit = await RoadClosurePermitsApi.getRoadClosurePermit("permit-id");

// Create permit
const newPermit = await RoadClosurePermitsApi.createRoadClosurePermit({
  applicantName: "João Silva",
  applicantContact: "+258 84 123 4567",
  vehiclePlateNumber: "AAA-123-MP",
  roadName: "Avenida Julius Nyerere",
  closureType: "PARTIAL",
  startDate: "2026-05-15",
  endDate: "2026-05-15",
  startTime: "08:00",
  endTime: "17:00",
  reason: "Construction work",
});
```

## Using with React Query

For optimal data fetching, use React Query (recommended):

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { VehiclesApi, TariffPlansApi } from "@/lib/api";

// Query example
function VehiclesList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vehicles", { page: 1 }],
    queryFn: ({ signal }) =>
      VehiclesApi.searchVehicles({ page: 1, pageSize: 20 }, signal),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map((vehicle) => (
        <div key={vehicle.id}>{vehicle.plateNumber}</div>
      ))}
    </div>
  );
}

// Mutation example
function CreateTariffForm() {
  const mutation = useMutation({
    mutationFn: TariffPlansApi.createTariffPlan,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["tariff-plans"] });
    },
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Error Handling

All API calls return typed errors:

```typescript
import { getApiErrorMessage } from "@/lib/api";

try {
  await VehiclesApi.lookupByPlate("INVALID");
} catch (error) {
  const message = getApiErrorMessage(error);
  console.error(message); // User-friendly error message
}
```

## Authentication

All API calls automatically include:
- Bearer token from Keycloak
- Automatic token refresh when expired
- Redirect to login on 401 errors

## Environment Variables

Required in `.env`:

```env
VITE_API_BASE_URL=https://ilgars.ayinza.dev/core/api
VITE_MOTOR_VEHICLE_API_BASE_URL=https://ilgars.ayinza.dev/motorvehicle/api
VITE_API_TIMEOUT_MS=30000
```

## API Endpoints Mapping

| API Method | HTTP Method | Endpoint |
|------------|-------------|----------|
| `VehiclesApi.searchVehicles` | GET | `/v1/vehicles` |
| `VehiclesApi.lookupByPlate` | GET | `/v1/vehicles/by-plate/{plateNumber}` |
| `TariffPlansApi.listTariffPlans` | GET | `/v1/tariff-plans` |
| `TariffPlansApi.getTariffPlan` | GET | `/v1/tariff-plans/{id}` |
| `TariffPlansApi.createTariffPlan` | POST | `/v1/tariff-plans` |
| `TariffPlansApi.updateTariffPlan` | POST | `/v1/tariff-plans/{id}` |
| `TariffPlansApi.activateTariffPlan` | POST | `/v1/tariff-plans/{id}/activate` |
| `RoadClosureRatesApi.listRoadClosureRates` | GET | `/v1/road-closure-rates` |
| `RoadClosureRatesApi.createRoadClosureRate` | POST | `/v1/road-closure-rates` |
| `RoadClosurePermitsApi.listRoadClosurePermits` | GET | `/v1/road-closure-permits` |
| `RoadClosurePermitsApi.getRoadClosurePermit` | GET | `/v1/road-closure-permits/{id}` |
| `RoadClosurePermitsApi.createRoadClosurePermit` | POST | `/v1/road-closure-permits` |

## Schema Validation

All responses are validated using Zod schemas. If the API returns unexpected data, a `ValidationError` will be thrown.

## Adding New APIs

1. Create a new directory under `src/lib/api/` (e.g., `transactions/`)
2. Create `schemas.ts` with Zod schemas
3. Create `api.ts` with API methods
4. Export from `index.ts`

Example:

```typescript
// src/lib/api/transactions/schemas.ts
import { z } from "zod";

export const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  // ...
});

export const TransactionListResponseSchema = z.object({
  data: z.array(TransactionSchema),
  meta: z.object({...}).optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionListResponse = z.infer<typeof TransactionListResponseSchema>;

// src/lib/api/transactions/api.ts
import { coreRequest } from "../httpClient";
import { TransactionListResponseSchema, type TransactionListResponse } from "./schemas";

export const TransactionsApi = {
  listTransactions: (params?: any, signal?: AbortSignal) =>
    coreRequest<TransactionListResponse>({
      method: "GET",
      url: "/v1/transactions",
      params,
      signal,
      schema: TransactionListResponseSchema,
    }),
};
```
