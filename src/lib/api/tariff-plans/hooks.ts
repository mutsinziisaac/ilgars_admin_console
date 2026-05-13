// Generic CRUD wrapper hooks for Tariff Plans entity
import {
  TariffPlansApi,
  type ListTariffPlansParams,
} from "./api"
import type {
  TariffPlanListResponse,
  TariffPlanDetailResponse,
  CreateTariffPlanRequest,
  UpdateTariffPlanRequest,
  TariffPlan,
} from "./schemas"
import { tariffPlansKeys } from "./queryKeys"
import { createCrudHooks, createMutationHook } from "@/lib/api/queryHooks"
import type { UseMutationOptions } from "@tanstack/react-query"

const {
  useList: useTariffPlansList,
  useDetail: useTariffPlanDetail,
  useCreate: useCreateTariffPlan,
  useUpdate: useUpdateTariffPlan,
  useDelete: useDeleteTariffPlan,
} = createCrudHooks<
  TariffPlanListResponse,
  TariffPlanDetailResponse,
  CreateTariffPlanRequest,
  UpdateTariffPlanRequest,
  ListTariffPlansParams,
  string
>({
  keys: tariffPlansKeys,
  listFn: TariffPlansApi.listTariffPlans,
  detailFn: TariffPlansApi.getTariffPlan,
  createFn: TariffPlansApi.createTariffPlan,
  updateFn: TariffPlansApi.updateTariffPlan,
  deleteFn: TariffPlansApi.deleteTariffPlan,
  defaultListParams: {
    status: "all",
  },
})

// Create the mutation hook factory for activate
const activateTariffPlanMutationHook = createMutationHook<
  string,
  void
>({
  mutationFn: TariffPlansApi.activateTariffPlan,
  invalidateKeys: [tariffPlansKeys.all()],
})

// Export hook that matches the pattern from createCrudHooks
const useActivateTariffPlan = (
  options?: UseMutationOptions<void, unknown, string, unknown>
) => activateTariffPlanMutationHook(options)

export {
  useTariffPlansList,
  useTariffPlanDetail,
  useCreateTariffPlan,
  useUpdateTariffPlan,
  useDeleteTariffPlan,
  useActivateTariffPlan,
}
