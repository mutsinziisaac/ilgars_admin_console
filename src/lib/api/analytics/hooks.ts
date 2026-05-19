import { useQuery } from "@tanstack/react-query"
import { DEFAULT_MUNICIPALITY_ID } from "../constants"
import { AnalyticsApi } from "./api"

export const analyticsKeys = {
  all: () => ["analytics"] as const,
  liveMap: (municipalityId?: string) => ["analytics", "live-map", municipalityId ?? "all"] as const,
}

export const useLiveMap = (municipalityId = DEFAULT_MUNICIPALITY_ID) =>
  useQuery({
    queryKey: analyticsKeys.liveMap(municipalityId),
    queryFn: ({ signal }) => AnalyticsApi.getLiveMap({ municipalityId }, signal),
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  })
