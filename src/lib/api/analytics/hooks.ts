import { useQuery } from "@tanstack/react-query"
import { getActiveMunicipalityId } from "../municipality-scope"
import { AnalyticsApi } from "./api"

export const analyticsKeys = {
  all: () => ["analytics"] as const,
  liveMap: (municipalityId?: string) => ["analytics", "live-map", municipalityId ?? getActiveMunicipalityId()] as const,
}

export const useLiveMap = (municipalityId = getActiveMunicipalityId()) =>
  useQuery({
    queryKey: analyticsKeys.liveMap(municipalityId),
    queryFn: ({ signal }) => AnalyticsApi.getLiveMap({ municipalityId }, signal),
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  })
