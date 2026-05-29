import { useQuery } from "@tanstack/react-query"
import { getActiveMunicipalityId, withActiveMunicipalityQueryKey } from "../municipality-scope"
import {
  RoadClosurePermitsApi,
  type RoadClosurePermitSearchParams,
} from "./api"
import type { RoadClosurePermitListResponse } from "./schemas"

export const PENDING_ROAD_CLOSURE_PERMIT_STATUS = "PENDING_ADMIN_APPROVAL"

export const getPendingRoadClosurePermitParams = () => ({
  municipalityId: getActiveMunicipalityId(),
  page: 0,
  size: 100,
  status: PENDING_ROAD_CLOSURE_PERMIT_STATUS,
}) satisfies RoadClosurePermitSearchParams

export const roadClosurePermitKeys = {
  all: () => ["road-closure-permits"] as const,
  lists: () => [...roadClosurePermitKeys.all(), "list"] as const,
  list: (params?: RoadClosurePermitSearchParams) =>
    [...roadClosurePermitKeys.lists(), withActiveMunicipalityQueryKey(params)] as const,
  pending: () => roadClosurePermitKeys.list(getPendingRoadClosurePermitParams()),
}

export const readRoadClosurePermitTotal = (
  response: RoadClosurePermitListResponse | undefined,
) => {
  const metaTotal = response?.meta?.total ?? response?.meta?.totalElements
  if (typeof metaTotal === "number" && Number.isFinite(metaTotal)) return metaTotal
  if (typeof metaTotal === "string") {
    const parsed = Number(metaTotal)
    if (Number.isFinite(parsed)) return parsed
  }

  return (response?.data ?? response?.content ?? []).length
}

export const removeRoadClosurePermitFromListResponse = (
  response: RoadClosurePermitListResponse | undefined,
  permitId: string,
): RoadClosurePermitListResponse | undefined => {
  if (!response) return response

  const data = response.data?.filter((permit) => permit.id !== permitId)
  const content = response.content?.filter((permit) => permit.id !== permitId)
  const previousCount = (response.data ?? response.content ?? []).length
  const nextCount = (data ?? content ?? []).length
  const removedCount = Math.max(0, previousCount - nextCount)

  return {
    ...response,
    ...(response.data ? { data } : {}),
    ...(response.content ? { content } : {}),
    meta: response.meta
      ? {
          ...response.meta,
          total:
            typeof response.meta.total === "number"
              ? Math.max(0, response.meta.total - removedCount)
              : response.meta.total,
          totalElements:
            typeof response.meta.totalElements === "number"
              ? Math.max(0, response.meta.totalElements - removedCount)
              : response.meta.totalElements,
        }
      : response.meta,
  }
}

export const useRoadClosurePermitsList = (
  params?: RoadClosurePermitSearchParams,
) =>
  useQuery({
    queryKey: roadClosurePermitKeys.list(params),
    queryFn: ({ signal }) =>
      RoadClosurePermitsApi.listRoadClosurePermits(params, signal),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

export const usePendingRoadClosurePermits = () =>
  useQuery({
    queryKey: roadClosurePermitKeys.pending(),
    queryFn: ({ signal }) =>
      RoadClosurePermitsApi.listRoadClosurePermits(
        getPendingRoadClosurePermitParams(),
        signal,
      ),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
