import { useState, useEffect } from "react";
import { useIsAuthenticated } from "@azure/msal-react";
import useCatalogoService from "../services/catalogoService";

const INITIAL_FORM = {
  sku: "",
  nombre: "",
  descripcion: "",
  precio: "",
  categoria: "",
  imagenUrl: "",
};

export default function ProductosPage() {
  const isAuthenticated = useIsAuthenticated();
  const {
    listarProductos,
    getProductoBySku,
    getProductosByCategoria,
    crearProducto,
    updateProducto,
    deleteProducto,
  } = useCatalogoService();

  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingSku, setEditingSku] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [filtro, setFiltro] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const cargarProductos = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listarProductos();
      setProductos(data.content || []);
    } catch {
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setExito("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setExito("");
    try {
      const payload = {
        ...form,
        precio: parseFloat(form.precio),
        imagenUrl: form.imagenUrl || "",
      };
      if (editingSku) {
        await updateProducto(editingSku, payload);
        setExito("Producto actualizado correctamente");
        setEditingSku(null);
      } else {
        await crearProducto(payload);
        setExito("Producto creado correctamente");
      }
      setForm(INITIAL_FORM);
      await cargarProductos();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (sku) => {
    setLoading(true);
    setError("");
    try {
      const producto = await getProductoBySku(sku);
      if (producto) {
        setForm({
          sku: producto.sku,
          nombre: producto.nombre,
          descripcion: producto.descripcion || "",
          precio: producto.precio.toString(),
          categoria: producto.categoria,
          imagenUrl: producto.imagenUrl || "",
        });
        setEditingSku(sku);
        setExito("");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError("Error al cargar producto para editar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sku) => {
    setLoading(true);
    setError("");
    setConfirmDelete(null);
    try {
      await deleteProducto(sku);
      setExito("Producto dado de baja correctamente");
      await cargarProductos();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroCategoria = async () => {
    if (!filtro.trim()) {
      await cargarProductos();
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getProductosByCategoria(filtro.trim());
      setProductos(Array.isArray(data) ? data : []);
    } catch {
      setError("Error al filtrar por categoría");
    } finally {
      setLoading(false);
    }
  };

  const cancelarEdicion = () => {
    setEditingSku(null);
    setForm(INITIAL_FORM);
    setError("");
    setExito("");
  };

  const formatPrecio = (precio) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(precio);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-white mb-6">Gestión de Productos</h1>

      {isAuthenticated && (
        <div className="bg-[#0f172a] border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-white mb-4">
            {editingSku ? `Editar Producto (${editingSku})` : "Crear Producto"}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          {exito && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded mb-4 text-sm">
              {exito}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">SKU</label>
              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                required
                maxLength={64}
                disabled={!!editingSku}
                placeholder="ANILLAS-001"
                className="w-full bg-[#1e293b] border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                maxLength={120}
                placeholder="Anillas de madera"
                className="w-full bg-[#1e293b] border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                maxLength={1000}
                rows={3}
                placeholder="Descripción del producto..."
                className="w-full bg-[#1e293b] border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Precio (MXN)</label>
              <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                placeholder="299.00"
                className="w-full bg-[#1e293b] border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Categoría</label>
              <input
                type="text"
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
                maxLength={64}
                placeholder="Anillas"
                className="w-full bg-[#1e293b] border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-400 mb-1">URL de Imagen (opcional)</label>
              <input
                type="url"
                name="imagenUrl"
                value={form.imagenUrl}
                onChange={handleChange}
                maxLength={500}
                placeholder="https://..."
                className="w-full bg-[#1e293b] border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white font-medium px-6 py-2 rounded text-sm transition-colors"
              >
                {submitting
                  ? editingSku ? "Actualizando..." : "Creando..."
                  : editingSku ? "Actualizar Producto" : "Crear Producto"}
              </button>
              {editingSku && (
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  className="bg-slate-600 hover:bg-slate-500 text-white font-medium px-6 py-2 rounded text-sm transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Filtrar por categoría..."
          className="bg-[#1e293b] border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 sm:w-64"
        />
        <button
          onClick={handleFiltroCategoria}
          className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded transition-colors"
        >
          Filtrar
        </button>
        {filtro && (
          <button
            onClick={async () => { setFiltro(""); await cargarProductos(); }}
            className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] border border-slate-600 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-white font-medium mb-2">Confirmar eliminación</h3>
            <p className="text-slate-400 text-sm mb-4">
              ¿Estás seguro de dar de baja el producto <strong className="text-white">{confirmDelete}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="bg-slate-600 hover:bg-slate-500 text-white text-sm px-4 py-2 rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium text-white mb-4">
          Listado de Productos
          <span className="text-slate-400 text-sm font-normal ml-2">({productos.length})</span>
        </h2>
        {loading ? (
          <p className="text-slate-400 text-sm">Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p className="text-slate-400 text-sm">No hay productos disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productos.map((p) => (
              <div
                key={p.sku}
                className="bg-[#0f172a] border border-slate-700 rounded-lg overflow-hidden hover:border-slate-500 transition-colors"
              >
                {p.imagenUrl && (
                  <img
                    src={p.imagenUrl}
                    alt={p.nombre}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium text-sm">{p.nombre}</h3>
                    <span className="text-cyan-400 font-semibold text-sm whitespace-nowrap ml-2">
                      {formatPrecio(p.precio)}
                    </span>
                  </div>
                  <span className="inline-block bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded mb-2">
                    {p.categoria}
                  </span>
                  <p className="text-slate-400 text-xs mb-1">SKU: {p.sku}</p>
                  {p.descripcion && (
                    <p className="text-slate-500 text-xs line-clamp-2 mb-3">{p.descripcion}</p>
                  )}
                  {isAuthenticated && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      <button
                        onClick={() => handleEdit(p.sku)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(p.sku)}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded transition-colors border border-red-500/30"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
