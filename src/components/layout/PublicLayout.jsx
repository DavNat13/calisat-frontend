import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CarritoDrawer from "../../modules/carrito/components/CarritoDrawer";

/**
 * Shell de la zona PÚBLICA de la aplicación: navbar superior + región
 * principal + pie. Es un <Route element={...}> sin path: sus rutas hijas se
 * renderizan dentro del <Outlet/>.
 *
 * El skip-link global vive en App.jsx y apunta a #contenido, que aquí
 * aporta este <main> (con tabindex="-1" para poder recibir el foco del
 * skip-link y del cambio de ruta). El Footer va DESPUÉS de </main>: como
 * landmark role="contentinfo" debe ser hermano de la región principal y
 * además el skip-link no debe atravesarlo. El shell de administración NO
 * usa navbar ni pie: allí el panel lateral los sustituye
 * (src/modules/admin/layout).
 *
 * El panel del carrito va FUERA de <main>: es un diálogo position:fixed que
 * solo monta cuando está abierto, y vivir dentro de la región principal le
 * daría un contexto de página erróneo (y haría que el skip-link lo rodeara).
 */
export default function PublicLayout() {
  return (
    <>
      <Navbar />
      {/* tabindex="-1": permite que el skip-link y la navegación por ruta
          muevan el foco a la región principal sin añadirlo al Tab. */}
      <main id="contenido" tabIndex={-1} className="app__contenido">
        <Outlet />
      </main>
      <Footer />
      <CarritoDrawer />
    </>
  );
}
