export const vehiclesKeys = {
  all: () => ["vehicles"] as const,
  list: (filters?: unknown) =>
    filters
      ? (["vehicles", "list", filters] as const)
      : (["vehicles", "list"] as const),
  detail: (id: string) => ["vehicles", "detail", id] as const,
}
