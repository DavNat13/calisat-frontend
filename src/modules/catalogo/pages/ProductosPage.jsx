import { RotateCcw } from "lucide-react";
import useAuthRole from "../../../auth/useAuthRole";
import { ROLES } from "../../../auth/roles";
import useProductos from "../hooks/useProductos";
import ProductoForm from "../components/ProductoForm";
import ProductoCard from "../components/ProductoCard";
import ConfirmDialog from "../components/ConfirmDialog";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import "./ProductosPage.css";

/**
 * Listado de productos.
 *
 * - soloLectura (por defecto false): modo VITRINA para la ruta pública
 *   /productos (solo consulta y filtro, sin formulario ni acciones de
 *   tarjeta). La gestión vive en /admin/productos, que entra sin la prop.
 * - Solo en gestión (puedeGestionar), el botón "Ver dados de baja"
 *   (aria-pressed) conmuta el listado a los productos inactivos; en esa
 *   vista el formulario y el filtro por categoría se ocultan y cada tarjeta
 *   ofrece la acción única "Reactivar".
 */
export default function ProductosPage({ soloLectura = false }) {
  const { hasRole } = useAuthRole();
  const esAdministrador = hasRole(ROLES.ADMINISTRADOR);
  const puedeGestionar = esAdministrador && !soloLectura;
  const {
    productos, form, editingSku, loading, submitting,
    error, exito, filtro, confirmDelete,
    setFiltro, setConfirmDelete, handleChange, handleSubmit,
    handleEdit, handleDelete, handleFiltroCategoria,
    cancelarEdicion, cargarProductos,
    mostrarInactivos, productosInactivos, cargandoInactivos,
    reactivandoSku, alternarInactivos, handleReactivar, cargarInactivos,
  } = useProductos();

  // Fuente de verdad del listado según la vista activa (activos / bajas).
  const listado = mostrarInactivos ? productosInactivos : productos;
  const cargandoListado = mostrarInactivos ? cargandoInactivos : loading;

  const onLimpiarFiltro = async () => {
    setFiltro("");
    await cargarProductos();
  };

  const onRecargarVista = async () => {
    if (mostrarInactivos) {
      await cargarInactivos();
      return;
    }
    await onLimpiarFiltro();
  };

  return (
    <div className="pagina">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">
              {soloLectura ? "Catálogo de Productos" : "Gestión de Productos"}
            </h1>
            <p className="pagina__descripcion">
              {soloLectura
                ? "Explora el catálogo de productos de Calisat."
                : "Consulta, filtra y administra el catálogo de productos de Calisat."}
            </p>
          </div>
        </header>

        {puedeGestionar && !mostrarInactivos && (
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

        <div className="productos__filtros">
          {!mostrarInactivos && (
            <>
              <div className="productos__campo-busqueda">
                <Input
                  label="Filtrar por categoría"
                  id="productos-filtro"
                  type="text"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  placeholder="Ej. Anillas"
                />
              </div>
              <Button
                variant="secundario"
                onClick={handleFiltroCategoria}
                disabled={loading}
              >
                Filtrar
              </Button>
              {filtro && (
                <Button variant="fantasma" onClick={onLimpiarFiltro} disabled={loading}>
                  Limpiar
                </Button>
              )}
            </>
          )}

          {puedeGestionar && (
            <Button
              variant="secundario"
              className={
                mostrarInactivos
                  ? "productos__alternar productos__alternar--activo"
                  : "productos__alternar"
              }
              aria-pressed={mostrarInactivos}
              onClick={alternarInactivos}
              disabled={loading || cargandoInactivos}
              icon={<RotateCcw className="icono" aria-hidden="true" />}
            >
              Ver dados de baja
            </Button>
          )}
        </div>

        <ConfirmDialog
          sku={confirmDelete}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />

        {/* Sin formulario (modo vitrina o vista de dados de baja) el único
            sitio donde se comunica un fallo o un éxito es aquí. */}
        <section aria-labelledby="productos-listado" aria-busy={cargandoListado}>
          <h2 className="productos__subtitulo" id="productos-listado">
            {mostrarInactivos ? "Productos dados de baja" : "Listado de Productos"}
            <span className="productos__contador">({listado.length})</span>
          </h2>

          {(!puedeGestionar || mostrarInactivos) && error && (
            <p className="productos__estado productos__estado--error" role="alert">
              {error}
            </p>
          )}

          {mostrarInactivos && exito && (
            <p className="productos__estado productos__estado--exito" role="status">
              {exito}
            </p>
          )}

          {/* El estado de carga solo sustituye a la lista cuando NO hay nada
              que mostrar: si ya hay tarjetas (editar/filtrar/baja) se
              conservan y se marca aria-busy, en vez de desmontar toda la
              rejilla y hacerla reaparecer (parpadeo + pérdida de scroll). */}
          {cargandoListado && listado.length === 0 ? (
            <p className="productos__estado" role="status">
              {mostrarInactivos
                ? "Cargando productos dados de baja..."
                : "Cargando productos..."}
            </p>
          ) : listado.length === 0 ? (
            <div className="productos__vacio">
              <p className="productos__estado" role="status">
                {mostrarInactivos
                  ? "No hay productos dados de baja."
                  : "No hay productos disponibles."}
              </p>
              <Button variant="secundario" onClick={onRecargarVista}>
                Recargar listado
              </Button>
            </div>
          ) : (
            <div className="productos__grid">
              {listado.map((p) => (
                <ProductoCard
                  key={p.sku}
                  producto={p}
                  puedeGestionar={puedeGestionar}
                  onEdit={handleEdit}
                  onDelete={setConfirmDelete}
                  vistaInactivos={mostrarInactivos}
                  onReactivar={handleReactivar}
                  reactivando={reactivandoSku === p.sku}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
