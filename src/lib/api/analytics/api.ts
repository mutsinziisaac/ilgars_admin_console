import { coreRequest } from "../httpClient"
import { withActiveMunicipality } from "../municipality-scope"
import {
  HeatmapResponseSchema,
  LiveMapResponseSchema,
  type HeatmapResponse,
  type LiveMapResponse,
} from "./schemas"

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
      params: withActiveMunicipality(params),
      signal,
      schema: HeatmapResponseSchema,
    }),

  /**
   * GET /v1/admin/live-map
   * Returns the latest known vehicle/device positions for the municipality.
   */
  getLiveMap: (params?: { municipalityId?: string }, signal?: AbortSignal) =>
    coreRequest<LiveMapResponse>({
      method: "GET",
      url: "/v1/admin/live-map",
      params: withActiveMunicipality(params),
      signal,
      schema: LiveMapResponseSchema,
    }),
}
