import { withActiveMunicipalityQueryKey } from "../municipality-scope"

export const finePoliciesKeys = {
  all: () => ["fine-policies"] as const,
  list: (filters?: unknown) =>
    ["fine-policies", "list", withActiveMunicipalityQueryKey(filters)] as const,
}
