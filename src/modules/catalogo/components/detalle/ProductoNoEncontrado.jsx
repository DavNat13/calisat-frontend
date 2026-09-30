import { Link } from "react-router-dom";
import { PackageX } from "lucide-react";

/**
 * Estado "no encontrado" de la ficha (SKU inexistente o dado de baja).
 *
 * No es un error técnico: se ofrecen las dos salidas habituales (catálogo
 * e inicio) en lugar de dejar a la persona en un callejón sin salida.
 */
export default function ProductoNoEncontrado({ sku }) {
  return (
    <div className="detalle__vacio">
      <PackageX className="icono icono--xl" aria-hidden="true" />
      <h1 className="detalle__vacio-titulo">Producto no encontrado</h1>
      <p className="detalle__vacio-texto">
        No encontramos ningún producto con el SKU <strong>{sku}</strong>.
        Puede que se haya dado de baja o que el enlace esté desactualizado.
      </p>
      <div className="detalle__vacio-acciones">
        <Link className="boton boton--primario" to="/productos">
          Ver catálogo
        </Link>
        <Link className="boton boton--secundario" to="/">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
