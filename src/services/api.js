import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../auth/AuthConfig";

const msalInstance = new PublicClientApplication(msalConfig);

let accessToken = null;

export async function initAuth() {
  await msalInstance.initialize();
  const response = await msalInstance.handleRedirectPromise();
  if (response) {
    accessToken = response.accessToken;
  }
  return response;
}

export function getMsalInstance() {
  return msalInstance;
}

export async function loginRedirect() {
  const loginRequest = { scopes: ["User.Read"] };
  await msalInstance.loginRedirect(loginRequest);
}

export async function logoutRedirect() {
  await msalInstance.logoutRedirect();
}

export async function acquireTokenSilent() {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) return null;

  const apiRequest = {
    scopes: [`api://${import.meta.env.VITE_AZURE_CLIENT_ID}/desarrollo/read-write`],
    account: accounts[0],
  };

  try {
    const response = await msalInstance.acquireTokenSilent(apiRequest);
    accessToken = response.accessToken;
    return accessToken;
  } catch (error) {
    console.warn("Token silencioso fallo, intentando redirect:", error);
    await msalInstance.acquireTokenRedirect(apiRequest);
    return null;
  }
}

export function getAccessToken() {
  return accessToken;
}

export function isAuthenticated() {
  return msalInstance.getAllAccounts().length > 0;
}

export function getCurrentAccount() {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
}

export async function apiRequest(url, options = {}) {
  const token = await acquireTokenSilent();
  if (!token) {
    throw new Error("No se pudo obtener el token de acceso");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response;
}
