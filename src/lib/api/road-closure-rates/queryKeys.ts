export const roadClosureRatesKeys = {
  all: () => ["road-closure-rates"] as const,
  list: (filters?: unknown) =>
    filters
      ? (["road-closure-rates", "list", filters] as const)
      : (["road-closure-rates", "list"] as const),
  detail: (id: string) => ["road-closure-rates", "detail", id] as const,
}
