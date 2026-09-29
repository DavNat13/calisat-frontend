import { useMemo } from "react";
import AuthRoleContext from "./authRoleContext";
import useAuthSession from "./useAuthSession";

/**
 * Proveedor del contexto de roles (`useAuthRole()`).
 *
 * Los roles salen de `useAuthSession()`, que unifica los dos proveedores:
 *  - Sesión de AZURE  → claim `roles` del id token de Entra ID.
 *  - Sesión de COGNITO → claim `cognito:groups` (mayúsculas) y, si no hay
 *    ninguno, `["CLIENTE"]` (fallback obligatorio, igual que el backend).
 *
 * El contrato de `useAuthRole()` —`roles`, `activeRole`, `hasRole`,
 * `hasAnyRole`, `isAuthenticated`— NO cambia: todo el código existente
 * (Navbar, UserMenu, ProductosPage, AdminSidebar, ProtectedRoute) depende.
 */
export default function AuthRoleProvider({ children }) {
  const { roles, isAuthenticated } = useAuthSession();
  const rolesKey = roles.join(",");

  const value = useMemo(() => {
    const hasRole = (rol) => roles.includes(String(rol).toUpperCase());
    const hasAnyRole = (...rols) => rols.flat().some((rol) => hasRole(rol));
    return {
      roles,
      activeRole: roles[0] ?? null,
      hasRole,
      hasAnyRole,
      isAuthenticated,
    };
    // `roles` es derivado de `rolesKey`: si la clave no cambia, el contenido
    // de la lista tampoco, y así el objeto de contexto es estable entre
    // renders (evita re-renderizar toda la app por un array nuevo).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolesKey, isAuthenticated]);

  return <AuthRoleContext.Provider value={value}>{children}</AuthRoleContext.Provider>;
}
