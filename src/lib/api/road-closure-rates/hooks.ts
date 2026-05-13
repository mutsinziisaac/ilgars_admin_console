// Generic CRUD wrapper hooks for Road Closure Rates entity
import {
  RoadClosureRatesApi,
  type ListRoadClosureRatesParams,
} from "./api"
import type {
  RoadClosureRateListResponse,
  RoadClosureRateDetailResponse,
  CreateRoadClosureRateRequest,
  UpdateRoadClosureRateRequest,
} from "./schemas"
import { roadClosureRatesKeys } from "./queryKeys"
import { createCrudHooks, createMutationHook } from "@/lib/api/queryHooks"
import type { UseMutationOptions } from "@tanstack/react-query"

const {
  useList: useRoadClosureRatesList,
  useDetail: useRoadClosureRateDetail,
  useCreate: useCreateRoadClosureRate,
  useUpdate: useUpdateRoadClosureRate,
  useDelete: useDeleteRoadClosureRate,
} = createCrudHooks<
  RoadClosureRateListResponse,
  RoadClosureRateDetailResponse,
  CreateRoadClosureRateRequest,
  UpdateRoadClosureRateRequest,
  ListRoadClosureRatesParams,
  string
>({
  keys: roadClosureRatesKeys,
  listFn: RoadClosureRatesApi.listRoadClosureRates,
  detailFn: RoadClosureRatesApi.getRoadClosureRate,
  createFn: RoadClosureRatesApi.createRoadClosureRate,
  updateFn: RoadClosureRatesApi.updateRoadClosureRate,
  deleteFn: RoadClosureRatesApi.deleteRoadClosureRate,
  defaultListParams: {
    active: true,
  },
})

// Create the mutation hook factory for activate
const activateRoadClosureRateMutationHook = createMutationHook<string, void>({
  mutationFn: RoadClosureRatesApi.activateRoadClosureRate,
  invalidateKeys: [roadClosureRatesKeys.all()],
})

// Export hook that matches the pattern from createCrudHooks
const useActivateRoadClosureRate = (
  options?: UseMutationOptions<void, unknown, string, unknown>
) => activateRoadClosureRateMutationHook(options)

export {
  useRoadClosureRatesList,
  useRoadClosureRateDetail,
  useCreateRoadClosureRate,
  useUpdateRoadClosureRate,
  useDeleteRoadClosureRate,
  useActivateRoadClosureRate,
}
