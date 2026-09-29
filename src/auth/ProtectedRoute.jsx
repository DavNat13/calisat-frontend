import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";
import useAuthRole from "./useAuthRole";

export default function ProtectedRoute({ roles, children }) {
  const isAuthenticated = useIsAuthenticated();
  const { hasAnyRole } = useAuthRole();
  const location = useLocation();

  // Sin sesión → /login (antes iba a "/", lo que dejaba al usuario en la
  // home sin haber resuelto su intención: él pidió una ruta protegida y lo
  // que quiere es autenticarse). El destino original viaja en state.from
  // para que useLoginActions pueda retomarlo tras el redirect.
  // /login NO está protegida, así que no hay bucle.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Con sesión pero sin el rol requerido → /403. Esa ruta vive en el shell
  // público y NO está envuelta en ProtectedRoute, así que sigue siendo
  // alcanzable (redirigirla aquí crearía un bucle infinito).
  if (roles && roles.length > 0 && !hasAnyRole(...roles)) {
    return <Navigate to="/403" replace />;
  }

  return children ?? <Outlet />;
}
