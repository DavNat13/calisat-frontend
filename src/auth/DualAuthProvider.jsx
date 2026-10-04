/**
 * Árbol de contextos de autenticación de la app.
 *
 * Orden (de fuera hacia dentro):
 *   1. `<AuthProvider>`  → react-oidc-context con la config de Cognito.
 *   2. `<MsalProvider>`  → instancia MSAL compartida (Entra ID).
 *   3. `<AuthRoleProvider>` → `useAuthRole()` (roles + isAuthenticated).
 *
 * Con ese orden cualquier hijo —incluidos `AuthRoleProvider`, las rutas y
 * los componentes de UI— tiene LOS DOS contextos disponibles, que es lo que
 * exige `useAuthSession()`.
 *
 * `skipSigninCallback` y `onSigninCallback` los calcula `main.jsx` en
 * `redirectCallback.js`: solo el proveedor que pidió el redirect canjea su
 * `?code=`, y la URL se limpia al terminar.
 */
import { useEffect } from "react";
import { AuthProvider, useAuth } from "react-oidc-context";
import { MsalProvider } from "@azure/msal-react";
import AuthRoleProvider from "./AuthRoleProvider";
import useRetorno from "./retorno";
import { hayCallbackDeAuth, limpiarUrl } from "./redirectCallback";
import { cognitoOidcConfig } from "../config/cognitoConfig";

/**
 * Consume el retorno pendiente (si lo hay) en cuanto hay sesión. Va como
 * componente aparte para poder usar el hook fuera del render principal.
 */
function RetornoAlVolver() {
  useRetorno();
  return null;
}

/**
 * Respaldo de la limpieza de la URL tras un callback de Cognito:
 * `onSigninCallback` solo se ejecuta si el canje del `?code=` resuelve, de
 * modo que un fallo (código caducado o ya consumido, red caída) dejaría el
 * parámetro en la barra de direcciones y un F5 volvería a leerlo.
 * `isLoading` garantiza que la URL se toca DESPUÉS de oidc-client-ts y NO
 * antes, o el canje se rompería.
 */
function LimpiezaCallbackPendiente() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !hayCallbackDeAuth()) return;
    limpiarUrl();
  }, [isLoading]);

  return null;
}

export default function DualAuthProvider({
  msalInstance,
  skipSigninCallback,
  onSigninCallback,
  children,
}) {
  return (
    <AuthProvider
      {...cognitoOidcConfig}
      skipSigninCallback={skipSigninCallback}
      onSigninCallback={onSigninCallback}
    >
      <MsalProvider instance={msalInstance}>
        <AuthRoleProvider>
          <RetornoAlVolver />
          <LimpiezaCallbackPendiente />
          {children}
        </AuthRoleProvider>
      </MsalProvider>
    </AuthProvider>
  );
}
