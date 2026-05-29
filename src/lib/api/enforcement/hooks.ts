import { useQuery } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"
import { EnforcementApi, type ListEnforcementOfficersParams } from "./api"
import { enforcementKeys } from "./queryKeys"
import type { EnforcementOfficerListResponse } from "./schemas"

export const useEnforcementOfficersList = (
  params?: ListEnforcementOfficersParams,
  options?: Pick<UseQueryOptions<EnforcementOfficerListResponse>, "enabled">,
) =>
  useQuery({
    queryKey: enforcementKeys.officers(params),
    queryFn: ({ signal }) => EnforcementApi.listOfficers(params, signal),
    enabled: options?.enabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

export const useOfficerKpis = () =>
  useQuery({
    queryKey: enforcementKeys.officerKpis(),
    queryFn: ({ signal }) => EnforcementApi.getOfficerKpis(signal),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
