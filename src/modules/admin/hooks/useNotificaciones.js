import { useEffect, useRef, useState } from "react";
import useNotificacionService, {
  TAMANO_PAGINA_NOTIFICACIONES,
} from "../services/notificacionService";
import { mensajeParaUsuario, registrarFallo } from "../../../utils/errores";

/**
 * Estado y acciones de la pantalla de Notificaciones (ADMINISTRADOR).
 *
 * - Listado paginado `GET /api/v1/notificaciones` con filtro opcional
 *   `?estado=` (valores EXACTOS del enum EstadoNotificacion).
 * - Detalle `GET /api/v1/notificaciones/{id}` con la traza de intentos.
 * - Reintento `POST /api/v1/notificaciones/{id}/reintentar` (FALLIDO /
 *   REINTENTO / CANCELADO; 409 para el resto).
 *
 * `error`/`exito` se comunican en la página; `errorDetalle` vive en el modal
 * de detalle y `errorFormulario` en el modal de confirmación del reintento.
 */
export default function useNotificaciones() {
  const servicio = useNotificacionService();

  const [notificaciones, setNotificaciones] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [modalDetalle, setModalDetalle] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");

  const [reintentoPendiente, setReintentoPendiente] = useState(null);
  const [errorFormulario, setErrorFormulario] = useState("");
  /**
   * Secuencia de peticiones del detalle: al cerrar o reabrir el modal, una
   * respuesta anterior (más lenta) no debe pisar la de la notificación que
   * ahora se está viendo.
   */
  const secuenciaDetalle = useRef(0);

  /** Sincroniza los estados del listado con la Page<> de Spring. */
  const aplicarPagina = (datos, paginaObjetivo) => {
    const contenido = Array.isArray(datos?.content) ? datos.content : [];
    const paginas =
      Number.isInteger(datos?.totalPages) && datos.totalPages > 0
        ? datos.totalPages
        : 1;
    setNotificaciones(contenido);
    setTotalElementos(
      Number.isInteger(datos?.totalElements)
        ? datos.totalElements
        : contenido.length
    );
    setTotalPaginas(paginas);
    setPagina(Math.min(Math.max(paginaObjetivo, 0), paginas - 1));
  };

  const cargar = async (paginaObjetivo = 0, estado = filtroEstado) => {
    setCargando(true);
    setError("");
    try {
      const datos = await servicio.listar(
        paginaObjetivo,
        TAMANO_PAGINA_NOTIFICACIONES,
        estado
      );
      aplicarPagina(datos, paginaObjetivo);
    } catch (err) {
      registrarFallo("notificaciones/cargar", err);
      setError(
        mensajeParaUsuario(err, "No se pudieron cargar las notificaciones.")
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // Carga inicial dentro de una IIFE asíncrona (mismo patrón que
    // useProductos): fuera de ella, react-hooks/set-state-in-effect marca la
    // llamada al helper como setState síncrono dentro del efecto.
    (async () => {
      await cargar();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial; el servicio se recrea en cada render (mismo patrón que useProductos)
  }, []);

  /* ----------------------------- Listado -------------------------------- */
  const cambiarFiltro = async (valor) => {
    setFiltroEstado(valor);
    setExito("");
    await cargar(0, valor);
  };

  const irAPagina = async (destino) => {
    if (destino < 0 || destino >= totalPaginas || cargando) return;
    setExito("");
    await cargar(destino);
  };

  const recargar = async () => {
    setExito("");
    await cargar(pagina, filtroEstado);
  };

  /* ------------------------------ Detalle ------------------------------- */
  const abrirDetalle = async (notificacion) => {
    const peticion = ++secuenciaDetalle.current;
    const vigente = () => secuenciaDetalle.current === peticion;

    setModalDetalle(notificacion);
    setDetalle(null);
    setErrorDetalle("");
    setCargandoDetalle(true);
    try {
      const datos = await servicio.detalle(notificacion.id);
      if (!vigente()) return;
      setDetalle(datos);
    } catch (err) {
      if (!vigente()) return;
      registrarFallo("notificaciones/detalle", err);
      setErrorDetalle(
        mensajeParaUsuario(err, "No se pudo cargar el detalle de la notificación.")
      );
    } finally {
      // Solo la petición activa apaga su propio indicador de carga.
      if (vigente()) setCargandoDetalle(false);
    }
  };

  const cerrarDetalle = () => {
    secuenciaDetalle.current += 1; // invalida lo que siga en vuelo
    setModalDetalle(null);
    setDetalle(null);
    setErrorDetalle("");
    setCargandoDetalle(false);
  };

  /* ----------------------------- Reintento ------------------------------ */
  const pedirReintento = (notificacion) => {
    setErrorFormulario("");
    setReintentoPendiente(notificacion);
  };

  const cancelarReintento = () => {
    if (enviando) return;
    setReintentoPendiente(null);
    setErrorFormulario("");
  };

  const confirmarReintento = async () => {
    if (!reintentoPendiente) return;
    setEnviando(true);
    setErrorFormulario("");
    setError("");
    try {
      await servicio.reintentar(reintentoPendiente.id);
      setReintentoPendiente(null);
      setExito("Reintento solicitado: la notificación vuelve a la cola de envío.");
      await cargar(pagina, filtroEstado);
    } catch (err) {
      registrarFallo("notificaciones/reintentar", err);
      setErrorFormulario(
        mensajeParaUsuario(
          err,
          "No se pudo reintentar la notificación. Inténtalo de nuevo."
        )
      );
    } finally {
      setEnviando(false);
    }
  };

  return {
    // Listado
    notificaciones,
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
    // Detalle
    modalDetalle,
    detalle,
    cargandoDetalle,
    errorDetalle,
    abrirDetalle,
    cerrarDetalle,
    // Reintento
    reintentoPendiente,
    errorFormulario,
    pedirReintento,
    cancelarReintento,
    confirmarReintento,
  };
}
