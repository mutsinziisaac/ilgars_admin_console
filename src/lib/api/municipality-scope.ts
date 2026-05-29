import { getStoredMunicipalityId } from "@/lib/municipality-registry"
import { DEFAULT_MUNICIPALITY_ID } from "./constants"

export const getActiveMunicipalityId = () =>
  getStoredMunicipalityId() || DEFAULT_MUNICIPALITY_ID

export const withActiveMunicipality = <TParams extends Record<string, unknown> | undefined>(
  params?: TParams,
) => ({
  ...(params ?? {}),
  municipalityId: getActiveMunicipalityId(),
})

export const withActiveMunicipalityData = <TPayload extends Record<string, unknown>>(
  payload: TPayload,
) => ({
  ...payload,
  municipalityId: getActiveMunicipalityId(),
})

export const withActiveMunicipalityQueryKey = (filters?: unknown) => ({
  ...((filters && typeof filters === "object" && !Array.isArray(filters))
    ? (filters as Record<string, unknown>)
    : {}),
  municipalityId: getActiveMunicipalityId(),
})
