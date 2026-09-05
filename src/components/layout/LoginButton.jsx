import { useIsAuthenticated } from "@azure/msal-react";
import { useMsal } from "@azure/msal-react";
import { useEffect, useRef } from "react";
import { loginRequest } from "../../auth/AuthConfig";

export default function LoginButton() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (accounts.length > 0 && inProgress === "none") {
      if (window.location.search.includes("state=") || window.location.hash.includes("code=")) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (!hasRegistered.current) {
        hasRegistered.current = true;
        instance.acquireTokenSilent({ ...loginRequest, account: accounts[0] })
          .then(response => {
            return fetch(`${import.meta.env.VITE_MS_USUARIOS_URL}/api/v1/usuarios/registro`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${response.accessToken}`,
                "Content-Type": "application/json"
              }
            });
          })
          .then(res => {
            if (res.ok) console.log("Usuario sincronizado con el backend");
          })
          .catch(e => console.error("Error sincronizando usuario:", e));
      }
    }
  }, [accounts, inProgress, instance]);

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch(e => {
      console.error("Error en login:", e);
    });
  };

  const handleLogout = () => {
    hasRegistered.current = false;
    instance.logoutRedirect().catch(e => {
      console.error("Error en logout:", e);
    });
  };

  if (isAuthenticated && accounts.length > 0) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">
          Hola, <strong className="text-white">{accounts[0].name}</strong>
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="bg-[#EA580C] hover:bg-[#c2410c] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
    >
      <svg className="w-4 h-4" viewBox="0 0 23 23" fill="currentColor">
        <path d="M0 0h11v11H0zM12 0h11v11H12zM0 12h11v11H0zM12 12h11v11H12z"/>
      </svg>
      Iniciar Sesión
    </button>
  );
}
