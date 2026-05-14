import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  FinePoliciesApi,
  type ListFinePoliciesParams,
} from "./api"
import type { CreateFinePolicyRequest, UpdateFinePolicyRequest } from "./schemas"
import { finePoliciesKeys } from "./queryKeys"

export const useFinePoliciesList = (params?: ListFinePoliciesParams) =>
  useQuery({
    queryKey: finePoliciesKeys.list(params),
    queryFn: ({ signal }) => FinePoliciesApi.listFinePolicies(params, signal),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

export const useCreateFinePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateFinePolicyRequest) =>
      FinePoliciesApi.createFinePolicy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: finePoliciesKeys.all() })
    },
  })
}

export const useUpdateFinePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFinePolicyRequest }) =>
      FinePoliciesApi.updateFinePolicy(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: finePoliciesKeys.all() })
    },
  })
}

export const useDeleteFinePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => FinePoliciesApi.deleteFinePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: finePoliciesKeys.all() })
    },
  })
}
