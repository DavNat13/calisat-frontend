export default function ConfirmDialog({ sku, onConfirm, onCancel }) {
  if (!sku) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1e293b] border border-slate-600 rounded-lg p-6 max-w-sm mx-4">
        <h3 className="text-white font-medium mb-2">Confirmar eliminación</h3>
        <p className="text-slate-400 text-sm mb-4">
          ¿Estás seguro de dar de baja el producto{" "}
          <strong className="text-white">{sku}</strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="bg-slate-600 hover:bg-slate-500 text-white text-sm px-4 py-2 rounded transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(sku)}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
