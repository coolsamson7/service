import { AuthConfig } from "angular-oauth2-oidc";

export const authConfig: AuthConfig = {
    issuer: 'http://localhost:8080/realms/service',
    redirectUri: window.location.origin + "/home",
    clientId: 'service-browser',
    scope: 'openid profile email offline_access', // service
    responseType: 'code',
    // at_hash is not present in JWT token
    disableAtHashCheck: true,
    showDebugInformation: true
  }
