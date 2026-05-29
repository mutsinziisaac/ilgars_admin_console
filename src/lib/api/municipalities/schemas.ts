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

export const MunicipalityListResponseSchema = z
  .object({
    data: z.array(MunicipalitySchema).optional(),
    content: z.array(MunicipalitySchema).optional(),
    items: z.array(MunicipalitySchema).optional(),
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
  .passthrough();

export const BoundaryVersionDetailResponseSchema = z.object({
  data: BoundaryVersionSchema,
});

export const BoundaryVersionListResponseSchema = z
  .object({
    data: z.array(BoundaryVersionSchema).optional(),
    content: z.array(BoundaryVersionSchema).optional(),
    items: z.array(BoundaryVersionSchema).optional(),
  })
  .passthrough();

export const MunicipalityConfigurationDataSchema = z
  .object({
    municipality: MunicipalitySchema.optional(),
    boundaryVersions: z.array(BoundaryVersionSchema).optional(),
    boundaries: z.array(BoundaryVersionSchema).optional(),
    activeBoundaryVersion: BoundaryVersionSchema.optional().nullable(),
  })
  .passthrough();

export const MunicipalityConfigurationResponseSchema = z
  .object({
    data: z.union([MunicipalityConfigurationDataSchema, MunicipalitySchema]),
  })
  .passthrough();

export const CreateMunicipalityRequestSchema = z.object({
  code: z.string(),
  name: z.string(),
  timezone: z.string(),
});

export const CreateBoundaryVersionRequestSchema = z.object({
  version: z.string(),
  displayName: z.string(),
  format: z.string().default("GEOJSON"),
  active: z.boolean().optional(),
  boundaryData: z.string(),
});

export type Municipality = z.infer<typeof MunicipalitySchema>;
export type BoundaryVersion = z.infer<typeof BoundaryVersionSchema>;
export type MunicipalityDetailResponse = z.infer<typeof MunicipalityDetailResponseSchema>;
export type MunicipalityListResponse = z.infer<typeof MunicipalityListResponseSchema>;
// Written explicitly because Zod v4 collapses union inside object output to `{}`
export type MunicipalityConfigurationResponse = {
  data: z.infer<typeof MunicipalityConfigurationDataSchema> | Municipality;
};
export type BoundaryVersionDetailResponse = z.infer<typeof BoundaryVersionDetailResponseSchema>;
export type BoundaryVersionListResponse = z.infer<typeof BoundaryVersionListResponseSchema>;
export type CreateMunicipalityRequest = z.infer<typeof CreateMunicipalityRequestSchema>;
export type CreateBoundaryVersionRequest = z.infer<typeof CreateBoundaryVersionRequestSchema>;
