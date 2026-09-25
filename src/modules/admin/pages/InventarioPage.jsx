import { CircleAlert, Check, Pencil, Plus, Search, Trash2 } from "lucide-react";
import useStock from "../hooks/useStock";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import "./InventarioPage.css";

/** Formato numérico compartido de las pantallas del panel. */
const FORMATO_NUMERO = new Intl.NumberFormat("es-CL");

const aTexto = (valor) =>
  typeof valor === "number" ? FORMATO_NUMERO.format(valor) : "—";

const aFecha = (valor) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? "—"
    : fecha.toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });
};

/**
 * Movimientos disponibles por fila. La clave es el sufijo del endpoint
 * (`POST /api/v1/stock/{sku}/{tipo}`); `etiquetaBoton` es el texto de la
 * acción principal del modal (y el prefijo del aria-label de la fila).
 */
const TIPOS_MOVIMIENTO = {
  reservar: {
    titulo: "Reservar stock",
    descripcion:
      "Pasa unidades de disponibles a reservadas. Solo se acepta si hay stock libre (disponibles − reservadas) suficiente.",
    etiquetaBoton: "Reservar",
  },
  liberar: {
    titulo: "Liberar stock reservado",
    descripcion:
      "Libera reserva: decrementa las reservadas; las disponibles no cambian. Solo se acepta si hay reservadas suficientes.",
    etiquetaBoton: "Liberar",
  },
  confirmar: {
    titulo: "Confirmar salida de stock",
    descripcion:
      "Descuenta la cantidad de disponibles y de reservadas a la vez (salida física del almacén).",
    etiquetaBoton: "Confirmar salida",
  },
};

/**
 * Inventario (solo ADMINISTRADOR) — `/admin/inventario`.
 *
 * Composición: `.pagina > .contenedor` + cabecera `.pagina__cabecera`;
 * barra de búsqueda/alta, zona de mensajes (role="status"/"alert") y
 * listado tabular `.inventario__lista` con `<th scope="col">`, paginación
 * simple y tres modales del kit (registro, confirmación, movimiento).
 */
export default function InventarioPage() {
  const stock = useStock();
  const {
    registros,
    pagina,
    totalPaginas,
    totalElementos,
    cargando,
    enviando,
    error,
    exito,
    nota,
    consulta,
    consultaActiva,
    setConsulta,
    buscar,
    limpiarBusqueda,
    irAPagina,
    recargar,
    modalRegistro,
    formRegistro,
    errorFormulario,
    abrirNuevo,
    abrirEdicion,
    cerrarModalRegistro,
    cambiarFormRegistro,
    guardarRegistro,
    registroEliminar,
    pedirEliminar,
    cancelarEliminar,
    confirmarEliminar,
    modalMovimiento,
    formMovimiento,
    cerrarModalMovimiento,
    cambiarFormMovimiento,
    aplicarMovimiento,
    abrirMovimiento,
  } = stock;

  const esEdicion = modalRegistro?.modo === "editar";
  const movimientoActual = modalMovimiento
    ? TIPOS_MOVIMIENTO[modalMovimiento.tipo]
    : null;
  const enPrimeraPagina = pagina === 0;
  const enUltimaPagina = pagina >= totalPaginas - 1;

  const alPulsarEnter = (evento) => {
    if (evento.key !== "Enter") return;
    evento.preventDefault();
    buscar();
  };

  return (
    <div className="pagina inventario">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Inventario</h1>
            <p className="pagina__descripcion">
              Consulta y gestiona el stock por SKU: altas, cantidades
              disponibles y reservadas, y movimientos de reserva, liberación y
              salida.
            </p>
          </div>
        </header>

        {/* ------------------------- Barra de acciones ------------------- */}
        <div className="inventario__barra">
          <div className="inventario__campo-busqueda">
            <Input
              label="Buscar por SKU"
              id="inventario-busqueda"
              type="search"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              onKeyDown={alPulsarEnter}
              placeholder="ANILLAS-001"
              hint="Búsqueda exacta: escribe el SKU completo y pulsa Buscar."
            />
          </div>
          <Button
            variant="secundario"
            icon={<Search className="icono" aria-hidden="true" />}
            onClick={buscar}
            disabled={cargando}
          >
            Buscar
          </Button>
          <Button
            variant="primario"
            icon={<Plus className="icono" aria-hidden="true" />}
            onClick={abrirNuevo}
          >
            Nuevo registro
          </Button>
        </div>

        {/* --------------------- Mensajes de la página ------------------- */}
        {exito && (
          <p className="inventario__mensaje inventario__mensaje--exito" role="status">
            <Check className="icono icono--sm" aria-hidden="true" />
            <span>{exito}</span>
          </p>
        )}
        {error && (
          <p className="inventario__mensaje inventario__mensaje--error" role="alert">
            <CircleAlert className="icono icono--sm" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        {/* --------------------------- Listado --------------------------- */}
        <section
          className="inventario__seccion"
          aria-labelledby="inventario-listado"
          aria-busy={cargando}
        >
          <div className="inventario__encabezado">
            <h2 className="inventario__titulo-listado" id="inventario-listado">
              Registros de stock
              <span className="inventario__contador">({totalElementos})</span>
            </h2>
            {consultaActiva && !cargando && (
              <Button variant="fantasma" size="sm" onClick={limpiarBusqueda}>
                Limpiar búsqueda
              </Button>
            )}
          </div>

          {nota && (
            <p className="inventario__nota" role="status">
              {nota}
            </p>
          )}

          {cargando && registros.length === 0 ? (
            <p className="inventario__estado" role="status">
              Cargando inventario...
            </p>
          ) : registros.length === 0 ? (
            <div className="inventario__vacio">
              <p className="inventario__estado" role="status">
                No hay registros de stock que mostrar.
              </p>
              <Button variant="secundario" onClick={recargar}>
                Recargar listado
              </Button>
            </div>
          ) : (
            <>
              {/* Región desplazable con foco de teclado (overflow-x en móvil) */}
              <div
                className="inventario__lista"
                role="region"
                aria-labelledby="inventario-listado"
                tabIndex={0}
              >
                {/* aria-labelledby: nombre accesible de la tabla (mismo texto
                    que la región envolvente; sin <caption> visible). */}
                <table
                  className="inventario__tabla"
                  aria-labelledby="inventario-listado"
                >
                  <thead>
                    <tr>
                      <th scope="col">SKU</th>
                      <th scope="col" className="inventario__celda--numerica">
                        Disponibles
                      </th>
                      <th scope="col" className="inventario__celda--numerica">
                        Reservadas
                      </th>
                      <th scope="col" className="inventario__celda--numerica">
                        {/* Reservada ⊆ disponible en ms-inventario:
                            unidades libres = disponibles − reservadas */}
                        Libres
                      </th>
                      <th scope="col">Actualizado</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map((registro) => {
                      const disponibles = Number(registro.cantidadDisponible) || 0;
                      const reservadas = Number(registro.cantidadReservada) || 0;
                      return (
                        <tr key={registro.id ?? registro.sku}>
                          <th scope="row">
                            {registro.sku}
                          </th>
                          <td className="inventario__celda--numerica">
                            {aTexto(disponibles)}
                          </td>
                          <td className="inventario__celda--numerica">
                            {aTexto(reservadas)}
                          </td>
                          <td className="inventario__celda--numerica">
                            {aTexto(Math.max(disponibles - reservadas, 0))}
                          </td>
                          <td className="inventario__fecha">
                            {aFecha(registro.fechaActualizacion)}
                          </td>
                          <td>
                            <div className="inventario__acciones">
                              <Button
                                variant="secundario"
                                size="sm"
                                icon={<Pencil className="icono icono--sm" aria-hidden="true" />}
                                onClick={() => abrirEdicion(registro)}
                                aria-label={`Editar el registro ${registro.sku}`}
                                disabled={cargando}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="secundario"
                                size="sm"
                                onClick={() => abrirMovimiento(registro, "reservar")}
                                aria-label={`Reservar stock de ${registro.sku}`}
                                disabled={cargando}
                              >
                                Reservar
                              </Button>
                              <Button
                                variant="secundario"
                                size="sm"
                                onClick={() => abrirMovimiento(registro, "liberar")}
                                aria-label={`Liberar stock reservado de ${registro.sku}`}
                                disabled={cargando}
                              >
                                Liberar
                              </Button>
                              <Button
                                variant="secundario"
                                size="sm"
                                onClick={() => abrirMovimiento(registro, "confirmar")}
                                aria-label={`Confirmar salida de stock de ${registro.sku}`}
                                disabled={cargando}
                              >
                                Confirmar
                              </Button>
                              <Button
                                variant="peligro"
                                size="sm"
                                icon={<Trash2 className="icono icono--sm" aria-hidden="true" />}
                                onClick={() => pedirEliminar(registro)}
                                aria-label={`Eliminar el registro ${registro.sku}`}
                                disabled={cargando}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <nav className="inventario__paginacion" aria-label="Paginación del inventario">
                <Button
                  variant="secundario"
                  size="sm"
                  onClick={() => irAPagina(pagina - 1)}
                  disabled={enPrimeraPagina || cargando}
                >
                  Anterior
                </Button>
                <p className="inventario__paginacion-texto">
                  {`Página ${pagina + 1} de ${totalPaginas}`}
                </p>
                <Button
                  variant="secundario"
                  size="sm"
                  onClick={() => irAPagina(pagina + 1)}
                  disabled={enUltimaPagina || cargando}
                >
                  Siguiente
                </Button>
              </nav>
            </>
          )}
        </section>

        {/* ---------------------- Modal: alta/edición -------------------- */}
        <Modal
          open={Boolean(modalRegistro)}
          title={esEdicion ? "Editar registro de stock" : "Nuevo registro de stock"}
          onClose={cerrarModalRegistro}
          footer={
            <>
              <Button variant="secundario" onClick={cerrarModalRegistro} disabled={enviando}>
                Cancelar
              </Button>
              <Button
                type="submit"
                form="inventario-formulario"
                variant="primario"
                disabled={enviando}
                data-foco-principal=""
              >
                {enviando
                  ? "Guardando..."
                  : esEdicion
                    ? "Guardar cambios"
                    : "Crear registro"}
              </Button>
            </>
          }
        >
          <form
            id="inventario-formulario"
            className="inventario-formulario"
            onSubmit={guardarRegistro}
            aria-busy={enviando}
          >
            {errorFormulario && (
              <p className="inventario-formulario__alerta" role="alert">
                <CircleAlert className="icono icono--sm" aria-hidden="true" />
                <span>{errorFormulario}</span>
              </p>
            )}
            <Input
              label="SKU"
              id="inventario-sku"
              name="sku"
              type="text"
              value={formRegistro.sku}
              onChange={cambiarFormRegistro}
              required
              maxLength={64}
              disabled={esEdicion || enviando}
              placeholder="ANILLAS-001"
              hint={esEdicion ? "El SKU no se puede modificar." : undefined}
            />
            <Input
              label="Cantidad disponible"
              id="inventario-disponible"
              name="cantidadDisponible"
              type="number"
              min="0"
              step="1"
              value={formRegistro.cantidadDisponible}
              onChange={cambiarFormRegistro}
              required
              disabled={enviando}
              placeholder="0"
            />
            <Input
              label="Cantidad reservada"
              id="inventario-reservada"
              name="cantidadReservada"
              type="number"
              min="0"
              step="1"
              value={formRegistro.cantidadReservada}
              onChange={cambiarFormRegistro}
              required
              disabled={enviando}
              placeholder="0"
              hint="No puede superar a la cantidad disponible."
            />
          </form>
        </Modal>

        {/* ------------------- Modal: confirmar borrado ----------------- */}
        <Modal
          open={Boolean(registroEliminar)}
          title="Confirmar eliminación"
          onClose={cancelarEliminar}
          footer={
            <>
              <Button variant="secundario" onClick={cancelarEliminar} disabled={enviando}>
                Cancelar
              </Button>
              <Button
                variant="peligro"
                onClick={confirmarEliminar}
                disabled={enviando}
                data-foco-principal=""
              >
                {enviando ? "Eliminando..." : "Eliminar"}
              </Button>
            </>
          }
        >
          {errorFormulario && (
            <p className="inventario-formulario__alerta" role="alert">
              <CircleAlert className="icono icono--sm" aria-hidden="true" />
              <span>{errorFormulario}</span>
            </p>
          )}
          <p className="inventario__confirmacion">
            ¿Estás seguro de eliminar el registro de stock de{" "}
            <strong className="inventario__sku-inline">{registroEliminar?.sku}</strong>?
            El registro dejará de existir en el inventario.
          </p>
        </Modal>

        {/* --------------------- Modal: movimiento ---------------------- */}
        <Modal
          open={Boolean(modalMovimiento)}
          title={movimientoActual?.titulo ?? "Movimiento de stock"}
          onClose={cerrarModalMovimiento}
          footer={
            <>
              <Button variant="secundario" onClick={cerrarModalMovimiento} disabled={enviando}>
                Cancelar
              </Button>
              <Button
                type="submit"
                form="inventario-movimiento"
                variant="primario"
                disabled={enviando}
                data-foco-principal=""
              >
                {enviando ? "Aplicando..." : (movimientoActual?.etiquetaBoton ?? "Aplicar")}
              </Button>
            </>
          }
        >
          <form
            id="inventario-movimiento"
            className="inventario-formulario"
            onSubmit={aplicarMovimiento}
            aria-busy={enviando}
          >
            {errorFormulario && (
              <p className="inventario-formulario__alerta" role="alert">
                <CircleAlert className="icono icono--sm" aria-hidden="true" />
                <span>{errorFormulario}</span>
              </p>
            )}
            <p className="inventario-formulario__resumen">
              SKU <strong className="inventario__sku-inline">{modalMovimiento?.registro?.sku}</strong>
              {movimientoActual ? ` · ${movimientoActual.descripcion}` : ""}
            </p>
            <Input
              label="Cantidad"
              id="inventario-cantidad"
              name="cantidad"
              type="number"
              min="1"
              step="1"
              value={formMovimiento.cantidad}
              onChange={cambiarFormMovimiento}
              required
              disabled={enviando}
              placeholder="1"
              hint="Número entero mayor que 0."
            />
            <Input
              label="Referencia de orden (opcional)"
              id="inventario-ref-orden"
              name="refOrden"
              type="text"
              value={formMovimiento.refOrden}
              onChange={cambiarFormMovimiento}
              disabled={enviando}
              maxLength={64}
              placeholder="ORD-2026-0001"
            />
          </form>
        </Modal>
      </div>
    </div>
  );
}
