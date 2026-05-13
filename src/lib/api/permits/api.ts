import { coreRequest } from "../httpClient";
import { DEFAULT_MUNICIPALITY_ID } from "../constants";
import { RoadClosureRatesApi } from "../road-closure-rates/api";
import {
  RoadClosurePermitDetailResponseSchema,
  RoadClosurePermitListResponseSchema,
  type CreateRoadClosurePermitRequest,
  type RoadClosurePermitApprovalRequest,
  type RoadClosurePermitDetailResponse,
  type RoadClosurePermitListResponse,
} from "./schemas";

export { RoadClosureRatesApi };

export interface RoadClosurePermitSearchParams {
  municipalityId?: string;
  page?: number;
  size?: number;
  status?: string;
  routeId?: string;
}

export const RoadClosurePermitsApi = {
  /**
   * List road closure permit requests
   * GET /v1/road-closure-permits
   */
  listRoadClosurePermits: (
    params?: RoadClosurePermitSearchParams,
    signal?: AbortSignal,
  ) =>
    coreRequest<RoadClosurePermitListResponse>({
      method: "GET",
      url: "/v1/road-closure-permits",
      params: {
        municipalityId: DEFAULT_MUNICIPALITY_ID,
        ...params,
      },
      signal,
      schema: RoadClosurePermitListResponseSchema,
    }),

  /**
   * Get a road closure permit request
   * GET /v1/road-closure-permits/{roadClosurePermitId}
   */
  getRoadClosurePermit: (roadClosurePermitId: string, signal?: AbortSignal) =>
    coreRequest<RoadClosurePermitDetailResponse>({
      method: "GET",
      url: `/v1/road-closure-permits/${encodeURIComponent(roadClosurePermitId)}`,
      signal,
      schema: RoadClosurePermitDetailResponseSchema,
    }),

  /**
   * Create a road closure permit request
   * POST /v1/road-closure-permits
   */
  createRoadClosurePermit: (
    payload: CreateRoadClosurePermitRequest,
    signal?: AbortSignal,
  ) =>
    coreRequest<RoadClosurePermitDetailResponse>({
      method: "POST",
      url: "/v1/road-closure-permits",
      data: {
        data: {
          municipalityId: DEFAULT_MUNICIPALITY_ID,
          ...payload,
        },
      },
      signal,
      schema: RoadClosurePermitDetailResponseSchema,
    }),

  /**
   * Approve or reject a road closure permit request
   * POST /v1/road-closure-permits/{roadClosurePermitId}/approval
   */
  decideRoadClosurePermit: (
    roadClosurePermitId: string,
    payload: RoadClosurePermitApprovalRequest,
    signal?: AbortSignal,
  ) =>
    coreRequest<RoadClosurePermitDetailResponse>({
      method: "POST",
      url: `/v1/road-closure-permits/${encodeURIComponent(roadClosurePermitId)}/approval`,
      data: { data: payload },
      signal,
      schema: RoadClosurePermitDetailResponseSchema,
    }),

  /**
   * Issue a road closure permit after payment
   * POST /v1/road-closure-permits/{roadClosurePermitId}/issue
   */
  issueRoadClosurePermit: (roadClosurePermitId: string, signal?: AbortSignal) =>
    coreRequest<RoadClosurePermitDetailResponse>({
      method: "POST",
      url: `/v1/road-closure-permits/${encodeURIComponent(roadClosurePermitId)}/issue`,
      data: {},
      signal,
      schema: RoadClosurePermitDetailResponseSchema,
    }),
};
