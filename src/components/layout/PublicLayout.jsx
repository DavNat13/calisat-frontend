import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

/**
 * Shell de la zona PÚBLICA de la aplicación: navbar superior + región
 * principal. Es un <Route element={...}> sin path: sus rutas hijas se
 * renderizan dentro del <Outlet/>.
 *
 * El skip-link global vive en App.jsx y apunta a #contenido, que aquí
 * aporta este <main> (con tabindex="-1" para poder recibir el foco del
 * skip-link y del cambio de ruta). El shell de administración NO usa esta
 * navbar: allí el panel lateral la sustituye (src/modules/admin/layout).
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
    </>
  );
}
