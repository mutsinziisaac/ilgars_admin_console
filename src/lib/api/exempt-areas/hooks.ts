import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ExemptAreasApi,
  type ListExemptAreasParams,
} from "./api"
import type { CreateExemptAreaRequest, UpdateExemptAreaRequest } from "./schemas"
import { exemptAreasKeys } from "./queryKeys"

export const useExemptAreasList = (params?: ListExemptAreasParams) =>
  useQuery({
    queryKey: exemptAreasKeys.list(params),
    queryFn: ({ signal }) => ExemptAreasApi.listExemptAreas(params, signal),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

export const useCreateExemptArea = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateExemptAreaRequest) =>
      ExemptAreasApi.createExemptArea(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exemptAreasKeys.all() })
    },
  })
}

export const useUpdateExemptArea = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExemptAreaRequest }) =>
      ExemptAreasApi.updateExemptArea(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exemptAreasKeys.all() })
    },
  })
}

export const useDeleteExemptArea = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ExemptAreasApi.deleteExemptArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exemptAreasKeys.all() })
    },
  })
}
