import { coreRequest, coreHttpClient } from "../httpClient"
import {
  RoadClosureRateDetailResponseSchema,
  RoadClosureRateListResponseSchema,
  type RoadClosureRateListResponse,
  type RoadClosureRateDetailResponse,
  type CreateRoadClosureRateRequest,
  type UpdateRoadClosureRateRequest,
} from "./schemas"

const MUNICIPALITY_ID = "aa73ac5e-4912-460f-a927-ba3ccbe57207"

export interface ListRoadClosureRatesParams {
  municipalityId?: string
  purpose?: string
  roadType?: string
  active?: boolean
}

export const RoadClosureRatesApi = {
  /**
   * List road closure rates
   * GET /v1/road-closure-rates
   */
  listRoadClosureRates: async (params?: ListRoadClosureRatesParams, signal?: AbortSignal): Promise<RoadClosureRateListResponse> => {
    const effectiveParams = {
      municipalityId: MUNICIPALITY_ID,
      ...params,
    }
    
    return coreRequest<RoadClosureRateListResponse>({
      method: "GET",
      url: "/v1/road-closure-rates",
      params: effectiveParams,
      signal,
      schema: RoadClosureRateListResponseSchema,
    })
  },

  /**
   * Get road closure rate by ID
   * GET /v1/road-closure-rates/{id}
   */
  getRoadClosureRate: async (id: string, signal?: AbortSignal): Promise<RoadClosureRateDetailResponse> => {
    return coreRequest<RoadClosureRateDetailResponse>({
      method: "GET",
      url: `/v1/road-closure-rates/${encodeURIComponent(id)}`,
      signal,
      schema: RoadClosureRateDetailResponseSchema,
    })
  },

  /**
   * Create road closure rate
   * POST /v1/road-closure-rates
   */
  createRoadClosureRate: (payload: CreateRoadClosureRateRequest) =>
    coreRequest<RoadClosureRateDetailResponse>({
      method: "POST",
      url: "/v1/road-closure-rates",
      data: {
        data: {
          municipalityId: MUNICIPALITY_ID,
          ...payload,
        },
      },
      schema: RoadClosureRateDetailResponseSchema,
    }),

  /**
   * Update road closure rate
   * PUT /v1/road-closure-rates/{id}
   */
  updateRoadClosureRate: (id: string, payload: UpdateRoadClosureRateRequest) =>
    coreRequest<RoadClosureRateDetailResponse>({
      method: "PUT",
      url: `/v1/road-closure-rates/${encodeURIComponent(id)}`,
      data: {
        data: {
          municipalityId: MUNICIPALITY_ID,
          ...payload,
        },
      },
      schema: RoadClosureRateDetailResponseSchema,
    }),

  /**
   * Activate road closure rate
   * POST /v1/road-closure-rates/{id}/activate
   */
  activateRoadClosureRate: (id: string) =>
    coreRequest<void>({
      method: "POST",
      url: `/v1/road-closure-rates/${encodeURIComponent(id)}/activate`,
      data: {},
    }),

  /**
   * Delete road closure rate
   * DELETE /v1/road-closure-rates/{id}
   */
  deleteRoadClosureRate: (id: string) =>
    coreHttpClient.delete(`/v1/road-closure-rates/${encodeURIComponent(id)}`).then(() => undefined),
}
