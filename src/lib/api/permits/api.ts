import { coreRequest } from "../httpClient";
import { DEFAULT_MUNICIPALITY_ID } from "../constants";
import { toApiError } from "../errors";
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

const shouldTryNextDecisionRequest = (error: unknown) => {
  const apiError = toApiError(error);
  return apiError.status === 400 || apiError.status === 404 || apiError.status === 422;
};

const normalizeDecisionResponse = async (
  roadClosurePermitId: string,
  response: unknown,
  signal?: AbortSignal,
): Promise<RoadClosurePermitDetailResponse> => {
  const parsed = RoadClosurePermitDetailResponseSchema.safeParse(response);
  if (parsed.success) return parsed.data;

  return RoadClosurePermitsApi.getRoadClosurePermit(roadClosurePermitId, signal);
};

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
    detailRoadClosurePermitId = roadClosurePermitId,
  ) => {
    const encodedPermitId = encodeURIComponent(roadClosurePermitId);
    const decisionPayload = {
      municipalityId: DEFAULT_MUNICIPALITY_ID,
      permitId: roadClosurePermitId,
      roadClosurePermitId,
      ...payload,
    };
    const attempts = [
      {
        url: `/v1/road-closure-permits/${encodedPermitId}/approval`,
        data: { data: decisionPayload },
      },
      {
        url: `/v1/road-closure-permits/${encodedPermitId}/approval`,
        data: decisionPayload,
      },
      {
        url: "/v1/road-closure-permits/approval",
        data: { data: decisionPayload },
      },
      {
        url: "/v1/road-closure-permits/approval",
        data: decisionPayload,
      },
      {
        url: "/v1/road-closure-permits//approval",
        data: { data: decisionPayload },
      },
      {
        url: "/v1/road-closure-permits//approval",
        data: decisionPayload,
      },
    ];

    const runAttempt = async (index: number): Promise<RoadClosurePermitDetailResponse> => {
      const attempt = attempts[index];
      if (!attempt) {
        throw new Error("No road closure permit approval endpoint is available.");
      }

      try {
        const response = await coreRequest<unknown>({
          method: "POST",
          url: attempt.url,
          params: {
            municipalityId: DEFAULT_MUNICIPALITY_ID,
          },
          data: attempt.data,
          signal,
        });

        return normalizeDecisionResponse(detailRoadClosurePermitId, response, signal);
      } catch (error) {
        if (index < attempts.length - 1 && shouldTryNextDecisionRequest(error)) {
          return runAttempt(index + 1);
        }

        throw error;
      }
    };

    return runAttempt(0);
  },

  /**
   * Issue a road closure permit after payment
   * POST /v1/road-closure-permits/{roadClosurePermitId}/issue
   */
  issueRoadClosurePermit: (
    roadClosurePermitId: string,
    payload: { paymentReference: string },
    signal?: AbortSignal,
  ) =>
    coreRequest<RoadClosurePermitDetailResponse>({
      method: "POST",
      url: `/v1/road-closure-permits/${encodeURIComponent(roadClosurePermitId)}/issue`,
      data: {
        data: {
          municipalityId: DEFAULT_MUNICIPALITY_ID,
          permitId: roadClosurePermitId,
          roadClosurePermitId,
          paymentReference: payload.paymentReference,
        },
      },
      signal,
      schema: RoadClosurePermitDetailResponseSchema,
    }),
};
