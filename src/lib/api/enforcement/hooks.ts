import { useQuery } from "@tanstack/react-query"
import { EnforcementApi } from "./api"
import { enforcementKeys } from "./queryKeys"

export const useOfficerKpis = () =>
  useQuery({
    queryKey: enforcementKeys.officerKpis(),
    queryFn: ({ signal }) => EnforcementApi.getOfficerKpis(signal),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
