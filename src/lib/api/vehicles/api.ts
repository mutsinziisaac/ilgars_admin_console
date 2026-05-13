import { motorVehicleRequest } from "../httpClient";
import {
  VehicleListResponseSchema,
  VehicleDetailResponseSchema,
  type VehicleListResponse,
  type VehicleDetailResponse,
} from "./schemas";

export interface VehicleSearchParams {
  page?: number;
  size?: number;
  plateNumber?: string;
  make?: string;
  model?: string;
  fuelType?: string;
  serviceType?: string;
  status?: string;
}

export const VehiclesApi = {
  /**
   * Get Motorvehicle vehicles with optional filters
   * GET /v1/vehicles
   */
  getVehicles: (params?: VehicleSearchParams, signal?: AbortSignal) =>
    motorVehicleRequest<VehicleListResponse>({
      method: "GET",
      url: "/v1/vehicles",
      params,
      signal,
      schema: VehicleListResponseSchema,
    }),

  /**
   * Get vehicle by ID
   * GET /v1/vehicles/{id}
   */
  getVehicleById: (id: string, signal?: AbortSignal) =>
    motorVehicleRequest<VehicleDetailResponse>({
      method: "GET",
      url: `/v1/vehicles/${encodeURIComponent(id)}`,
      signal,
      schema: VehicleDetailResponseSchema,
    }),

  /**
   * Lookup vehicle by plate number
   * GET /v1/vehicles/by-plate/{plateNumber}
   */
  lookupByPlate: (plateNumber: string, signal?: AbortSignal) =>
    motorVehicleRequest<VehicleDetailResponse>({
      method: "GET",
      url: `/v1/vehicles/by-plate/${encodeURIComponent(plateNumber)}`,
      signal,
      schema: VehicleDetailResponseSchema,
    }),
};
