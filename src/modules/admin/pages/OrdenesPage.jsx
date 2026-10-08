import { Check, CircleAlert, Eye, RefreshCw, Search, XCircle } from "lucide-react";
import useOrdenesAdmin from "../hooks/useOrdenesAdmin";
import {
  ETIQUETA_ORDEN,
  TONO_ORDEN,
  destinosDe,
  esTerminal,
} from "../services/estadoOrden";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import Badge from "../../../components/ui/Badge";
import { formatoCLP } from "../../../utils/formatoCLP";
import "./OrdenesPage.css";

const aFecha = (valor) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? "—"
    : fecha.toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });
};

const idCorto = (id) => String(id ?? "").slice(0, 8);

/**
 * Órdenes (solo ADMINISTRADOR) — `/admin/ordenes`.
 *
 * Listado global paginado de `ms-orden`, detalle con líneas y dirección,
 * cambio de estado SOLO con los destinos de `estadoOrden.js` y cancelación.
 */
export default function OrdenesPage() {
  const o = useOrdenesAdmin();
  const enPrimeraPagina = o.pagina === 0;
  const enUltimaPagina = o.pagina >= o.totalPaginas - 1;
  const destinos = o.modalEstado ? destinosDe(o.modalEstado.estado) : [];

  const buscarEnter = (evento) => {
    if (evento.key !== "Enter") return;
    evento.preventDefault();
    o.buscar();
  };

  return (
    <div className="pagina ordenes">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Órdenes</h1>
            <p className="pagina__descripcion">
              Listado global de pedidos: estado, cliente y total. El cambio de
              estado sigue la máquina de estados del backend (una transición
              ilegal responde 409).
            </p>
          </div>
          <div className="pagina__acciones">
            <Button
              variant="secundario"
              icon={<RefreshCw className="icono icono--sm" aria-hidden="true" />}
              onClick={() => o.irAPagina(o.pagina)}
              disabled={o.cargando}
            >
              Recargar
            </Button>
          </div>
        </header>

        <div className="ordenes__barra">
          <Input
            label="Buscar orden"
            id="ordenes-busqueda"
            type="search"
            value={o.consulta}
            onChange={(e) => o.setConsulta(e.target.value)}
            onKeyDown={buscarEnter}
            placeholder="Estado, ciudad o usuario"
            hint="Filtra en la página actual: id, usuario, estado o ciudad."
          />
          <Button
            variant="secundario"
            icon={<Search className="icono icono--sm" aria-hidden="true" />}
            onClick={o.buscar}
            disabled={o.cargando}
          >
            Buscar
          </Button>
          <Button variant="secundario" onClick={o.limpiarBusqueda} disabled={o.cargando}>
            Limpiar
          </Button>
        </div>

        {o.exito && (
          <p className="ordenes__mensaje ordenes__mensaje--exito" role="status">
            <Check className="icono icono--sm" aria-hidden="true" />
            <span>{o.exito}</span>
          </p>
        )}
        {o.error && (
          <p className="ordenes__mensaje ordenes__mensaje--error" role="alert">
            <CircleAlert className="icono icono--sm" aria-hidden="true" />
            <span>{o.error}</span>
          </p>
        )}

        <section className="ordenes__seccion" aria-busy={o.cargando}>
          {o.cargando && o.ordenes.length === 0 ? (
            <p className="ordenes__estado" role="status">Cargando órdenes…</p>
          ) : o.ordenes.length === 0 ? (
            <div className="ordenes__vacio">
              <p className="ordenes__estado" role="status">
                No hay órdenes que mostrar.
              </p>
            </div>
          ) : (
            <>
              <div className="ordenes__tabla-envoltorio">
                <table className="ordenes__tabla" aria-label="Listado de órdenes">
                  <thead>
                    <tr>
                      <th scope="col">Orden</th>
                      <th scope="col">Creada</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Cliente</th>
                      <th scope="col">Ciudad</th>
                      <th scope="col" className="ordenes__celda--numerica">Total</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {o.ordenes.map((orden) => (
                      <tr key={orden.id}>
                        <th scope="row">{idCorto(orden.id)}</th>
                        <td className="ordenes__fecha">{aFecha(orden.fechaCreacion)}</td>
                        <td>
                          <Badge tone={TONO_ORDEN[orden.estado] ?? "neutral"}>
                            {ETIQUETA_ORDEN[orden.estado] ?? orden.estado}
                          </Badge>
                        </td>
                        <td className="ordenes__cliente">{orden.usuarioSub}</td>
                        <td>{orden.direccionCiudad || "—"}</td>
                        <td className="ordenes__celda--numerica">
                          {formatoCLP(orden.total)}
                        </td>
                        <td>
                          <div className="ordenes__acciones">
                            <Button
                              variant="secundario"
                              size="sm"
                              icon={<Eye className="icono icono--sm" aria-hidden="true" />}
                              onClick={() => o.abrirDetalle(orden)}
                              aria-label={`Ver la orden ${idCorto(orden.id)}`}
                            >
                              Ver
                            </Button>
                            <Button
                              variant="secundario"
                              size="sm"
                              onClick={() => o.abrirEstado(orden)}
                              aria-label={`Cambiar el estado de la orden ${idCorto(orden.id)}`}
                              disabled={esTerminal(orden.estado)}
                            >
                              Estado
                            </Button>
                            <Button
                              variant="peligro"
                              size="sm"
                              icon={<XCircle className="icono icono--sm" aria-hidden="true" />}
                              onClick={() => o.cancelar(orden)}
                              aria-label={`Cancelar la orden ${idCorto(orden.id)}`}
                              disabled={o.enviando || esTerminal(orden.estado)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <nav className="ordenes__paginacion" aria-label="Paginación de órdenes">
                <Button
                  variant="secundario"
                  size="sm"
                  onClick={() => o.irAPagina(o.pagina - 1)}
                  disabled={enPrimeraPagina || o.cargando}
                >
                  Anterior
                </Button>
                <p className="ordenes__paginacion-texto">
                  {`Página ${o.pagina + 1} de ${o.totalPaginas} · ${o.totalElementos} órdenes`}
                </p>
                <Button
                  variant="secundario"
                  size="sm"
                  onClick={() => o.irAPagina(o.pagina + 1)}
                  disabled={enUltimaPagina || o.cargando}
                >
                  Siguiente
                </Button>
              </nav>
            </>
          )}
        </section>
      </div>

      {/* ------------------------- Modal: detalle ----------------------- */}
      <Modal
        open={Boolean(o.modalDetalle)}
        title={`Orden ${idCorto(o.modalDetalle?.id)}`}
        onClose={o.cerrarDetalle}
        footer={
          <Button variant="secundario" onClick={o.cerrarDetalle}>
            Cerrar
          </Button>
        }
      >
        {o.modalDetalle && (
          <div className="ordenes__detalle">
            <p>
              Estado:{" "}
              <Badge tone={TONO_ORDEN[o.modalDetalle.estado] ?? "neutral"}>
                {ETIQUETA_ORDEN[o.modalDetalle.estado] ?? o.modalDetalle.estado}
              </Badge>
            </p>
            <p className="ordenes__direccion">
              {o.modalDetalle.direccionCalle || "Sin calle"},{" "}
              {o.modalDetalle.direccionCiudad || "—"},{" "}
              {o.modalDetalle.direccionCodigoPostal || "—"} ·{" "}
              {o.modalDetalle.direccionPais || "—"}
            </p>
            <ul className="ordenes__lineas">
              {(o.modalDetalle.items ?? []).map((linea) => (
                <li key={linea.id ?? linea.sku}>
                  {linea.nombreProducto || linea.sku} × {linea.cantidad}
                  <span>{formatoCLP(linea.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="ordenes__totales">
              <span>Subtotal {formatoCLP(o.modalDetalle.subtotal)} · Envío{" "}
                {formatoCLP(o.modalDetalle.costoEnvio ?? 0)}</span>
              <strong>{formatoCLP(o.modalDetalle.total)}</strong>
            </div>
          </div>
        )}
      </Modal>

      {/* ------------------------ Modal: estado ------------------------- */}
      <Modal
        open={Boolean(o.modalEstado)}
        title="Cambiar estado de la orden"
        onClose={o.cerrarEstado}
        footer={
          <>
            <Button variant="secundario" onClick={o.cerrarEstado} disabled={o.enviando}>
              Cancelar
            </Button>
            <Button onClick={o.aplicarEstado} disabled={o.enviando || !o.nuevoEstado}>
              {o.enviando ? "Aplicando…" : "Aplicar"}
            </Button>
          </>
        }
      >
        <div className="ordenes__formulario">
          <label className="campo__label" htmlFor="ordenes-estado">
            Estado destino
          </label>
          <select
            id="ordenes-estado"
            className="campo__control"
            value={o.nuevoEstado}
            onChange={(e) => o.setNuevoEstado(e.target.value)}
            disabled={o.enviando}
          >
            {destinos.map((destino) => (
              <option key={destino} value={destino}>
                {ETIQUETA_ORDEN[destino] ?? destino}
              </option>
            ))}
          </select>
          {o.errorFormulario && (
            <p className="ordenes__mensaje ordenes__mensaje--error" role="alert">
              <CircleAlert className="icono icono--sm" aria-hidden="true" />
              <span>{o.errorFormulario}</span>
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
