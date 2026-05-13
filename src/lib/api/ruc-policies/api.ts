import { coreRequest, coreHttpClient } from "../httpClient"
import {
  RUCPolicyDetailResponseSchema,
  RUCPolicyListResponseSchema,
  type RUCPolicyListResponse,
  type RUCPolicyDetailResponse,
  type CreateRUCPolicyRequest,
  type UpdateRUCPolicyRequest,
} from "./schemas"

const MUNICIPALITY_ID = "aa73ac5e-4912-460f-a927-ba3ccbe57207"

export interface ListRUCPoliciesParams {
  municipalityId?: string
  active?: boolean
}

export const RUCPoliciesApi = {
  /**
   * List RUC policies
   * GET /v1/ruc-policies
   */
  listRUCPolicies: async (params?: ListRUCPoliciesParams, signal?: AbortSignal): Promise<RUCPolicyListResponse> => {
    const effectiveParams = {
      municipalityId: MUNICIPALITY_ID,
      ...params,
    }
    
    return coreRequest<RUCPolicyListResponse>({
      method: "GET",
      url: "/v1/ruc-policies",
      params: effectiveParams,
      signal,
      schema: RUCPolicyListResponseSchema,
    })
  },

  /**
   * Get RUC policy by ID
   * GET /v1/ruc-policies/{id}
   */
  getRUCPolicy: async (id: string, signal?: AbortSignal): Promise<RUCPolicyDetailResponse> => {
    return coreRequest<RUCPolicyDetailResponse>({
      method: "GET",
      url: `/v1/ruc-policies/${encodeURIComponent(id)}`,
      signal,
      schema: RUCPolicyDetailResponseSchema,
    })
  },

  /**
   * Create RUC policy
   * POST /v1/ruc-policies
   */
  createRUCPolicy: (payload: CreateRUCPolicyRequest) =>
    coreRequest<RUCPolicyDetailResponse>({
      method: "POST",
      url: "/v1/ruc-policies",
      data: {
        data: {
          municipalityId: MUNICIPALITY_ID,
          ...payload,
        },
      },
      schema: RUCPolicyDetailResponseSchema,
    }),

  /**
   * Update RUC policy
   * PUT /v1/ruc-policies/{id}
   */
  updateRUCPolicy: (id: string, payload: UpdateRUCPolicyRequest) =>
    coreRequest<RUCPolicyDetailResponse>({
      method: "PUT",
      url: `/v1/ruc-policies/${encodeURIComponent(id)}`,
      data: {
        data: {
          municipalityId: MUNICIPALITY_ID,
          ...payload,
        },
      },
      schema: RUCPolicyDetailResponseSchema,
    }),

  /**
   * Activate RUC policy
   * POST /v1/ruc-policies/{id}/activate
   */
  activateRUCPolicy: (id: string) =>
    coreRequest<void>({
      method: "POST",
      url: `/v1/ruc-policies/${encodeURIComponent(id)}/activate`,
      data: {},
    }),

  /**
   * Delete RUC policy
   * DELETE /v1/ruc-policies/{id}
   */
  deleteRUCPolicy: (id: string) =>
    coreHttpClient.delete(`/v1/ruc-policies/${encodeURIComponent(id)}`).then(() => undefined),
}
