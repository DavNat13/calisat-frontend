import { CircleAlert, Check } from "lucide-react";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import "./ProductoForm.css";

export default function ProductoForm({
  form,
  editingSku,
  submitting,
  error,
  exito,
  onChange,
  onSubmit,
  onCancel,
}) {
  const hayEstado = Boolean(error || exito);

  return (
    <section
      className="tarjeta producto-form"
      aria-labelledby="producto-form-titulo"
    >
      <h2 className="producto-form__titulo" id="producto-form-titulo">
        {editingSku ? `Editar Producto (${editingSku})` : "Crear Producto"}
      </h2>

      {/* Un SOLO nodo de estado con id único: si error y éxito coincidieran
          (racha de acciones) se emitirían dos id="producto-form-estado" y
          aria-describedby apuntaría al primero. El error tiene prioridad. */}
      {error ? (
        <p
          className="producto-form__alerta producto-form__alerta--error"
          id="producto-form-estado"
          role="alert"
        >
          <CircleAlert className="icono icono--sm" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : exito ? (
        <p
          className="producto-form__alerta producto-form__alerta--exito"
          id="producto-form-estado"
          role="status"
        >
          <Check className="icono icono--sm" aria-hidden="true" />
          <span>{exito}</span>
        </p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="producto-form__grid"
        aria-busy={submitting}
        aria-describedby={hayEstado ? "producto-form-estado" : undefined}
      >
        <div className="producto-form__campo">
          <Input
            label="SKU"
            id="producto-sku"
            name="sku"
            type="text"
            value={form.sku}
            onChange={onChange}
            required
            maxLength={64}
            disabled={!!editingSku}
            placeholder="ANILLAS-001"
          />
        </div>

        <div className="producto-form__campo">
          <Input
            label="Nombre"
            id="producto-nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={onChange}
            required
            maxLength={120}
            placeholder="Anillas de madera"
          />
        </div>

        <div className="producto-form__campo producto-form__full">
          <Input
            label="Descripción"
            id="producto-descripcion"
            name="descripcion"
            multiline
            rows={3}
            value={form.descripcion}
            onChange={onChange}
            maxLength={1000}
            placeholder="Descripción del producto..."
          />
        </div>

        <div className="producto-form__campo">
          <Input
            label="Precio (MXN)"
            id="producto-precio"
            name="precio"
            type="number"
            value={form.precio}
            onChange={onChange}
            required
            min="0.01"
            step="0.01"
            placeholder="299.00"
          />
        </div>

        <div className="producto-form__campo">
          <Input
            label="Categoría"
            id="producto-categoria"
            name="categoria"
            type="text"
            value={form.categoria}
            onChange={onChange}
            required
            maxLength={64}
            placeholder="Anillas"
          />
        </div>

        <div className="producto-form__campo producto-form__full">
          <Input
            label="URL de Imagen (opcional)"
            id="producto-imagen"
            name="imagenUrl"
            type="url"
            value={form.imagenUrl}
            onChange={onChange}
            maxLength={500}
            placeholder="https://..."
          />
        </div>

        <div className="producto-form__campo producto-form__full producto-form__acciones">
          <Button type="submit" variant="primario" disabled={submitting}>
            {submitting
              ? editingSku
                ? "Actualizando..."
                : "Creando..."
              : editingSku
                ? "Actualizar Producto"
                : "Crear Producto"}
          </Button>
          {editingSku && (
            <Button type="button" variant="secundario" onClick={onCancel} disabled={submitting}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}
