import { z } from "zod";

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
  .optional();

export const FinePolicySchema = z
  .object({
    id: z.string(),
    municipalityId: z.string(),
    code: z.string(),
    trigger: z.string(),
    gracePeriodHours: z.number(),
    baseAmount: z.number(),
    incrementAmount: z.number(),
    incrementEveryHours: z.number(),
    appliesWhileInside: z.boolean(),
    active: z.boolean(),
    createdAt: z.string().optional().nullable(),
    updatedAt: z.string().optional().nullable(),
  })
  .passthrough();

export const FinePolicyListResponseSchema = z.object({
  data: z.array(FinePolicySchema).optional(),
  content: z.array(FinePolicySchema).optional(),
  meta: PageMetaSchema,
});

export const FinePolicyDetailResponseSchema = z.object({
  data: FinePolicySchema,
});

export const CreateFinePolicyRequestSchema = z.object({
  municipalityId: z.string().optional(),
  code: z.string(),
  trigger: z.string(),
  gracePeriodHours: z.number(),
  baseAmount: z.number(),
  incrementAmount: z.number(),
  incrementEveryHours: z.number(),
  appliesWhileInside: z.boolean(),
  active: z.boolean().optional().default(true),
});

export const UpdateFinePolicyRequestSchema = CreateFinePolicyRequestSchema.partial().extend({
  municipalityId: z.string().optional(),
});

export type FinePolicy = z.infer<typeof FinePolicySchema>;
export type FinePolicyListResponse = z.infer<typeof FinePolicyListResponseSchema>;
export type FinePolicyDetailResponse = z.infer<typeof FinePolicyDetailResponseSchema>;
export type CreateFinePolicyRequest = z.infer<typeof CreateFinePolicyRequestSchema>;
export type UpdateFinePolicyRequest = z.infer<typeof UpdateFinePolicyRequestSchema>;
