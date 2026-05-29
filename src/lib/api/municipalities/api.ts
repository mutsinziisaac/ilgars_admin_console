import { coreRequest } from "../httpClient";
import {
  BoundaryVersionDetailResponseSchema,
  MunicipalityDetailResponseSchema,
  MunicipalityConfigurationResponseSchema,
  type BoundaryVersionDetailResponse,
  type CreateBoundaryVersionRequest,
  type CreateMunicipalityRequest,
  type MunicipalityConfigurationResponse,
  type MunicipalityDetailResponse,
} from "./schemas";

export const MunicipalitiesApi = {
  /**
   * Get municipality configuration
   * GET /v1/municipalities/{municipalityId}/configuration
   */
  getMunicipalityConfiguration: (municipalityId: string, signal?: AbortSignal) =>
    coreRequest<MunicipalityConfigurationResponse>({
      method: "GET",
      url: `/v1/municipalities/${encodeURIComponent(municipalityId)}/configuration`,
      signal,
      schema: MunicipalityConfigurationResponseSchema,
    }),

  /**
   * Create municipality
   * POST /v1/municipalities
   */
  createMunicipality: (payload: CreateMunicipalityRequest) =>
    coreRequest<MunicipalityDetailResponse>({
      method: "POST",
      url: "/v1/municipalities",
      data: { data: payload },
      schema: MunicipalityDetailResponseSchema,
    }),

  /**
   * Create municipality boundary version
   * POST /v1/municipalities/{municipalityId}/boundary-versions
   */
  createBoundaryVersion: (
    municipalityId: string,
    payload: CreateBoundaryVersionRequest,
  ) =>
    coreRequest<BoundaryVersionDetailResponse>({
      method: "POST",
      url: `/v1/municipalities/${encodeURIComponent(municipalityId)}/boundary-versions`,
      data: { data: payload },
      schema: BoundaryVersionDetailResponseSchema,
    }),

  /**
   * Activate boundary version
   * POST /v1/boundary-versions/{boundaryVersionId}/activate
   */
  activateBoundaryVersion: (boundaryVersionId: string) =>
    coreRequest<BoundaryVersionDetailResponse>({
      method: "POST",
      url: `/v1/boundary-versions/${encodeURIComponent(boundaryVersionId)}/activate`,
      schema: BoundaryVersionDetailResponseSchema,
    }),
};
