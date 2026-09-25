import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@fontsource-variable/inter';
import './styles/index.css';

import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./auth/AuthConfig";
import AuthRoleProvider from "./auth/AuthRoleProvider";

const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.addEventCallback((event) => {
  if (
    event.eventType === EventType.LOGIN_FAILURE ||
    event.eventType === EventType.ACQUIRE_TOKEN_FAILURE
  ) {
    console.error("Fallo de MSAL:", event.error);
  }
});

async function bootstrap() {
  await msalInstance.initialize();

  try {
    const response = await msalInstance.handleRedirectPromise();
    if (response) {
      console.info("Autenticacion completada:", response.account?.username);
    }
  } catch (error) {
    console.error("Error al procesar respuesta de Azure:", error);
    window.history.replaceState(null, "", window.location.pathname);
  }

  // MSAL no marca ninguna cuenta como "activa" por su cuenta: sin este paso
  // getActiveAccount() devuelve null y AuthRoleProvider no puede leer los
  // claims de roles del id token (ProtectedRoute denegaría siempre y la UI
  // no mostraría ninguna opción de rol). Se marca solo si aún no hay una,
  // para no pisar una selección explícita. El valor persiste en la caché de
  // MSAL (sessionStorage), así que también sobrevive a un refresh.
  try {
    const cuentas = msalInstance.getAllAccounts();
    if (cuentas.length > 0 && !msalInstance.getActiveAccount()) {
      msalInstance.setActiveAccount(cuentas[0]);
    }
  } catch (error) {
    console.error("Error al fijar la cuenta activa:", error);
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <AuthRoleProvider>
          <App />
        </AuthRoleProvider>
      </MsalProvider>
    </React.StrictMode>
  );
}

bootstrap().catch((error) => {
  console.error("Error al inicializar MSAL:", error);
});
