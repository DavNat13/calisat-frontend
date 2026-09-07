const formatPrecio = (precio) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(precio);
};

export default function ProductoCard({ producto, isAuthenticated, onEdit, onDelete }) {
  const { sku, nombre, descripcion, precio, categoria, imagenUrl } = producto;

  return (
    <div className="bg-[#0f172a] border border-slate-700 rounded-lg overflow-hidden hover:border-slate-500 transition-colors">
      {imagenUrl && (
        <img src={imagenUrl} alt={nombre} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-medium text-sm">{nombre}</h3>
          <span className="text-cyan-400 font-semibold text-sm whitespace-nowrap ml-2">
            {formatPrecio(precio)}
          </span>
        </div>
        <span className="inline-block bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded mb-2">
          {categoria}
        </span>
        <p className="text-slate-400 text-xs mb-1">SKU: {sku}</p>
        {descripcion && (
          <p className="text-slate-500 text-xs line-clamp-2 mb-3">{descripcion}</p>
        )}
        {isAuthenticated && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
            <button
              onClick={() => onEdit(sku)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(sku)}
              className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded transition-colors border border-red-500/30"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
