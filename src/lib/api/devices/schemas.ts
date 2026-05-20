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

const ActiveDevicePayloadSchema = z
  .object({
    assignment: DeviceAssignmentSchema.optional().nullable(),
    activeAssignment: DeviceAssignmentSchema.optional().nullable(),
    deviceAssignment: DeviceAssignmentSchema.optional().nullable(),
    device: DeviceSchema.optional().nullable(),
    tracker: DeviceSchema.optional().nullable(),
    gpsDevice: DeviceSchema.optional().nullable(),
  })
  .passthrough()
  .transform((payload) => ({
    ...payload,
    assignment: payload.assignment ?? payload.activeAssignment ?? payload.deviceAssignment ?? null,
    device: payload.device ?? payload.tracker ?? payload.gpsDevice ?? null,
  }))

export const ActiveDeviceResponseSchema = z
  .union([
    ActiveDevicePayloadSchema,
    z.object({ data: ActiveDevicePayloadSchema }).passthrough(),
  ])
  .transform((response) => ("data" in response ? response.data : response))

export const DeviceResponseSchema = z
  .union([DeviceSchema, z.object({ data: DeviceSchema })])
  .transform((response) => ("data" in response ? response.data : response))

export const DeviceListResponseSchema = z
  .union([
    z.array(DeviceSchema),
    z
      .object({
        data: z
          .union([
            z.array(DeviceSchema),
            z.object({
              content: z.array(DeviceSchema).optional(),
              items: z.array(DeviceSchema).optional(),
            }).passthrough(),
          ])
          .optional(),
        content: z.array(DeviceSchema).optional(),
        items: z.array(DeviceSchema).optional(),
      })
      .passthrough(),
  ])
  .transform((response) => {
    if (Array.isArray(response)) return { data: response }
    if (Array.isArray(response.data)) return { data: response.data }
    if (Array.isArray(response.data?.content)) return { data: response.data.content }
    if (Array.isArray(response.data?.items)) return { data: response.data.items }
    if (Array.isArray(response.content)) return { data: response.content }
    if (Array.isArray(response.items)) return { data: response.items }
    return { data: [] }
  })

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
export type DeviceListResponse = z.infer<typeof DeviceListResponseSchema>
export type DeviceAssignment = z.infer<typeof DeviceAssignmentSchema>
export type ActiveDeviceResponse = z.infer<typeof ActiveDeviceResponseSchema>
export type RegisterDeviceRequest = z.infer<typeof RegisterDeviceRequestSchema>
export type AssignDeviceRequest = z.infer<typeof AssignDeviceRequestSchema>
