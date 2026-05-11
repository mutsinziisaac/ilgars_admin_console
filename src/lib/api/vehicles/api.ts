import { coreRequest } from "../httpClient";
import {
  FleetVehicleListResponseSchema,
  FleetVehicleDetailResponseSchema,
  type FleetVehicleListResponse,
  type FleetVehicleDetailResponse,
} from "./schemas";

export interface FleetVehicleSearchParams {
  page?: number;
  pageSize?: number;
  plateNumber?: string;
  make?: string;
  model?: string;
  status?: string;
}

export const VehiclesApi = {
  /**
   * Get fleet vehicles with optional filters
   * GET /v1/fleet-vehicles
   */
  getFleetVehicles: (params?: FleetVehicleSearchParams, signal?: AbortSignal) =>
    coreRequest<FleetVehicleListResponse>({
      method: "GET",
      url: "/v1/fleet-vehicles",
      params,
      signal,
      schema: FleetVehicleListResponseSchema,
    }),

  /**
   * Get fleet vehicle by ID
   * GET /v1/fleet-vehicles/{id}
   */
  getFleetVehicleById: (id: string, signal?: AbortSignal) =>
    coreRequest<FleetVehicleDetailResponse>({
      method: "GET",
      url: `/v1/fleet-vehicles/${encodeURIComponent(id)}`,
      signal,
      schema: FleetVehicleDetailResponseSchema,
    }),
};
