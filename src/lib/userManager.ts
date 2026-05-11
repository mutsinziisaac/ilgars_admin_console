import { UserManager, Log } from "oidc-client-ts";
import { getAuthConfig } from "./auth/authConfig";

// Enable logging in development for debugging
if (import.meta.env.DEV) {
  Log.setLogger(console);
  Log.setLevel(Log.DEBUG); // Changed to DEBUG for more detailed logs
}

export const userManager = new UserManager(getAuthConfig());

// Set up event handlers for token management
userManager.events.addAccessTokenExpiring(() => {
  console.log("Access token expiring, attempting silent renewal...");
  userManager.signinSilent().catch((error) => {
    console.error("Silent renewal on token expiring failed:", error);
  });
});

userManager.events.addAccessTokenExpired(() => {
  console.warn("Access token expired");
});

userManager.events.addSilentRenewError((error) => {
  console.error("Silent renew error:", error);
});

userManager.events.addUserLoaded((user) => {
  console.log(
    "User loaded/refreshed, token expires at:",
    new Date(user.expires_at! * 1000),
  );
});

userManager.events.addUserUnloaded(() => {
  console.log("User unloaded");
});
