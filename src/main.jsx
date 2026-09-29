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
  // ?code=...&state=... → solo el proveedor que pidió el redirect (marcado
  // en sessionStorage por useLoginActions) puede canjear su código.
  const { callbackDeAzure, callbackDeCognito } = clasificarCallback();

  if (callbackDeAzure) {
    await procesarCallbackAzure(msalInstance);
  } else if (!callbackDeCognito) {
    // Callback de una pestaña vieja, de otra página o parámetros huérfanos:
    // se descarta para que nadie canjee un código que no le pertenece.
    limpiarUrl();
  }
  // El marcador ya fue consumido (o esta pestaña nunca lanzó un redirect).
  limpiarProveedorPendiente();

  // getActiveAccount() → claims de roles del id token de Azure (ver
  // msalInstance.js). Con sesión de Cognito no hay cuenta MSAL y los roles
  // salen de `cognito:groups` dentro de AuthRoleProvider.
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
