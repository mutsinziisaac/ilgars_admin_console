import { withActiveMunicipalityQueryKey } from "../municipality-scope"

export const rucPoliciesKeys = {
  all: () => ["ruc-policies"] as const,
  list: (filters?: unknown) =>
    ["ruc-policies", "list", withActiveMunicipalityQueryKey(filters)] as const,
  detail: (id: string) => ["ruc-policies", "detail", id] as const,
}
