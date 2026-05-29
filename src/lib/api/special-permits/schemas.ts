import { z } from "zod"

const PageMetaSchema = z
  .object({
    page: z.number().optional(),
    pageSize: z.number().optional(),
    size: z.number().optional(),
    number: z.number().optional(),
    total: z.number().optional(),
    totalElements: z.number().optional(),
    pageCount: z.number().optional(),
    totalPages: z.number().optional(),
  })
  .passthrough()
  .optional()

export const SpecialPermitSchema = z
  .object({
    id: z.coerce.string(),
    municipalityId: z.string().optional().nullable(),
    vehicleId: z.string().optional().nullable(),
    vehiclePlate: z.string().optional().nullable(),
    plateNumber: z.string().optional().nullable(),
    permitType: z.string().optional().nullable(),
    authorizationType: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    applicantName: z.string().optional().nullable(),
    applicantContact: z.string().optional().nullable(),
    applicantPhone: z.string().optional().nullable(),
    requestedBy: z.string().optional().nullable(),
    vehicleClass: z.string().optional().nullable(),
    axleCount: z.coerce.number().optional().nullable(),
    grossWeight: z.coerce.number().optional().nullable(),
    grossWeightKg: z.coerce.number().optional().nullable(),
    vehicleCapacitySnapshot: z.coerce.number().optional().nullable(),
    capacityUnit: z.string().optional().nullable(),
    requestedStartAt: z.string().optional().nullable(),
    requestedEndAt: z.string().optional().nullable(),
    validFrom: z.string().optional().nullable(),
    validTo: z.string().optional().nullable(),
    approvedBy: z.string().optional().nullable(),
    approvedAt: z.string().optional().nullable(),
    escortReference: z.string().optional().nullable(),
    rejectedAt: z.string().optional().nullable(),
    createdAt: z.string().optional().nullable(),
    updatedAt: z.string().optional().nullable(),
    justification: z.string().optional().nullable(),
    reason: z.string().optional().nullable(),
    travelReason: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    routeName: z.string().optional().nullable(),
    routeCode: z.string().optional().nullable(),
    roadType: z.string().optional().nullable(),
    routeGeoJson: z.string().optional().nullable(),
    expectedDurationDays: z.coerce.number().optional().nullable(),
    paymentMode: z.string().optional().nullable(),
    paymentStatus: z.string().optional().nullable(),
  })
  .passthrough()

const SpecialPermitListEnvelopeSchema = z
  .object({
    data: z
      .union([
        z.array(SpecialPermitSchema),
        z
          .object({
            content: z.array(SpecialPermitSchema).optional(),
            items: z.array(SpecialPermitSchema).optional(),
          })
          .passthrough(),
      ])
      .optional(),
    content: z.array(SpecialPermitSchema).optional(),
    items: z.array(SpecialPermitSchema).optional(),
    meta: PageMetaSchema,
  })
  .passthrough()

export const SpecialPermitListResponseSchema = z
  .union([z.array(SpecialPermitSchema), SpecialPermitListEnvelopeSchema])
  .transform((response) => {
    if (Array.isArray(response)) return { data: response }
    if (Array.isArray(response.data)) return { data: response.data, meta: response.meta }
    if (Array.isArray(response.data?.content)) return { data: response.data.content, meta: response.meta ?? response.data }
    if (Array.isArray(response.data?.items)) return { data: response.data.items, meta: response.meta ?? response.data }
    if (Array.isArray(response.content)) return { data: response.content, meta: response.meta }
    if (Array.isArray(response.items)) return { data: response.items, meta: response.meta }
    return { data: [], meta: response.meta }
  })

export const SpecialPermitDetailResponseSchema = z
  .union([SpecialPermitSchema, z.object({ data: SpecialPermitSchema })])
  .transform((response) => ("data" in response ? response : { data: response }))

export const SpecialPermitActionResponseSchema = z
  .union([
    SpecialPermitDetailResponseSchema,
    z.object({ data: z.unknown().nullable().optional() }).passthrough(),
    z.unknown(),
  ])
  .transform((response) => response)

export type SpecialPermit = z.infer<typeof SpecialPermitSchema>
export type SpecialPermitListResponse = z.infer<typeof SpecialPermitListResponseSchema>
export type SpecialPermitDetailResponse = z.infer<typeof SpecialPermitDetailResponseSchema>
export type CreateSpecialPermitVehicleSelectionRequest = Record<string, unknown>
export type CreateSpecialPermitRouteRequest = Record<string, unknown>
export type ApproveSpecialPermitRequest = Record<string, unknown>
export type ReviewSpecialPermitRouteRequest = Record<string, unknown>
export type UpdateSpecialPermitPaymentStatusRequest = Record<string, unknown>
