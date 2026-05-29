import { coreRequest } from "../httpClient"
import { withActiveMunicipality, withActiveMunicipalityData } from "../municipality-scope"
import {
  SpecialPermitActionResponseSchema,
  SpecialPermitDetailResponseSchema,
  SpecialPermitListResponseSchema,
  type ApproveSpecialPermitRequest,
  type CreateSpecialPermitRouteRequest,
  type CreateSpecialPermitVehicleSelectionRequest,
  type ReviewSpecialPermitRouteRequest,
  type SpecialPermitDetailResponse,
  type SpecialPermitListResponse,
  type UpdateSpecialPermitPaymentStatusRequest,
} from "./schemas"

export interface ListSpecialPermitsParams {
  municipalityId?: string
  vehicleId?: string
  status?: string
  page?: number
  size?: number
}

export interface ListSpecialPermitRouteRequestsParams {
  municipalityId?: string
  status?: string
  page?: number
  size?: number
}

export const SpecialPermitsApi = {
  /**
   * GET /v1/special-permits
   */
  listSpecialPermits: (params?: ListSpecialPermitsParams, signal?: AbortSignal) =>
    coreRequest<SpecialPermitListResponse>({
      method: "GET",
      url: "/v1/special-permits",
      params: withActiveMunicipality(params),
      signal,
      schema: SpecialPermitListResponseSchema,
    }),

  /**
   * GET /v1/special-permit-route-requests
   */
  listSpecialPermitRouteRequests: (params?: ListSpecialPermitRouteRequestsParams, signal?: AbortSignal) =>
    coreRequest<SpecialPermitListResponse>({
      method: "GET",
      url: "/v1/special-permit-route-requests",
      params: withActiveMunicipality(params),
      signal,
      schema: SpecialPermitListResponseSchema,
    }),

  /**
   * POST /v1/special-permit-route-requests
   */
  createSpecialPermitRouteRequest: (payload: CreateSpecialPermitRouteRequest, signal?: AbortSignal) =>
    coreRequest<SpecialPermitDetailResponse>({
      method: "POST",
      url: "/v1/special-permit-route-requests",
      data: {
        data: withActiveMunicipalityData(payload),
      },
      signal,
      schema: SpecialPermitDetailResponseSchema,
    }),

  /**
   * POST /v1/special-permit-route-requests/{requestId}/approval
   */
  reviewSpecialPermitRouteRequest: (
    requestId: string,
    payload: ReviewSpecialPermitRouteRequest,
    signal?: AbortSignal,
  ) =>
    coreRequest<unknown>({
      method: "POST",
      url: `/v1/special-permit-route-requests/${encodeURIComponent(requestId)}/approval`,
      data: {
        data: withActiveMunicipalityData(payload),
      },
      signal,
      schema: SpecialPermitActionResponseSchema,
    }),

  /**
   * GET /v1/special-permits/{permitId}
   */
  getSpecialPermit: (permitId: string, signal?: AbortSignal) =>
    coreRequest<SpecialPermitDetailResponse>({
      method: "GET",
      url: `/v1/special-permits/${encodeURIComponent(permitId)}`,
      params: withActiveMunicipality(),
      signal,
      schema: SpecialPermitDetailResponseSchema,
    }),

  /**
   * POST /v1/special-permits/vehicle-selections
   */
  createVehicleSelection: (payload: CreateSpecialPermitVehicleSelectionRequest, signal?: AbortSignal) =>
    coreRequest<SpecialPermitDetailResponse>({
      method: "POST",
      url: "/v1/special-permits/vehicle-selections",
      data: {
        data: withActiveMunicipalityData(payload),
      },
      signal,
      schema: SpecialPermitDetailResponseSchema,
    }),

  /**
   * POST /v1/special-permits/{permitId}/approve
   */
  approveSpecialPermit: (permitId: string, payload: ApproveSpecialPermitRequest, signal?: AbortSignal) =>
    coreRequest<unknown>({
      method: "POST",
      url: `/v1/special-permits/${encodeURIComponent(permitId)}/approve`,
      data: {
        data: withActiveMunicipalityData(payload),
      },
      signal,
      schema: SpecialPermitActionResponseSchema,
    }),

  /**
   * POST /v1/special-permits/{permitId}/payment-status
   */
  updatePaymentStatus: (
    permitId: string,
    payload: UpdateSpecialPermitPaymentStatusRequest,
    signal?: AbortSignal,
  ) =>
    coreRequest<unknown>({
      method: "POST",
      url: `/v1/special-permits/${encodeURIComponent(permitId)}/payment-status`,
      data: {
        data: withActiveMunicipalityData(payload),
      },
      signal,
      schema: SpecialPermitActionResponseSchema,
    }),
}
