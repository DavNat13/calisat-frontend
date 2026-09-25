import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";
import useAuthRole from "./useAuthRole";

export default function ProtectedRoute({ roles, children }) {
  const isAuthenticated = useIsAuthenticated();
  const { hasAnyRole } = useAuthRole();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (roles && roles.length > 0 && !hasAnyRole(...roles)) {
    return <Navigate to="/403" replace />;
  }

  return children ?? <Outlet />;
}
