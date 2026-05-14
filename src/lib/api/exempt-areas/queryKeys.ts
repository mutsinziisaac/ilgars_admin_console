export const exemptAreasKeys = {
  all: () => ["exempt-areas"] as const,
  list: (filters?: unknown) =>
    filters
      ? (["exempt-areas", "list", filters] as const)
      : (["exempt-areas", "list"] as const),
  detail: (id: string) => ["exempt-areas", "detail", id] as const,
}
