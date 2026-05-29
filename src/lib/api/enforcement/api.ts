import { coreRequest } from "../httpClient"
import { withActiveMunicipality } from "../municipality-scope"
import {
  EnforcementOfficerListResponseSchema,
  OfficerKpisResponseSchema,
  type EnforcementOfficerListResponse,
  type OfficerKpisResponse,
} from "./schemas"

export interface ListEnforcementOfficersParams {
  municipalityId?: string
  status?: string
  page?: number
  size?: number
}

export const EnforcementApi = {
  /**
   * GET /v1/enforcement/officers
   */
  listOfficers: (params?: ListEnforcementOfficersParams, signal?: AbortSignal) =>
    coreRequest<EnforcementOfficerListResponse>({
      method: "GET",
      url: "/v1/enforcement/officers",
      params: withActiveMunicipality(params),
      signal,
      schema: EnforcementOfficerListResponseSchema,
    }),

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
