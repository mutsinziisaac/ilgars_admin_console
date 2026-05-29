import type { ListSpecialPermitRouteRequestsParams, ListSpecialPermitsParams } from "./api"
import { withActiveMunicipalityQueryKey } from "../municipality-scope"

export const specialPermitKeys = {
  all: () => ["special-permits"] as const,
  lists: () => [...specialPermitKeys.all(), "list"] as const,
  list: (params?: ListSpecialPermitsParams) =>
    [...specialPermitKeys.lists(), withActiveMunicipalityQueryKey(params)] as const,
  routeRequests: (params?: ListSpecialPermitRouteRequestsParams) =>
    [...specialPermitKeys.all(), "route-requests", withActiveMunicipalityQueryKey(params)] as const,
  detail: (permitId: string) =>
    [...specialPermitKeys.all(), "detail", withActiveMunicipalityQueryKey(), permitId] as const,
}
