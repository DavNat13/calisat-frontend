import { useEffect, useState } from "react";
import useOrdenAdminService from "../services/ordenAdminService";
import { destinosDe } from "../services/estadoOrden";
import { mensajeParaUsuario, registrarFallo } from "../../../utils/errores";

/** Tamaño de página fijo del listado del panel. */
const TAMANO_PAGINA = 20;

const aLista = (datos) => (Array.isArray(datos?.content) ? datos.content : []);

const coincide = (orden, termino) => {
  const texto = termino.toLowerCase();
  return (
    String(orden?.id ?? "").toLowerCase().includes(texto) ||
    String(orden?.usuarioSub ?? "").toLowerCase().includes(texto) ||
    String(orden?.estado ?? "").toLowerCase().includes(texto) ||
    String(orden?.direccionCiudad ?? "").toLowerCase().includes(texto)
  );
};

/**
 * Estado de la pantalla Órdenes (solo ADMINISTRADOR).
 *
 * - Listado global paginado `GET /api/v1/ordenes/todas`.
 * - Búsqueda en cliente (id, usuario, estado o ciudad): el endpoint no
 *   acepta filtros.
 * - Modal de detalle (líneas, dirección, subtotal/envío/total) y modal de
 *   cambio de estado SOLO con los destinos válidos de `estadoOrden.js`.
 */
export default function useOrdenesAdmin() {
  const servicio = useOrdenAdminService();

  const [ordenes, setOrdenes] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [consulta, setConsulta] = useState("");
  const [consultaAplicada, setConsultaAplicada] = useState("");

  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalEstado, setModalEstado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");

  /** Primer `setState` llega tras el `await` (regla set-state-in-effect). */
  const cargar = async (numeroPagina) => {
    try {
      const datos = await servicio.listarTodas(numeroPagina, TAMANO_PAGINA);
      const contenido = aLista(datos);
      setOrdenes(contenido);
      setPagina(numeroPagina);
      setTotalPaginas(Number(datos?.totalPages) || 1);
      setTotalElementos(Number(datos?.totalElements) || contenido.length);
      setError("");
    } catch (err) {
      registrarFallo("ordenes/cargar", err);
      setError(mensajeParaUsuario(err, "No se pudieron cargar las órdenes."));
      setOrdenes([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    (async () => {
      await cargar(0);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial
  }, []);

  const filtradas = consultaAplicada
    ? ordenes.filter((orden) => coincide(orden, consultaAplicada))
    : ordenes;

  const buscar = () => {
    setConsultaAplicada(consulta.trim());
  };

  const limpiarBusqueda = () => {
    setConsulta("");
    setConsultaAplicada("");
  };

  const abrirDetalle = (orden) => setModalDetalle(orden);
  const cerrarDetalle = () => setModalDetalle(null);

  const abrirEstado = (orden) => {
    setModalEstado(orden);
    const destinos = destinosDe(orden.estado);
    setNuevoEstado(destinos[0] ?? "");
    setErrorFormulario("");
  };
  const cerrarEstado = () => {
    setModalEstado(null);
    setNuevoEstado("");
    setErrorFormulario("");
  };

  /** Transición con recarga: el listado siempre pinta el estado real. */
  const aplicarEstado = async () => {
    if (!modalEstado || !nuevoEstado) return;
    setEnviando(true);
    setErrorFormulario("");
    try {
      await servicio.cambiarEstado(modalEstado.id, nuevoEstado);
      setExito(`Orden ${modalEstado.id.slice(0, 8)} → ${nuevoEstado}.`);
      cerrarEstado();
      await cargar(pagina);
    } catch (err) {
      registrarFallo("ordenes/cambiarEstado", err);
      setErrorFormulario(mensajeParaUsuario(err, "No se pudo cambiar el estado."));
    } finally {
      setEnviando(false);
    }
  };

  const cancelar = async (orden) => {
    setEnviando(true);
    setError("");
    try {
      await servicio.cancelar(orden.id);
      setExito(`Orden ${orden.id.slice(0, 8)} cancelada.`);
      setModalDetalle(null);
      await cargar(pagina);
    } catch (err) {
      registrarFallo("ordenes/cancelar", err);
      setError(mensajeParaUsuario(err, "No se pudo cancelar la orden."));
    } finally {
      setEnviando(false);
    }
  };

  return {
    ordenes: filtradas,
    totalElementos,
    pagina,
    totalPaginas,
    cargando,
    enviando,
    error,
    exito,
    consulta,
    setConsulta,
    buscar,
    limpiarBusqueda,
    irAPagina: cargar,
    modalDetalle,
    abrirDetalle,
    cerrarDetalle,
    modalEstado,
    abrirEstado,
    cerrarEstado,
    nuevoEstado,
    setNuevoEstado,
    errorFormulario,
    aplicarEstado,
    cancelar,
  };
}
