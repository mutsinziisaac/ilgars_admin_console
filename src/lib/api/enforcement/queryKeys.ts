import { withActiveMunicipalityQueryKey } from "../municipality-scope"

export const enforcementKeys = {
  all: () => ["enforcement"] as const,
  officers: (params?: object) =>
    [...enforcementKeys.all(), "officers", withActiveMunicipalityQueryKey(params)] as const,
  officerKpis: () => ["enforcement", "officer-kpis"] as const,
}
