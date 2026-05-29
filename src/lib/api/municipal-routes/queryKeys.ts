import { withActiveMunicipalityQueryKey } from "../municipality-scope"

export const municipalRoutesKeys = {
  all: () => ["municipal-routes"] as const,
  list: (filters?: unknown) =>
    ["municipal-routes", "list", withActiveMunicipalityQueryKey(filters)] as const,
}
