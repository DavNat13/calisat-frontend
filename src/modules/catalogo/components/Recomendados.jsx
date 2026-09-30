import ProductoCard from "./ProductoCard";
import "./Recomendados.css";

/**
 * Franja de recomendados bajo la ficha de producto.
 *
 * Pinta ProductoCard SIN `puedeGestionar`, lo que la deja en modo vitrina:
 * nombre enlazado al detalle y "Añadir al carrito". El filtrado del SKU en
 * pantalla lo hace la página, de modo que aquí no hace falta lógica de datos.
 * Si no queda nada que sugerir no se pinta nada: un h2 sin contenido por
 * debajo es ruido para un lector de pantalla.
 */
export default function Recomendados({ productos }) {
  if (!productos?.length) return null;

  return (
    <section className="recomendados" aria-labelledby="recomendados-titulo">
      <h2 className="recomendados__titulo" id="recomendados-titulo">
        Productos Recomendados
      </h2>
      <div className="recomendados__grid">
        {productos.map((producto) => (
          <ProductoCard key={producto.sku} producto={producto} />
        ))}
      </div>
    </section>
  );
}
