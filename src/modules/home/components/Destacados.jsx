import { Link } from "react-router-dom";
import ProductoCard from "../../catalogo/components/ProductoCard";
import useDestacados from "../hooks/useDestacados";
import "./Destacados.css";

// 4 placeholders fijos: coinciden con el page size del hook (listarProductos(0, 4)).
const ESQUELETOS = [0, 1, 2, 3];

/**
 * Sección "Productos Destacados" de la home.
 *
 * Pinta `ProductoCard` SIN `puedeGestionar`, lo que la deja en modo vitrina:
 * nombre enlazado a la ficha y "Añadir al carrito".
 *
 * Si el GET público falla o devuelve la página vacía, la sección NO se
 * renderiza (`return null`): la portada nunca muestra errores de API, solo
 * los registra en consola el hook.
 */
export default function Destacados() {
  const { cargando, productos } = useDestacados();

  if (!cargando && productos.length === 0) return null;

  return (
    <section
      className="destacados"
      aria-labelledby="destacados-titulo"
      aria-busy={cargando}
    >
      <div className="contenedor">
        <div className="destacados__cabecera">
          <h2 className="destacados__titulo" id="destacados-titulo">
            Productos Destacados
          </h2>
          <Link className="destacados__ver-todo" to="/productos">
            Ver todo
          </Link>
        </div>

        {/* Región viva: anuncia la carga a lectores de pantalla; los
            esqueletos son decorativos y quedan ocultos con aria-hidden. */}
        <p className="visualmente-oculto" role="status">
          {cargando ? "Cargando productos destacados" : ""}
        </p>

        <div className="destacados__grid">
          {cargando
            ? ESQUELETOS.map((n) => (
                <div key={n} className="destacados__esqueleto" aria-hidden="true" />
              ))
            : productos.map((producto) => (
                <ProductoCard key={producto.sku} producto={producto} />
              ))}
        </div>
      </div>
    </section>
  );
}
