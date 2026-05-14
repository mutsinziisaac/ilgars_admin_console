import { coreRequest, coreHttpClient } from "../httpClient";
import { DEFAULT_MUNICIPALITY_ID } from "../constants";
import {
  FinePolicyDetailResponseSchema,
  FinePolicyListResponseSchema,
  type CreateFinePolicyRequest,
  type UpdateFinePolicyRequest,
  type FinePolicyDetailResponse,
  type FinePolicyListResponse,
} from "./schemas";

export interface ListFinePoliciesParams {
  municipalityId?: string;
  active?: boolean;
  page?: number;
  size?: number;
}

export const FinePoliciesApi = {
  /**
   * List fine policies
   * GET /v1/fine-policies
   */
  listFinePolicies: (params?: ListFinePoliciesParams, signal?: AbortSignal) =>
    coreRequest<FinePolicyListResponse>({
      method: "GET",
      url: "/v1/fine-policies",
      params: {
        municipalityId: DEFAULT_MUNICIPALITY_ID,
        ...params,
      },
      signal,
      schema: FinePolicyListResponseSchema,
    }),

  /**
   * Create fine policy
   * POST /v1/fine-policies
   */
  createFinePolicy: (payload: CreateFinePolicyRequest, signal?: AbortSignal) =>
    coreRequest<FinePolicyDetailResponse>({
      method: "POST",
      url: "/v1/fine-policies",
      data: {
        data: {
          municipalityId: DEFAULT_MUNICIPALITY_ID,
          ...payload,
        },
      },
      signal,
      schema: FinePolicyDetailResponseSchema,
    }),

  /**
   * Get fine policy
   * GET /v1/fine-policies/{id}
   */
  getFinePolicy: (policyId: string, signal?: AbortSignal) =>
    coreRequest<FinePolicyDetailResponse>({
      method: "GET",
      url: `/v1/fine-policies/${encodeURIComponent(policyId)}`,
      signal,
      schema: FinePolicyDetailResponseSchema,
    }),

  /**
   * Update fine policy
   * PUT /v1/fine-policies/{id}
   */
  updateFinePolicy: (policyId: string, payload: UpdateFinePolicyRequest, signal?: AbortSignal) =>
    coreRequest<FinePolicyDetailResponse>({
      method: "PUT",
      url: `/v1/fine-policies/${encodeURIComponent(policyId)}`,
      data: {
        data: {
          municipalityId: DEFAULT_MUNICIPALITY_ID,
          ...payload,
        },
      },
      signal,
      schema: FinePolicyDetailResponseSchema,
    }),

  /**
   * Delete fine policy
   * DELETE /v1/fine-policies/{id}
   */
  deleteFinePolicy: (policyId: string) =>
    coreHttpClient.delete(`/v1/fine-policies/${encodeURIComponent(policyId)}`).then(() => undefined),
};
