import { useEffect, useState } from "react";
import useStockService, { TAMANO_PAGINA_STOCK } from "../services/stockService";
import { mensajeParaUsuario, registrarFallo } from "../../../utils/errores";

/** Formulario del alta/edición de un registro de stock. */
const FORM_VACIO = { sku: "", cantidadDisponible: "", cantidadReservada: "" };

/** Formulario de los movimientos (reservar / liberar / confirmar). */
const FORM_MOVIMIENTO_VACIO = { cantidad: "", refOrden: "" };

/** Mensaje de éxito por tipo de movimiento, tras recargar el listado. */
const EXITO_MOVIMIENTO = {
  reservar: "Stock reservado correctamente",
  liberar: "Stock liberado correctamente",
  confirmar: "Salida de stock confirmada correctamente",
};

/**
 * Estado y acciones de la pantalla de Inventario (solo ADMINISTRADOR).
 *
 * - Listado paginado de `GET /api/v1/stock` (20 por página, ordenado por SKU)
 *   con búsqueda EXACTA por SKU (`GET /api/v1/stock/sku/{sku}`): el backend
 *   no expone filtro por subcadena, así que un término sin resultados deja la
 *   lista vacía y lo comunica en `nota` (role="status").
 * - CRUD (modal de alta/edición + confirmación de borrado) y movimientos de
 *   stock (reservar / liberar / confirmar) con validación previa en cliente.
 *
 * Separación de mensajes: `error`/`exito`/`nota` van al listado de la página;
 * `errorFormulario` vive dentro del modal abierto (solo un modal a la vez),
 * para no duplicar alertas en el DOM.
 */
export default function useStock() {
  const servicio = useStockService();

  const [registros, setRegistros] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [nota, setNota] = useState("");
  const [consulta, setConsulta] = useState("");
  const [consultaActiva, setConsultaActiva] = useState("");

  const [modalRegistro, setModalRegistro] = useState(null);
  const [formRegistro, setFormRegistro] = useState(FORM_VACIO);
  const [registroEliminar, setRegistroEliminar] = useState(null);
  const [modalMovimiento, setModalMovimiento] = useState(null);
  const [formMovimiento, setFormMovimiento] = useState(FORM_MOVIMIENTO_VACIO);
  const [errorFormulario, setErrorFormulario] = useState("");

  /** Sincroniza estados del listado con la Page<> devuelta por Spring. */
  const aplicarPagina = (datos, paginaObjetivo) => {
    const contenido = Array.isArray(datos?.content) ? datos.content : [];
    const paginas =
      Number.isInteger(datos?.totalPages) && datos.totalPages > 0
        ? datos.totalPages
        : 1;
    setRegistros(contenido);
    setTotalElementos(
      Number.isInteger(datos?.totalElements)
        ? datos.totalElements
        : contenido.length
    );
    setTotalPaginas(paginas);
    setPagina(Math.min(Math.max(paginaObjetivo, 0), paginas - 1));
  };

  /**
   * Núcleo de carga: el PRIMER setState llega después de un `await`, por lo
   * que el efecto inicial puede lanzarlo sin violar
   * `react-hooks/set-state-in-effect` (la página ya arranca con
   * `cargando = true`, `error` y `nota` vacíos).
   */
  const ejecutarCarga = async (paginaObjetivo, sku) => {
    try {
      const termino = String(sku ?? "").trim();
      if (termino) {
        const registro = await servicio.buscarPorSku(termino);
        setRegistros(registro ? [registro] : []);
        setTotalElementos(registro ? 1 : 0);
        setTotalPaginas(1);
        setPagina(0);
        setNota(
          registro ? "" : `No hay registros de stock con el SKU «${termino}».`
        );
      } else {
        const datos = await servicio.listar(paginaObjetivo);
        aplicarPagina(datos, paginaObjetivo);
      }
    } catch (err) {
      registrarFallo("stock/cargar", err);
      setError(mensajeParaUsuario(err, "No se pudo cargar el inventario."));
    } finally {
      setCargando(false);
    }
  };

  /**
   * Carga una página (o la búsqueda exacta si `sku` trae término).
   * `sku` por defecto = última consulta aplicada: así recargar tras una
   * escritura mantiene el filtro visible. Solo se usa desde handlers.
   */
  const cargar = async (paginaObjetivo = 0, sku = consultaActiva) => {
    setCargando(true);
    setError("");
    setNota("");
    await ejecutarCarga(paginaObjetivo, sku);
  };

  useEffect(() => {
    // Carga inicial dentro de una IIFE asíncrona (mismo patrón que
    // useProductos): fuera de ella, react-hooks/set-state-in-effect marca la
    // llamada al helper como setState síncrono dentro del efecto.
    (async () => {
      await ejecutarCarga(0, "");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial; el servicio se recrea en cada render (mismo patrón que useProductos)
  }, []);

  /* ----------------------------- Búsqueda ------------------------------ */
  const buscar = async () => {
    // Ya hay una petición en vuelo: el botón está deshabilitado, pero el
    // input sigue activo y por Intro llegaría una segunda carga. La más lenta
    // ganaría y la lista quedaría con datos del término ANTERIOR (distinto al
    // que muestra el input). Mismo criterio que irAPagina.
    if (cargando) return;

    const termino = consulta.trim();
    setConsultaActiva(termino);
    setExito("");
    await cargar(0, termino);
  };

  const limpiarBusqueda = async () => {
    if (cargando) return; // ídem: no pisar una carga en curso

    setConsulta("");
    setConsultaActiva("");
    setExito("");
    await cargar(0, "");
  };

  const irAPagina = async (destino) => {
    if (destino < 0 || destino >= totalPaginas || cargando) return;
    setExito("");
    await cargar(destino);
  };

  const recargar = async () => {
    setExito("");
    await cargar(pagina, consultaActiva);
  };

  /* -------------------------- Alta / edición --------------------------- */
  const abrirNuevo = () => {
    setFormRegistro(FORM_VACIO);
    setErrorFormulario("");
    setModalRegistro({ modo: "nuevo", registro: null });
  };

  const abrirEdicion = (registro) => {
    setFormRegistro({
      sku: registro.sku ?? "",
      cantidadDisponible: String(registro.cantidadDisponible ?? 0),
      cantidadReservada: String(registro.cantidadReservada ?? 0),
    });
    setErrorFormulario("");
    setModalRegistro({ modo: "editar", registro });
  };

  const cerrarModalRegistro = () => {
    if (enviando) return;
    setModalRegistro(null);
    setErrorFormulario("");
  };

  const cambiarFormRegistro = (e) => {
    setFormRegistro((previo) => ({ ...previo, [e.target.name]: e.target.value }));
    setErrorFormulario("");
  };

  const guardarRegistro = async (e) => {
    e.preventDefault();
    const sku = formRegistro.sku.trim();
    const disponible = Number(formRegistro.cantidadDisponible);
    const reservada = Number(formRegistro.cantidadReservada);

    if (!sku) return setErrorFormulario("El SKU es obligatorio.");
    if (sku.length > 64)
      return setErrorFormulario("El SKU no puede superar 64 caracteres.");
    if (!Number.isInteger(disponible) || disponible < 0)
      return setErrorFormulario(
        "La cantidad disponible debe ser un número entero mayor o igual a 0."
      );
    if (!Number.isInteger(reservada) || reservada < 0)
      return setErrorFormulario(
        "La cantidad reservada debe ser un número entero mayor o igual a 0."
      );
    if (reservada > disponible)
      return setErrorFormulario(
        "La cantidad reservada no puede ser mayor que la disponible."
      );

    const esEdicion = modalRegistro?.modo === "editar";
    setEnviando(true);
    setErrorFormulario("");
    setError("");
    try {
      const payload = {
        sku,
        cantidadDisponible: disponible,
        cantidadReservada: reservada,
      };
      if (esEdicion) {
        await servicio.actualizar(modalRegistro.registro.id, payload);
        setExito("Registro de stock actualizado correctamente");
      } else {
        await servicio.crear(payload);
        setExito("Registro de stock creado correctamente");
      }
      setModalRegistro(null);
      await cargar(pagina, consultaActiva);
    } catch (err) {
      registrarFallo("stock/guardar", err);
      setErrorFormulario(
        mensajeParaUsuario(
          err,
          "No se pudo guardar el registro de stock. Revisa los datos e inténtalo de nuevo."
        )
      );
    } finally {
      setEnviando(false);
    }
  };

  /* ---------------------------- Eliminar ------------------------------- */
  const pedirEliminar = (registro) => {
    setErrorFormulario("");
    setRegistroEliminar(registro);
  };

  const cancelarEliminar = () => {
    if (enviando) return;
    setRegistroEliminar(null);
    setErrorFormulario("");
  };

  const confirmarEliminar = async () => {
    if (!registroEliminar) return;
    setEnviando(true);
    setErrorFormulario("");
    setError("");
    try {
      await servicio.eliminar(registroEliminar.id);
      setRegistroEliminar(null);
      setExito("Registro de stock eliminado correctamente");
      await cargar(pagina, consultaActiva);
    } catch (err) {
      registrarFallo("stock/eliminar", err);
      setErrorFormulario(
        mensajeParaUsuario(
          err,
          "No se pudo eliminar el registro de stock. Inténtalo de nuevo."
        )
      );
    } finally {
      setEnviando(false);
    }
  };

  /* --------------------------- Movimientos ----------------------------- */
  const abrirMovimiento = (registro, tipo) => {
    setFormMovimiento(FORM_MOVIMIENTO_VACIO);
    setErrorFormulario("");
    setModalMovimiento({ registro, tipo });
  };

  const cerrarModalMovimiento = () => {
    if (enviando) return;
    setModalMovimiento(null);
    setErrorFormulario("");
  };

  const cambiarFormMovimiento = (e) => {
    setFormMovimiento((previo) => ({
      ...previo,
      [e.target.name]: e.target.value,
    }));
    setErrorFormulario("");
  };

  const aplicarMovimiento = async (e) => {
    e.preventDefault();
    const cantidad = Number(formMovimiento.cantidad);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      setErrorFormulario("La cantidad debe ser un número entero mayor que 0.");
      return;
    }
    const refOrden = formMovimiento.refOrden.trim();
    const { registro, tipo } = modalMovimiento;

    setEnviando(true);
    setErrorFormulario("");
    setError("");
    try {
      await servicio.movimiento(registro.sku, tipo, { cantidad, refOrden });
      setModalMovimiento(null);
      setExito(EXITO_MOVIMIENTO[tipo] ?? "Movimiento aplicado correctamente");
      await cargar(pagina, consultaActiva);
    } catch (err) {
      registrarFallo(`stock/${tipo}`, err);
      setErrorFormulario(
        mensajeParaUsuario(
          err,
          "No se pudo aplicar el movimiento de stock. Revisa la cantidad e inténtalo de nuevo."
        )
      );
    } finally {
      setEnviando(false);
    }
  };

  return {
    // Listado
    registros,
    pagina,
    totalPaginas,
    totalElementos,
    tamanoPagina: TAMANO_PAGINA_STOCK,
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
    // Modal de registro (alta / edición)
    modalRegistro,
    formRegistro,
    errorFormulario,
    abrirNuevo,
    abrirEdicion,
    cerrarModalRegistro,
    cambiarFormRegistro,
    guardarRegistro,
    // Eliminar
    registroEliminar,
    pedirEliminar,
    cancelarEliminar,
    confirmarEliminar,
    // Movimientos
    modalMovimiento,
    formMovimiento,
    abrirMovimiento,
    cerrarModalMovimiento,
    cambiarFormMovimiento,
    aplicarMovimiento,
  };
}
