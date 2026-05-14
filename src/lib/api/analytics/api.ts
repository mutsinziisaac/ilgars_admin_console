import { coreRequest } from "../httpClient"
import { HeatmapResponseSchema, type HeatmapResponse } from "./schemas"

export interface TripHeatmapParams {
  municipalityId: string
  chargeMode?: "PREPAID" | "POSTPAID" | string
  from: string
  to: string
}

export const AnalyticsApi = {
  /**
   * GET /v1/analytics/trips/heatmap
   * Proxies https://ilgars.ayinza.dev/core/api/v1/analytics/trips/heatmap
   */
  getTripsHeatmap: (params: TripHeatmapParams, signal?: AbortSignal) =>
    coreRequest<HeatmapResponse>({
      method: "GET",
      url: "/v1/analytics/trips/heatmap",
      params,
      signal,
      schema: HeatmapResponseSchema,
    }),
}
