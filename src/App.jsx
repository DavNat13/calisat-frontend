import { Suspense } from "react";
import { BrowserRouter, Routes } from "react-router-dom";
import PublicRoutes from "./routes/PublicRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import CarritoProvider from "./modules/carrito/context/CarritoContext";
import "./App.css";

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

/**
 * Shell raíz: router + skip-link + <Suspense> de las rutas diferidas.
 *
 * Las rutas se declaran en src/routes: una rama pública (shell con navbar y
 * footer) y una de administración; App solo las monta. Los módulos devuelven
 * un fragmento de <Route> y aquí se invocan como funciones porque react-router
 * exige que los hijos de <Routes> sean <Route> o <React.Fragment> (un
 * <PublicRoutes/> como elemento dispararía "All component children of
 * <Routes> must be a <Route> or <React.Fragment>").
 *
 * El CarritoProvider vive AQUÍ (y dentro de <BrowserRouter>) porque sus
 * consumidores navegan: navbar, panel lateral y checkout.
 */
export default function App() {
  return (
    <BrowserRouter>
      <CarritoProvider>
        <div className="app">
          <a className="skip-link" href="#contenido">
            Saltar al contenido
          </a>
          <Suspense fallback={CARGA_RUTA}>
            <Routes>
              {PublicRoutes()}
              {AdminRoutes()}
            </Routes>
          </Suspense>
        </div>
      </CarritoProvider>
    </BrowserRouter>
  );
}
