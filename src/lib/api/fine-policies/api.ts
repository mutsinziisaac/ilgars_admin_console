import { coreRequest } from "../httpClient";
import { DEFAULT_MUNICIPALITY_ID } from "../constants";
import {
  FinePolicyDetailResponseSchema,
  FinePolicyListResponseSchema,
  type CreateFinePolicyRequest,
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
};
