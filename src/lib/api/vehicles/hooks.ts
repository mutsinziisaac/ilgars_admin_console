// Read-only hooks for Vehicles entity
import {
  VehiclesApi,
  type VehicleSearchParams,
} from "./api"
import type {
  VehicleListResponse,
  VehicleDetailResponse,
} from "./schemas"
import { vehiclesKeys } from "./queryKeys"
import { createReadOnlyHooks } from "@/lib/api/queryHooks"

const {
  useList: useVehiclesList,
  useDetail: useVehicleDetail,
} = createReadOnlyHooks<
  VehicleListResponse,
  VehicleDetailResponse,
  VehicleSearchParams,
  string
>({
  keys: vehiclesKeys,
  listFn: VehiclesApi.getVehicles,
  detailFn: VehiclesApi.getVehicleById,
  defaultListParams: {
    page: 0,
    size: 10,
  },
})

export {
  useVehiclesList,
  useVehicleDetail,
}
