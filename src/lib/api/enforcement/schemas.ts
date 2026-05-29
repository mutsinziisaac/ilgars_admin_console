import { z } from "zod"

export const OfficerKpisPayloadSchema = z.record(z.string(), z.unknown())

export const OfficerKpisResponseSchema = z
  .union([
    z.object({
      data: OfficerKpisPayloadSchema,
    }).passthrough(),
    OfficerKpisPayloadSchema,
  ])

export const EnforcementOfficerSchema = z
  .object({
    id: z.coerce.string().optional().nullable(),
    officerSubject: z.string().optional().nullable(),
    subject: z.string().optional().nullable(),
    userSubject: z.string().optional().nullable(),
    userId: z.string().optional().nullable(),
    officerName: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    displayName: z.string().optional().nullable(),
    username: z.string().optional().nullable(),
    preferredUsername: z.string().optional().nullable(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    municipalityId: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
  })
  .passthrough()

const EnforcementOfficerListEnvelopeSchema = z
  .object({
    data: z
      .union([
        z.array(EnforcementOfficerSchema),
        z
          .object({
            content: z.array(EnforcementOfficerSchema).optional(),
            items: z.array(EnforcementOfficerSchema).optional(),
            officers: z.array(EnforcementOfficerSchema).optional(),
            officerProfiles: z.array(EnforcementOfficerSchema).optional(),
            profiles: z.array(EnforcementOfficerSchema).optional(),
            records: z.array(EnforcementOfficerSchema).optional(),
            results: z.array(EnforcementOfficerSchema).optional(),
            rows: z.array(EnforcementOfficerSchema).optional(),
          })
          .passthrough(),
      ])
      .optional(),
    content: z.array(EnforcementOfficerSchema).optional(),
    items: z.array(EnforcementOfficerSchema).optional(),
    officers: z.array(EnforcementOfficerSchema).optional(),
    officerProfiles: z.array(EnforcementOfficerSchema).optional(),
    profiles: z.array(EnforcementOfficerSchema).optional(),
    records: z.array(EnforcementOfficerSchema).optional(),
    results: z.array(EnforcementOfficerSchema).optional(),
    rows: z.array(EnforcementOfficerSchema).optional(),
  })
  .passthrough()

export const EnforcementOfficerListResponseSchema = z
  .union([z.array(EnforcementOfficerSchema), EnforcementOfficerListEnvelopeSchema])
  .transform((response) => {
    if (Array.isArray(response)) return { data: response }
    if (Array.isArray(response.data)) return { data: response.data }
    if (Array.isArray(response.data?.content)) return { data: response.data.content }
    if (Array.isArray(response.data?.items)) return { data: response.data.items }
    if (Array.isArray(response.data?.officers)) return { data: response.data.officers }
    if (Array.isArray(response.data?.officerProfiles)) return { data: response.data.officerProfiles }
    if (Array.isArray(response.data?.profiles)) return { data: response.data.profiles }
    if (Array.isArray(response.data?.records)) return { data: response.data.records }
    if (Array.isArray(response.data?.results)) return { data: response.data.results }
    if (Array.isArray(response.data?.rows)) return { data: response.data.rows }
    if (Array.isArray(response.content)) return { data: response.content }
    if (Array.isArray(response.items)) return { data: response.items }
    if (Array.isArray(response.officers)) return { data: response.officers }
    if (Array.isArray(response.officerProfiles)) return { data: response.officerProfiles }
    if (Array.isArray(response.profiles)) return { data: response.profiles }
    if (Array.isArray(response.records)) return { data: response.records }
    if (Array.isArray(response.results)) return { data: response.results }
    if (Array.isArray(response.rows)) return { data: response.rows }
    return { data: [] }
  })

export type OfficerKpisPayload = z.infer<typeof OfficerKpisPayloadSchema>
export type OfficerKpisResponse = z.infer<typeof OfficerKpisResponseSchema>
export type EnforcementOfficer = z.infer<typeof EnforcementOfficerSchema>
export type EnforcementOfficerListResponse = z.infer<typeof EnforcementOfficerListResponseSchema>
