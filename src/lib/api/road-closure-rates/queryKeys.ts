import { withActiveMunicipalityQueryKey } from "../municipality-scope"

export const roadClosureRatesKeys = {
  all: () => ["road-closure-rates"] as const,
  list: (filters?: unknown) =>
    ["road-closure-rates", "list", withActiveMunicipalityQueryKey(filters)] as const,
  detail: (id: string) => ["road-closure-rates", "detail", id] as const,
}
