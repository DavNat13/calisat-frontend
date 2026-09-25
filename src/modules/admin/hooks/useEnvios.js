import { useEffect, useRef, useState } from "react";
import useEnvioService from "../services/envioService";
import { destinosDe } from "../services/estadoEnvio";
import { esUuid } from "../services/apiAdmin";
import { mensajeParaUsuario, registrarFallo } from "../../../utils/errores";

/** Formulario de alta de un envío. */
const FORM_ENVIO_VACIO = {
  ordenId: "",
  transportista: "",
  direccionCalle: "",
  direccionCiudad: "",
  direccionPais: "",
  direccionCodigoPostal: "",
};

/** Formulario de cambio de estado (solo destinos válidos). */
const FORM_ESTADO_VACIO = { estado: "", descripcion: "", ubicacion: "" };

const aLista = (datos) => (Array.isArray(datos) ? datos : []);

/**
 * Estado y acciones de la pantalla de Envíos (ADMINISTRADOR | LOGISTICA).
 *
 * - Listado global `GET /api/v1/envios`.
 * - Búsqueda: si el término es un UUID se re-consulta al backend con
 *   `?ordenId=`; si no, se filtra en cliente por numeroGuia/ordenId.
 * - Alta (modal), cambio de estado (modal SOLO con destinos válidos según
 *   `estadoEnvio.js`) y detalle con historial vía seguimiento público.
 *
 * `error`/`exito`/`nota` se comunican en la página; `errorFormulario` vive
 * dentro del modal abierto (solo hay un modal montado a la vez).
 */
export default function useEnvios() {
  const servicio = useEnvioService();

  const [envios, setEnvios] = useState([]);
  const [baseEnvios, setBaseEnvios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [nota, setNota] = useState("");
  const [consulta, setConsulta] = useState("");
  const [consultaAplicada, setConsultaAplicada] = useState("");

  const [modalCrear, setModalCrear] = useState(false);
  const [formCrear, setFormCrear] = useState(FORM_ENVIO_VACIO);
  const [modalEstado, setModalEstado] = useState(null);
  const [formEstado, setFormEstado] = useState(FORM_ESTADO_VACIO);
  const [errorFormulario, setErrorFormulario] = useState("");

  const [modalDetalle, setModalDetalle] = useState(null);
  const [seguimiento, setSeguimiento] = useState(null);
  const [cargandoSeguimiento, setCargandoSeguimiento] = useState(false);
  const [errorSeguimiento, setErrorSeguimiento] = useState("");
  /**
   * Secuencia de peticiones del detalle: al cerrar o reabrir el modal, una
   * respuesta anterior (más lenta) no debe pisar la del envío que ahora se
   * está viendo.
   */
  const secuenciaDetalle = useRef(0);

  /**
   * Núcleo de carga del listado: el PRIMER setState llega tras un `await`,
   * así el efecto inicial puede lanzarlo sin violar
   * `react-hooks/set-state-in-effect` (arranca con cargando=true).
   *
   * @returns la lista completa cargada, o `null` si la petición falló.
   */
  const ejecutarCargaBase = async () => {
    try {
      const lista = await servicio.listar();
      const contenido = aLista(lista);
      setBaseEnvios(contenido);
      setEnvios(contenido);
      return contenido;
    } catch (err) {
      registrarFallo("envios/cargar", err);
      setError(mensajeParaUsuario(err, "No se pudieron cargar los envíos."));
      return null;
    } finally {
      setCargando(false);
    }
  };

  /**
   * Recarga completa del listado (efectos de éxito usan este camino) y
   * re-aplica el filtro vigente sobre la base nueva: tras crear o cambiar
   * un estado, el listado y la caja de búsqueda deben seguir coherentes
   * (mismo criterio que useStock con `consultaActiva`).
   */
  const cargarBase = async () => {
    setCargando(true);
    setError("");
    setNota("");
    const contenido = await ejecutarCargaBase();
    if (contenido == null) return;

    const termino = consultaAplicada.trim();
    if (!termino) return;

    // UUID → re-consulta al backend (?ordenId=); el resto se filtra en cliente.
    if (esUuid(termino)) {
      setCargando(true);
      try {
        const lista = await servicio.listarPorOrden(termino);
        const filtrados = aLista(lista);
        setEnvios(filtrados);
        setNota(
          filtrados.length ? "" : `No hay envíos registrados para la orden ${termino}.`
        );
      } catch (err) {
        registrarFallo("envios/buscarPorOrden", err);
        setError(mensajeParaUsuario(err, "No se pudo buscar la orden indicada."));
      } finally {
        setCargando(false);
      }
      return;
    }

    const filtrados = contenido.filter((envio) => coincide(envio, termino));
    setEnvios(filtrados);
    setNota(
      filtrados.length ? "" : `No hay envíos que coincidan con «${termino}».`,
    );
  };

  useEffect(() => {
    // Carga inicial dentro de una IIFE asíncrona (mismo patrón que
    // useProductos): fuera de ella, react-hooks/set-state-in-effect marca la
    // llamada al helper como setState síncrono dentro del efecto.
    (async () => {
      await ejecutarCargaBase();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial; el servicio se recrea en cada render (mismo patrón que useProductos)
  }, []);

  /* ----------------------------- Búsqueda ------------------------------ */
  const coincide = (envio, termino) => {
    const texto = termino.toLowerCase();
    return (
      String(envio?.numeroGuia ?? "").toLowerCase().includes(texto) ||
      String(envio?.ordenId ?? "").toLowerCase().includes(texto)
    );
  };

  const buscar = async () => {
    // Ya hay una petición en vuelo: pulsar Intro de nuevo con otro término
    // lanzaría dos cargas concurrentes y la respuesta ANTIGUA podría llegar
    // al final (lista desactualizada respecto a lo que hay en el input).
    if (cargando) return;

    const termino = consulta.trim();
    setConsultaAplicada(termino);
    setError("");
    setExito("");
    setNota("");

    if (!termino) {
      setEnvios(baseEnvios);
      return;
    }

    // UUID → re-consulta al backend (?ordenId=); el resto se filtra en cliente.
    if (esUuid(termino)) {
      setCargando(true);
      try {
        const lista = await servicio.listarPorOrden(termino);
        const contenido = aLista(lista);
        setEnvios(contenido);
        setNota(
          contenido.length ? "" : `No hay envíos registrados para la orden ${termino}.`
        );
      } catch (err) {
        registrarFallo("envios/buscarPorOrden", err);
        setError(mensajeParaUsuario(err, "No se pudo buscar la orden indicada."));
      } finally {
        setCargando(false);
      }
      return;
    }

    const filtrados = baseEnvios.filter((envio) => coincide(envio, termino));
    setEnvios(filtrados);
    setNota(
      filtrados.length ? "" : `No hay envíos que coincidan con «${termino}».`
    );
  };

  const limpiarBusqueda = () => {
    // Mismo criterio que buscar/irAPagina: no alterar la lista mientras hay
    // una carga en vuelo (la respuesta en curso pisaría el reseteo).
    if (cargando) return;

    setConsulta("");
    setConsultaAplicada("");
    setNota("");
    setError("");
    setExito("");
    setEnvios(baseEnvios);
  };

  /* ------------------------------- Alta -------------------------------- */
  const abrirCrear = () => {
    setFormCrear(FORM_ENVIO_VACIO);
    setErrorFormulario("");
    setModalCrear(true);
  };

  const cerrarCrear = () => {
    if (enviando) return;
    setModalCrear(false);
    setErrorFormulario("");
  };

  const cambiarFormCrear = (e) => {
    setFormCrear((previo) => ({ ...previo, [e.target.name]: e.target.value }));
    setErrorFormulario("");
  };

  const crearEnvio = async (e) => {
    e.preventDefault();
    const ordenId = formCrear.ordenId.trim();
    const calle = formCrear.direccionCalle.trim();
    const ciudad = formCrear.direccionCiudad.trim();
    const pais = formCrear.direccionPais.trim();
    const cp = formCrear.direccionCodigoPostal.trim();
    const transportista = formCrear.transportista.trim();

    if (!ordenId)
      return setErrorFormulario("El UUID de la orden es obligatorio.");
    if (!esUuid(ordenId))
      return setErrorFormulario(
        "El ordenId debe ser un UUID válido (formato 8-4-4-4-12)."
      );
    if (!calle) return setErrorFormulario("La calle de entrega es obligatoria.");
    if (!ciudad) return setErrorFormulario("La ciudad de entrega es obligatoria.");
    if (!pais) return setErrorFormulario("El país de entrega es obligatorio.");
    if (!cp) return setErrorFormulario("El código postal de entrega es obligatorio.");

    setEnviando(true);
    setErrorFormulario("");
    setError("");
    try {
      await servicio.crear({
        ordenId,
        direccionCalle: calle,
        direccionCiudad: ciudad,
        direccionPais: pais,
        direccionCodigoPostal: cp,
        ...(transportista ? { transportista } : {}),
      });
      setModalCrear(false);
      setExito("Envío creado correctamente");
      await cargarBase();
    } catch (err) {
      registrarFallo("envios/crear", err);
      setErrorFormulario(
        mensajeParaUsuario(
          err,
          "No se pudo crear el envío. Revisa los datos e inténtalo de nuevo."
        )
      );
    } finally {
      setEnviando(false);
    }
  };

  /* -------------------------- Cambio de estado ------------------------- */
  const abrirCambioEstado = (envio) => {
    const destinos = destinosDe(envio?.estado);
    if (destinos.length === 0) return; // terminal: la página no pinta el botón
    setFormEstado({ estado: destinos[0], descripcion: "", ubicacion: "" });
    setErrorFormulario("");
    setModalEstado(envio);
  };

  const cerrarCambioEstado = () => {
    if (enviando) return;
    setModalEstado(null);
    setErrorFormulario("");
  };

  const cambiarFormEstado = (e) => {
    setFormEstado((previo) => ({ ...previo, [e.target.name]: e.target.value }));
    setErrorFormulario("");
  };

  const aplicarCambioEstado = async (e) => {
    e.preventDefault();
    const destinos = destinosDe(modalEstado?.estado);
    if (!destinos.includes(formEstado.estado)) {
      setErrorFormulario(
        "Selecciona un estado de destino válido para el envío actual."
      );
      return;
    }
    const descripcion = formEstado.descripcion.trim();
    const ubicacion = formEstado.ubicacion.trim();

    setEnviando(true);
    setErrorFormulario("");
    setError("");
    try {
      await servicio.cambiarEstado(modalEstado.id, {
        estado: formEstado.estado,
        ...(descripcion ? { descripcion } : {}),
        ...(ubicacion ? { ubicacion } : {}),
      });
      setModalEstado(null);
      setExito("Estado del envío actualizado correctamente");
      await cargarBase();
    } catch (err) {
      registrarFallo("envios/cambiarEstado", err);
      setErrorFormulario(
        mensajeParaUsuario(
          err,
          "No se pudo actualizar el estado del envío. Inténtalo de nuevo."
        )
      );
    } finally {
      setEnviando(false);
    }
  };

  /* ------------------------------ Detalle ------------------------------ */
  const abrirDetalle = async (envio) => {
    const peticion = ++secuenciaDetalle.current;
    const vigente = () => secuenciaDetalle.current === peticion;

    setModalDetalle(envio);
    setSeguimiento(null);
    setErrorSeguimiento("");
    setCargandoSeguimiento(true);
    try {
      const datos = await servicio.seguimiento(envio.numeroGuia);
      if (!vigente()) return;
      setSeguimiento(datos);
    } catch (err) {
      if (!vigente()) return;
      registrarFallo("envios/seguimiento", err);
      setErrorSeguimiento(
        mensajeParaUsuario(err, "No se pudo cargar el historial del envío.")
      );
    } finally {
      // Solo la petición activa apaga su propio indicador de carga.
      if (vigente()) setCargandoSeguimiento(false);
    }
  };

  const cerrarDetalle = () => {
    secuenciaDetalle.current += 1; // invalida lo que siga en vuelo
    setModalDetalle(null);
    setSeguimiento(null);
    setErrorSeguimiento("");
    setCargandoSeguimiento(false);
  };

  return {
    // Listado
    envios,
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
    recargar: cargarBase,
    // Alta
    modalCrear,
    formCrear,
    abrirCrear,
    cerrarCrear,
    cambiarFormCrear,
    crearEnvio,
    // Cambio de estado
    modalEstado,
    formEstado,
    abrirCambioEstado,
    cerrarCambioEstado,
    cambiarFormEstado,
    aplicarCambioEstado,
    // Detalle + historial
    modalDetalle,
    seguimiento,
    cargandoSeguimiento,
    errorSeguimiento,
    abrirDetalle,
    cerrarDetalle,
    // Errores de los modales de escritura
    errorFormulario,
  };
}
