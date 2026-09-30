import { Route, Navigate } from "react-router-dom";
import AdminLayout from "../modules/admin/layout/AdminLayout";
import ProtectedRoute from "../auth/ProtectedRoute";
import { ROLES } from "../auth/roles";
import {
  DashboardPage,
  ProductosPage,
  InventarioPage,
  EnviosPage,
  NotificacionesPage,
} from "./lazyPages";

/**
 * Rama /admin: panel lateral, SIN navbar pública.
 * Los guards quedan EXACTAMENTE igual que en el App.jsx original
 * (shell ADMIN|LOGISTICA; productos/inventario/notificaciones sólo ADMIN;
 * envíos hereda el guard del shell).
 *
 * Devuelve un <React.Fragment> de <Route> por la misma restricción de
 * react-router que PublicRoutes (los hijos de <Routes> no pueden ser
 * componentes); App.jsx lo invoca dentro de <Routes>.
 */
export default function AdminRoutes() {
  return (
    <>
      {/* ProtectedRoute sin children devuelve <Outlet/>, así que el
          AdminLayout se monta y sus rutas hijas se dibujan dentro. */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={[ROLES.ADMINISTRADOR, ROLES.LOGISTICA]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="productos"
          element={
            <ProtectedRoute roles={[ROLES.ADMINISTRADOR]}>
              <ProductosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventario"
          element={
            <ProtectedRoute roles={[ROLES.ADMINISTRADOR]}>
              <InventarioPage />
            </ProtectedRoute>
          }
        />
        {/* Envíos: el guard del shell /admin ya limita a ADMIN|LOG. */}
        <Route path="envios" element={<EnviosPage />} />
        <Route
          path="notificaciones"
          element={
            <ProtectedRoute roles={[ROLES.ADMINISTRADOR]}>
              <NotificacionesPage />
            </ProtectedRoute>
          }
        />
        {/* Un rol de gestión perdido en una subruta vuelve al panel. */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </>
  );
}
