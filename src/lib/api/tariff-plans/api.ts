import { coreRequest, coreHttpClient } from "../httpClient"
import {
  TariffPlanDetailResponseSchema,
  TariffPlanListResponseSchema,
  type TariffPlanListResponse,
  type TariffPlanDetailResponse,
  type CreateTariffPlanRequest,
  type UpdateTariffPlanRequest,
} from "./schemas"

const MUNICIPALITY_ID = "aa73ac5e-4912-460f-a927-ba3ccbe57207"

export interface ListTariffPlansParams {
  municipalityId?: string
  status?: "all" | "active" | "inactive"
}

export const TariffPlansApi = {
  /**
   * List tariff plans
   * GET /v1/tariff-plans
   */
  listTariffPlans: async (params?: ListTariffPlansParams, signal?: AbortSignal): Promise<TariffPlanListResponse> => {
    const effectiveParams = {
      municipalityId: MUNICIPALITY_ID,
      status: "all",
      ...params,
    }
    
    return coreRequest<TariffPlanListResponse>({
      method: "GET",
      url: "/v1/tariff-plans",
      params: effectiveParams,
      signal,
      schema: TariffPlanListResponseSchema,
    })
  },

  /**
   * Get tariff plan by ID
   * GET /v1/tariff-plans/{id}
   */
  getTariffPlan: async (id: string, signal?: AbortSignal): Promise<TariffPlanDetailResponse> => {
    return coreRequest<TariffPlanDetailResponse>({
      method: "GET",
      url: `/v1/tariff-plans/${encodeURIComponent(id)}`,
      signal,
      schema: TariffPlanDetailResponseSchema,
    })
  },

  /**
   * Create tariff plan
   * POST /v1/tariff-plans
   */
  createTariffPlan: (payload: CreateTariffPlanRequest) =>
    coreRequest<TariffPlanDetailResponse>({
      method: "POST",
      url: "/v1/tariff-plans",
      data: {
        data: {
          municipalityId: MUNICIPALITY_ID,
          ...payload,
        },
      },
      schema: TariffPlanDetailResponseSchema,
    }),

  /**
   * Update tariff plan
   * PUT /v1/tariff-plans/{id}
   */
  updateTariffPlan: (id: string, payload: UpdateTariffPlanRequest) =>
    coreRequest<TariffPlanDetailResponse>({
      method: "PUT",
      url: `/v1/tariff-plans/${encodeURIComponent(id)}`,
      data: {
        data: {
          municipalityId: MUNICIPALITY_ID,
          ...payload,
        },
      },
      schema: TariffPlanDetailResponseSchema,
    }),

  /**
   * Activate tariff plan
   * POST /v1/tariff-plans/{id}/activate
   */
  activateTariffPlan: (id: string) =>
    coreRequest<void>({
      method: "POST",
      url: `/v1/tariff-plans/${encodeURIComponent(id)}/activate`,
      data: {},
    }),

  /**
   * Delete tariff plan
   * DELETE /v1/tariff-plans/{id}
   */
  deleteTariffPlan: (id: string) =>
    coreHttpClient.delete(`/v1/tariff-plans/${encodeURIComponent(id)}`).then(() => undefined),
}
