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

export const MunicipalRouteSchema = z
  .object({
    id: z.string(),
    municipalityId: z.string(),
    code: z.string(),
    name: z.string(),
    roadType: z.string(),
    geoJson: z.string().optional().default(""),
    distanceKm: z.number().optional().nullable(),
    allowedUses: z.array(z.string()).optional().default([]),
    active: z.boolean().optional().default(false),
    createdAt: z.string().optional().nullable(),
    updatedAt: z.string().optional().nullable(),
  })
  .passthrough();

export const MunicipalRouteListResponseSchema = z.object({
  data: z.array(MunicipalRouteSchema).optional(),
  content: z.array(MunicipalRouteSchema).optional(),
  meta: PageMetaSchema,
});

export const MunicipalRouteDetailResponseSchema = z.object({
  data: MunicipalRouteSchema,
});

export const CreateMunicipalRouteRequestSchema = z.object({
  municipalityId: z.string().optional(),
  code: z.string(),
  name: z.string(),
  roadType: z.string(),
  geoJson: z.string(),
  distanceKm: z.number().optional(),
  allowedUses: z.array(z.string()),
  active: z.boolean().optional().default(true),
});

export const UpdateMunicipalRouteRequestSchema = CreateMunicipalRouteRequestSchema.partial();

export type MunicipalRoute = z.infer<typeof MunicipalRouteSchema>;
export type MunicipalRouteListResponse = z.infer<typeof MunicipalRouteListResponseSchema>;
export type MunicipalRouteDetailResponse = z.infer<typeof MunicipalRouteDetailResponseSchema>;
export type CreateMunicipalRouteRequest = z.infer<typeof CreateMunicipalRouteRequestSchema>;
export type UpdateMunicipalRouteRequest = z.infer<typeof UpdateMunicipalRouteRequestSchema>;
