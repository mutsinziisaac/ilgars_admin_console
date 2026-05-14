import { coreHttpClient, coreRequest } from "../httpClient";
import { DEFAULT_MUNICIPALITY_ID } from "../constants";
import {
  ExemptAreaDetailResponseSchema,
  ExemptAreaListResponseSchema,
  type CreateExemptAreaRequest,
  type ExemptAreaDetailResponse,
  type ExemptAreaListResponse,
  type UpdateExemptAreaRequest,
} from "./schemas";

export interface ListExemptAreasParams {
  municipalityId?: string;
  active?: boolean;
  page?: number;
  size?: number;
}

export const ExemptAreasApi = {
  /**
   * List exempt areas
   * GET /v1/exempt-areas
   */
  listExemptAreas: (params?: ListExemptAreasParams, signal?: AbortSignal) =>
    coreRequest<ExemptAreaListResponse>({
      method: "GET",
      url: "/v1/exempt-areas",
      params: {
        municipalityId: DEFAULT_MUNICIPALITY_ID,
        active: true,
        ...params,
      },
      signal,
      schema: ExemptAreaListResponseSchema,
    }),

  /**
   * Create exempt area
   * POST /v1/exempt-areas
   */
  createExemptArea: (payload: CreateExemptAreaRequest, signal?: AbortSignal) =>
    coreRequest<ExemptAreaDetailResponse>({
      method: "POST",
      url: "/v1/exempt-areas",
      data: {
        data: {
          municipalityId: DEFAULT_MUNICIPALITY_ID,
          ...payload,
        },
      },
      signal,
      schema: ExemptAreaDetailResponseSchema,
    }),

  /**
   * Get exempt area
   * GET /v1/exempt-areas/{id}
   */
  getExemptArea: (areaId: string, signal?: AbortSignal) =>
    coreRequest<ExemptAreaDetailResponse>({
      method: "GET",
      url: `/v1/exempt-areas/${encodeURIComponent(areaId)}`,
      signal,
      schema: ExemptAreaDetailResponseSchema,
    }),

  /**
   * Update exempt area
   * PUT /v1/exempt-areas/{id}
   */
  updateExemptArea: (areaId: string, payload: UpdateExemptAreaRequest, signal?: AbortSignal) =>
    coreRequest<ExemptAreaDetailResponse>({
      method: "PUT",
      url: `/v1/exempt-areas/${encodeURIComponent(areaId)}`,
      data: {
        data: {
          municipalityId: DEFAULT_MUNICIPALITY_ID,
          ...payload,
        },
      },
      signal,
      schema: ExemptAreaDetailResponseSchema,
    }),

  /**
   * Delete exempt area
   * DELETE /v1/exempt-areas/{id}
   */
  deleteExemptArea: (areaId: string) =>
    coreHttpClient.delete(`/v1/exempt-areas/${encodeURIComponent(areaId)}`).then(() => undefined),
};
