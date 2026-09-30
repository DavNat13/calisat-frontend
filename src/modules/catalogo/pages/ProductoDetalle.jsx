import { useParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import useProductoDetalle from "../hooks/useProductoDetalle";
import GaleriaProducto from "../components/detalle/GaleriaProducto";
import DetalleCompra from "../components/detalle/DetalleCompra";
import ProductoNoEncontrado from "../components/detalle/ProductoNoEncontrado";
import Recomendados from "../components/Recomendados";
import "./ProductoDetalle.css";

/**
 * Ruta /producto/:sku · ficha de producto.
 *
 * Un SOLO <section aria-busy> envuelve todos los estados para que un lector
 * de pantalla se entere de que la zona está ocupada mientras carga; dentro,
 * la página pinta UN estado por vez:
 *   - cargando → esqueleto (aria-hidden) + aviso role="status"
 *   - error    → role="alert" + Reintentar (el hook rehace el fetch)
 *   - null     → SKU inexistente (ProductoNoEncontrado)
 *   - objeto   → galería + compra + recomendados
 *
 * `key={producto.sku}` fuerza el remontaje al cambiar de SKU: si no, la
 * galería conservaría la miniatura activa del producto anterior.
 */
export default function ProductoDetalle() {
  const { sku } = useParams();
  const { cargando, producto, error, recomendados, reintentar } =
    useProductoDetalle(sku);
  const listo = !cargando && !error;
  // La recomendación nunca debe repetir el producto que se está viendo.
  const otros = recomendados.filter((p) => p.sku !== sku);

  return (
    <div className="pagina">
      <div className="contenedor">
        <section aria-busy={cargando} aria-label="Ficha de producto">
          {cargando && (
            <>
              <div className="detalle__skeleton" aria-hidden="true">
                <div className="detalle__skeleton-visor" />
                <div className="detalle__skeleton-linea detalle__skeleton-linea--titulo" />
                <div className="detalle__skeleton-linea" />
                <div className="detalle__skeleton-linea detalle__skeleton-linea--corta" />
              </div>
              <p className="visualmente-oculto" role="status">
                Cargando producto...
              </p>
            </>
          )}

          {error && (
            <div className="detalle__estado detalle__estado--error" role="alert">
              <p className="detalle__estado-texto">{error}</p>
              <Button variant="primario" onClick={reintentar}>
                Reintentar
              </Button>
            </div>
          )}

          {listo && !producto && <ProductoNoEncontrado sku={sku} />}

          {listo && producto && (
            <article className="detalle" key={producto.sku}>
              <GaleriaProducto producto={producto} />
              <DetalleCompra producto={producto} />
            </article>
          )}

          {listo && producto && (
            <Recomendados productos={otros} />
          )}
        </section>
      </div>
    </div>
  );
}
