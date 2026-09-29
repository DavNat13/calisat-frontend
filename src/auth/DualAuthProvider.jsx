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
import { AuthProvider } from "react-oidc-context";
import { MsalProvider } from "@azure/msal-react";
import AuthRoleProvider from "./AuthRoleProvider";
import useRetorno from "./retorno";
import { cognitoOidcConfig } from "../config/cognitoConfig";

/**
 * Consume el retorno pendiente (si lo hay) en cuanto hay sesión. Va como
 * componente aparte para poder usar el hook fuera del render principal.
 */
function RetornoAlVolver() {
  useRetorno();
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
          {children}
        </AuthRoleProvider>
      </MsalProvider>
    </AuthProvider>
  );
}
