import { withActiveMunicipalityQueryKey } from "../municipality-scope"

export const enforcementKeys = {
  all: () => ["enforcement"] as const,
  officers: (params?: Record<string, unknown>) =>
    [...enforcementKeys.all(), "officers", withActiveMunicipalityQueryKey(params)] as const,
  officerKpis: () => ["enforcement", "officer-kpis"] as const,
}
