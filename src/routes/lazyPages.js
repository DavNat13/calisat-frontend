import { lazy } from "react";

/**
 * Carga diferida por ruta (React.lazy + Suspense): cada página pasa a ser su
 * propio chunk y el bundle inicial (React + router + MSAL + layouts) baja de
 * los 500 kB que advertía el build. El fallback vive en App.css (.app__carga).
 *
 * Archivo .js SIN JSX a propósito: aquí solo se declaran los chunks, de modo
 * que react-refresh no exige que el módulo exporte únicamente componentes.
 */

/* ------------------------------- Zona pública -------------------------- */
export const HomePage = lazy(() => import("../modules/home/HomePage"));
// Acceso dual (Entra ID / Cognito): la página vive en src/modules/auth/login.
export const LoginPage = lazy(() => import("../modules/auth/login/LoginPage"));
export const ProductosPage = lazy(
  () => import("../modules/catalogo/pages/ProductosPage")
);
// Stub de ficha de producto (la Fase 3 lo reemplaza por la versión real).
export const ProductoDetalle = lazy(
  () => import("../modules/catalogo/pages/ProductoDetalle")
);
export const NosotrosPage = lazy(
  () => import("../modules/informativas/pages/NosotrosPage")
);
export const ContactoPage = lazy(
  () => import("../modules/informativas/pages/ContactoPage")
);
export const TerminosPage = lazy(
  () => import("../modules/informativas/pages/TerminosPage")
);
export const PrivacidadPage = lazy(
  () => import("../modules/informativas/pages/PrivacidadPage")
);
export const ForbiddenPage = lazy(
  () => import("../modules/errors/ForbiddenPage")
);
export const CarritoPage = lazy(
  () => import("../modules/carrito/pages/CarritoPage")
);
export const CheckoutPage = lazy(
  () => import("../modules/carrito/pages/CheckoutPage")
);
export const UserProfile = lazy(
  () => import("../modules/usuarios/pages/UserProfile")
);

/* ------------------------------ Zona admin ----------------------------- */
export const DashboardPage = lazy(
  () => import("../modules/admin/pages/DashboardPage")
);
export const InventarioPage = lazy(
  () => import("../modules/admin/pages/InventarioPage")
);
export const EnviosPage = lazy(
  () => import("../modules/admin/pages/EnviosPage")
);
export const NotificacionesPage = lazy(
  () => import("../modules/admin/pages/NotificacionesPage")
);
