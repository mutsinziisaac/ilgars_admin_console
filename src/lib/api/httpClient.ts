import axios from "axios";
import type { RequestConfig } from "./types";
import { parseWithSchema } from "./zod-utils";
import { attachAuthInterceptors } from "./interceptors";
import { userManager } from "@/lib/userManager";

const CORE_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://ilgars.ayinza.dev/core/api";
const MOTOR_VEHICLE_API_BASE_URL =
  import.meta.env.VITE_MOTOR_VEHICLE_API_BASE_URL ??
  "https://ilgars.ayinza.dev/motorvehicle/api";
const REQUEST_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 30000);

// Core API client (for tariffs, permits, etc.)
export const coreHttpClient = axios.create({
  baseURL: CORE_API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  withCredentials: false,
  paramsSerializer: {
    indexes: null, // serialize arrays as repeated params: filter=a&filter=b
  },
});

// Motor Vehicle API client (for vehicle lookups)
export const motorVehicleHttpClient = axios.create({
  baseURL: MOTOR_VEHICLE_API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  withCredentials: false,
  paramsSerializer: {
    indexes: null,
  },
});

// Attach auth interceptors to both clients
attachAuthInterceptors(coreHttpClient, {
  getLanguage: () =>
    typeof document !== "undefined" ? document.documentElement.lang : undefined,
  onUnauthorized: () => {
    console.log("Session expired, redirecting to login...");
    userManager.signoutRedirect();
  },
});

attachAuthInterceptors(motorVehicleHttpClient, {
  getLanguage: () =>
    typeof document !== "undefined" ? document.documentElement.lang : undefined,
  onUnauthorized: () => {
    console.log("Session expired, redirecting to login...");
    userManager.signoutRedirect();
  },
});

// Generic request function for core API
export const coreRequest = async <TResponse>({
  schema,
  ...config
}: RequestConfig<TResponse>): Promise<TResponse> => {
  const response = await coreHttpClient.request<TResponse>({
    ...config,
  });

  if (schema) {
    if (import.meta.env.DEV) {
      console.debug("[coreHttpClient] response before validation", {
        url: config.url,
        method: config.method,
        data: response.data,
      });
    }
    return parseWithSchema(schema, response.data);
  }

  return response.data as TResponse;
};

// Generic request function for motor vehicle API
export const motorVehicleRequest = async <TResponse>({
  schema,
  ...config
}: RequestConfig<TResponse>): Promise<TResponse> => {
  if (import.meta.env.DEV) {
    console.debug("[motorVehicleHttpClient] Making request:", {
      url: config.url,
      method: config.method,
      params: config.params,
    });
  }
  
  const response = await motorVehicleHttpClient.request<TResponse>({
    ...config,
  });

  if (schema) {
    if (import.meta.env.DEV) {
      console.debug("[motorVehicleHttpClient] response before validation", {
        url: config.url,
        method: config.method,
        data: response.data,
      });
    }
    return parseWithSchema(schema, response.data);
  }

  return response.data as TResponse;
};
