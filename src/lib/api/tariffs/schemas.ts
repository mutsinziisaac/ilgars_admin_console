import { z } from "zod";

// Tariff Plan schema
export const TariffPlanSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(["ROAD_CLOSURE", "CIRCULATION"]).optional(),
  weightMin: z.number().optional(),
  weightMax: z.number().optional(),
  dailyRate: z.number().optional(),
  monthlyRate: z.number().optional(),
  annualRate: z.number().optional(),
  currency: z.string().optional().default("MZN"),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).optional(),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const TariffPlanListResponseSchema = z.object({
  data: z.array(TariffPlanSchema),
  meta: z
    .object({
      page: z.number().optional(),
      pageSize: z.number().optional(),
      total: z.number().optional(),
      pageCount: z.number().optional(),
    })
    .optional(),
});

export const TariffPlanDetailResponseSchema = z.object({
  data: TariffPlanSchema,
});

export const CreateTariffPlanRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(["ROAD_CLOSURE", "CIRCULATION"]),
  weightMin: z.number().optional(),
  weightMax: z.number().optional(),
  dailyRate: z.number().optional(),
  monthlyRate: z.number().optional(),
  annualRate: z.number().optional(),
  currency: z.string().optional().default("MZN"),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
});

export const UpdateTariffPlanRequestSchema = CreateTariffPlanRequestSchema.partial();

export type TariffPlan = z.infer<typeof TariffPlanSchema>;
export type TariffPlanListResponse = z.infer<typeof TariffPlanListResponseSchema>;
export type TariffPlanDetailResponse = z.infer<typeof TariffPlanDetailResponseSchema>;
export type CreateTariffPlanRequest = z.infer<typeof CreateTariffPlanRequestSchema>;
export type UpdateTariffPlanRequest = z.infer<typeof UpdateTariffPlanRequestSchema>;
