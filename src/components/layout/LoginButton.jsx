import { useIsAuthenticated } from "@azure/msal-react";
import { useMsal } from "@azure/msal-react";
import { useEffect } from "react";
import { loginRequest } from "../../auth/AuthConfig";

export default function LoginButton() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (accounts.length > 0 && inProgress === "none") {
      if (window.location.search.includes("state=") || window.location.hash.includes("code=")) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [accounts, inProgress]);

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch(e => {
      console.error("Error en login:", e);
    });
  };

  const handleLogout = () => {
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
