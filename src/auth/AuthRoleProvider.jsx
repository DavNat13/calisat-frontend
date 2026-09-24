import { useMemo } from "react";
import { useMsal } from "@azure/msal-react";
import AuthRoleContext from "./authRoleContext";

function normalizarRoles(claim) {
  if (!claim) return [];
  const lista = Array.isArray(claim) ? claim : [claim];
  return lista
    .filter((rol) => typeof rol === "string" && rol.trim().length > 0)
    .map((rol) => rol.trim().toUpperCase());
}

export default function AuthRoleProvider({ children }) {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  const idTokenClaims = activeAccount?.idTokenClaims;
  const roles = normalizarRoles(idTokenClaims?.roles);
  const isAuthenticated = Boolean(activeAccount);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolesKey, isAuthenticated]);

  return <AuthRoleContext.Provider value={value}>{children}</AuthRoleContext.Provider>;
}
