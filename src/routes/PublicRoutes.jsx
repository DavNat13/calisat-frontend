import { Route, Navigate } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import ProtectedRoute from "../auth/ProtectedRoute";
import { ROLES } from "../auth/roles";
import {
  HomePage,
  LoginPage,
  ProductosPage,
  ProductoDetalle,
  NosotrosPage,
  ContactoPage,
  TerminosPage,
  PrivacidadPage,
  ForbiddenPage,
  CarritoRedirect,
  CheckoutPage,
  UserProfile,
} from "./lazyPages";

/**
 * Rutas de la zona PÚBLICA: todas viven bajo el shell PublicLayout
 * (Navbar + <main id="contenido"> + Footer), que aporta el <Outlet/>.
 *
 * Devuelve un <React.Fragment> de <Route> porque React Router NO acepta
 * componentes como hijos de <Routes> (invariant: deben ser <Route> o
 * Fragment); App.jsx lo invoca dentro de <Routes>.
 */
export default function PublicRoutes() {
  return (
    <>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        {/* Acceso dual: destino único de "Iniciar Sesión" (navbar) y de
            ProtectedRoute cuando no hay sesión. */}
        <Route path="/login" element={<LoginPage />} />
        {/* Vitrina (soloLectura): la gestión vive en /admin/productos */}
        <Route path="/productos" element={<ProductosPage soloLectura />} />
        {/* Ficha de producto: carga real por SKU (galería + compra) */}
        <Route path="/producto/:sku" element={<ProductoDetalle />} />
        {/* Páginas informativas (contenedor propio src/modules/informativas) */}
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/contacto" element={<ContactoPage />} />
        <Route path="/terminos" element={<TerminosPage />} />
        <Route path="/privacidad" element={<PrivacidadPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute roles={[ROLES.CLIENTE]}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        {/* Sin prop roles: cualquier rol autenticado ve su propio perfil
            (ahora todos los roles muestran "Ver Perfil" en la navbar). */}
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        {/* Sin guard: el carrito es un panel lateral, no una página con
            datos privados. /carrito solo lo abre y vuelve a "/" (replace). */}
        <Route path="/carrito" element={<CarritoRedirect />} />
        {/* Sin comodín, cualquier URL desconocida dejaba el <main> en
            blanco. Se redirige al inicio: hay un 403 propio, pero aún no
            existe página 404. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </>
  );
}
