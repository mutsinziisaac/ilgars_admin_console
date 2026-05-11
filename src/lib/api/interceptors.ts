import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { toApiError } from "./errors";
import { userManager } from "@/lib/userManager";

interface AttachInterceptorOptions {
  onUnauthorized?: () => void;
  getLanguage?: () => string | undefined;
}

// Mutex to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const onRefreshFailed = () => {
  refreshSubscribers = [];
};

const shouldAttemptRefresh = (error: AxiosError): boolean => {
  const status = error.response?.status;
  if (status !== 401) {
    return false;
  }

  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retry?: boolean;
  };

  return Boolean(originalRequest) && !originalRequest._retry;
};

export const attachAuthInterceptors = (
  instance: AxiosInstance,
  options?: AttachInterceptorOptions,
): void => {
  instance.interceptors.request.use(async (config) => {
    // Get token from OIDC user manager
    const user = await userManager.getUser();
    let token = user?.access_token;

    if (import.meta.env.DEV) {
      console.debug("[Auth Interceptor] Token present:", !!token);
      if (token) {
        console.debug("[Auth Interceptor] Token preview:", token.substring(0, 20) + "...");
      }
    }

    // Check if token is expired or about to expire (within 30 seconds)
    if (user && user.expires_at) {
      const expiresAt = user.expires_at * 1000; // Convert to milliseconds
      const now = Date.now();
      const bufferTime = 30 * 1000; // 30 seconds buffer

      if (expiresAt - now < bufferTime) {
        console.log("Token expiring soon, attempting proactive refresh...");
        try {
          const refreshedUser = await userManager.signinSilent();
          if (refreshedUser?.access_token) {
            token = refreshedUser.access_token;
            console.log("Proactive token refresh successful");
          }
        } catch (error) {
          console.warn("Proactive token refresh failed:", error);
          // Continue with the old token, the response interceptor will handle 401
        }
      }
    }

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    const language = options?.getLanguage?.();
    if (language) {
      config.headers = config.headers ?? {};
      config.headers["Accept-Language"] = language;
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (shouldAttemptRefresh(error)) {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        originalRequest._retry = true;

        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(instance(originalRequest));
            });
            // Set a timeout to reject if refresh takes too long
            setTimeout(() => {
              reject(toApiError(error));
            }, 10000);
          });
        }

        isRefreshing = true;

        try {
          // Attempt to refresh the token silently
          const user = await userManager.signinSilent();

          if (user?.access_token) {
            console.log("Token refresh successful");

            // Update the header with the new token
            originalRequest.headers.Authorization = `Bearer ${user.access_token}`;

            // Notify all queued requests about the new token
            onTokenRefreshed(user.access_token);

            isRefreshing = false;

            // Retry the original request with the new token
            return instance(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          onRefreshFailed();
          isRefreshing = false;

          // Check if it's a specific error that means we should logout
          const errorMessage = String(refreshError);
          if (
            errorMessage.includes("Token is not active") ||
            errorMessage.includes("invalid_grant") ||
            errorMessage.includes("Session not active")
          ) {
            console.log("Refresh token is invalid, logging out user");
            options?.onUnauthorized?.();
            return Promise.reject(toApiError(error));
          }
        }

        isRefreshing = false;

        // If refresh fails or no token returned, logout
        options?.onUnauthorized?.();
        return Promise.reject(toApiError(error));
      }

      throw toApiError(error);
    },
  );
};
