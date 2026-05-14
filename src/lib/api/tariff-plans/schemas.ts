import { z } from "zod"

// Tariff Rate Schema
export const TariffRateSchema = z.object({
  capacityBandCode: z.string(),
  capacityUnit: z.string().optional().nullable(),
  minimumCapacity: z.number().optional().nullable(),
  maximumCapacity: z.number().optional().nullable(),
  amountPerDay: z.number(),
  amountPerMonth: z.number().optional(),
  minimumCharge: z.number().optional().default(0),
})

// Tariff Plan Schema
export const TariffPlanSchema = z.object({
  id: z.string(),
  municipalityId: z.string(),
  code: z.string(),
  name: z.string(),
  tariffType: z.string(),
  description: z.string().optional().nullable(),
  active: z.boolean().optional().default(false),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
  activatedAt: z.string().optional().nullable(),
  rates: z.array(TariffRateSchema).optional().default([]),
})

// List Response Schema
export const TariffPlanListResponseSchema = z.object({
  data: z.array(TariffPlanSchema).optional(),
  content: z.array(TariffPlanSchema).optional(),
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
export const TariffPlanDetailResponseSchema = z.object({
  data: TariffPlanSchema,
})

// Create Request Schema
export const CreateTariffPlanRequestSchema = z.object({
  municipalityId: z.string().optional(),
  code: z.string(),
  name: z.string(),
  tariffType: z.string().default("CIRCULATION_LICENCE"),
  description: z.string().optional(),
  rates: z.array(TariffRateSchema),
})

// Update Request Schema
export const UpdateTariffPlanRequestSchema = z.object({
  municipalityId: z.string().optional(),
  code: z.string(),
  name: z.string(),
  tariffType: z.string(),
  description: z.string().optional(),
  rates: z.array(TariffRateSchema),
})

// Types
export type TariffRate = z.infer<typeof TariffRateSchema>
export type TariffPlan = z.infer<typeof TariffPlanSchema>
export type TariffPlanListResponse = z.infer<typeof TariffPlanListResponseSchema>
export type TariffPlanDetailResponse = z.infer<typeof TariffPlanDetailResponseSchema>
export type CreateTariffPlanRequest = z.infer<typeof CreateTariffPlanRequestSchema>
export type UpdateTariffPlanRequest = z.infer<typeof UpdateTariffPlanRequestSchema>
