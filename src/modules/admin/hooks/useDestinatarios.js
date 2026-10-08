import { useEffect, useState } from "react";
import useDestinatarioService, {
  filtrarDestinatarios,
} from "../services/destinatarioService";
import { mensajeParaUsuario, registrarFallo } from "../../../utils/errores";

/** Formulario de alta/edición (upsert por azureSub). */
const FORM_VACIO = { azureSub: "", email: "", nombre: "", rol: "", activo: true };

/**
 * Estado de la pantalla Destinatarios (directorio de ms-notificaciones).
 *
 * El backend solo ofrece GET listado y POST upsert: aquí se montan la
 * búsqueda en cliente, el modal de alta/edición y la confirmación de baja
 * lógica (`activo: false`).
 */
export default function useDestinatarios() {
  const servicio = useDestinatarioService();

  const [destinatarios, setDestinatarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [consulta, setConsulta] = useState("");

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [bajaPendiente, setBajaPendiente] = useState(null);

  const cargar = async () => {
    try {
      const datos = await servicio.listar();
      setDestinatarios(Array.isArray(datos) ? datos : []);
      setError("");
    } catch (err) {
      registrarFallo("destinatarios/cargar", err);
      setError(mensajeParaUsuario(err, "No se pudo cargar el directorio."));
      setDestinatarios([]);
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
    setForm(FORM_VACIO);
    setErrorFormulario("");
    setModal(true);
  };

  const abrirEdicion = (destinatario) => {
    setForm({ ...FORM_VACIO, ...destinatario });
    setErrorFormulario("");
    setModal(true);
  };

  const cerrarModal = () => {
    setModal(false);
    setErrorFormulario("");
  };

  const cambiar = (evento) => {
    const { name, value, checked, type } = evento.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const guardar = async () => {
    setEnviando(true);
    setErrorFormulario("");
    try {
      await servicio.guardar(form);
      setExito(`Destinatario ${form.email} guardado en el directorio.`);
      cerrarModal();
      await cargar();
    } catch (err) {
      registrarFallo("destinatarios/guardar", err);
      setErrorFormulario(mensajeParaUsuario(err, "No se pudo guardar."));
    } finally {
      setEnviando(false);
    }
  };

  const confirmarBaja = async () => {
    if (!bajaPendiente) return;
    setEnviando(true);
    setError("");
    try {
      await servicio.darDeBaja(bajaPendiente);
      setExito(`${bajaPendiente.email} dado de baja.`);
      setBajaPendiente(null);
      await cargar();
    } catch (err) {
      registrarFallo("destinatarios/baja", err);
      setError(mensajeParaUsuario(err, "No se pudo dar de baja."));
    } finally {
      setEnviando(false);
    }
  };

  const visibles = filtrarDestinatarios(destinatarios, consulta);
  const activos = destinatarios.filter((item) => item.activo !== false).length;

  return {
    destinatarios: visibles,
    total: destinatarios.length,
    activos,
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
    bajaPendiente,
    setBajaPendiente,
    confirmarBaja,
    recargar: cargar,
  };
}
