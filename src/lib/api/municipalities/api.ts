import { coreRequest } from "../httpClient";
import {
  BoundaryVersionDetailResponseSchema,
  BoundaryVersionListResponseSchema,
  MunicipalityConfigurationResponseSchema,
  MunicipalityDetailResponseSchema,
  MunicipalityListResponseSchema,
  type BoundaryVersionDetailResponse,
  type BoundaryVersionListResponse,
  type CreateBoundaryVersionRequest,
  type CreateMunicipalityRequest,
  type MunicipalityConfigurationResponse,
  type MunicipalityDetailResponse,
  type MunicipalityListResponse,
} from "./schemas";

export const MunicipalitiesApi = {
  /**
   * List municipalities
   * GET /v1/municipalities
   */
  listMunicipalities: (signal?: AbortSignal) =>
    coreRequest<MunicipalityListResponse>({
      method: "GET",
      url: "/v1/municipalities",
      signal,
      schema: MunicipalityListResponseSchema,
    }),

  /**
   * Get municipality by id
   * GET /v1/municipalities/{municipalityId}
   */
  getMunicipality: (municipalityId: string, signal?: AbortSignal) =>
    coreRequest<MunicipalityDetailResponse>({
      method: "GET",
      url: `/v1/municipalities/${encodeURIComponent(municipalityId)}`,
      signal,
      schema: MunicipalityDetailResponseSchema,
    }),

  /**
   * List municipality boundary versions
   * GET /v1/municipalities/{municipalityId}/boundary-versions
   */
  listBoundaryVersions: (municipalityId: string, signal?: AbortSignal) =>
    coreRequest<BoundaryVersionListResponse>({
      method: "GET",
      url: `/v1/municipalities/${encodeURIComponent(municipalityId)}/boundary-versions`,
      signal,
      schema: BoundaryVersionListResponseSchema,
    }),

  /**
   * Get municipality configuration
   * GET /v1/municipalities/{municipalityId}/configuration
   */
  getMunicipalityConfiguration: (
    municipalityId: string,
    signal?: AbortSignal,
  ) =>
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
      data: {},
      schema: BoundaryVersionDetailResponseSchema,
    }),
};
