import { devicesRequest } from "../httpClient"
import {
  ActiveDeviceResponseSchema,
  DeviceAssignmentSchema,
  DeviceSchema,
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
   *
   * Devices service does not use the Core { data } wrapper.
   */
  registerDevice: (payload: RegisterDeviceRequest) =>
    devicesRequest<Device>({
      method: "POST",
      url: "/v1/devices",
      data: payload,
      schema: DeviceSchema,
    }),

  /**
   * Assign tracker to vehicle
   * POST /v1/devices/{deviceId}/assignments
   */
  assignDevice: (deviceId: string, payload: AssignDeviceRequest) =>
    devicesRequest<DeviceAssignment>({
      method: "POST",
      url: `/v1/devices/${encodeURIComponent(deviceId)}/assignments`,
      data: payload,
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
      data: payload,
      schema: DeviceAssignmentSchema,
    }),

  /**
   * Get active tracker by vehicle
   * GET /v1/vehicles/{vehicleId}/active-device
   */
  getActiveDeviceByVehicle: (vehicleId: string, signal?: AbortSignal) =>
    devicesRequest<ActiveDeviceResponse>({
      method: "GET",
      url: `/v1/vehicles/${encodeURIComponent(vehicleId)}/active-device`,
      signal,
      schema: ActiveDeviceResponseSchema,
    }),
}
