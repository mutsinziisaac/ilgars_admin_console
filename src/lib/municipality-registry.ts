import type { Municipality } from "@/lib/api"
import {
  ACTIVE_MUNICIPALITY_ID_STORAGE_KEY,
  ACTIVE_MUNICIPALITY_STORAGE_KEY,
  DEFAULT_MUNICIPALITY_ID,
  MUNICIPALITIES_STORAGE_KEY,
} from "@/lib/api/constants"

export const getStoredMunicipality = (): Municipality | null => {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(ACTIVE_MUNICIPALITY_STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Municipality) : null
  } catch {
    return null
  }
}

export const getStoredMunicipalityId = () => {
  if (typeof window === "undefined") return DEFAULT_MUNICIPALITY_ID

  return localStorage.getItem(ACTIVE_MUNICIPALITY_ID_STORAGE_KEY) || DEFAULT_MUNICIPALITY_ID
}

export const getStoredMunicipalities = (): Municipality[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(MUNICIPALITIES_STORAGE_KEY)
    const municipalities = stored ? (JSON.parse(stored) as Municipality[]) : []
    const activeMunicipality = getStoredMunicipality()
    return activeMunicipality ? mergeMunicipalities(municipalities, [activeMunicipality]) : municipalities
  } catch {
    const activeMunicipality = getStoredMunicipality()
    return activeMunicipality ? [activeMunicipality] : []
  }
}

export const storeMunicipalities = (municipalities: Municipality[]) => {
  if (typeof window === "undefined") return

  localStorage.setItem(MUNICIPALITIES_STORAGE_KEY, JSON.stringify(municipalities))
}

export const mergeMunicipalities = (
  current: Municipality[],
  incoming: Municipality[] = [],
) => {
  const byId = new Map<string, Municipality>()

  current.forEach((municipality) => byId.set(municipality.id, municipality))
  incoming.forEach((municipality) => byId.set(municipality.id, municipality))

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export const upsertStoredMunicipality = (municipality: Municipality) => {
  const municipalities = mergeMunicipalities(getStoredMunicipalities(), [municipality])
  storeMunicipalities(municipalities)
  return municipalities
}

export const setActiveMunicipality = (municipality: Municipality) => {
  if (typeof window === "undefined") return

  const previousMunicipality = getStoredMunicipality()
  const nextMunicipalities = previousMunicipality
    ? mergeMunicipalities(getStoredMunicipalities(), [previousMunicipality, municipality])
    : mergeMunicipalities(getStoredMunicipalities(), [municipality])

  storeMunicipalities(nextMunicipalities)
  localStorage.setItem(ACTIVE_MUNICIPALITY_ID_STORAGE_KEY, municipality.id)
  localStorage.setItem(ACTIVE_MUNICIPALITY_STORAGE_KEY, JSON.stringify(municipality))
}

export const getMunicipalityDisplayName = (municipalityId = getStoredMunicipalityId()) => {
  const municipality =
    getStoredMunicipalities().find((item) => item.id === municipalityId) ??
    getStoredMunicipality()

  return municipality?.name || municipality?.code || "Active municipality"
}
