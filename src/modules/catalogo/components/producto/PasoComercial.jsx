import { Link } from "react-router-dom";
import Input from "../../../../components/ui/Input";
import { ID_CAMPO } from "../../constantes/producto";

/**
 * Paso 2 · Precio (CLP), categoría e imagen de portada.
 *
 * NO hay campo de stock: el ProductoRequest del catálogo no lo contempla y
 * inventarlo provocaría un 400 del backend. Para no dejar al usuario sin
 * respuesta, el hint del precio apunta a la pantalla que SÍ gestiona stock.
 */
export default function PasoComercial({ form, errores = {}, onChange }) {
  return (
    <>
      <div className="modal-pasos__campo">
        <Input
          label="Precio (CLP)"
          id={ID_CAMPO.precio}
          name="precio"
          type="number"
          value={form.precio}
          onChange={onChange}
          error={errores.precio}
          hint={
            <>
              El stock se administra en{" "}
              <Link className="modal-pasos__enlace" to="/admin/inventario">
                Inventario
              </Link>
              .
            </>
          }
          min="1"
          step="1"
          placeholder="29990"
          required
        />
      </div>

      <div className="modal-pasos__campo">
        <Input
          label="Categoría"
          id={ID_CAMPO.categoria}
          name="categoria"
          type="text"
          value={form.categoria}
          onChange={onChange}
          error={errores.categoria}
          maxLength={64}
          placeholder="Anillas"
          required
        />
      </div>

      <div className="modal-pasos__campo modal-pasos__contenido--full">
        <Input
          label="URL de imagen (opcional)"
          id={ID_CAMPO.imagenUrl}
          name="imagenUrl"
          type="url"
          value={form.imagenUrl}
          onChange={onChange}
          error={errores.imagenUrl}
          maxLength={500}
          placeholder="https://..."
        />
      </div>
    </>
  );
}
