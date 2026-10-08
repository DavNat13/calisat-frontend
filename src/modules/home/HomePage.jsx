import Card from "../../components/ui/Card";
import { CATEGORIAS } from "./constantes/homeDatos";
import Hero from "./components/Hero";
import Destacados from "./components/Destacados";
import Beneficios from "./components/Beneficios";
import Ubicacion from "./components/Ubicacion";
import "./HomePage.css";

/**
 * Portada pública. Composición: Hero → Destacados → Beneficios → Categorías →
 * Ubicación (mapa de Puerto Montt).
 *
 * Destacados se autocancela: si el GET del catálogo falla o vuelve vacío,
 * esa sección no se pinta y la home sigue en pie sin mensajes de error.
 * Las categorías (las de siempre) se conservan al pie de la página.
 */
export default function HomePage() {
  return (
    <div className="inicio">
      <Hero />
      <Destacados />
      <Beneficios />

      <section className="categorias" aria-labelledby="categorias-titulo">
        <div className="contenedor">
          <h2 className="categorias__titulo" id="categorias-titulo">
            Categorías
          </h2>
          <div className="categorias__grid">
            {CATEGORIAS.map(({ nombre, descripcion, Icono }) => (
              <Card key={nombre} columna className="categoria">
                <span className="categoria__icono">
                  <Icono className="icono icono--lg" aria-hidden="true" />
                </span>
                <h3 className="categoria__nombre">{nombre}</h3>
                <p className="categoria__descripcion">{descripcion}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Ubicacion />
    </div>
  );
}
