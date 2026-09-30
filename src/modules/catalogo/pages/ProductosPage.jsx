import { useState } from "react";
import { Plus } from "lucide-react";
import useAuthRole from "../../../auth/useAuthRole";
import { ROLES } from "../../../auth/roles";
import useProductos from "../hooks/useProductos";
import ProductoCard from "../components/ProductoCard";
import ConfirmDialog from "../components/ConfirmDialog";
import BarraFiltros from "../components/producto/BarraFiltros";
import ListadoEstado from "../components/producto/ListadoEstado";
import ProductoModal from "../components/producto/ProductoModal";
import Button from "../../../components/ui/Button";
import "./ProductosPage.css";

/**
 * Listado de productos.
 *
 * - soloLectura: modo VITRINA para /productos (solo consulta y filtro); la
 *   gestión vive en /admin/productos, que entra sin la prop.
 * - El alta/edición ya NO vive en un formulario inline: un único MODAL
 *   PASO A PASO (ProductoModal) atiende ambos modos y esta página solo
 *   decide si está abierto y en qué modo. En gestión, "Ver dados de baja"
 *   (aria-pressed) conmuta a los inactivos: sin filtro ni alta y con la
 *   acción única "Reactivar" en cada tarjeta.
 */
export default function ProductosPage({ soloLectura = false }) {
  const { hasRole } = useAuthRole();
  const puedeGestionar = hasRole(ROLES.ADMINISTRADOR) && !soloLectura;
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modo, setModo] = useState("crear");
  const {
    productos, loading, error, exito, filtro, confirmDelete,
    setFiltro, setConfirmDelete, handleFiltroCategoria, cargarProductos,
    form, handleChange, handleSubmit, submitting, cargandoEdicion,
    cancelarEdicion, handleEdit, handleDelete,
    mostrarInactivos, productosInactivos, cargandoInactivos,
    reactivandoSku, alternarInactivos, handleReactivar, cargarInactivos,
  } = useProductos({ onGuardado: () => setModalAbierto(false) });

  // Fuente de verdad del listado según la vista activa (activos / bajas).
  const listado = mostrarInactivos ? productosInactivos : productos;
  const cargandoListado = mostrarInactivos ? cargandoInactivos : loading;

  // Mientras el modal está abierto, los avisos del CRUD viven DENTRO de él;
  // al cerrarse vuelven a la página (banner role="status" / role="alert").
  const avisoError = modalAbierto ? "" : error;
  const avisoExito = modalAbierto ? "" : exito;

  const abrirCrear = () => {
    cancelarEdicion(); // borra restos del intento anterior (form, error, éxito)
    setModo("crear");
    setModalAbierto(true);
  };

  const abrirEdicion = async (sku) => {
    setModo("editar");
    setModalAbierto(true);
    // Si la precarga falla se cierra y el error queda visible en la página.
    if (!(await handleEdit(sku))) setModalAbierto(false);
  };

  // Limpiar el filtro vuelve al listado completo (la API no pagina por texto).
  const onLimpiarFiltro = async () => { setFiltro(""); await cargarProductos(); };

  // Recarga la vista que esté activa: bajas → inactivos; si no → filtros.
  const onRecargarVista = async () =>
    mostrarInactivos ? cargarInactivos() : onLimpiarFiltro();

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
          {puedeGestionar && (
            <div className="pagina__acciones">
              <Button variant="primario" icon={<Plus className="icono" aria-hidden="true" />} onClick={abrirCrear}>
                Crear Producto
              </Button>
            </div>
          )}
        </header>

        <BarraFiltros
          puedeGestionar={puedeGestionar}
          mostrarInactivos={mostrarInactivos}
          filtro={filtro}
          onFiltroChange={(e) => setFiltro(e.target.value)}
          onFiltrar={handleFiltroCategoria}
          onLimpiar={onLimpiarFiltro}
          cargando={loading}
          cargandoInactivos={cargandoInactivos}
          onAlternar={alternarInactivos}
        />

        <ConfirmDialog sku={confirmDelete} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />

        <ListadoEstado
          titulo={mostrarInactivos ? "Productos dados de baja" : "Listado de Productos"}
          contador={listado.length}
          cargando={cargandoListado}
          vacio={listado.length === 0}
          cargandoTexto={mostrarInactivos ? "Cargando productos dados de baja..." : "Cargando productos..."}
          vacioTexto={mostrarInactivos ? "No hay productos dados de baja." : "No hay productos disponibles."}
          error={avisoError}
          exito={avisoExito}
          onRecargar={onRecargarVista}
        >
          {listado.map((p) => (
            <ProductoCard
              key={p.sku}
              producto={p}
              puedeGestionar={puedeGestionar}
              onEdit={abrirEdicion}
              onDelete={setConfirmDelete}
              vistaInactivos={mostrarInactivos}
              onReactivar={handleReactivar}
              reactivando={reactivandoSku === p.sku}
            />
          ))}
        </ListadoEstado>

        {puedeGestionar && (
          <ProductoModal
            abierto={modalAbierto} modo={modo} onCerrar={() => setModalAbierto(false)}
            form={form} handleChange={handleChange} handleSubmit={handleSubmit}
            cargandoEdicion={cargandoEdicion} submitting={submitting} error={error}
          />
        )}
      </div>
    </div>
  );
}
