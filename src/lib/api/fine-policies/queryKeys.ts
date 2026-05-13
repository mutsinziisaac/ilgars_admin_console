export const finePoliciesKeys = {
  all: () => ["fine-policies"] as const,
  list: (filters?: unknown) =>
    filters
      ? (["fine-policies", "list", filters] as const)
      : (["fine-policies", "list"] as const),
}
