import { WebStorageStateStore } from "oidc-client-ts";

const isBrowser = typeof window !== "undefined";

const getDefaultOrigin = () => {
  if (isBrowser && window.location) {
    return window.location.origin;
  }
  return import.meta.env.VITE_APP_BASE_URL ?? "http://localhost:5173";
};

const createMemoryStorage = (): Storage => {
  let store: Record<string, string> = {};
  return {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      store = {};
    },
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key)
        ? store[key]
        : null;
    },
    key(index) {
      return Object.keys(store)[index] ?? null;
    },
    removeItem(key) {
      delete store[key];
    },
    setItem(key, value) {
      store[key] = value;
    },
  };
};

const storage = isBrowser ? window.sessionStorage : createMemoryStorage();

const KEYCLOAK_URL =
  import.meta.env.VITE_KEYCLOAK_URL ?? "https://auth-rtms.ayinza.dev";
// Same-origin proxy base for fetch endpoints to avoid CORS. The vite dev
// server and Vercel both rewrite this prefix to KEYCLOAK_URL.
const KEYCLOAK_PROXY_BASE =
  import.meta.env.VITE_KEYCLOAK_PROXY_BASE ?? "/auth";
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM ?? "ilgars";
const KEYCLOAK_CLIENT_ID =
  import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "ilgars-ui";
const REDIRECT_URI =
  import.meta.env.VITE_KEYCLOAK_REDIRECT_URI ?? getDefaultOrigin();
const POST_LOGOUT_REDIRECT_URI =
  import.meta.env.VITE_KEYCLOAK_POST_LOGOUT_REDIRECT_URI ?? getDefaultOrigin();

export function getAuthConfig() {
  const realmPath = `/realms/${KEYCLOAK_REALM}/protocol/openid-connect`;
  const config = {
    authority: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`,
    client_id: KEYCLOAK_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    post_logout_redirect_uri: POST_LOGOUT_REDIRECT_URI,
    response_type: "code",
    scope: "openid profile email offline_access",
    userStore: new WebStorageStateStore({ store: storage }),
    automaticSilentRenew: true,
    accessTokenExpiringNotificationTimeInSeconds: 60,
    loadUserInfo: true,
    includeIdTokenInSilentRenew: true,
    metadata: {
      // issuer must match the `iss` claim Keycloak signs into tokens
      issuer: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`,
      // Browser navigations — no CORS, hit Keycloak directly
      authorization_endpoint: `${KEYCLOAK_URL}${realmPath}/auth`,
      end_session_endpoint: `${KEYCLOAK_URL}${realmPath}/logout`,
      // fetch() calls — must be same-origin to bypass CORS
      token_endpoint: `${KEYCLOAK_PROXY_BASE}${realmPath}/token`,
      userinfo_endpoint: `${KEYCLOAK_PROXY_BASE}${realmPath}/userinfo`,
      jwks_uri: `${KEYCLOAK_PROXY_BASE}${realmPath}/certs`,
    },
  };

  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log("Keycloak Config:", {
      authority: config.authority,
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
      post_logout_redirect_uri: config.post_logout_redirect_uri,
    });
  }

  return config;
}

export const authConfig = getAuthConfig();
