import { useMutation, useQuery } from "@tanstack/react-query"
import { DevicesApi } from "./api"
import { devicesKeys } from "./queryKeys"
import type { AssignDeviceRequest, RegisterDeviceRequest } from "./schemas"
import type { ListDevicesParams } from "./api"

export const useDevicesList = (params?: ListDevicesParams) =>
  useQuery({
    queryKey: devicesKeys.list(params),
    queryFn: ({ signal }) => DevicesApi.listDevices(params, signal),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

export const useRegisterDevice = () =>
  useMutation({
    mutationFn: (payload: RegisterDeviceRequest) => DevicesApi.registerDevice(payload),
  })

export const useAssignDevice = (deviceId: string) =>
  useMutation({
    mutationFn: (payload: AssignDeviceRequest) => DevicesApi.assignDevice(deviceId, payload),
  })

export const useReplaceDeviceAssignment = (deviceId: string) =>
  useMutation({
    mutationFn: (payload: AssignDeviceRequest) => DevicesApi.replaceDeviceAssignment(deviceId, payload),
  })

export const useActiveDeviceByVehicle = (vehicleId: string | null | undefined) =>
  useQuery({
    queryKey: vehicleId ? devicesKeys.activeByVehicle(vehicleId) : ["devices", "active-by-vehicle", "disabled"],
    queryFn: ({ signal }) => {
      if (!vehicleId) {
        throw new Error("Vehicle ID is required")
      }

      return DevicesApi.getActiveDeviceByVehicle(vehicleId, signal)
    },
    enabled: Boolean(vehicleId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
