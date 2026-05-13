import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query"

type ListFetcher<TData, TParams> = (args: {
  signal?: AbortSignal
  params?: TParams
}) => Promise<TData>

type DetailFetcher<TData, TId> = (
  id: TId,
  signal?: AbortSignal
) => Promise<TData>

export const createListQueryHook = <TData, TParams = undefined>(options: {
  key: (params?: TParams) => QueryKey
  fetcher: ListFetcher<TData, TParams>
  defaultParams?: TParams
  queryOptions?: Omit<
    UseQueryOptions<TData, unknown, TData, QueryKey>,
    "queryKey" | "queryFn"
  >
}) => {
  const { key, fetcher, defaultParams, queryOptions } = options

  return (params?: TParams): UseQueryResult<TData, unknown> => {
    const effectiveParams = params ?? defaultParams

    return useQuery<TData, unknown>({
      queryKey: key(effectiveParams),
      queryFn: ({ signal }) => fetcher({ signal, params: effectiveParams }),
      ...queryOptions,
    })
  }
}

export const createDetailQueryHook = <TData, TId = string | number>(options: {
  key: (id: TId) => QueryKey
  fetcher: DetailFetcher<TData, TId>
  queryOptions?: Omit<
    UseQueryOptions<TData, unknown, TData, QueryKey>,
    "queryKey" | "queryFn" | "enabled"
  >
}) => {
  const { key, fetcher, queryOptions } = options

  return (id: TId | null | undefined): UseQueryResult<TData, unknown> =>
    useQuery<TData, unknown>({
      queryKey: id != null ? key(id) : (["_disabled"] as const),
      queryFn: ({ signal }) => {
        if (id == null) {
          return Promise.reject(new Error("Resource id is required"))
        }

        return fetcher(id, signal)
      },
      enabled: id != null,
      ...queryOptions,
    })
}

export const createMutationHook = <TInput, TOutput>(options: {
  mutationFn: (payload: TInput) => Promise<TOutput>
  invalidateKeys?: QueryKey[]
  mutationOptions?: Omit<
    UseMutationOptions<TOutput, unknown, TInput, unknown>,
    "mutationFn"
  >
}) => {
  const { mutationFn, invalidateKeys = [], mutationOptions } = options

  return (
    overrideOptions?: Omit<
      UseMutationOptions<TOutput, unknown, TInput, unknown>,
      "mutationFn"
    >
  ): UseMutationResult<TOutput, unknown, TInput, unknown> => {
    const queryClient = useQueryClient()

    const baseOnSuccess = mutationOptions?.onSuccess
    const overrideOnSuccess = overrideOptions?.onSuccess

    return useMutation<TOutput, unknown, TInput>({
      mutationFn,
      ...mutationOptions,
      ...overrideOptions,
      onSuccess: async (...args) => {
        if (baseOnSuccess) {
          await baseOnSuccess(...args)
        }

        if (overrideOnSuccess) {
          await overrideOnSuccess(...args)
        }

        await Promise.all(
          invalidateKeys.map((key) =>
            queryClient.invalidateQueries({ queryKey: key })
          )
        )
      },
    })
  }
}

type CrudKeys<TParams, TId extends string | number> = {
  list: (params?: TParams) => QueryKey
  detail: (id: TId) => QueryKey
}

interface CrudHooksOptions<
  TListData,
  TDetailData,
  TCreateInput,
  TUpdateInput,
  TParams,
  TId extends string | number,
> {
  keys: CrudKeys<TParams, TId>
  listFn: (params?: TParams, signal?: AbortSignal) => Promise<TListData>
  detailFn: (id: TId, signal?: AbortSignal) => Promise<TDetailData>
  createFn: (payload: TCreateInput) => Promise<TDetailData>
  updateFn: (id: TId, payload: TUpdateInput) => Promise<TDetailData>
  deleteFn: (id: TId) => Promise<void>
  defaultListParams?: TParams
  listQueryOptions?: Omit<
    UseQueryOptions<TListData, unknown, TListData, QueryKey>,
    "queryKey" | "queryFn"
  >
  detailQueryOptions?: Omit<
    UseQueryOptions<TDetailData, unknown, TDetailData, QueryKey>,
    "queryKey" | "queryFn" | "enabled"
  >
}

export const createCrudHooks = <
  TListData,
  TDetailData,
  TCreateInput,
  TUpdateInput,
  TParams = undefined,
  TId extends string | number = string | number,
>(
  options: CrudHooksOptions<
    TListData,
    TDetailData,
    TCreateInput,
    TUpdateInput,
    TParams,
    TId
  >
) => {
  const {
    keys,
    listFn,
    detailFn,
    createFn,
    updateFn,
    deleteFn,
    defaultListParams,
    listQueryOptions,
    detailQueryOptions,
  } = options

  const useList = createListQueryHook<TListData, TParams>({
    key: keys.list,
    fetcher: ({ params, signal }) => listFn(params, signal),
    defaultParams: defaultListParams,
    queryOptions: listQueryOptions,
  })

  const useDetail = createDetailQueryHook<TDetailData, TId>({
    key: keys.detail,
    fetcher: (id, signal) => detailFn(id, signal),
    queryOptions: detailQueryOptions,
  })

  // Helper to invalidate all list queries regardless of params
  const invalidateAllLists = async (
    queryClient: ReturnType<typeof useQueryClient>
  ) => {
    await queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey
        const listKey = keys.list(undefined)
        return (
          Array.isArray(queryKey) &&
          queryKey.length >= 2 &&
          queryKey[0] === listKey[0] &&
          queryKey[1] === listKey[1]
        )
      },
    })
  }

  const useCreate = (
    options?: UseMutationOptions<TDetailData, unknown, TCreateInput, unknown>
  ) => {
    const queryClient = useQueryClient()
    const baseOnSuccess = options?.onSuccess

    return useMutation<TDetailData, unknown, TCreateInput>({
      mutationFn: createFn,
      ...options,
      onSuccess: async (...args) => {
        await invalidateAllLists(queryClient)

        if (baseOnSuccess) {
          await baseOnSuccess(...args)
        }
      },
    })
  }

  const useUpdate = (
    id: TId,
    options?: UseMutationOptions<TDetailData, unknown, TUpdateInput, unknown>
  ) => {
    const queryClient = useQueryClient()
    const baseOnSuccess = options?.onSuccess

    return useMutation<TDetailData, unknown, TUpdateInput>({
      mutationFn: (payload) => updateFn(id, payload),
      ...options,
      onSuccess: async (...args) => {
        // Invalidate the specific detail and all lists
        await queryClient.invalidateQueries({ queryKey: keys.detail(id) })
        await invalidateAllLists(queryClient)

        if (baseOnSuccess) {
          await baseOnSuccess(...args)
        }
      },
    })
  }

  const useDelete = (
    options?: UseMutationOptions<void, unknown, TId, unknown>
  ) => {
    const queryClient = useQueryClient()
    const baseOnSuccess = options?.onSuccess

    return useMutation<void, unknown, TId>({
      mutationFn: deleteFn,
      ...options,
      onSuccess: async (...args) => {
        await invalidateAllLists(queryClient)

        if (baseOnSuccess) {
          await baseOnSuccess(...args)
        }
      },
    })
  }

  return {
    useList,
    useDetail,
    useCreate,
    useUpdate,
    useDelete,
  } as const
}

/**
 * Factory for read-only hooks (list + detail only).
 * Use this when you don't need create/update/delete operations.
 */
type ReadOnlyKeys<TParams, TId extends string | number> = {
  list: (params?: TParams) => QueryKey
  detail: (id: TId) => QueryKey
}

interface ReadOnlyHooksOptions<
  TListData,
  TDetailData,
  TParams,
  TId extends string | number,
> {
  keys: ReadOnlyKeys<TParams, TId>
  listFn: (params?: TParams, signal?: AbortSignal) => Promise<TListData>
  detailFn: (id: TId, signal?: AbortSignal) => Promise<TDetailData>
  defaultListParams?: TParams
  listQueryOptions?: Omit<
    UseQueryOptions<TListData, unknown, TListData, QueryKey>,
    "queryKey" | "queryFn"
  >
  detailQueryOptions?: Omit<
    UseQueryOptions<TDetailData, unknown, TDetailData, QueryKey>,
    "queryKey" | "queryFn" | "enabled"
  >
}

export const createReadOnlyHooks = <
  TListData,
  TDetailData,
  TParams = undefined,
  TId extends string | number = string | number,
>(
  options: ReadOnlyHooksOptions<TListData, TDetailData, TParams, TId>
) => {
  const {
    keys,
    listFn,
    detailFn,
    defaultListParams,
    listQueryOptions,
    detailQueryOptions,
  } = options

  const useList = createListQueryHook<TListData, TParams>({
    key: keys.list,
    fetcher: ({ params, signal }) => listFn(params, signal),
    defaultParams: defaultListParams,
    queryOptions: listQueryOptions,
  })

  const useDetail = createDetailQueryHook<TDetailData, TId>({
    key: keys.detail,
    fetcher: (id, signal) => detailFn(id, signal),
    queryOptions: detailQueryOptions,
  })

  return {
    useList,
    useDetail,
  } as const
}
