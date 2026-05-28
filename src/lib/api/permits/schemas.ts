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

export const RoadClosurePermitSchema = z
  .object({
    id: z.string(),
    municipalityId: z.string(),
    routeId: z.string().optional().nullable(),
    applicantName: z.string(),
    applicantPhone: z.string().optional().nullable(),
    purpose: z.string(),
    requestedStartAt: z.string(),
    requestedEndAt: z.string(),
    conditions: z.string().optional().nullable(),
    status: z.string(),
    invoiceId: z.string().optional().nullable(),
    permitNumber: z.string().optional().nullable(),
    approvedBy: z.string().optional().nullable(),
    approvedAt: z.string().optional().nullable(),
    rejectedAt: z.string().optional().nullable(),
    issuedAt: z.string().optional().nullable(),
    createdAt: z.string().optional().nullable(),
    updatedAt: z.string().optional().nullable(),
  })
  .passthrough();

export const RoadClosurePermitListResponseSchema = z.object({
  data: z.array(RoadClosurePermitSchema).optional(),
  content: z.array(RoadClosurePermitSchema).optional(),
  meta: PageMetaSchema,
});

export const RoadClosurePermitDetailResponseSchema = z.object({
  data: RoadClosurePermitSchema,
});

export const CreateRoadClosurePermitRequestSchema = z.object({
  routeId: z.string(),
  applicantName: z.string(),
  applicantPhone: z.string(),
  purpose: z.string(),
  requestedStartAt: z.string(),
  requestedEndAt: z.string(),
  conditions: z.string().optional(),
});

export const RoadClosurePermitApprovalRequestSchema = z.object({
  municipalityId: z.string().optional(),
  decision: z.enum(["APPROVED", "REJECTED"]),
  approvedBy: z.string(),
  notes: z.string().optional(),
});

export type RoadClosurePermit = z.infer<typeof RoadClosurePermitSchema>;
export type RoadClosurePermitListResponse = z.infer<typeof RoadClosurePermitListResponseSchema>;
export type RoadClosurePermitDetailResponse = z.infer<typeof RoadClosurePermitDetailResponseSchema>;
export type CreateRoadClosurePermitRequest = z.infer<typeof CreateRoadClosurePermitRequestSchema>;
export type RoadClosurePermitApprovalRequest = z.infer<typeof RoadClosurePermitApprovalRequestSchema>;

// Re-export the deployed road-closure rate contract from the canonical module.
export type {
  RoadClosureRate,
  RoadClosureRateListResponse,
  RoadClosureRateDetailResponse,
  CreateRoadClosureRateRequest,
  UpdateRoadClosureRateRequest,
} from "../road-closure-rates/schemas";
