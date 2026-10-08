import { useEffect, useState } from "react";
import usePreferenciaService, {
  CANALES,
  clavePreferencia,
} from "../services/preferenciaService";
import { mensajeParaUsuario, registrarFallo } from "../../../utils/errores";

const FORM_VACIO = { tipoCampana: "", canal: "EMAIL", optIn: true };

/**
 * Estado de la pantalla Preferencias (suscripciones del usuario autenticado
 * en ms-notificaciones).
 *
 * No hay listado global: GET devuelve las SUYAS y el PUT hace upsert por
 * (tipoCampana, canal). Borrar no existe en el backend, así que la única
 * baja posible es dejar la fila en `optIn: false`.
 */
export default function usePreferencias() {
  const servicio = usePreferenciaService();

  const [preferencias, setPreferencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [form, setForm] = useState(FORM_VACIO);
  const [errorFormulario, setErrorFormulario] = useState("");

  const cargar = async () => {
    try {
      const datos = await servicio.obtenerPropias();
      setPreferencias(Array.isArray(datos?.preferencias) ? datos.preferencias : []);
      setError("");
    } catch (err) {
      registrarFallo("preferencias/cargar", err);
      setError(mensajeParaUsuario(err, "No se pudieron cargar tus preferencias."));
      setPreferencias([]);
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

  const cambiar = (evento) => {
    const { name, value, checked, type } = evento.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const enviar = async (item, mensajeExito) => {
    setEnviando(true);
    setErrorFormulario("");
    setError("");
    try {
      const guardadas = await servicio.guardar([item]);
      setPreferencias(Array.isArray(guardadas) ? guardadas : [item]);
      setExito(mensajeExito);
      return true;
    } catch (err) {
      registrarFallo("preferencias/guardar", err);
      setErrorFormulario(mensajeParaUsuario(err, "No se pudo guardar."));
      setError(mensajeParaUsuario(err, "No se pudo guardar."));
      return false;
    } finally {
      setEnviando(false);
    }
  };

  /** Alta desde el formulario (upsert en el backend). */
  const agregar = async () => {
    const tipo = form.tipoCampana.trim();
    if (!tipo) {
      setErrorFormulario("Escribe el tipo de campaña.");
      return;
    }
    if (!CANALES.includes(form.canal)) {
      setErrorFormulario("Elige un canal soportado.");
      return;
    }
    const clave = `${tipo}|${form.canal}`;
    if (preferencias.some((item) => clavePreferencia(item) === clave)) {
      setErrorFormulario("Ya existe esa combinación: usa el interruptor de la tabla.");
      return;
    }
    const guardado = await enviar(
      { tipoCampana: tipo, canal: form.canal, optIn: form.optIn },
      `Preferencia ${tipo} guardada.`
    );
    if (guardado) setForm(FORM_VACIO);
  };

  /** Conmuta el opt-in de una fila existente (upsert con la misma clave). */
  const alternar = async (item) =>
    enviar(
      { ...item, optIn: item.optIn !== true },
      `${item.tipoCampana}: ${item.optIn ? "baja" : "alta"} registrada.`
    );

  return {
    preferencias,
    cargando,
    enviando,
    error,
    exito,
    form,
    errorFormulario,
    cambiar,
    agregar,
    alternar,
    recargar: cargar,
  };
}
