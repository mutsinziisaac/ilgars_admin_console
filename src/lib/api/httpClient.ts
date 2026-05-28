import type { RequestConfig } from "./types";
import { parseWithSchema } from "./zod-utils";
import { ApiError, NetworkError, toApiError } from "./errors";
import { userManager } from "@/lib/userManager";

const resolveApiBaseUrl = (
  baseUrl: string | undefined,
  fallbackPath: string,
): string => {
  const trimmed = (baseUrl ?? "").trim();
  if (!trimmed) return fallbackPath.replace(/\/+$/, "");

  if (/^https?:\/\//i.test(trimmed) && import.meta.env.DEV) {
    try {
      const url = new URL(trimmed);
      return `${url.pathname}${url.search}`.replace(/\/+$/, "");
    } catch {
      return fallbackPath.replace(/\/+$/, "");
    }
  }

  return trimmed.replace(/\/+$/, "");
};

const CORE_API_BASE_URL = resolveApiBaseUrl(
  import.meta.env.VITE_CORE_API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL,
  "/api/core",
);
const MOTOR_VEHICLE_API_BASE_URL = resolveApiBaseUrl(
  import.meta.env.VITE_MOTOR_VEHICLE_API_BASE_URL,
  "/api/motorvehicle",
);
const DEVICES_API_BASE_URL = resolveApiBaseUrl(
  import.meta.env.VITE_DEVICES_API_BASE_URL,
  "/api/devices",
);
const REQUEST_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 30000);

type FetchRequestConfig<TResponse> = RequestConfig<TResponse> & {
  baseURL?: string;
};

const isJsonBody = (body: unknown): boolean => {
  if (body === null || body === undefined) return false;
  if (typeof body !== "object") return false;
  if (body instanceof FormData) return false;
  if (body instanceof Blob) return false;
  if (body instanceof ArrayBuffer) return false;
  if (body instanceof URLSearchParams) return false;

  return true;
};

const readResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text === "" ? null : text;
};

const normalizePath = (baseUrl: string, path: string): string => {
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  let normalizedPath = path.replace(/^\/+/, "");

  if (normalizedBase.endsWith("/v1") && normalizedPath.startsWith("v1/")) {
    normalizedPath = normalizedPath.slice(3);
  }

  return `${normalizedBase}/${normalizedPath}`;
};

const appendParams = (
  url: string,
  params: FetchRequestConfig<unknown>["params"],
): string => {
  if (!params) return url;

  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
      return;
    }

    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  if (!query) return url;

  return `${url}${url.includes("?") ? "&" : "?"}${query}`;
};

const getAccessToken = async (): Promise<string | undefined> => {
  const user = await userManager.getUser();
  let token = user?.access_token;

  if (user?.expires_at) {
    const expiresAt = user.expires_at * 1000;
    const bufferTime = 30 * 1000;

    if (expiresAt - Date.now() < bufferTime) {
      const refreshedUser = await userManager.signinSilent();
      token = refreshedUser?.access_token;
    }
  }

  const normalizedToken = token?.trim();
  return normalizedToken || undefined;
};

const buildHeaders = async (
  headers: FetchRequestConfig<unknown>["headers"],
  hasJsonBody: boolean,
): Promise<Headers> => {
  const requestHeaders = new Headers(headers as HeadersInit | undefined);
  const token = await getAccessToken();

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  if (typeof document !== "undefined" && document.documentElement.lang) {
    requestHeaders.set("Accept-Language", document.documentElement.lang);
  }

  if (hasJsonBody && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  return requestHeaders;
};

const requestWithFetch = async <TResponse>(
  config: FetchRequestConfig<TResponse>,
  retryOnUnauthorized = true,
): Promise<TResponse> => {
  const { schema, url = "", method = "GET", params, data, signal, headers } = config;
  const baseURL = config.baseURL ?? CORE_API_BASE_URL;
  const body = data as unknown;
  const hasJsonBody = isJsonBody(body);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  const requestUrl = appendParams(normalizePath(baseURL, url), params);

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else if (typeof signal.addEventListener === "function") {
      signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  try {
    const response = await fetch(requestUrl, {
      method,
      headers: await buildHeaders(headers, hasJsonBody),
      body:
        body === undefined || body === null
          ? undefined
          : hasJsonBody
            ? JSON.stringify(body)
            : (body as BodyInit),
      signal: controller.signal,
    });

    const responseBody = await readResponseBody(response);

    if (response.status === 401 && retryOnUnauthorized) {
      try {
        await userManager.signinSilent();
        return requestWithFetch(config, false);
      } catch {
        userManager.signoutRedirect();
      }
    }

    if (!response.ok) {
      throw new ApiError(`Request failed with ${response.status} ${response.statusText}`, {
        status: response.status,
        details: responseBody,
      });
    }

    if (schema) {
      return parseWithSchema(schema, responseBody);
    }

    return responseBody as TResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new NetworkError("Request timed out or was cancelled", { cause: error });
    }

    throw toApiError(error);
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const coreHttpClient = {
  request: <TResponse>(config: RequestConfig<TResponse>) =>
    requestWithFetch<TResponse>({ ...config, baseURL: CORE_API_BASE_URL }),
  delete: <TResponse = unknown>(url: string, config?: RequestConfig<TResponse>) =>
    requestWithFetch<TResponse>({
      ...config,
      method: "DELETE",
      url,
      baseURL: CORE_API_BASE_URL,
    }),
};

export const motorVehicleHttpClient = {
  request: <TResponse>(config: RequestConfig<TResponse>) =>
    requestWithFetch<TResponse>({
      ...config,
      baseURL: MOTOR_VEHICLE_API_BASE_URL,
    }),
  delete: <TResponse = unknown>(url: string, config?: RequestConfig<TResponse>) =>
    requestWithFetch<TResponse>({
      ...config,
      method: "DELETE",
      url,
      baseURL: MOTOR_VEHICLE_API_BASE_URL,
    }),
};

export const devicesHttpClient = {
  request: <TResponse>(config: RequestConfig<TResponse>) =>
    requestWithFetch<TResponse>({
      ...config,
      baseURL: DEVICES_API_BASE_URL,
    }),
  delete: <TResponse = unknown>(url: string, config?: RequestConfig<TResponse>) =>
    requestWithFetch<TResponse>({
      ...config,
      method: "DELETE",
      url,
      baseURL: DEVICES_API_BASE_URL,
    }),
};

export const coreRequest = async <TResponse>({
  schema,
  ...config
}: RequestConfig<TResponse>): Promise<TResponse> =>
  coreHttpClient.request<TResponse>({ ...config, schema });

export const motorVehicleRequest = async <TResponse>({
  schema,
  ...config
}: RequestConfig<TResponse>): Promise<TResponse> =>
  motorVehicleHttpClient.request<TResponse>({ ...config, schema });

export const devicesRequest = async <TResponse>({
  schema,
  ...config
}: RequestConfig<TResponse>): Promise<TResponse> =>
  devicesHttpClient.request<TResponse>({ ...config, schema });
