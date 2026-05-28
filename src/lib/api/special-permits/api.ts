import { coreRequest } from "../httpClient"
import { DEFAULT_MUNICIPALITY_ID } from "../constants"
import {
  SpecialPermitActionResponseSchema,
  SpecialPermitDetailResponseSchema,
  SpecialPermitListResponseSchema,
  type ApproveSpecialPermitRequest,
  type CreateSpecialPermitVehicleSelectionRequest,
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

export const SpecialPermitsApi = {
  /**
   * GET /v1/special-permits
   */
  listSpecialPermits: (params?: ListSpecialPermitsParams, signal?: AbortSignal) =>
    coreRequest<SpecialPermitListResponse>({
      method: "GET",
      url: "/v1/special-permits",
      params: {
        municipalityId: DEFAULT_MUNICIPALITY_ID,
        ...params,
      },
      signal,
      schema: SpecialPermitListResponseSchema,
    }),

  /**
   * GET /v1/special-permits/{permitId}
   */
  getSpecialPermit: (permitId: string, signal?: AbortSignal) =>
    coreRequest<SpecialPermitDetailResponse>({
      method: "GET",
      url: `/v1/special-permits/${encodeURIComponent(permitId)}`,
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
        data: {
          municipalityId: DEFAULT_MUNICIPALITY_ID,
          ...payload,
        },
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
        data: {
          municipalityId: DEFAULT_MUNICIPALITY_ID,
          ...payload,
        },
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
        data: {
          municipalityId: DEFAULT_MUNICIPALITY_ID,
          ...payload,
        },
      },
      signal,
      schema: SpecialPermitActionResponseSchema,
    }),
}
