import { z } from "zod"

// Road Closure Rate Schema
export const RoadClosureRateSchema = z.object({
  id: z.string(),
  municipalityId: z.string(),
  purpose: z.string(), // CONSTRUCTION, FILMING, SPORTING_EVENTS, FAIRS, FOR_PROFIT_EVENTS
  roadType: z.string(), // PRIMARY_ROAD, SECONDARY_ROAD, TERTIARY_ROAD
  closureType: z.string().optional(), // FULL_CLOSURE, PARTIAL_RESTRICTION
  hourlyRate: z.number(),
  currency: z.string(),
  chargeType: z.string(), // ROAD_CLOSURE
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().optional().nullable(),
  activatedAt: z.string().optional().nullable(),
})

// List Response Schema
export const RoadClosureRateListResponseSchema = z.object({
  data: z.array(RoadClosureRateSchema).optional(),
  content: z.array(RoadClosureRateSchema).optional(),
  meta: z
    .object({
      page: z.number().optional(),
      pageSize: z.number().optional(),
      total: z.number().optional(),
      pageCount: z.number().optional(),
      totalElements: z.number().optional(),
      totalPages: z.number().optional(),
      size: z.number().optional(),
      number: z.number().optional(),
    })
    .optional(),
})

// Detail Response Schema
export const RoadClosureRateDetailResponseSchema = z.object({
  data: RoadClosureRateSchema,
})

// Create Request Schema
export const CreateRoadClosureRateRequestSchema = z.object({
  purpose: z.string(),
  roadType: z.string(),
  closureType: z.string().optional(),
  hourlyRate: z.number(),
  currency: z.string().default("MZN"),
  chargeType: z.string().default("ROAD_CLOSURE"),
  active: z.boolean().optional().default(false),
})

// Update Request Schema
export const UpdateRoadClosureRateRequestSchema = z.object({
  purpose: z.string(),
  roadType: z.string(),
  closureType: z.string().optional(),
  hourlyRate: z.number(),
  currency: z.string(),
  chargeType: z.string(),
  active: z.boolean().optional(),
})

// Types
export type RoadClosureRate = z.infer<typeof RoadClosureRateSchema>
export type RoadClosureRateListResponse = z.infer<typeof RoadClosureRateListResponseSchema>
export type RoadClosureRateDetailResponse = z.infer<typeof RoadClosureRateDetailResponseSchema>
export type CreateRoadClosureRateRequest = z.infer<typeof CreateRoadClosureRateRequestSchema>
export type UpdateRoadClosureRateRequest = z.infer<typeof UpdateRoadClosureRateRequestSchema>
