import { coreRequest } from "../httpClient";
import { DEFAULT_MUNICIPALITY_ID } from "../constants";
import {
  MunicipalRouteDetailResponseSchema,
  MunicipalRouteListResponseSchema,
  type CreateMunicipalRouteRequest,
  type MunicipalRouteDetailResponse,
  type MunicipalRouteListResponse,
  type UpdateMunicipalRouteRequest,
} from "./schemas";

export interface ListMunicipalRoutesParams {
  municipalityId?: string;
  allowedUse?: "SPECIAL_PERMIT" | "ROAD_CLOSURE" | string;
  active?: boolean;
  page?: number;
  size?: number;
}

export const MunicipalRoutesApi = {
  /**
   * List municipal routes
   * GET /v1/municipal-routes
   */
  listMunicipalRoutes: (params?: ListMunicipalRoutesParams, signal?: AbortSignal) =>
    coreRequest<MunicipalRouteListResponse>({
      method: "GET",
      url: "/v1/municipal-routes",
      params: {
        municipalityId: DEFAULT_MUNICIPALITY_ID,
        ...params,
      },
      signal,
      schema: MunicipalRouteListResponseSchema,
    }),

  /**
   * Create municipal route
   * POST /v1/municipal-routes
   */
  createMunicipalRoute: (payload: CreateMunicipalRouteRequest, signal?: AbortSignal) =>
    coreRequest<MunicipalRouteDetailResponse>({
      method: "POST",
      url: "/v1/municipal-routes",
      data: {
        data: {
          municipalityId: DEFAULT_MUNICIPALITY_ID,
          ...payload,
        },
      },
      signal,
      schema: MunicipalRouteDetailResponseSchema,
    }),

  /**
   * Update municipal route
   * PUT /v1/municipal-routes/{routeId}
   */
  updateMunicipalRoute: (
    routeId: string,
    payload: UpdateMunicipalRouteRequest,
    signal?: AbortSignal,
  ) =>
    coreRequest<MunicipalRouteDetailResponse>({
      method: "PUT",
      url: `/v1/municipal-routes/${routeId}`,
      data: {
        data: payload,
      },
      signal,
      schema: MunicipalRouteDetailResponseSchema,
    }),
};
