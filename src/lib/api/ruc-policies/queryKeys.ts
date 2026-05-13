export const rucPoliciesKeys = {
  all: () => ["ruc-policies"] as const,
  list: (filters?: unknown) =>
    filters
      ? (["ruc-policies", "list", filters] as const)
      : (["ruc-policies", "list"] as const),
  detail: (id: string) => ["ruc-policies", "detail", id] as const,
}
