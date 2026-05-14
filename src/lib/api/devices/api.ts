import { devicesRequest } from "../httpClient"
import {
  ActiveDeviceResponseSchema,
  DeviceAssignmentSchema,
  DeviceResponseSchema,
  type ActiveDeviceResponse,
  type AssignDeviceRequest,
  type Device,
  type DeviceAssignment,
  type RegisterDeviceRequest,
} from "./schemas"

export const DevicesApi = {
  /**
   * Register tracker
   * POST /v1/devices
   */
  registerDevice: (payload: RegisterDeviceRequest) =>
    devicesRequest<Device>({
      method: "POST",
      url: "/v1/devices",
      data: { data: payload },
      schema: DeviceResponseSchema,
    }),

  /**
   * Assign tracker to vehicle
   * POST /v1/devices/{deviceId}/assignments
   * Proxies https://ilgars.ayinza.dev/devices/api/v1/devices/{deviceId}/assignments
   */
  assignDevice: (deviceId: string, payload: AssignDeviceRequest) =>
    devicesRequest<DeviceAssignment>({
      method: "POST",
      url: `/v1/devices/${encodeURIComponent(deviceId)}/assignments`,
      data: { data: payload },
      schema: DeviceAssignmentSchema,
    }),

  /**
   * Replace any active tracker assignment on the vehicle
   * POST /v1/devices/{deviceId}/assignments/replace
   */
  replaceDeviceAssignment: (deviceId: string, payload: AssignDeviceRequest) =>
    devicesRequest<DeviceAssignment>({
      method: "POST",
      url: `/v1/devices/${encodeURIComponent(deviceId)}/assignments/replace`,
      data: { data: payload },
      schema: DeviceAssignmentSchema,
    }),

  /**
   * Get active tracker by vehicle
   * GET /v1/vehicles/{vehicleId}/active-device
   * Proxies https://ilgars.ayinza.dev/devices/api/v1/vehicles/{vehicleId}/active-device
   */
  getActiveDeviceByVehicle: (vehicleId: string, signal?: AbortSignal) =>
    devicesRequest<ActiveDeviceResponse>({
      method: "GET",
      url: `/v1/vehicles/${encodeURIComponent(vehicleId)}/active-device`,
      signal,
      schema: ActiveDeviceResponseSchema,
    }),
}
