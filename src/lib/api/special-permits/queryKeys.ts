import type { ListSpecialPermitsParams } from "./api"

export const specialPermitKeys = {
  all: () => ["special-permits"] as const,
  lists: () => [...specialPermitKeys.all(), "list"] as const,
  list: (params?: ListSpecialPermitsParams) =>
    [...specialPermitKeys.lists(), params ?? {}] as const,
  detail: (permitId: string) => [...specialPermitKeys.all(), "detail", permitId] as const,
}
