import { withActiveMunicipalityQueryKey } from "../municipality-scope"

export const tariffPlansKeys = {
  all: () => ["tariff-plans"] as const,
  list: (filters?: unknown) =>
    ["tariff-plans", "list", withActiveMunicipalityQueryKey(filters)] as const,
  detail: (id: string) => ["tariff-plans", "detail", id] as const,
}
