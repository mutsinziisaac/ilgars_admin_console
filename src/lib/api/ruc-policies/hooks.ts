// Generic CRUD wrapper hooks for RUC Policies entity
import {
  RUCPoliciesApi,
  type ListRUCPoliciesParams,
} from "./api"
import type {
  RUCPolicyListResponse,
  RUCPolicyDetailResponse,
  CreateRUCPolicyRequest,
  UpdateRUCPolicyRequest,
} from "./schemas"
import { rucPoliciesKeys } from "./queryKeys"
import { createCrudHooks, createMutationHook } from "@/lib/api/queryHooks"
import type { UseMutationOptions } from "@tanstack/react-query"

const {
  useList: useRUCPoliciesList,
  useDetail: useRUCPolicyDetail,
  useCreate: useCreateRUCPolicy,
  useUpdate: useUpdateRUCPolicy,
  useDelete: useDeleteRUCPolicy,
} = createCrudHooks<
  RUCPolicyListResponse,
  RUCPolicyDetailResponse,
  CreateRUCPolicyRequest,
  UpdateRUCPolicyRequest,
  ListRUCPoliciesParams,
  string
>({
  keys: rucPoliciesKeys,
  listFn: RUCPoliciesApi.listRUCPolicies,
  detailFn: RUCPoliciesApi.getRUCPolicy,
  createFn: RUCPoliciesApi.createRUCPolicy,
  updateFn: RUCPoliciesApi.updateRUCPolicy,
  deleteFn: RUCPoliciesApi.deleteRUCPolicy,
  defaultListParams: {
    active: true,
  },
})

// Create the mutation hook factory for activate
const activateRUCPolicyMutationHook = createMutationHook<string, void>({
  mutationFn: RUCPoliciesApi.activateRUCPolicy,
  invalidateKeys: [rucPoliciesKeys.all()],
})

// Export hook that matches the pattern from createCrudHooks
const useActivateRUCPolicy = (
  options?: UseMutationOptions<void, unknown, string, unknown>
) => activateRUCPolicyMutationHook(options)

export {
  useRUCPoliciesList,
  useRUCPolicyDetail,
  useCreateRUCPolicy,
  useUpdateRUCPolicy,
  useDeleteRUCPolicy,
  useActivateRUCPolicy,
}
