// Read-only hooks for Vehicles entity
import {
  VehiclesApi,
  type FleetVehicleSearchParams,
} from "./api"
import type {
  FleetVehicleListResponse,
  FleetVehicleDetailResponse,
} from "./schemas"
import { vehiclesKeys } from "./queryKeys"
import { createReadOnlyHooks } from "@/lib/api/queryHooks"

const {
  useList: useVehiclesList,
  useDetail: useVehicleDetail,
} = createReadOnlyHooks<
  FleetVehicleListResponse,
  FleetVehicleDetailResponse,
  FleetVehicleSearchParams,
  string
>({
  keys: vehiclesKeys,
  listFn: VehiclesApi.getFleetVehicles,
  detailFn: VehiclesApi.getFleetVehicleById,
  defaultListParams: {
    page: 1,
    pageSize: 10,
  },
})

export {
  useVehiclesList,
  useVehicleDetail,
}
