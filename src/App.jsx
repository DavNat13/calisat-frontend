import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./modules/admin/layout/AdminLayout";
import ProtectedRoute from "./auth/ProtectedRoute";
import { ROLES } from "./auth/roles";
import "./App.css";

// Carga diferida por ruta (React.lazy + Suspense): cada página pasa a ser su
// propio chunk y el bundle inicial (React + router + MSAL + layouts) baja de
// los 500 kB que advertía el build. El fallback vive en App.css (.app__carga).
const HomePage = lazy(() => import("./modules/home/HomePage"));
const ProductosPage = lazy(() => import("./modules/catalogo/pages/ProductosPage"));
const ForbiddenPage = lazy(() => import("./modules/errors/ForbiddenPage"));
const CarritoPage = lazy(() => import("./modules/carrito/pages/CarritoPage"));
const CheckoutPage = lazy(() => import("./modules/carrito/pages/CheckoutPage"));
const UserProfile = lazy(() => import("./modules/usuarios/pages/UserProfile"));
const DashboardPage = lazy(() => import("./modules/admin/pages/DashboardPage"));
const InventarioPage = lazy(() => import("./modules/admin/pages/InventarioPage"));
const EnviosPage = lazy(() => import("./modules/admin/pages/EnviosPage"));
const NotificacionesPage = lazy(
  () => import("./modules/admin/pages/NotificacionesPage")
);

// Fallback de <Suspense>: fuera de los <Routes> para que un solo nodo anuncie
// la carga de cualquier ruta (role="status" en el propio párrafo).
const CARGA_RUTA = (
  <div className="pagina pagina--centrada">
    <div className="contenedor">
      <p className="app__carga" role="status">
        <span className="app__carga-icono anim-spin" aria-hidden="true" />
        Cargando...
      </p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <Suspense fallback={CARGA_RUTA}>
          <Routes>
            {/* ---------------- Shell público: Navbar + <main> ---------------- */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              {/* Vitrina (soloLectura): la gestión vive en /admin/productos */}
              <Route path="/productos" element={<ProductosPage soloLectura />} />
              <Route path="/403" element={<ForbiddenPage />} />
              <Route
                path="/carrito"
                element={
                  <ProtectedRoute roles={[ROLES.CLIENTE]}>
                    <CarritoPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute roles={[ROLES.CLIENTE]}>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute roles={[ROLES.CLIENTE]}>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              {/* Sin comodín, cualquier URL desconocida dejaba el <main> en
                  blanco (navbar sin contenido). Se redirige al inicio: hay un
                  403 propio, pero aún no existe página 404. */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            {/* --------- Shell admin: panel lateral, SIN navbar pública -------- */}
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
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;
