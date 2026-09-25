import { Check, CircleAlert, Clock, Eye, Mail, RefreshCw } from "lucide-react";
import useNotificaciones from "../hooks/useNotificaciones";
import { ESTADOS_NOTIFICACION, esReintentable } from "../services/estadoNotificacion";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Badge from "../../../components/ui/Badge";
import "./NotificacionesPage.css";

const aFecha = (valor) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? "—"
    : fecha.toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });
};

/** Etiqueta visible de cada estado (clave = enum EstadoNotificacion). */
const ETIQUETA_ESTADO = {
  PENDIENTE: "Pendiente",
  ENVIANDO: "Enviando",
  ENVIADO: "Enviado",
  REINTENTO: "Reintento",
  FALLIDO: "Fallido",
  CANCELADO: "Cancelado",
  OMITIDO: "Omitido",
};

/** Tono del Badge por estado (neutral / amarillo / éxito / peligro). */
const TONO_ESTADO = {
  PENDIENTE: "neutral",
  ENVIANDO: "amarillo",
  ENVIADO: "exito",
  REINTENTO: "amarillo",
  FALLIDO: "peligro",
  CANCELADO: "neutral",
  OMITIDO: "neutral",
};

const destinatarioDe = (notificacion) =>
  notificacion?.destinatarioNombre || notificacion?.destinatarioEmail || "Sin destinatario";

/**
 * Notificaciones (solo ADMINISTRADOR) — `/admin/notificaciones`.
 *
 * Composición: cabecera `.pagina__cabecera`, filtro por estado (select),
 * listado de tarjetas `.notificaciones__lista` con Badge de estado, paginación
 * simple y dos modales del kit: detalle (mensaje + traza de intentos) y
 * confirmación del reintento.
 */
export default function NotificacionesPage() {
  const notificaciones = useNotificaciones();
  const {
    notificaciones: listado,
    pagina,
    totalPaginas,
    totalElementos,
    filtroEstado,
    cambiarFiltro,
    irAPagina,
    recargar,
    cargando,
    enviando,
    error,
    exito,
    modalDetalle,
    detalle,
    cargandoDetalle,
    errorDetalle,
    abrirDetalle,
    cerrarDetalle,
    reintentoPendiente,
    errorFormulario,
    pedirReintento,
    cancelarReintento,
    confirmarReintento,
  } = notificaciones;

  const intentos = Array.isArray(detalle?.intentosEnvio)
    ? detalle.intentosEnvio
    : [];
  const enPrimeraPagina = pagina === 0;
  const enUltimaPagina = pagina >= totalPaginas - 1;

  return (
    <div className="pagina notificaciones">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Notificaciones</h1>
            <p className="pagina__descripcion">
              Historial de notificaciones del sistema: estado de envío, traza
              de intentos y reintentos manuales.
            </p>
          </div>
        </header>

        {/* ------------------------- Filtro de estado -------------------- */}
        <div className="notificaciones__barra">
          <div className="campo notificaciones__filtro">
            <label className="campo__label" htmlFor="notificaciones-estado">
              Filtrar por estado
            </label>
            <select
              id="notificaciones-estado"
              className="campo__control"
              value={filtroEstado}
              onChange={(e) => cambiarFiltro(e.target.value)}
              disabled={cargando}
            >
              <option value="">Todos</option>
              {ESTADOS_NOTIFICACION.map((estado) => (
                <option key={estado} value={estado}>
                  {ETIQUETA_ESTADO[estado] ?? estado}
                </option>
              ))}
            </select>
          </div>
          <Button variant="secundario" onClick={recargar} disabled={cargando}>
            Recargar
          </Button>
        </div>

        {/* --------------------- Mensajes de la página ------------------- */}
        {exito && (
          <p
            className="notificaciones__mensaje notificaciones__mensaje--exito"
            role="status"
          >
            <Check className="icono icono--sm" aria-hidden="true" />
            <span>{exito}</span>
          </p>
        )}
        {error && (
          <p
            className="notificaciones__mensaje notificaciones__mensaje--error"
            role="alert"
          >
            <CircleAlert className="icono icono--sm" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        {/* --------------------------- Listado --------------------------- */}
        <section
          className="notificaciones__seccion"
          aria-labelledby="notificaciones-listado"
          aria-busy={cargando}
        >
          <div className="notificaciones__encabezado">
            <h2
              className="notificaciones__titulo-listado"
              id="notificaciones-listado"
            >
              Listado de notificaciones
              <span className="notificaciones__contador">({totalElementos})</span>
            </h2>
          </div>

          {cargando && listado.length === 0 ? (
            <p className="notificaciones__estado" role="status">
              Cargando notificaciones...
            </p>
          ) : listado.length === 0 ? (
            <div className="notificaciones__vacio">
              <p className="notificaciones__estado" role="status">
                No hay notificaciones que mostrar con este filtro.
              </p>
              <Button variant="secundario" onClick={recargar}>
                Recargar listado
              </Button>
            </div>
          ) : (
            <>
              <ul className="notificaciones__lista">
                {listado.map((notificacion) => {
                  const estado = String(notificacion?.estado ?? "").toUpperCase();
                  const reintentable = esReintentable(estado);
                  const intentosActuales = Number(notificacion?.intentos) || 0;
                  const maximoIntentos = Number(notificacion?.maxIntentos) || 0;
                  return (
                    <li key={notificacion.id} className="notificacion-ficha">
                      <div className="notificacion-ficha__info">
                        <div className="notificacion-ficha__cabecera">
                          <h3 className="notificacion-ficha__asunto">
                            {notificacion?.asunto || "Sin asunto"}
                          </h3>
                          <Badge tone={TONO_ESTADO[estado] ?? "neutral"}>
                            {ETIQUETA_ESTADO[estado] ?? notificacion?.estado ?? "—"}
                          </Badge>
                        </div>
                        <p className="notificacion-ficha__destinatario">
                          <Mail className="icono icono--sm" aria-hidden="true" />
                          {destinatarioDe(notificacion)}
                        </p>
                        <div className="notificacion-ficha__meta">
                          <Badge tone="neutral">{notificacion?.canal ?? "—"}</Badge>
                          <Badge tone="neutral">{notificacion?.tipo ?? "—"}</Badge>
                          <span className="notificacion-ficha__texto">
                            Intentos {intentosActuales}/{maximoIntentos || "—"}
                          </span>
                          <span className="notificacion-ficha__texto">
                            <Clock className="icono icono--sm" aria-hidden="true" />
                            {aFecha(notificacion?.fechaCreacion)}
                          </span>
                        </div>
                      </div>

                      <div className="notificacion-ficha__acciones">
                        <Button
                          variant="secundario"
                          size="sm"
                          icon={<Eye className="icono icono--sm" aria-hidden="true" />}
                          onClick={() => abrirDetalle(notificacion)}
                        >
                          Detalle
                        </Button>
                        {/* Solo si el enum lo permite; en caso contrario el botón no se renderiza. */}
                        {reintentable && (
                          <Button
                            variant="primario"
                            size="sm"
                            icon={<RefreshCw className="icono icono--sm" aria-hidden="true" />}
                            onClick={() => pedirReintento(notificacion)}
                          >
                            Reintentar
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <nav
                className="notificaciones__paginacion"
                aria-label="Paginación de notificaciones"
              >
                <Button
                  variant="secundario"
                  size="sm"
                  onClick={() => irAPagina(pagina - 1)}
                  disabled={enPrimeraPagina || cargando}
                >
                  Anterior
                </Button>
                <p className="notificaciones__paginacion-texto">
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

        {/* ------------------------ Modal: detalle ----------------------- */}
        <Modal
          open={Boolean(modalDetalle)}
          title="Detalle de la notificación"
          onClose={cerrarDetalle}
          className="notificaciones-detalle"
          footer={
            <Button variant="secundario" onClick={cerrarDetalle}>
              Cerrar
            </Button>
          }
        >
          <div className="notificacion-detalle">
            <h3 className="notificacion-detalle__subtitulo">Mensaje</h3>
            <dl className="notificacion-detalle__datos">
              <div className="notificacion-detalle__dato">
                <dt>Asunto</dt>
                <dd>{detalle?.asunto || modalDetalle?.asunto || "Sin asunto"}</dd>
              </div>
              <div className="notificacion-detalle__dato">
                <dt>Destinatario</dt>
                <dd>{destinatarioDe(detalle ?? modalDetalle)}</dd>
              </div>
              <div className="notificacion-detalle__dato">
                <dt>Canal</dt>
                <dd>{detalle?.canal ?? modalDetalle?.canal ?? "—"}</dd>
              </div>
              <div className="notificacion-detalle__dato">
                <dt>Tipo</dt>
                <dd>{detalle?.tipo ?? modalDetalle?.tipo ?? "—"}</dd>
              </div>
              <div className="notificacion-detalle__dato">
                <dt>Estado</dt>
                <dd>
                  <Badge
                    tone={
                      TONO_ESTADO[String(detalle?.estado ?? modalDetalle?.estado ?? "").toUpperCase()] ??
                      "neutral"
                    }
                  >
                    {ETIQUETA_ESTADO[
                      String(detalle?.estado ?? modalDetalle?.estado ?? "").toUpperCase()
                    ] ??
                      detalle?.estado ??
                      modalDetalle?.estado ??
                      "—"}
                  </Badge>
                </dd>
              </div>
              <div className="notificacion-detalle__dato">
                <dt>Intentos</dt>
                <dd>
                  {`${detalle?.intentos ?? modalDetalle?.intentos ?? 0} / ${
                    detalle?.maxIntentos ?? modalDetalle?.maxIntentos ?? "—"
                  }`}
                </dd>
              </div>
              <div className="notificacion-detalle__dato">
                <dt>Origen</dt>
                <dd>{detalle?.origenMs ?? "—"}</dd>
              </div>
              <div className="notificacion-detalle__dato">
                <dt>Correlación</dt>
                <dd className="notificacion-detalle__mono">
                  {detalle?.correlacionId ?? "—"}
                </dd>
              </div>
              <div className="notificacion-detalle__dato">
                <dt>Creada</dt>
                <dd>{aFecha(detalle?.fechaCreacion ?? modalDetalle?.fechaCreacion)}</dd>
              </div>
              <div className="notificacion-detalle__dato">
                <dt>Próximo intento</dt>
                <dd>{aFecha(detalle?.proximoIntentoAt)}</dd>
              </div>
            </dl>

            {(detalle?.cuerpoTexto || modalDetalle?.cuerpoTexto) && (
              <>
                <h3 className="notificacion-detalle__subtitulo">Cuerpo</h3>
                <p className="notificacion-detalle__cuerpo">
                  {detalle?.cuerpoTexto ?? modalDetalle?.cuerpoTexto}
                </p>
              </>
            )}

            <h3
              className="notificacion-detalle__subtitulo"
              id="notificacion-intentos"
            >
              Traza de intentos
            </h3>
            {cargandoDetalle ? (
              <p className="notificacion-detalle__estado" role="status">
                Cargando detalle de la notificación...
              </p>
            ) : errorDetalle ? (
              <p
                className="notificacion-detalle__estado notificacion-detalle__estado--error"
                role="alert"
              >
                {errorDetalle}
              </p>
            ) : intentos.length === 0 ? (
              <p className="notificacion-detalle__estado" role="status">
                Todavía no hay intentos de envío registrados.
              </p>
            ) : (
              <div
                className="notificacion-detalle__tabla-zona"
                role="region"
                aria-label="Traza de intentos de envío"
                tabIndex={0}
              >
                {/* aria-labelledby: nombre accesible de la tabla, tomado del
                    <h3> precedente (la región de scroll ya lleva el suyo). */}
                <table
                  className="notificacion-detalle__tabla"
                  aria-labelledby="notificacion-intentos"
                >
                  <thead>
                    <tr>
                      <th scope="col">N.º</th>
                      <th scope="col">Fecha</th>
                      <th scope="col">Proveedor</th>
                      <th scope="col">HTTP</th>
                      <th scope="col">Resultado</th>
                      <th scope="col">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intentos.map((intento, indice) => (
                      <tr key={intento.id ?? indice}>
                        <th scope="row">{intento.numeroIntento ?? indice + 1}</th>
                        <td>{aFecha(intento.fechaIntento)}</td>
                        <td>{intento.proveedor ?? "—"}</td>
                        <td>{intento.httpStatus ?? "—"}</td>
                        <td>
                          <Badge tone={intento.exito ? "exito" : "peligro"}>
                            {intento.exito ? "Exitoso" : "Fallido"}
                          </Badge>
                        </td>
                        <td className="notificacion-detalle__error-celda">
                          {intento.error ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>

        {/* ------------------- Modal: confirmar reintento ---------------- */}
        <Modal
          open={Boolean(reintentoPendiente)}
          title="Confirmar reintento"
          onClose={cancelarReintento}
          footer={
            <>
              <Button variant="secundario" onClick={cancelarReintento} disabled={enviando}>
                Cancelar
              </Button>
              <Button
                type="submit"
                form="notificacion-reintento"
                variant="primario"
                disabled={enviando}
                data-foco-principal=""
              >
                {enviando ? "Reintentando..." : "Confirmar reintento"}
              </Button>
            </>
          }
        >
          <form
            id="notificacion-reintento"
            className="notificaciones-formulario"
            onSubmit={confirmarReintento}
            aria-busy={enviando}
          >
            {errorFormulario && (
              <p className="notificaciones-formulario__alerta" role="alert">
                <CircleAlert className="icono icono--sm" aria-hidden="true" />
                <span>{errorFormulario}</span>
              </p>
            )}
            <p className="notificaciones-formulario__mensaje">
              ¿Quieres reintentar el envío de{" "}
              <strong className="notificaciones__asunto-inline">
                {reintentoPendiente?.asunto || "esta notificación"}
              </strong>{" "}
              a {destinatarioDe(reintentoPendiente)}? Volverá al estado
              PENDIENTE y se enviará de nuevo.
            </p>
          </form>
        </Modal>
      </div>
    </div>
  );
}
