import Input from "../../../../components/ui/Input";
import { ID_CAMPO } from "../../constantes/producto";

/**
 * Paso 1 · Datos básicos: SKU (bloqueado al editar), nombre y descripción.
 * Cada campo recibe `error` solo si falló SU validación: el Input del kit
 * es quien traduce eso a aria-invalid + aria-describedby del mensaje.
 */
export default function PasoBasicos({
  form,
  errores = {},
  onChange,
  editar = false,
}) {
  return (
    <>
      <div className="modal-pasos__campo">
        <Input
          label="SKU"
          id={ID_CAMPO.sku}
          name="sku"
          type="text"
          value={form.sku}
          onChange={onChange}
          error={errores.sku}
          disabled={editar}
          maxLength={64}
          placeholder="ANILLAS-001"
          required
        />
      </div>

      <div className="modal-pasos__campo">
        <Input
          label="Nombre"
          id={ID_CAMPO.nombre}
          name="nombre"
          type="text"
          value={form.nombre}
          onChange={onChange}
          error={errores.nombre}
          maxLength={120}
          placeholder="Anillas de madera"
          required
        />
      </div>

      {/* La descripción ocupa las dos columnas de la rejilla del paso. */}
      <div className="modal-pasos__campo modal-pasos__contenido--full">
        <Input
          label="Descripción"
          id={ID_CAMPO.descripcion}
          name="descripcion"
          multiline
          rows={3}
          value={form.descripcion}
          onChange={onChange}
          error={errores.descripcion}
          maxLength={1000}
          placeholder="Descripción del producto..."
        />
      </div>
    </>
  );
}
