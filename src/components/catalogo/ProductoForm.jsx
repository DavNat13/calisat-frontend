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
  const inputClass =
    "w-full bg-surface-2 border border-border-strong rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary";
  const disabledClass = `${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <div className="bg-surface border border-border-strong rounded-lg p-6 mb-8">
      <h2 className="text-lg font-medium text-white mb-4">
        {editingSku ? `Editar Producto (${editingSku})` : "Crear Producto"}
      </h2>

      {error && (
        <div className="bg-danger-soft border border-danger/30 text-danger px-4 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      {exito && (
        <div className="bg-success/10 border border-success/30 text-success px-4 py-2 rounded mb-4 text-sm">
          {exito}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">SKU</label>
          <input
            type="text"
            name="sku"
            value={form.sku}
            onChange={onChange}
            required
            maxLength={64}
            disabled={!!editingSku}
            placeholder="ANILLAS-001"
            className={editingSku ? disabledClass : inputClass}
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={onChange}
            required
            maxLength={120}
            placeholder="Anillas de madera"
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-slate-400 mb-1">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={onChange}
            maxLength={1000}
            rows={3}
            placeholder="Descripción del producto..."
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Precio (MXN)</label>
          <input
            type="number"
            name="precio"
            value={form.precio}
            onChange={onChange}
            required
            min="0.01"
            step="0.01"
            placeholder="299.00"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Categoría</label>
          <input
            type="text"
            name="categoria"
            value={form.categoria}
            onChange={onChange}
            required
            maxLength={64}
            placeholder="Anillas"
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-slate-400 mb-1">URL de Imagen (opcional)</label>
          <input
            type="url"
            name="imagenUrl"
            value={form.imagenUrl}
            onChange={onChange}
            maxLength={500}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary-hover disabled:bg-slate-600 text-white font-medium px-6 py-2 rounded text-sm transition-colors"
          >
            {submitting
              ? editingSku ? "Actualizando..." : "Creando..."
              : editingSku ? "Actualizar Producto" : "Crear Producto"}
          </button>
          {editingSku && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-slate-600 hover:bg-slate-500 text-white font-medium px-6 py-2 rounded text-sm transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
