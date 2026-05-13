import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  FinePoliciesApi,
  type ListFinePoliciesParams,
} from "./api"
import type { CreateFinePolicyRequest } from "./schemas"
import { finePoliciesKeys } from "./queryKeys"

export const useFinePoliciesList = (params?: ListFinePoliciesParams) =>
  useQuery({
    queryKey: finePoliciesKeys.list(params),
    queryFn: ({ signal }) => FinePoliciesApi.listFinePolicies(params, signal),
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
