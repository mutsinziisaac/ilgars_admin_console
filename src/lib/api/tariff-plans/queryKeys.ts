export const tariffPlansKeys = {
  all: () => ["tariff-plans"] as const,
  list: (filters?: unknown) =>
    filters
      ? (["tariff-plans", "list", filters] as const)
      : (["tariff-plans", "list"] as const),
  detail: (id: string) => ["tariff-plans", "detail", id] as const,
}
