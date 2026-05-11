import type { AxiosRequestConfig } from "axios";
import type { ZodSchema } from "zod";

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

export interface ApiResponseMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  pageCount?: number;
  [key: string]: unknown;
}

export interface ApiResponse<TData> {
  data: TData;
  meta?: ApiResponseMeta;
}

export interface PaginatedResponse<TData> extends ApiResponse<TData> {
  meta: ApiResponseMeta & {
    page: number;
    pageSize: number;
  };
}

export interface ApiErrorShape {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
  fieldErrors?: Record<string, string[]>;
}

export interface RequestConfig<TResponse> extends AxiosRequestConfig {
  schema?: ZodSchema<TResponse>;
}
