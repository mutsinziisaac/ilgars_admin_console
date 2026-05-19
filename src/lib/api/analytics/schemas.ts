import { z } from "zod"

const HEATMAP_ARRAY_KEYS = ["points", "items", "content", "heatmap", "locations", "features"] as const
const LIVE_MAP_ARRAY_KEYS = ["vehicles", "devices", "items", "content", "locations", "positions", "features"] as const

const findArrayByKeys = (value: unknown, keys: readonly string[]): unknown[] => {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== "object") return []

  const record = value as Record<string, unknown>
  for (const key of keys) {
    const nested = record[key]
    if (Array.isArray(nested)) return nested
  }

  for (const nestedKey of ["data", "result", "payload", "body"]) {
    const nested = findArrayByKeys(record[nestedKey], keys)
    if (nested.length > 0) return nested
  }

  return []
}

export const HeatmapResponseSchema = z
  .unknown()
  .transform((value) => findArrayByKeys(value, HEATMAP_ARRAY_KEYS))
  .pipe(z.array(z.unknown()))

export const LiveMapResponseSchema = z
  .unknown()
  .transform((value) => findArrayByKeys(value, LIVE_MAP_ARRAY_KEYS))
  .pipe(z.array(z.unknown()))

export type HeatmapPoint = unknown
export type HeatmapResponse = z.infer<typeof HeatmapResponseSchema>
export type LiveMapPoint = unknown
export type LiveMapResponse = z.infer<typeof LiveMapResponseSchema>
