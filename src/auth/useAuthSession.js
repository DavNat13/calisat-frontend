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

/** true si `valor` tiene forma de correo (`alguien@dominio`, sin espacios). */
function esCorreo(valor) {
  return typeof valor === "string" && /^[^\s@]+@[^\s@]+$/.test(valor);
}

/**
 * Parte local de un correo: `davnat137` de `davnat137@gmail.com`.
 *
 * Es el fallback OBLIGATORIO de `user.name` cuando la fuente no aporta
 * nombre: devuelve "" (nunca undefined) para que el caller encadene su
 * último recurso y el DOM no muestre `undefined` ni "null".
 */
function parteLocalCorreo(correo) {
  return esCorreo(correo) ? correo.split("@")[0] : "";
}

/**
 * Sesión dual (Microsoft Entra ID + AWS Cognito) en un único hook.
 *
 * CONTRATO de salida (claves estables; añadir más no rompe a nadie):
 *   {
 *     isAuthenticated, proveedor, identificador, roles, cargando, logout,
 *     user: { name, email, provider, roles } | null
 *   }
 *
 * `user` es la forma NORMALIZADA del perfil, igual para los dos proveedores:
 * - Con sesión → objeto con `name` y `email` siempre string (vacío si la
 *   fuente no lo aporta), `provider` igual a `proveedor` y `roles` igual al
 *   `roles` de nivel superior (mismo array).
 * - Sin sesión → `null`, no un objeto vacío: los consumidores lo leen dentro
 *   de `isAuthenticated` (con `?.` como doble salvaguarda).
 * `user.name` nunca queda vacío si hay correo: cae a la parte local
 * (`davnat137` de `davnat137@gmail.com`).
 * `identificador` se DERIVA de `user` (misma cadena de fallbacks) para no
 * duplicar lógica; sigue siendo un string de display o `null` sin sesión.
 */
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

  let roles = [];
  // Candidatos a nombre y correo de la sesión ACTIVA; siempre string para
  // que `user` no pueda contener undefined.
  let nombreSesion = "";
  let emailSesion = "";

  if (sesionAzure) {
    const claims = cuenta?.idTokenClaims;
    // `username` de MSAL es una UPN (email-like); si no lo es, se miran los
    // claims del id token antes de quedarse sin correo.
    emailSesion =
      [cuenta?.username, claims?.email, claims?.preferred_username].find(
        esCorreo
      ) ?? "";
    nombreSesion =
      cuenta?.name ||
      (esCorreo(cuenta?.username) ? "" : cuenta?.username) ||
      "";
    roles = normalizarRoles(claims?.roles);
  } else if (sesionCognito) {
    const perfil = usuario?.profile;
    emailSesion = perfil?.email || "";
    // Orden: nombre del profile → parte local del correo → correo → teléfono.
    nombreSesion =
      perfil?.name ||
      parteLocalCorreo(emailSesion) ||
      perfil?.email ||
      perfil?.phone_number ||
      "";
    // Cognito no pide roles de aplicación: vienen en `cognito:groups`.
    // Fallback OBLIGATORIO a CLIENTE (mismo criterio que el backend) para
    // que un usuario público vea vitrina/carrito/perfil sin grupos.
    const grupos = normalizarRoles(perfil?.["cognito:groups"]);
    roles = grupos.length > 0 ? grupos : [ROLES.CLIENTE];
  }

  /**
   * Usuario normalizado (ver JSDoc del hook): forma única para Azure y
   * Cognito, con `name`/`email` siempre string y `null` sin sesión.
   */
  const user = proveedor
    ? {
        name: nombreSesion.trim() || parteLocalCorreo(emailSesion),
        email: emailSesion,
        provider: proveedor,
        roles,
      }
    : null;

  // Derivado de `user`: misma cadena de fallbacks, sin lógica duplicada.
  // Se mantiene como string de display (o `null` sin sesión) porque lo
  // consumen UserNavbar, PerfilTarjeta y el banner de /login.
  const identificador = user ? user.name || user.email || "usuario" : null;

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
    user,
    roles,
    cargando,
    logout,
  };
}
