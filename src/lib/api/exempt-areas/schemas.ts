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

export const ExemptAreaSchema = z
  .object({
    id: z.string(),
    municipalityId: z.string().optional().nullable(),
    code: z.string().optional().nullable(),
    name: z.string(),
    description: z.string().optional().nullable(),
    format: z.string().optional().nullable(),
    boundaryData: z.string().optional().nullable(),
    active: z.boolean().optional().default(true),
    createdAt: z.string().optional().nullable(),
    updatedAt: z.string().optional().nullable(),
  })
  .passthrough();

export const ExemptAreaListResponseSchema = z.object({
  data: z.array(ExemptAreaSchema).optional(),
  content: z.array(ExemptAreaSchema).optional(),
  meta: PageMetaSchema,
});

export const ExemptAreaDetailResponseSchema = z.object({
  data: ExemptAreaSchema,
});

export const CreateExemptAreaRequestSchema = z.object({
  municipalityId: z.string().optional(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  format: z.string().default("GEOJSON"),
  boundaryData: z.string(),
  active: z.boolean().optional().default(true),
});

export const UpdateExemptAreaRequestSchema = CreateExemptAreaRequestSchema.partial().extend({
  municipalityId: z.string().optional(),
});

export type ExemptArea = z.infer<typeof ExemptAreaSchema>;
export type ExemptAreaListResponse = z.infer<typeof ExemptAreaListResponseSchema>;
export type ExemptAreaDetailResponse = z.infer<typeof ExemptAreaDetailResponseSchema>;
export type CreateExemptAreaRequest = z.infer<typeof CreateExemptAreaRequestSchema>;
export type UpdateExemptAreaRequest = z.infer<typeof UpdateExemptAreaRequestSchema>;
