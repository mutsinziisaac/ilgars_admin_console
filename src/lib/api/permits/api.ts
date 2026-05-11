import { coreRequest } from "../httpClient";
import {
  RoadClosureRateListResponseSchema,
  RoadClosureRateDetailResponseSchema,
  RoadClosurePermitListResponseSchema,
  RoadClosurePermitDetailResponseSchema,
  type RoadClosureRateListResponse,
  type RoadClosureRateDetailResponse,
  type CreateRoadClosureRateRequest,
  type RoadClosurePermitListResponse,
  type RoadClosurePermitDetailResponse,
  type CreateRoadClosurePermitRequest,
} from "./schemas";

export interface RoadClosureRateSearchParams {
  page?: number;
  pageSize?: number;
  status?: "ACTIVE" | "INACTIVE";
  roadType?: string;
}

export interface RoadClosurePermitSearchParams {
  page?: number;
  pageSize?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  vehiclePlateNumber?: string;
  startDate?: string;
  endDate?: string;
}

export const RoadClosureRatesApi = {
  /**
   * List all road closure rates
   * GET /v1/road-closure-rates
   */
  listRoadClosureRates: (
    params?: RoadClosureRateSearchParams,
    signal?: AbortSignal,
  ) =>
    coreRequest<RoadClosureRateListResponse>({
      method: "GET",
      url: "/v1/road-closure-rates",
      params,
      signal,
      schema: RoadClosureRateListResponseSchema,
    }),

  /**
   * Create a new road closure rate
   * POST /v1/road-closure-rates
   */
  createRoadClosureRate: (
    data: CreateRoadClosureRateRequest,
    signal?: AbortSignal,
  ) =>
    coreRequest<RoadClosureRateDetailResponse>({
      method: "POST",
      url: "/v1/road-closure-rates",
      data,
      signal,
      schema: RoadClosureRateDetailResponseSchema,
    }),
};

export const RoadClosurePermitsApi = {
  /**
   * List all road closure permits
   * GET /v1/road-closure-permits
   */
  listRoadClosurePermits: (
    params?: RoadClosurePermitSearchParams,
    signal?: AbortSignal,
  ) =>
    coreRequest<RoadClosurePermitListResponse>({
      method: "GET",
      url: "/v1/road-closure-permits",
      params,
      signal,
      schema: RoadClosurePermitListResponseSchema,
    }),

  /**
   * Get a specific road closure permit
   * GET /v1/road-closure-permits/{roadClosurePermitId}
   */
  getRoadClosurePermit: (roadClosurePermitId: string, signal?: AbortSignal) =>
    coreRequest<RoadClosurePermitDetailResponse>({
      method: "GET",
      url: `/v1/road-closure-permits/${roadClosurePermitId}`,
      signal,
      schema: RoadClosurePermitDetailResponseSchema,
    }),

  /**
   * Create a new road closure permit
   * POST /v1/road-closure-permits
   */
  createRoadClosurePermit: (
    data: CreateRoadClosurePermitRequest,
    signal?: AbortSignal,
  ) =>
    coreRequest<RoadClosurePermitDetailResponse>({
      method: "POST",
      url: "/v1/road-closure-permits",
      data,
      signal,
      schema: RoadClosurePermitDetailResponseSchema,
    }),
};
