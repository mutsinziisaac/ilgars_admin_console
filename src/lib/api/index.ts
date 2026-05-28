// Export HTTP clients
export { coreHttpClient, motorVehicleHttpClient, devicesHttpClient, coreRequest, motorVehicleRequest, devicesRequest } from "./httpClient";

// Export error utilities
export { ApiError, NetworkError, ValidationError, toApiError, getApiErrorMessage } from "./errors";

// Export types
export type { ApiResponse, PaginatedResponse, ApiErrorShape, RequestConfig } from "./types";

// Export API services
export { VehiclesApi } from "./vehicles/api";
export { TariffPlansApi } from "./tariff-plans/api";
export { RUCPoliciesApi } from "./ruc-policies/api";
export { RoadClosureRatesApi } from "./road-closure-rates/api";
export { RoadClosurePermitsApi } from "./permits/api";
export { MunicipalRoutesApi } from "./municipal-routes/api";
export { MunicipalitiesApi } from "./municipalities/api";
export { FinePoliciesApi } from "./fine-policies/api";
export { ExemptAreasApi } from "./exempt-areas/api";
export { DevicesApi } from "./devices/api";
export { AnalyticsApi } from "./analytics/api";
export { EnforcementApi } from "./enforcement/api";
export { SpecialPermitsApi } from "./special-permits/api";

// Export schemas and types
export type { Vehicle, VehicleListResponse, VehicleDetailResponse } from "./vehicles/schemas";
export type {
  TariffPlan,
  TariffPlanListResponse,
  TariffPlanDetailResponse,
  CreateTariffPlanRequest,
  UpdateTariffPlanRequest,
} from "./tariff-plans/schemas";
export type {
  RUCPolicy,
  RUCPolicyListResponse,
  RUCPolicyDetailResponse,
  CreateRUCPolicyRequest,
  UpdateRUCPolicyRequest,
} from "./ruc-policies/schemas";
export type {
  RoadClosureRate,
  RoadClosureRateListResponse,
  RoadClosureRateDetailResponse,
  CreateRoadClosureRateRequest,
  UpdateRoadClosureRateRequest,
} from "./road-closure-rates/schemas";
export type {
  RoadClosurePermit,
  RoadClosurePermitListResponse,
  RoadClosurePermitDetailResponse,
  CreateRoadClosurePermitRequest,
  RoadClosurePermitApprovalRequest,
} from "./permits/schemas";
export type {
  MunicipalRoute,
  MunicipalRouteListResponse,
  MunicipalRouteDetailResponse,
  CreateMunicipalRouteRequest,
} from "./municipal-routes/schemas";
export type {
  Municipality,
  BoundaryVersion,
  MunicipalityDetailResponse,
  MunicipalityListResponse,
  MunicipalityConfigurationResponse,
  BoundaryVersionDetailResponse,
  BoundaryVersionListResponse,
  CreateMunicipalityRequest,
  CreateBoundaryVersionRequest,
} from "./municipalities/schemas";
export type {
  FinePolicy,
  FinePolicyListResponse,
  FinePolicyDetailResponse,
  CreateFinePolicyRequest,
  UpdateFinePolicyRequest,
} from "./fine-policies/schemas";
export type {
  ExemptArea,
  ExemptAreaListResponse,
  ExemptAreaDetailResponse,
  CreateExemptAreaRequest,
  UpdateExemptAreaRequest,
} from "./exempt-areas/schemas";
export type {
  Device,
  DeviceAssignment,
  ActiveDeviceResponse,
  RegisterDeviceRequest,
  AssignDeviceRequest,
} from "./devices/schemas";
export type {
  HeatmapPoint,
  HeatmapResponse,
} from "./analytics/schemas";
export type {
  OfficerKpisPayload,
  OfficerKpisResponse,
} from "./enforcement/schemas";
export type {
  SpecialPermit,
  SpecialPermitListResponse,
  SpecialPermitDetailResponse,
  CreateSpecialPermitVehicleSelectionRequest,
  ApproveSpecialPermitRequest,
  UpdateSpecialPermitPaymentStatusRequest,
} from "./special-permits/schemas";
