import { z } from "zod"

export const OfficerKpisPayloadSchema = z.record(z.string(), z.unknown())

export const OfficerKpisResponseSchema = z
  .union([
    z.object({
      data: OfficerKpisPayloadSchema,
    }).passthrough(),
    OfficerKpisPayloadSchema,
  ])

export type OfficerKpisPayload = z.infer<typeof OfficerKpisPayloadSchema>
export type OfficerKpisResponse = z.infer<typeof OfficerKpisResponseSchema>
