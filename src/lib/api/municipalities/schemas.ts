import { z } from "zod";

export const MunicipalitySchema = z
  .object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    timezone: z.string(),
    status: z.string().optional().default("Active"),
    createdAt: z.string().optional().nullable(),
    updatedAt: z.string().optional().nullable(),
  })
  .passthrough();

export const BoundaryVersionSchema = z
  .object({
    id: z.string(),
    municipalityId: z.string().optional(),
    version: z.string(),
    displayName: z.string(),
    format: z.string(),
    active: z.boolean().optional().default(false),
    createdAt: z.string().optional().nullable(),
    activatedAt: z.string().optional().nullable(),
  })
  .passthrough();

export const MunicipalityDetailResponseSchema = z.object({
  data: MunicipalitySchema,
});

export const BoundaryVersionDetailResponseSchema = z.object({
  data: BoundaryVersionSchema,
});

export const CreateMunicipalityRequestSchema = z.object({
  code: z.string(),
  name: z.string(),
  timezone: z.string(),
});

export const CreateBoundaryVersionRequestSchema = z.object({
  version: z.string(),
  displayName: z.string(),
  format: z.string().default("GEOJSON"),
  boundaryData: z.string(),
});

export type Municipality = z.infer<typeof MunicipalitySchema>;
export type BoundaryVersion = z.infer<typeof BoundaryVersionSchema>;
export type MunicipalityDetailResponse = z.infer<typeof MunicipalityDetailResponseSchema>;
export type BoundaryVersionDetailResponse = z.infer<typeof BoundaryVersionDetailResponseSchema>;
export type CreateMunicipalityRequest = z.infer<typeof CreateMunicipalityRequestSchema>;
export type CreateBoundaryVersionRequest = z.infer<typeof CreateBoundaryVersionRequestSchema>;
