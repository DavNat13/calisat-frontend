import { useEffect, useState } from "react";
import usePlantillaService from "../services/plantillaService";
import { mensajeParaUsuario, registrarFallo } from "../../../utils/errores";

const FORM_VACIO = {
  codigo: "",
  asunto: "",
  cuerpoTexto: "",
  cuerpoHtml: "",
  variables: "[]",
  activa: true,
};

/** Comprueba que `variables` sea un array JSON antes de mandarlo. */
const variablesValidas = (texto) => {
  try {
    return Array.isArray(JSON.parse(texto || "[]"));
  } catch {
    return false;
  }
};

/**
 * Estado de la pantalla Plantillas (CRUD de ms-notificaciones).
 *
 * Crear manda el registro completo; editar manda solo los cambios (el PUT
 * es parcial y sube `version`). "Desactivar" es un PUT con `activa: false`,
 * igual que hace el DELETE del backend (baja lógica, nunca borra).
 */
export default function usePlantillas() {
  const servicio = usePlantillaService();

  const [plantillas, setPlantillas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [consulta, setConsulta] = useState("");

  const [modal, setModal] = useState(null); // { modo: "crear" | "editar", plantilla }
  const [form, setForm] = useState(FORM_VACIO);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [bajaPendiente, setBajaPendiente] = useState(null);

  const cargar = async () => {
    try {
      const datos = await servicio.listar();
      setPlantillas(Array.isArray(datos) ? datos : []);
      setError("");
    } catch (err) {
      registrarFallo("plantillas/cargar", err);
      setError(mensajeParaUsuario(err, "No se pudieron cargar las plantillas."));
      setPlantillas([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    (async () => {
      await cargar();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial
  }, []);

  const abrirNuevo = () => {
    setForm({ ...FORM_VACIO });
    setErrorFormulario("");
    setModal({ modo: "crear" });
  };

  const abrirEdicion = (plantilla) => {
    setForm({ ...FORM_VACIO, ...plantilla });
    setErrorFormulario("");
    setModal({ modo: "editar", plantilla });
  };

  const cerrarModal = () => {
    setModal(null);
    setErrorFormulario("");
  };

  const cambiar = (evento) => {
    const { name, value, checked, type } = evento.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const guardar = async () => {
    if (!variablesValidas(form.variables)) {
      setErrorFormulario('Las variables deben ser un array JSON, p. ej. ["nombre"].');
      return;
    }
    setEnviando(true);
    setErrorFormulario("");
    try {
      if (modal?.modo === "editar") {
        await servicio.actualizar(modal.plantilla.codigo, form);
        setExito(`Plantilla ${modal.plantilla.codigo} actualizada.`);
      } else {
        await servicio.crear(form);
        setExito(`Plantilla ${form.codigo} creada.`);
      }
      cerrarModal();
      await cargar();
    } catch (err) {
      registrarFallo("plantillas/guardar", err);
      setErrorFormulario(mensajeParaUsuario(err, "No se pudo guardar."));
    } finally {
      setEnviando(false);
    }
  };

  /** Activa/inactiva con un PUT parcial (baja lógica, sin borrado físico). */
  const alternarActiva = async (plantilla) => {
    setEnviando(true);
    setError("");
    try {
      await servicio.actualizar(plantilla.codigo, { activa: plantilla.activa !== true });
      setExito(`Plantilla ${plantilla.codigo} ${plantilla.activa ? "desactivada" : "activada"}.`);
      await cargar();
    } catch (err) {
      registrarFallo("plantillas/alternar", err);
      setError(mensajeParaUsuario(err, "No se pudo cambiar el estado."));
    } finally {
      setEnviando(false);
    }
  };

  const confirmarBaja = async () => {
    if (!bajaPendiente) return;
    setEnviando(true);
    setError("");
    try {
      await servicio.eliminar(bajaPendiente.codigo);
      setExito(`Plantilla ${bajaPendiente.codigo} dada de baja.`);
      setBajaPendiente(null);
      await cargar();
    } catch (err) {
      registrarFallo("plantillas/eliminar", err);
      setError(mensajeParaUsuario(err, "No se pudo dar de baja."));
    } finally {
      setEnviando(false);
    }
  };

  const termino = consulta.trim().toLowerCase();
  const visibles = termino
    ? plantillas.filter((plantilla) =>
        [plantilla.codigo, plantilla.asunto]
          .filter(Boolean)
          .some((valor) => String(valor).toLowerCase().includes(termino))
      )
    : plantillas;

  return {
    plantillas: visibles,
    total: plantillas.length,
    activas: plantillas.filter((item) => item.activa !== false).length,
    cargando,
    enviando,
    error,
    exito,
    consulta,
    setConsulta,
    modal,
    form,
    errorFormulario,
    abrirNuevo,
    abrirEdicion,
    cerrarModal,
    cambiar,
    guardar,
    alternarActiva,
    bajaPendiente,
    setBajaPendiente,
    confirmarBaja,
    recargar: cargar,
  };
}
