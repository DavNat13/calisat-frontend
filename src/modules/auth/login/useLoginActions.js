/**
 * Lógica real de la pantalla de acceso dual (Entra ID + Cognito).
 *
 * CONTRATO con LoginPage.jsx / LoginSessionBanner.jsx (no cambiar la forma
 * sin avisar):
 *   {
 *     institucional: { loading, onAcceder(retorno?) },
 *     publico:       { loading, registroLoading, onAcceder(retorno?), onRegistro(retorno?) },
 *     sesionActiva:  { proveedor: "azure"|"cognito"|null, identificador, onCerrarSesion },
 *     error, cerrando
 *   }
 *
 * `loading`/`cerrando` se DERIVAN del estado de las librerías (inProgress de
 * MSAL y activeNavigator/isLoading de react-oidc-context): nunca se hace
 * setState DESPUÉS de disparar un redirect (la página se va y el estado se
 * quedaría colgado). Solo se pone estado antes de navegar (registro) y en
 * los catches, donde no hubo navegación.
 */
import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useAuth } from "react-oidc-context";
import { useLocation } from "react-router-dom";
import useAuthSession from "../../../auth/useAuthSession";
import { olvidarRetorno } from "../../../auth/retorno";
import {
  consumirErrorCallback,
  limpiarProveedorPendiente,
  limpiarUrl,
} from "../../../auth/redirectCallback";
import {
  abrirRegistroPublico,
  iniciarInstitucional,
  iniciarPublico,
  prepararRetorno,
} from "./loginActions";

const MENSAJE_MICROSOFT =
  "No se pudo iniciar sesión con Microsoft. Inténtalo de nuevo.";
const MENSAJE_COGNITO =
  "No se pudo iniciar sesión con AWS Cognito. Inténtalo de nuevo.";
const MENSAJE_CIERRE = "No se pudo cerrar la sesión. Inténtalo de nuevo.";

// Fallo de canje de Azure ocurrido al cargar la SPA (aún no había ruta de
// /login montada). Se lee al importar ESTE módulo, es decir, cuando React.lazy
// carga el chunk de /login: queda fuera del render, así que StrictMode no lo
// consume dos veces y el valor no se pierde en desarrollo.
const ERROR_DE_CALLBACK = consumirErrorCallback();

export default function useLoginActions() {
  const location = useLocation();
  const { instance, inProgress } = useMsal();
  const cognito = useAuth();
  const { proveedor, identificador, logout } = useAuthSession();

  const [errorLocal, setErrorLocal] = useState(ERROR_DE_CALLBACK);
  const [registrando, setRegistrando] = useState(false);
  const [cerrandoCognito, setCerrandoCognito] = useState(false);

  // Destino que inyecta ProtectedRoute en state.from; "/" si el usuario
  // llegó a /login directamente (navbar o logout).
  const destino = location.state?.from?.pathname ?? "/";

  // react-oidc-context no propaga las excepciones: las deja en `cognito.error`.
  // Ese es el único aviso de que el redirect a Cognito no llegó a salir
  // (o de que el canje del código falló), así que se limpia el marcador
  // pendiente y la URL para que el usuario pueda reintentar.
  useEffect(() => {
    if (!cognito.error) return;
    limpiarProveedorPendiente();
    limpiarUrl();
  }, [cognito.error]);

  const error =
    errorLocal ??
    (cognito.error
      ? `${MENSAJE_COGNITO} (${cognito.error.message ?? "error desconocido"})`
      : null);

  const institucional = {
    // inProgress pasa a "acquireToken" solo mientras MSAL redirige.
    loading: inProgress === "acquireToken",
    onAcceder: (retorno) => {
      setErrorLocal(null);
      prepararRetorno(retorno, destino);
      iniciarInstitucional(instance).catch(() => setErrorLocal(MENSAJE_MICROSOFT));
    },
  };

  const publico = {
    // activeNavigator es el subconjunto útil de isLoading: isLoading también
    // es true mientras el UserManager arranca, y eso pintaría
    // "Redirigiendo…" en un botón que no está redirigiendo a ninguna parte.
    loading: cognito.activeNavigator === "signinRedirect",
    registroLoading: registrando,
    onAcceder: (retorno) => {
      setErrorLocal(null);
      prepararRetorno(retorno, destino);
      iniciarPublico(cognito).catch(() => setErrorLocal(MENSAJE_COGNITO));
    },
    onRegistro: (retorno) => {
      setErrorLocal(null);
      prepararRetorno(retorno, destino);
      // Estado ANTES de navegar (la página se va en el assign).
      setRegistrando(true);
      try {
        abrirRegistroPublico();
      } catch {
        setRegistrando(false);
        setErrorLocal(MENSAJE_COGNITO);
      }
    },
  };

  const sesionActiva = {
    proveedor,
    identificador,
    onCerrarSesion: async () => {
      setErrorLocal(null);
      // Feedback del banner mientras Cognito borra el User local; el
      // redirect del Hosted UI llega justo después.
      setCerrandoCognito(proveedor === "cognito");
      try {
        olvidarRetorno();
        await logout();
      } catch (e) {
        console.error("Error al cerrar la sesión:", e);
        setCerrandoCognito(false);
        setErrorLocal(MENSAJE_CIERRE);
      }
    },
  };

  return {
    institucional,
    publico,
    sesionActiva,
    error,
    // inProgress "logout" = logoutRedirect de MSAL en marcha.
    cerrando: inProgress === "logout" || cerrandoCognito,
  };
}
