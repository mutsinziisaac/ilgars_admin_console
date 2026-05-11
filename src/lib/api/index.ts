// Export HTTP clients
export { coreHttpClient, motorVehicleHttpClient, coreRequest, motorVehicleRequest } from "./httpClient";

// Export error utilities
export { ApiError, NetworkError, ValidationError, toApiError, getApiErrorMessage } from "./errors";

// Export types
export type { ApiResponse, PaginatedResponse, ApiErrorShape, RequestConfig } from "./types";

// Export API services
export { VehiclesApi } from "./vehicles/api";
export { TariffPlansApi } from "./tariffs/api";
export { RoadClosureRatesApi, RoadClosurePermitsApi } from "./permits/api";

// Export schemas and types
export type { Vehicle, VehicleListResponse, VehicleDetailResponse } from "./vehicles/schemas";
export type {
  TariffPlan,
  TariffPlanListResponse,
  TariffPlanDetailResponse,
  CreateTariffPlanRequest,
  UpdateTariffPlanRequest,
} from "./tariffs/schemas";
export type {
  RoadClosureRate,
  RoadClosureRateListResponse,
  RoadClosureRateDetailResponse,
  CreateRoadClosureRateRequest,
  RoadClosurePermit,
  RoadClosurePermitListResponse,
  RoadClosurePermitDetailResponse,
  CreateRoadClosurePermitRequest,
} from "./permits/schemas";
