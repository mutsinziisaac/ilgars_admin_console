import { coreRequest } from "../httpClient"
import {
  OfficerKpisResponseSchema,
  type OfficerKpisResponse,
} from "./schemas"

export const EnforcementApi = {
  /**
   * Get KPI summary for the logged-in enforcement officer.
   * GET /v1/enforcement/officers/me/kpis
   */
  getOfficerKpis: (signal?: AbortSignal) =>
    coreRequest<OfficerKpisResponse>({
      method: "GET",
      url: "/v1/enforcement/officers/me/kpis",
      signal,
      schema: OfficerKpisResponseSchema,
    }),
}
