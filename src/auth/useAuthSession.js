/**
 * Sesión dual (Microsoft Entra ID + AWS Cognito) en un único hook.
 *
 * Es la FUENTE DE VERDAD de "¿quién tiene sesión?" para toda la app:
 * `AuthRoleProvider` (roles), `ProtectedRoute` (guard), `UserNavbar`
 * (menú/logout), `useUserSync` (registro en backend) y `useLoginActions`
 * (banner de /login) se apoyan en él, de modo que un cliente de Cognito
 * ve las mismas rutas y el mismo menú que uno de Azure.
 *
 * LIMITACIÓN CONOCIDA (fuera de alcance): los servicios de API
 * (`src/modules/admin/services/apiAdmin.js`, `adminService.js`,
 * `catalogoService.js` y `src/modules/usuarios/hooks/useUserProfile.js`)
 * siguen obteniendo el Bearer con `instance.acquireTokenSilent(...)` de
 * MSAL, es decir, siguen asumiendo sesión de Azure. Con sesión de Cognito
 * esas llamadas fallarían con 401: el panel `/admin` (rol ADMIN|LOG) y la
 * gestión de catálogo quedan reservados a Azure, mientras que vitrina,
 * carrito, checkout y perfil público consumen endpoints que no piden ese
 * token. Solo es trivial de ampliar si el backend acepta el id token de
 * Cognito como Bearer.
 */
import { useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import { useAuth } from "react-oidc-context";
import {
  AUTH_PROVIDER_AZURE,
  AUTH_PROVIDER_COGNITO,
  cerrarSesionHostedUi,
} from "../config/cognitoConfig";
import { ROLES } from "./roles";

/** `roles` del id token → array de strings en MAYÚSCULAS (claim o lista). */
function normalizarRoles(claim) {
  if (!claim) return [];
  const lista = Array.isArray(claim) ? claim : [claim];
  return lista
    .filter((rol) => typeof rol === "string" && rol.trim().length > 0)
    .map((rol) => rol.trim().toUpperCase());
}

export default function useAuthSession() {
  const { instance, accounts, inProgress } = useMsal();
  const cognito = useAuth();

  // Cuenta ACTIVA de MSAL (misma regla que los servicios y AdminSidebar);
  // `accounts[0]` solo como respaldo si MSAL no tiene ninguna activa.
  const cuenta = instance.getActiveAccount() ?? accounts[0] ?? null;
  const usuario = cognito.user ?? null;

  const sesionAzure = Boolean(cuenta);
  // Si hay sesión de Azure, ella manda: es la que aporta los roles de la
  // organización (ADMINISTRADOR/LOGISTICA) y el token del backend.
  const sesionCognito =
    !sesionAzure && Boolean(cognito.isAuthenticated && usuario);

  const proveedor = sesionAzure
    ? AUTH_PROVIDER_AZURE
    : sesionCognito
      ? AUTH_PROVIDER_COGNITO
      : null;

  const identificador = sesionAzure
    ? cuenta?.name || cuenta?.username || null
    : sesionCognito
      ? usuario?.profile?.email ||
        usuario?.profile?.phone_number ||
        "usuario"
      : null;

  let roles = [];
  if (sesionAzure) {
    roles = normalizarRoles(cuenta?.idTokenClaims?.roles);
  } else if (sesionCognito) {
    // Cognito no pide roles de aplicación: vienen en `cognito:groups`.
    // Fallback OBLIGATORIO a CLIENTE (mismo criterio que el backend) para
    // que un usuario público vea vitrina/carrito/perfil sin grupos.
    const grupos = normalizarRoles(usuario?.profile?.["cognito:groups"]);
    roles = grupos.length > 0 ? grupos : [ROLES.CLIENTE];
  }

  const isAuthenticated = Boolean(proveedor);

  /** true mientras alguno de los dos proveedores sigue inicializando. */
  const cargando = inProgress !== "none" || cognito.isLoading;

  /**
   * Cierre de sesión del proveedor ACTIVO (el que aporta la sesión visible).
   * - Azure: `logoutRedirect()` (MSAL borra su caché y Entra cierra sesión).
   * - Cognito: `removeUser()` PRIMERO — borra el User que oidc-client-ts
   *   guarda en sessionStorage, sin él la app se leería como autenticada al
   *   volver — y DESPUÉS se navega al `/logout` del Hosted UI, que invalida
   *   la sesión en Cognito.
   * Si conviven las dos sesiones en la misma pestaña, la local de Cognito se
   * descarta también al salir de Azure (solo borra el User, no navega).
   */
  const logout = useCallback(async () => {
    if (proveedor === AUTH_PROVIDER_AZURE) {
      if (cognito.isAuthenticated) {
        await cognito.removeUser().catch((e) =>
          console.error("No se pudo limpiar la sesión de Cognito:", e)
        );
      }
      await instance.logoutRedirect();
      return;
    }
    if (proveedor === AUTH_PROVIDER_COGNITO) {
      await cognito.removeUser();
      cerrarSesionHostedUi();
    }
  }, [proveedor, instance, cognito]);

  return {
    isAuthenticated,
    proveedor,
    identificador,
    roles,
    cargando,
    logout,
  };
}
