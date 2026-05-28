import { z } from "zod"

// RUC Policy Schema
export const RUCPolicySchema = z.object({
  id: z.string(),
  municipalityId: z.string(),
  gracePeriodHours: z.number(),
  specialPermitCapacityThreshold: z.number(),
  specialPermitCapacityUnit: z.string(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().optional().nullable(),
  activatedAt: z.string().optional().nullable(),
})

// List Response Schema
export const RUCPolicyListResponseSchema = z.object({
  data: z.array(RUCPolicySchema).optional(),
  content: z.array(RUCPolicySchema).optional(),
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
export const RUCPolicyDetailResponseSchema = z.object({
  data: RUCPolicySchema,
})

// Create Request Schema
export const CreateRUCPolicyRequestSchema = z.object({
  municipalityId: z.string().optional(),
  gracePeriodHours: z.number(),
  specialPermitCapacityThreshold: z.number(),
  specialPermitCapacityUnit: z.string().default("KGS"),
  active: z.boolean().optional().default(false),
})

// Update Request Schema
export const UpdateRUCPolicyRequestSchema = z.object({
  municipalityId: z.string().optional(),
  gracePeriodHours: z.number(),
  specialPermitCapacityThreshold: z.number(),
  specialPermitCapacityUnit: z.string(),
  active: z.boolean().optional(),
})

// Types
export type RUCPolicy = z.infer<typeof RUCPolicySchema>
export type RUCPolicyListResponse = z.infer<typeof RUCPolicyListResponseSchema>
export type RUCPolicyDetailResponse = z.infer<typeof RUCPolicyDetailResponseSchema>
export type CreateRUCPolicyRequest = z.infer<typeof CreateRUCPolicyRequestSchema>
export type UpdateRUCPolicyRequest = z.infer<typeof UpdateRUCPolicyRequestSchema>
