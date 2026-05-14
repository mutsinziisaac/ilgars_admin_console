import { z } from "zod"

const HEATMAP_ARRAY_KEYS = ["points", "items", "content", "heatmap", "locations", "features"] as const

const findHeatmapArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== "object") return []

  const record = value as Record<string, unknown>
  for (const key of HEATMAP_ARRAY_KEYS) {
    const nested = record[key]
    if (Array.isArray(nested)) return nested
  }

  for (const nestedKey of ["data", "result", "payload", "body"]) {
    const nested = findHeatmapArray(record[nestedKey])
    if (nested.length > 0) return nested
  }

  return []
}

export const HeatmapResponseSchema = z
  .unknown()
  .transform(findHeatmapArray)
  .pipe(z.array(z.unknown()))

export type HeatmapPoint = unknown
export type HeatmapResponse = z.infer<typeof HeatmapResponseSchema>
