import type { Municipality } from "@/lib/api"
import {
  ACTIVE_MUNICIPALITY_ID_STORAGE_KEY,
  ACTIVE_MUNICIPALITY_STORAGE_KEY,
  DEFAULT_MUNICIPALITY_ID,
  MUNICIPALITIES_STORAGE_KEY,
} from "@/lib/api/constants"

let activeMunicipality: Municipality | null = null
let activeMunicipalityId = DEFAULT_MUNICIPALITY_ID
let municipalities: Municipality[] = []

const readPersistentJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback

  try {
    const stored = window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

const writePersistentJson = (key: string, value: unknown) => {
  if (typeof window === "undefined") return

  window.localStorage.setItem(key, JSON.stringify(value))
  window.sessionStorage.setItem(key, JSON.stringify(value))
}

export const getStoredMunicipality = (): Municipality | null => {
  if (!activeMunicipality) {
    activeMunicipality = readPersistentJson<Municipality | null>(ACTIVE_MUNICIPALITY_STORAGE_KEY, null)
  }

  return activeMunicipality
}

export const getStoredMunicipalityId = () => {
  if (activeMunicipalityId === DEFAULT_MUNICIPALITY_ID && typeof window !== "undefined") {
    activeMunicipalityId =
      window.localStorage.getItem(ACTIVE_MUNICIPALITY_ID_STORAGE_KEY) ||
      window.sessionStorage.getItem(ACTIVE_MUNICIPALITY_ID_STORAGE_KEY) ||
      DEFAULT_MUNICIPALITY_ID
  }

  return activeMunicipalityId
}

export const getStoredMunicipalities = (): Municipality[] => {
  if (!municipalities.length) {
    municipalities = readPersistentJson<Municipality[]>(MUNICIPALITIES_STORAGE_KEY, [])
  }

  return activeMunicipality ? mergeMunicipalities(municipalities, [activeMunicipality]) : municipalities
}

export const storeMunicipalities = (nextMunicipalities: Municipality[]) => {
  municipalities = mergeMunicipalities(nextMunicipalities)
  writePersistentJson(MUNICIPALITIES_STORAGE_KEY, municipalities)
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
  activeMunicipality = municipality
  activeMunicipalityId = municipality.id
  const nextMunicipalities = mergeMunicipalities(getStoredMunicipalities(), [municipality])
  storeMunicipalities(nextMunicipalities)
  writePersistentJson(ACTIVE_MUNICIPALITY_STORAGE_KEY, municipality)
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACTIVE_MUNICIPALITY_ID_STORAGE_KEY, municipality.id)
    window.sessionStorage.setItem(ACTIVE_MUNICIPALITY_ID_STORAGE_KEY, municipality.id)
  }
}

export const getMunicipalityDisplayName = (municipalityId = getStoredMunicipalityId()) => {
  const municipality =
    getStoredMunicipalities().find((item) => item.id === municipalityId) ??
    getStoredMunicipality()

  return municipality?.name || municipality?.code || "Active municipality"
}
