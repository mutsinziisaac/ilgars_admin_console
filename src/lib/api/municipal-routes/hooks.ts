import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  MunicipalRoutesApi,
  type ListMunicipalRoutesParams,
} from "./api"
import type { CreateMunicipalRouteRequest } from "./schemas"
import { municipalRoutesKeys } from "./queryKeys"

export const useMunicipalRoutesList = (params?: ListMunicipalRoutesParams) =>
  useQuery({
    queryKey: municipalRoutesKeys.list(params),
    queryFn: ({ signal }) => MunicipalRoutesApi.listMunicipalRoutes(params, signal),
  })

export const useCreateMunicipalRoute = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateMunicipalRouteRequest) =>
      MunicipalRoutesApi.createMunicipalRoute(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: municipalRoutesKeys.all() })
    },
  })
}
