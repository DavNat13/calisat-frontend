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
  const { listarProductos, crearProducto } = useCatalogoService();

  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const cargarProductos = async () => {
    setLoading(true);
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
      await crearProducto(payload);
      setExito("Producto creado correctamente");
      setForm(INITIAL_FORM);
      await cargarProductos();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrecio = (precio) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(precio);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-white mb-6">Productos</h1>

      {isAuthenticated && (
        <div className="bg-[#0f172a] border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-white mb-4">Crear Producto</h2>

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
                placeholder="ANILLAS-001"
                className="w-full bg-[#1e293b] border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
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
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white font-medium px-6 py-2 rounded text-sm transition-colors"
              >
                {submitting ? "Creando..." : "Crear Producto"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium text-white mb-4">Listado de Productos</h2>
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
                    <p className="text-slate-500 text-xs line-clamp-2">{p.descripcion}</p>
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
