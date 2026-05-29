import { withActiveMunicipalityQueryKey } from "../municipality-scope"

export const exemptAreasKeys = {
  all: () => ["exempt-areas"] as const,
  list: (filters?: unknown) =>
    ["exempt-areas", "list", withActiveMunicipalityQueryKey(filters)] as const,
  detail: (id: string) => ["exempt-areas", "detail", id] as const,
}
