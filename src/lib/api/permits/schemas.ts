import { z } from "zod";

// Road Closure Rate schema
export const RoadClosureRateSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  roadType: z.string().optional(),
  duration: z.string().optional(),
  rate: z.number(),
  currency: z.string().optional().default("MZN"),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const RoadClosureRateListResponseSchema = z.object({
  data: z.array(RoadClosureRateSchema),
  meta: z
    .object({
      page: z.number().optional(),
      pageSize: z.number().optional(),
      total: z.number().optional(),
      pageCount: z.number().optional(),
    })
    .optional(),
});

export const RoadClosureRateDetailResponseSchema = z.object({
  data: RoadClosureRateSchema,
});

export const CreateRoadClosureRateRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  roadType: z.string().optional(),
  duration: z.string().optional(),
  rate: z.number(),
  currency: z.string().optional().default("MZN"),
});

// Road Closure Permit schema
export const RoadClosurePermitSchema = z.object({
  id: z.string().optional(),
  permitNumber: z.string().optional(),
  applicantName: z.string(),
  applicantContact: z.string().optional(),
  vehiclePlateNumber: z.string(),
  roadName: z.string(),
  closureType: z.enum(["FULL", "PARTIAL"]).optional(),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  reason: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"]).optional(),
  fee: z.number().optional(),
  currency: z.string().optional().default("MZN"),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const RoadClosurePermitListResponseSchema = z.object({
  data: z.array(RoadClosurePermitSchema),
  meta: z
    .object({
      page: z.number().optional(),
      pageSize: z.number().optional(),
      total: z.number().optional(),
      pageCount: z.number().optional(),
    })
    .optional(),
});

export const RoadClosurePermitDetailResponseSchema = z.object({
  data: RoadClosurePermitSchema,
});

export const CreateRoadClosurePermitRequestSchema = z.object({
  applicantName: z.string(),
  applicantContact: z.string().optional(),
  vehiclePlateNumber: z.string(),
  roadName: z.string(),
  closureType: z.enum(["FULL", "PARTIAL"]),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  reason: z.string().optional(),
});

export type RoadClosureRate = z.infer<typeof RoadClosureRateSchema>;
export type RoadClosureRateListResponse = z.infer<typeof RoadClosureRateListResponseSchema>;
export type RoadClosureRateDetailResponse = z.infer<typeof RoadClosureRateDetailResponseSchema>;
export type CreateRoadClosureRateRequest = z.infer<typeof CreateRoadClosureRateRequestSchema>;

export type RoadClosurePermit = z.infer<typeof RoadClosurePermitSchema>;
export type RoadClosurePermitListResponse = z.infer<typeof RoadClosurePermitListResponseSchema>;
export type RoadClosurePermitDetailResponse = z.infer<typeof RoadClosurePermitDetailResponseSchema>;
export type CreateRoadClosurePermitRequest = z.infer<typeof CreateRoadClosurePermitRequestSchema>;
