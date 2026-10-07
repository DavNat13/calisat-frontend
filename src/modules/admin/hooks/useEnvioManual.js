import { useState } from "react";
import useNotificacionService from "../services/notificacionService";
import { mensajeParaUsuario, registrarFallo } from "../../../utils/errores";

/**
 * Formulario del envío manual de correo desde el panel ADMINISTRADOR
 * (POST /api/v1/notificaciones/enviar).
 *
 * `destinatarioEmail` vacío = el backend resuelve el sub autenticado.
 * La validación de formato es solo cliente: la autoridad sigue siendo
 * `@Email` de la validación de Spring.
 */
const CAMPOS_INICIALES = { asunto: "", cuerpoTexto: "", destinatarioEmail: "" };

const FALTAN_CAMPOS = "El asunto y el cuerpo del correo son obligatorios.";
const EMAIL_INVALIDO = "El email del destinatario no es válido.";
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function useEnvioManual() {
  const servicio = useNotificacionService();

  const [abierto, setAbierto] = useState(false);
  const [campos, setCampos] = useState(CAMPOS_INICIALES);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  const abrir = () => {
    setCampos(CAMPOS_INICIALES);
    setError("");
    setExito(false);
    setAbierto(true);
  };

  const cerrar = () => {
    if (!enviando) setAbierto(false);
  };

  const cambiar =
    (nombre) =>
    (evento) => {
      const { value } = evento.target;
      setCampos((prev) => ({ ...prev, [nombre]: value }));
      if (error) setError("");
    };

  const reiniciar = () => {
    setCampos(CAMPOS_INICIALES);
    setError("");
    setExito(false);
  };

  const validar = () => {
    const asunto = campos.asunto.trim();
    const cuerpoTexto = campos.cuerpoTexto.trim();
    const email = campos.destinatarioEmail.trim();
    if (!asunto || !cuerpoTexto) return FALTAN_CAMPOS;
    if (email && !REGEX_EMAIL.test(email)) return EMAIL_INVALIDO;
    return "";
  };

  const enviar = async (event) => {
    event.preventDefault();
    const fallo = validar();
    if (fallo) {
      setError(fallo);
      return;
    }
    setEnviando(true);
    setError("");
    try {
      await servicio.enviarManual({
        asunto: campos.asunto.trim(),
        cuerpoTexto: campos.cuerpoTexto.trim(),
        destinatarioEmail: campos.destinatarioEmail.trim(),
      });
      setExito(true);
    } catch (err) {
      registrarFallo("useEnvioManual/enviar", err);
      setError(mensajeParaUsuario(err));
    } finally {
      setEnviando(false);
    }
  };

  return {
    abierto,
    campos,
    enviando,
    error,
    exito,
    abrir,
    cerrar,
    cambiar,
    enviar,
    reiniciar,
  };
}
