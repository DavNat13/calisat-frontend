import { Clock, Mail, MapPin, Phone } from "lucide-react";

/**
 * Datos y lógica pura del formulario de contacto.
 * Vive en .js (regla del proyecto: la lógica pura no va en los .jsx, que
 * solo exportan componentes).
 */

export const DATOS_CONTACTO = [
  { id: "email", IconoDato: Mail, titulo: "Email", valor: "hola@calisat.cl" },
  {
    id: "fono",
    IconoDato: Phone,
    titulo: "Teléfono",
    valor: "+56 9 8765 4321",
  },
  {
    id: "horario",
    IconoDato: Clock,
    titulo: "Horario",
    valor: "Lun a Vie · 09:00 a 18:00 (CLT)",
  },
  {
    id: "direccion",
    IconoDato: MapPin,
    titulo: "Dirección",
    valor: "O'Higgins 680, Puerto Montt, Los Lagos",
  },
];

/** Dirección y horario reutilizados por la home (y el formulario). */
export const DIRECCION_CONTACTO =
  DATOS_CONTACTO.find(({ id }) => id === "direccion")?.valor ?? "";
export const HORARIO = DATOS_CONTACTO.find(({ id }) => id === "horario")?.valor ?? "";

export const ASUNTOS = [
  "Consulta de productos",
  "Estado de mi pedido",
  "Despachos y cobertura",
  "Postventa y garantía",
  "Otro tema",
];

export const VALORES_INICIALES = {
  nombre: "",
  email: "",
  asunto: "",
  mensaje: "",
};

/**
 * Validación en cliente: sin backend todavía, pero con los mismos mensajes
 * que se mostrarán cuando exista el POST.
 */
export function validarContacto({ nombre, email, asunto, mensaje }) {
  const fallos = {};
  if (nombre.trim().length < 3) fallos.nombre = "Escribe tu nombre completo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fallos.email = "Ingresa un email válido.";
  }
  if (!asunto) fallos.asunto = "Selecciona un asunto.";
  if (mensaje.trim().length < 10) {
    fallos.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres).";
  }
  return fallos;
}
