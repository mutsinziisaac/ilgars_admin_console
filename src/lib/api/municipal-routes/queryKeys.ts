export const municipalRoutesKeys = {
  all: () => ["municipal-routes"] as const,
  list: (filters?: unknown) =>
    filters
      ? (["municipal-routes", "list", filters] as const)
      : (["municipal-routes", "list"] as const),
}
