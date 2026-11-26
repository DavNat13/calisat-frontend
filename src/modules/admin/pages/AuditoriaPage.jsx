import { CircleAlert, Clock, Mail, RefreshCw, ScrollText } from "lucide-react";
import useAuditoria from "../hooks/useAuditoria";
import {
  ETIQUETA_RESULTADO,
  ETIQUETA_TIPO,
  RESULTADOS_AUDITORIA,
  TIPOS_AUDITORIA,
  TONO_RESULTADO,
} from "../services/estadoAuditoria";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import "./AuditoriaPage.css";

const aFecha = (valor) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? "—"
    : fecha.toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });
};

/**
 * Auditoría (solo ADMINISTRADOR) — `/admin/auditoria`.
 *
 * Historial de los eventos de usuario/orden/envío procesados por la cola
 * interna auditoria.queue: cada ficha muestra el resultado del correo
 * automatizado (enviado / fallido / sin destinatario / evento desconocido).
 * Composición: cabecera `.pagina__cabecera`, filtros por tipo y resultado
 * (selects), listado de tarjetas `.auditoria__lista` con Badge de resultado
 * y paginación simple (patrón de NotificacionesPage, sin modales).
 */
export default function AuditoriaPage() {
  const {
    eventos: listado,
    pagina,
    totalPaginas,
    totalElementos,
    filtroTipo,
    filtroResultado,
    cambiarFiltroTipo,
    cambiarFiltroResultado,
    irAPagina,
    recargar,
    cargando,
    error,
  } = useAuditoria();

  const enPrimeraPagina = pagina === 0;
  const enUltimaPagina = pagina >= totalPaginas - 1;

  return (
    <div className="pagina auditoria">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Auditoría</h1>
            <p className="pagina__descripcion">
              Eventos de usuarios y órdenes procesados por la cola
              interna de auditoría, con el resultado del correo automatizado
              asociado a cada uno.
            </p>
          </div>
        </header>

        {/* ------------------------- Filtros ---------------------------- */}
        <div className="auditoria__barra">
          <div className="campo auditoria__filtro">
            <label className="campo__label" htmlFor="auditoria-tipo">
              Filtrar por tipo
            </label>
            <select
              id="auditoria-tipo"
              className="campo__control"
              value={filtroTipo}
              onChange={(e) => cambiarFiltroTipo(e.target.value)}
              disabled={cargando}
            >
              <option value="">Todos</option>
              {TIPOS_AUDITORIA.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {ETIQUETA_TIPO[tipo] ?? tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="campo auditoria__filtro">
            <label className="campo__label" htmlFor="auditoria-resultado">
              Filtrar por resultado del correo
            </label>
            <select
              id="auditoria-resultado"
              className="campo__control"
              value={filtroResultado}
              onChange={(e) => cambiarFiltroResultado(e.target.value)}
              disabled={cargando}
            >
              <option value="">Todos</option>
              {RESULTADOS_AUDITORIA.map((resultado) => (
                <option key={resultado} value={resultado}>
                  {ETIQUETA_RESULTADO[resultado] ?? resultado}
                </option>
              ))}
            </select>
          </div>

          <Button variant="secundario" onClick={recargar} disabled={cargando}>
            <RefreshCw className="icono icono--sm" aria-hidden="true" />
            Recargar
          </Button>
        </div>

        {/* --------------------- Mensajes de la página ------------------- */}
        {error && (
          <p className="auditoria__mensaje auditoria__mensaje--error" role="alert">
            <CircleAlert className="icono icono--sm" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        {/* --------------------------- Listado --------------------------- */}
        <section
          className="auditoria__seccion"
          aria-labelledby="auditoria-listado"
          aria-busy={cargando}
        >
          <div className="auditoria__encabezado">
            <h2 className="auditoria__titulo-listado" id="auditoria-listado">
              Historial de auditoría
              <span className="auditoria__contador">({totalElementos})</span>
            </h2>
          </div>

          {cargando && listado.length === 0 ? (
            <p className="auditoria__estado" role="status">
              Cargando auditoría...
            </p>
          ) : listado.length === 0 ? (
            <div className="auditoria__vacio">
              <p className="auditoria__estado" role="status">
                No hay eventos de auditoría con este filtro.
              </p>
              <Button variant="secundario" onClick={recargar}>
                Recargar listado
              </Button>
            </div>
          ) : (
            <>
              <ul className="auditoria__lista">
                {listado.map((evento) => {
                  const resultado = String(evento?.resultadoCorreo ?? "")
                    .toUpperCase();
                  const tipo = String(evento?.tipo ?? "").toUpperCase();
                  return (
                    <li key={evento.id} className="auditoria-ficha">
                      <div className="auditoria-ficha__info">
                        <div className="auditoria-ficha__cabecera">
                          <h3 className="auditoria-ficha__evento">
                            {evento?.evento || "Sin evento"}
                          </h3>
                          <Badge tone="neutral">
                            {ETIQUETA_TIPO[tipo] ?? evento?.tipo ?? "—"}
                          </Badge>
                          <Badge tone={TONO_RESULTADO[resultado] ?? "neutral"}>
                            {ETIQUETA_RESULTADO[resultado] ??
                              evento?.resultadoCorreo ??
                              "—"}
                          </Badge>
                        </div>
                        <p className="auditoria-ficha__referencia">
                          <ScrollText className="icono icono--sm" aria-hidden="true" />
                          {evento?.referenciaId || "Sin referencia"}
                        </p>
                        <div className="auditoria-ficha__meta">
                          {evento?.destinatarioEmail && (
                            <span className="auditoria-ficha__texto">
                              <Mail className="icono icono--sm" aria-hidden="true" />
                              {evento.destinatarioEmail}
                            </span>
                          )}
                          <span className="auditoria-ficha__texto">
                            <Clock className="icono icono--sm" aria-hidden="true" />
                            {aFecha(evento?.fechaEvento)}
                          </span>
                        </div>
                        {evento?.detalle && (
                          <p className="auditoria-ficha__detalle">
                            {evento.detalle}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <nav
                className="auditoria__paginacion"
                aria-label="Paginación de auditoría"
              >
                <Button
                  variant="secundario"
                  size="sm"
                  onClick={() => irAPagina(pagina - 1)}
                  disabled={enPrimeraPagina || cargando}
                >
                  Anterior
                </Button>
                <p className="auditoria__paginacion-texto">
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
      </div>
    </div>
  );
}
