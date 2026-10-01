import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@fontsource-variable/inter';
import './styles/index.css';

import DualAuthProvider from "./auth/DualAuthProvider";
import { crearMsalInstance, fijarCuentaActiva } from "./auth/msalInstance";
import {
  clasificarCallback,
  limpiarProveedorPendiente,
  limpiarUrl,
  procesarCallbackAzure,
} from "./auth/redirectCallback";

const msalInstance = crearMsalInstance();

async function bootstrap() {
  // MSAL exige inicializar la instancia antes de cualquier interacción.
  await msalInstance.initialize();

  // AZURE Y COGNITO regresan por redirect a la MISMA página con
  // ?code=...&state=... → el marcador de sessionStorage (useLoginActions)
  // dice si esta respuesta es de Cognito; MSAL no hace falta adivinarlo:
  // solo canjea el código cuyo `state` guardó él al lanzar el redirect.
  const { callbackDeAzure, callbackDeCognito } = clasificarCallback();

  // MSAL se resuelve SIEMPRE, no solo cuando la URL "parece" de Azure: su
  // respuesta viaja en el hash y su state en su propia caché, así que
  // clasificar por el query string dejaba redirects sin canjear y la cuenta
  // nunca llegaba a getActiveAccount(). `silencioso` = este callback NO es de
  // Azure (Cognito u huérfanos): ahí MSAL no debe avisar ni tocar la URL.
  await procesarCallbackAzure(msalInstance, { silencioso: !callbackDeAzure });

  if (!callbackDeAzure && !callbackDeCognito) {
    // Callback de una pestaña vieja, de otra página o parámetros huérfanos:
    // se descarta para que nadie canjee un código que no le pertenece.
    // Con callback de Cognito NO se limpia aquí: oidc-client-ts lo canjea
    // después y recién entonces se limpia en onSigninCallback.
    limpiarUrl();
  }
  // El marcador ya fue consumido (o esta pestaña nunca lanzó un redirect).
  limpiarProveedorPendiente();

  // Red de seguridad tras handleRedirectPromise(): si MSAL devolvió null
  // (F5 con sesión ya abierta, o recarga tras canjear), se activa la primera
  // cuenta en caché y getActiveAccount() nunca queda null con sesión de Azure.
  // Con sesión de Cognito no hay cuenta MSAL y los roles salen de
  // `cognito:groups` dentro de AuthRoleProvider.
  fijarCuentaActiva(msalInstance);

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <DualAuthProvider
        msalInstance={msalInstance}
        // true → Cognito ignora el ?code= de Azure (skipSigninCallback).
        // Con la URL ya limpia en los demás casos, ninguno de los dos
        // proveedores se apropió del código del otro.
        skipSigninCallback={!callbackDeCognito}
        onSigninCallback={limpiarUrl}
      >
        <App />
      </DualAuthProvider>
    </React.StrictMode>
  );
}

bootstrap().catch((error) => {
  console.error("Error al inicializar MSAL:", error);
});
