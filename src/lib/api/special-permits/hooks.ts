import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { SpecialPermitsApi, type ListSpecialPermitRouteRequestsParams, type ListSpecialPermitsParams } from "./api"
import { specialPermitKeys } from "./queryKeys"
import type {
  ApproveSpecialPermitRequest,
  CreateSpecialPermitRouteRequest,
  CreateSpecialPermitVehicleSelectionRequest,
  ReviewSpecialPermitRouteRequest,
  SpecialPermitListResponse,
  UpdateSpecialPermitPaymentStatusRequest,
} from "./schemas"

export const readSpecialPermitTotal = (
  response: SpecialPermitListResponse | undefined,
) => {
  const metaTotal = response?.meta?.total ?? response?.meta?.totalElements
  if (typeof metaTotal === "number" && Number.isFinite(metaTotal)) return metaTotal
  if (typeof metaTotal === "string") {
    const parsed = Number(metaTotal)
    if (Number.isFinite(parsed)) return parsed
  }

  return response?.data?.length ?? 0
}

export const useSpecialPermitsList = (params?: ListSpecialPermitsParams) =>
  useQuery({
    queryKey: specialPermitKeys.list(params),
    queryFn: ({ signal }) => SpecialPermitsApi.listSpecialPermits(params, signal),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

export const useSpecialPermitRouteRequestsList = (params?: ListSpecialPermitRouteRequestsParams) =>
  useQuery({
    queryKey: specialPermitKeys.routeRequests(params),
    queryFn: ({ signal }) => SpecialPermitsApi.listSpecialPermitRouteRequests(params, signal),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

export const useSpecialPermitDetail = (permitId: string | null | undefined) =>
  useQuery({
    queryKey: permitId ? specialPermitKeys.detail(permitId) : ["special-permits", "detail", "disabled"],
    queryFn: ({ signal }) => {
      if (!permitId) throw new Error("Special permit id is required")
      return SpecialPermitsApi.getSpecialPermit(permitId, signal)
    },
    enabled: Boolean(permitId),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  })

export const useCreateSpecialPermitVehicleSelection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSpecialPermitVehicleSelectionRequest) =>
      SpecialPermitsApi.createVehicleSelection(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: specialPermitKeys.all() }),
  })
}

export const useCreateSpecialPermitRouteRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSpecialPermitRouteRequest) =>
      SpecialPermitsApi.createSpecialPermitRouteRequest(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: specialPermitKeys.all() }),
  })
}

export const useApproveSpecialPermit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ permitId, payload }: { permitId: string; payload: ApproveSpecialPermitRequest }) =>
      SpecialPermitsApi.approveSpecialPermit(permitId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: specialPermitKeys.all() }),
  })
}

export const useReviewSpecialPermitRouteRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string
      payload: ReviewSpecialPermitRouteRequest
    }) => SpecialPermitsApi.reviewSpecialPermitRouteRequest(requestId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: specialPermitKeys.all() }),
  })
}

export const useUpdateSpecialPermitPaymentStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      permitId,
      payload,
    }: {
      permitId: string
      payload: UpdateSpecialPermitPaymentStatusRequest
    }) => SpecialPermitsApi.updatePaymentStatus(permitId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: specialPermitKeys.all() }),
  })
}
