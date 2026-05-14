import { z } from "zod"

export const DeviceSchema = z
  .object({
    id: z.string().optional().nullable(),
    deviceUid: z.string(),
    serialNumber: z.string().optional().nullable(),
    imei: z.string().optional().nullable(),
    simIccid: z.string().optional().nullable(),
    simMsisdn: z.string().optional().nullable(),
    vendor: z.string().optional().nullable(),
    model: z.string().optional().nullable(),
    providerKey: z.string().optional().nullable(),
    providerDeviceRef: z.string().optional().nullable(),
    protocol: z.string().optional().nullable(),
    firmwareVersion: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    createdAt: z.string().optional().nullable(),
    updatedAt: z.string().optional().nullable(),
  })
  .passthrough()

export const DeviceAssignmentSchema = z
  .object({
    id: z.string(),
    deviceId: z.string().optional().nullable(),
    vehicleId: z.string(),
    vehiclePlateSnapshot: z.string().optional().nullable(),
    vehicleTruckNumberSnapshot: z.string().optional().nullable(),
    assignedBy: z.string().optional().nullable(),
    reason: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    assignedAt: z.string().optional().nullable(),
    endedAt: z.string().optional().nullable(),
  })
  .passthrough()

export const ActiveDeviceResponseSchema = z
  .object({
    assignment: DeviceAssignmentSchema.optional().nullable(),
    device: DeviceSchema.optional().nullable(),
  })
  .passthrough()

export const DeviceResponseSchema = z
  .union([DeviceSchema, z.object({ data: DeviceSchema })])
  .transform((response) => ("data" in response ? response.data : response))

export const RegisterDeviceRequestSchema = z.object({
  deviceUid: z.string(),
  serialNumber: z.string(),
  imei: z.string(),
  simIccid: z.string(),
  simMsisdn: z.string(),
  vendor: z.string(),
  model: z.string(),
  providerKey: z.string(),
  providerDeviceRef: z.string(),
  protocol: z.string(),
  firmwareVersion: z.string(),
  status: z.string(),
})

export const AssignDeviceRequestSchema = z.object({
  vehicleId: z.string(),
  vehiclePlateSnapshot: z.string(),
  vehicleTruckNumberSnapshot: z.string(),
  assignedBy: z.string(),
  reason: z.string(),
})

export type Device = z.infer<typeof DeviceSchema>
export type DeviceAssignment = z.infer<typeof DeviceAssignmentSchema>
export type ActiveDeviceResponse = z.infer<typeof ActiveDeviceResponseSchema>
export type RegisterDeviceRequest = z.infer<typeof RegisterDeviceRequestSchema>
export type AssignDeviceRequest = z.infer<typeof AssignDeviceRequestSchema>
