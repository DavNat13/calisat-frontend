import { useEffect, useState } from "react";
import useAuditoriaService, {
  TAMANO_PAGINA_AUDITORIA,
} from "../services/auditoriaService";
import { mensajeParaUsuario, registrarFallo } from "../../../utils/errores";

/**
 * Estado y acciones de la pantalla de Auditoría (ADMINISTRADOR).
 *
 * - Listado paginado `GET /api/v1/auditoria` con filtros opcionales
 *   `?tipo=` y `?resultado=` (valores EXACTOS de los enums del backend).
 *
 * `error` se comunica en la página; no hay modales ni acciones (solo lectura).
 */
export default function useAuditoria() {
  const servicio = useAuditoriaService();

  const [eventos, setEventos] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroResultado, setFiltroResultado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  /** Sincroniza los estados del listado con la Page<> de Spring. */
  const aplicarPagina = (datos, paginaObjetivo) => {
    const contenido = Array.isArray(datos?.content) ? datos.content : [];
    const paginas =
      Number.isInteger(datos?.totalPages) && datos.totalPages > 0
        ? datos.totalPages
        : 1;
    setEventos(contenido);
    setTotalElementos(
      Number.isInteger(datos?.totalElements)
        ? datos.totalElements
        : contenido.length
    );
    setTotalPaginas(paginas);
    setPagina(Math.min(Math.max(paginaObjetivo, 0), paginas - 1));
  };

  const cargar = async (
    paginaObjetivo = 0,
    tipo = filtroTipo,
    resultado = filtroResultado
  ) => {
    setCargando(true);
    setError("");
    try {
      const datos = await servicio.listar(
        paginaObjetivo,
        TAMANO_PAGINA_AUDITORIA,
        tipo,
        resultado
      );
      aplicarPagina(datos, paginaObjetivo);
    } catch (err) {
      registrarFallo("auditoria/cargar", err);
      setError(
        mensajeParaUsuario(err, "No se pudo cargar el historial de auditoría.")
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // Carga inicial dentro de una IIFE asíncrona (mismo patrón que
    // useNotificaciones): fuera de ella, react-hooks/set-state-in-effect
    // marcaría la llamada al helper como setState síncrono dentro del efecto.
    (async () => {
      await cargar();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial; el servicio se recrea en cada render (mismo patrón que useNotificaciones)
  }, []);

  /* ----------------------------- Filtros ------------------------------- */
  const cambiarFiltroTipo = async (valor) => {
    setFiltroTipo(valor);
    await cargar(0, valor, filtroResultado);
  };

  const cambiarFiltroResultado = async (valor) => {
    setFiltroResultado(valor);
    await cargar(0, filtroTipo, valor);
  };

  const irAPagina = async (destino) => {
    if (destino < 0 || destino >= totalPaginas || cargando) return;
    await cargar(destino);
  };

  const recargar = async () => {
    await cargar(pagina);
  };

  return {
    eventos,
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
  };
}
