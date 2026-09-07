import { useIsAuthenticated } from "@azure/msal-react";
import useProductos from "../hooks/useProductos";
import ProductoForm from "../components/catalogo/ProductoForm";
import ProductoCard from "../components/catalogo/ProductoCard";
import ConfirmDialog from "../components/catalogo/ConfirmDialog";

export default function ProductosPage() {
  const isAuthenticated = useIsAuthenticated();
  const {
    productos, form, editingSku, loading, submitting,
    error, exito, filtro, confirmDelete,
    setFiltro, setConfirmDelete, handleChange, handleSubmit,
    handleEdit, handleDelete, handleFiltroCategoria,
    cancelarEdicion, cargarProductos,
  } = useProductos();

  const onLimpiarFiltro = async () => {
    setFiltro("");
    await cargarProductos();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-white mb-6">Gestión de Productos</h1>

      {isAuthenticated && (
        <ProductoForm
          form={form}
          editingSku={editingSku}
          submitting={submitting}
          error={error}
          exito={exito}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={cancelarEdicion}
        />
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
            onClick={onLimpiarFiltro}
            className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      <ConfirmDialog
        sku={confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

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
              <ProductoCard
                key={p.sku}
                producto={p}
                isAuthenticated={isAuthenticated}
                onEdit={handleEdit}
                onDelete={setConfirmDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
