import {
  Calendar,
  Check,
  CircleAlert,
  Eye,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";
import useEnvios from "../hooks/useEnvios";
import { destinosDe, esTerminal } from "../services/estadoEnvio";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Badge from "../../../components/ui/Badge";
import "./EnviosPage.css";

const aFecha = (valor) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? "—"
    : fecha.toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });
};

/** Etiqueta visible de cada estado (clave = enum EstadoEnvio). */
const ETIQUETA_ESTADO = {
  CREADO: "Creado",
  EN_PREPARACION: "En preparación",
  DESPACHADO: "Despachado",
  EN_TRANSITO: "En tránsito",
  ENTREGADO: "Entregado",
  FALLIDO: "Fallido",
  DEVUELTO: "Devuelto",
};

/** Tono del Badge por estado (neutral / amarillo / éxito / peligro). */
const TONO_ESTADO = {
  CREADO: "neutral",
  EN_PREPARACION: "amarillo",
  DESPACHADO: "amarillo",
  EN_TRANSITO: "amarillo",
  ENTREGADO: "exito",
  FALLIDO: "peligro",
  DEVUELTO: "peligro",
};

const direccionResumida = (envio) => {
  const partes = [
    envio?.direccionCalle,
    envio?.direccionCodigoPostal,
    envio?.direccionCiudad,
    envio?.direccionPais,
  ].filter(Boolean);
  return partes.length ? partes.join(", ") : "Sin dirección registrada";
};

/**
 * Envíos (ADMINISTRADOR | LOGISTICA) — `/admin/envios`.
 *
 * Composición: cabecera `.pagina__cabecera`, barra de búsqueda/alta, lista
 * de tarjetas `.envios__lista` con Badge de estado y tres modales del kit:
 * crear, detalle (datos + historial vía seguimiento público) y cambio de
 * estado (select SOLO con los destinos válidos del estado actual).
 */
export default function EnviosPage() {
  const envios = useEnvios();
  const {
    envios: listado,
    cargando,
    enviando,
    error,
    exito,
    nota,
    consulta,
    consultaAplicada,
    setConsulta,
    buscar,
    limpiarBusqueda,
    recargar,
    modalCrear,
    formCrear,
    abrirCrear,
    cerrarCrear,
    cambiarFormCrear,
    crearEnvio,
    modalEstado,
    formEstado,
    abrirCambioEstado,
    cerrarCambioEstado,
    cambiarFormEstado,
    aplicarCambioEstado,
    modalDetalle,
    seguimiento,
    cargandoSeguimiento,
    errorSeguimiento,
    abrirDetalle,
    cerrarDetalle,
    errorFormulario,
  } = envios;

  const destinos = modalEstado ? destinosDe(modalEstado.estado) : [];
  const eventos = Array.isArray(seguimiento?.eventos) ? seguimiento.eventos : [];

  const alPulsarEnter = (evento) => {
    if (evento.key !== "Enter") return;
    evento.preventDefault();
    buscar();
  };

  return (
    <div className="pagina envios">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Envíos</h1>
            <p className="pagina__descripcion">
              Seguimiento y gestión de los envíos de Calisat: creación,
              transiciones de estado e historial de eventos por número de guía.
            </p>
          </div>
        </header>

        {/* ------------------------- Barra de acciones ------------------- */}
        <div className="envios__barra">
          <div className="envios__campo-busqueda">
            <Input
              label="Buscar por ordenId o guía"
              id="envios-busqueda"
              type="search"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              onKeyDown={alPulsarEnter}
              placeholder="CAL-9F2B41C7A0D3"
              hint="Si el valor es un UUID se consulta el backend; el resto se filtra en la lista."
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
            onClick={abrirCrear}
          >
            Crear envío
          </Button>
        </div>

        {/* --------------------- Mensajes de la página ------------------- */}
        {exito && (
          <p className="envios__mensaje envios__mensaje--exito" role="status">
            <Check className="icono icono--sm" aria-hidden="true" />
            <span>{exito}</span>
          </p>
        )}
        {error && (
          <p className="envios__mensaje envios__mensaje--error" role="alert">
            <CircleAlert className="icono icono--sm" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        {/* --------------------------- Listado --------------------------- */}
        <section
          className="envios__seccion"
          aria-labelledby="envios-listado"
          aria-busy={cargando}
        >
          <div className="envios__encabezado">
            <h2 className="envios__titulo-listado" id="envios-listado">
              Listado de envíos
              <span className="envios__contador">({listado.length})</span>
            </h2>
            {consultaAplicada && !cargando && (
              <Button variant="fantasma" size="sm" onClick={limpiarBusqueda}>
                Limpiar búsqueda
              </Button>
            )}
          </div>

          {nota && (
            <p className="envios__nota" role="status">
              {nota}
            </p>
          )}

          {cargando && listado.length === 0 ? (
            <p className="envios__estado" role="status">
              Cargando envíos...
            </p>
          ) : listado.length === 0 ? (
            <div className="envios__vacio">
              <p className="envios__estado" role="status">
                No hay envíos que mostrar.
              </p>
              <Button variant="secundario" onClick={recargar}>
                Recargar listado
              </Button>
            </div>
          ) : (
            <ul className="envios__lista">
              {listado.map((envio) => {
                const estado = String(envio?.estado ?? "SIN_ESTADO").toUpperCase();
                const final = esTerminal(estado);
                return (
                  <li
                    key={envio?.id ?? envio?.numeroGuia}
                    className="envio-ficha"
                  >
                    <div className="envio-ficha__info">
                      <div className="envio-ficha__cabecera">
                        <h3 className="envio-ficha__guia">
                          {envio?.numeroGuia || "—"}
                        </h3>
                        <Badge tone={TONO_ESTADO[estado] ?? "neutral"}>
                          {ETIQUETA_ESTADO[estado] ?? estado}
                        </Badge>
                      </div>
                      <p className="envio-ficha__dato">
                        <Truck className="icono icono--sm" aria-hidden="true" />
                        {envio?.transportista || "Sin transportista asignado"}
                      </p>
                      <p className="envio-ficha__dato">
                        <MapPin className="icono icono--sm" aria-hidden="true" />
                        {direccionResumida(envio)}
                      </p>
                      <p className="envio-ficha__dato">
                        <Calendar className="icono icono--sm" aria-hidden="true" />
                        {aFecha(envio?.fechaCreacion)}
                      </p>
                      <p className="envio-ficha__orden">
                        Orden: <span className="envio-ficha__orden-valor">{envio?.ordenId ?? "—"}</span>
                      </p>
                    </div>

                    <div className="envio-ficha__acciones">
                      <Button
                        variant="secundario"
                        size="sm"
                        icon={<Eye className="icono icono--sm" aria-hidden="true" />}
                        onClick={() => abrirDetalle(envio)}
                      >
                        Detalle
                      </Button>
                      {/* Estado terminal: el botón NO se renderiza (nada oculto con aria-hidden). */}
                      {final ? (
                        <span className="envio-ficha__final">Estado final</span>
                      ) : (
                        <Button
                          variant="primario"
                          size="sm"
                          icon={<RefreshCw className="icono icono--sm" aria-hidden="true" />}
                          onClick={() => abrirCambioEstado(envio)}
                        >
                          Cambiar estado
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ------------------------ Modal: crear ------------------------- */}
        <Modal
          open={modalCrear}
          title="Crear envío"
          onClose={cerrarCrear}
          footer={
            <>
              <Button variant="secundario" onClick={cerrarCrear} disabled={enviando}>
                Cancelar
              </Button>
              <Button
                type="submit"
                form="envio-formulario"
                variant="primario"
                disabled={enviando}
                data-foco-principal=""
              >
                {enviando ? "Creando..." : "Crear envío"}
              </Button>
            </>
          }
        >
          <form
            id="envio-formulario"
            className="envios-formulario"
            onSubmit={crearEnvio}
            aria-busy={enviando}
          >
            {errorFormulario && (
              <p className="envios-formulario__alerta" role="alert">
                <CircleAlert className="icono icono--sm" aria-hidden="true" />
                <span>{errorFormulario}</span>
              </p>
            )}
            <Input
              label="UUID de la orden"
              id="envio-orden"
              name="ordenId"
              type="text"
              value={formCrear.ordenId}
              onChange={cambiarFormCrear}
              required
              disabled={enviando}
              placeholder="3f1a8c0e-1f2b-4c3d-9e8f-0a1b2c3d4e5f"
              hint="Formato 8-4-4-4-12. Una orden solo puede tener un envío."
            />
            <Input
              label="Transportista"
              id="envio-transportista"
              name="transportista"
              type="text"
              value={formCrear.transportista}
              onChange={cambiarFormCrear}
              disabled={enviando}
              maxLength={120}
              placeholder="SEUR"
              hint="Opcional hasta el despacho."
            />
            <Input
              label="Calle"
              id="envio-calle"
              name="direccionCalle"
              type="text"
              value={formCrear.direccionCalle}
              onChange={cambiarFormCrear}
              required
              disabled={enviando}
              maxLength={200}
              placeholder="Calle Mayor 1"
            />
            <Input
              label="Ciudad"
              id="envio-ciudad"
              name="direccionCiudad"
              type="text"
              value={formCrear.direccionCiudad}
              onChange={cambiarFormCrear}
              required
              disabled={enviando}
              maxLength={120}
              placeholder="Madrid"
            />
            <Input
              label="País"
              id="envio-pais"
              name="direccionPais"
              type="text"
              value={formCrear.direccionPais}
              onChange={cambiarFormCrear}
              required
              disabled={enviando}
              maxLength={64}
              placeholder="España"
            />
            <Input
              label="Código postal"
              id="envio-cp"
              name="direccionCodigoPostal"
              type="text"
              value={formCrear.direccionCodigoPostal}
              onChange={cambiarFormCrear}
              required
              disabled={enviando}
              maxLength={16}
              placeholder="28001"
            />
          </form>
        </Modal>

        {/* ------------------- Modal: cambio de estado ------------------- */}
        <Modal
          open={Boolean(modalEstado)}
          title="Cambiar estado del envío"
          onClose={cerrarCambioEstado}
          footer={
            <>
              <Button variant="secundario" onClick={cerrarCambioEstado} disabled={enviando}>
                Cancelar
              </Button>
              <Button
                type="submit"
                form="envio-estado"
                variant="primario"
                disabled={enviando}
                data-foco-principal=""
              >
                {enviando ? "Guardando..." : "Guardar estado"}
              </Button>
            </>
          }
        >
          <form
            id="envio-estado"
            className="envios-formulario"
            onSubmit={aplicarCambioEstado}
            aria-busy={enviando}
          >
            {errorFormulario && (
              <p className="envios-formulario__alerta" role="alert">
                <CircleAlert className="icono icono--sm" aria-hidden="true" />
                <span>{errorFormulario}</span>
              </p>
            )}
            <p className="envios-formulario__resumen">
              Guía <strong className="envios__guia-inline">{modalEstado?.numeroGuia}</strong>
              {` · Estado actual: ${ETIQUETA_ESTADO[String(modalEstado?.estado ?? "").toUpperCase()] ?? modalEstado?.estado ?? "—"}`}
            </p>
            <div className="campo">
              <label className="campo__label" htmlFor="envio-estado-select">
                Nuevo estado
              </label>
              <select
                id="envio-estado-select"
                className="campo__control"
                name="estado"
                value={formEstado.estado}
                onChange={cambiarFormEstado}
                disabled={enviando}
              >
                {destinos.map((destino) => (
                  <option key={destino} value={destino}>
                    {ETIQUETA_ESTADO[destino] ?? destino}
                  </option>
                ))}
              </select>
              <p className="campo__ayuda">
                Solo se muestran las transiciones permitidas desde el estado actual.
              </p>
            </div>
            <Input
              label="Descripción (opcional)"
              id="envio-descripcion"
              name="descripcion"
              type="text"
              value={formEstado.descripcion}
              onChange={cambiarFormEstado}
              disabled={enviando}
              maxLength={500}
              placeholder="En reparto con el transportista"
            />
            <Input
              label="Ubicación (opcional)"
              id="envio-ubicacion"
              name="ubicacion"
              type="text"
              value={formEstado.ubicacion}
              onChange={cambiarFormEstado}
              disabled={enviando}
              maxLength={200}
              placeholder="Centro logístico Madrid"
            />
          </form>
        </Modal>

        {/* ------------------------ Modal: detalle ----------------------- */}
        <Modal
          open={Boolean(modalDetalle)}
          title="Detalle del envío"
          onClose={cerrarDetalle}
          className="envios-detalle"
          footer={
            <Button variant="secundario" onClick={cerrarDetalle}>
              Cerrar
            </Button>
          }
        >
          <div className="envio-detalle">
            <h3 className="envio-detalle__subtitulo">Datos del envío</h3>
            <dl className="envio-detalle__datos">
              <div className="envio-detalle__dato">
                <dt>Número de guía</dt>
                <dd className="envio-detalle__guia">{modalDetalle?.numeroGuia ?? "—"}</dd>
              </div>
              <div className="envio-detalle__dato">
                <dt>Estado</dt>
                <dd>
                  <Badge
                    tone={
                      TONO_ESTADO[String(modalDetalle?.estado ?? "").toUpperCase()] ??
                      "neutral"
                    }
                  >
                    {ETIQUETA_ESTADO[String(modalDetalle?.estado ?? "").toUpperCase()] ??
                      modalDetalle?.estado ??
                      "—"}
                  </Badge>
                </dd>
              </div>
              <div className="envio-detalle__dato">
                <dt>Orden</dt>
                <dd className="envio-detalle__guia">{modalDetalle?.ordenId ?? "—"}</dd>
              </div>
              <div className="envio-detalle__dato">
                <dt>Transportista</dt>
                <dd>{modalDetalle?.transportista || "Sin transportista asignado"}</dd>
              </div>
              <div className="envio-detalle__dato">
                <dt>Dirección</dt>
                <dd>{direccionResumida(modalDetalle)}</dd>
              </div>
              <div className="envio-detalle__dato">
                <dt>Creado</dt>
                <dd>{aFecha(modalDetalle?.fechaCreacion)}</dd>
              </div>
              <div className="envio-detalle__dato">
                <dt>Despachado</dt>
                <dd>{aFecha(modalDetalle?.fechaDespacho)}</dd>
              </div>
              <div className="envio-detalle__dato">
                <dt>Entrega estimada</dt>
                <dd>{aFecha(modalDetalle?.fechaEntregaEstimada)}</dd>
              </div>
              <div className="envio-detalle__dato">
                <dt>Entrega real</dt>
                <dd>{aFecha(modalDetalle?.fechaEntregaReal)}</dd>
              </div>
            </dl>

            <h3 className="envio-detalle__subtitulo">Historial de eventos</h3>
            {cargandoSeguimiento ? (
              <p className="envio-detalle__estado" role="status">
                Cargando historial del envío...
              </p>
            ) : errorSeguimiento ? (
              <p className="envio-detalle__estado envio-detalle__estado--error" role="alert">
                {errorSeguimiento}
              </p>
            ) : eventos.length === 0 ? (
              <p className="envio-detalle__estado" role="status">
                Todavía no hay eventos registrados para este envío.
              </p>
            ) : (
              <ol className="envio-detalle__timeline">
                {eventos.map((evento, indice) => {
                  const estado = String(evento?.estado ?? "").toUpperCase();
                  const clave = evento?.id ?? `${estado}-${evento?.fechaEvento ?? indice}`;
                  return (
                    <li className="envio-evento" key={clave}>
                      <span
                        className="envio-evento__marca"
                        aria-hidden="true"
                      />
                      <div className="envio-evento__contenido">
                        <div className="envio-evento__cabecera">
                          <Badge tone={TONO_ESTADO[estado] ?? "neutral"}>
                            {ETIQUETA_ESTADO[estado] ?? evento?.estado ?? "—"}
                          </Badge>
                          <span className="envio-evento__fecha">
                            <Calendar className="icono icono--sm" aria-hidden="true" />
                            {aFecha(evento?.fechaEvento)}
                          </span>
                        </div>
                        {evento?.descripcion && (
                          <p className="envio-evento__texto">{evento.descripcion}</p>
                        )}
                        {evento?.ubicacion && (
                          <p className="envio-evento__ubicacion">
                            <MapPin className="icono icono--sm" aria-hidden="true" />
                            {evento.ubicacion}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
