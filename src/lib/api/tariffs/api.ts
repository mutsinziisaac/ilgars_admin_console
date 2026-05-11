import { coreRequest } from "../httpClient";
import {
  TariffPlanListResponseSchema,
  TariffPlanDetailResponseSchema,
  type TariffPlanListResponse,
  type TariffPlanDetailResponse,
  type CreateTariffPlanRequest,
  type UpdateTariffPlanRequest,
} from "./schemas";

export interface TariffPlanSearchParams {
  page?: number;
  pageSize?: number;
  type?: "ROAD_CLOSURE" | "CIRCULATION";
  status?: "ACTIVE" | "INACTIVE" | "DRAFT";
}

export const TariffPlansApi = {
  /**
   * List all tariff plans
   * GET /v1/tariff-plans
   */
  listTariffPlans: (params?: TariffPlanSearchParams, signal?: AbortSignal) =>
    coreRequest<TariffPlanListResponse>({
      method: "GET",
      url: "/v1/tariff-plans",
      params,
      signal,
      schema: TariffPlanListResponseSchema,
    }),

  /**
   * Get a specific tariff plan
   * GET /v1/tariff-plans/{tariffPlanId}
   */
  getTariffPlan: (tariffPlanId: string, signal?: AbortSignal) =>
    coreRequest<TariffPlanDetailResponse>({
      method: "GET",
      url: `/v1/tariff-plans/${tariffPlanId}`,
      signal,
      schema: TariffPlanDetailResponseSchema,
    }),

  /**
   * Create a new tariff plan
   * POST /v1/tariff-plans
   */
  createTariffPlan: (data: CreateTariffPlanRequest, signal?: AbortSignal) =>
    coreRequest<TariffPlanDetailResponse>({
      method: "POST",
      url: "/v1/tariff-plans",
      data,
      signal,
      schema: TariffPlanDetailResponseSchema,
    }),

  /**
   * Update an existing tariff plan
   * POST /v1/tariff-plans/{tariffPlanId}
   */
  updateTariffPlan: (
    tariffPlanId: string,
    data: UpdateTariffPlanRequest,
    signal?: AbortSignal,
  ) =>
    coreRequest<TariffPlanDetailResponse>({
      method: "POST",
      url: `/v1/tariff-plans/${tariffPlanId}`,
      data,
      signal,
      schema: TariffPlanDetailResponseSchema,
    }),

  /**
   * Activate a tariff plan
   * POST /v1/tariff-plans/{tariffPlanId}/activate
   */
  activateTariffPlan: (tariffPlanId: string, signal?: AbortSignal) =>
    coreRequest<TariffPlanDetailResponse>({
      method: "POST",
      url: `/v1/tariff-plans/${tariffPlanId}/activate`,
      signal,
      schema: TariffPlanDetailResponseSchema,
    }),
};
