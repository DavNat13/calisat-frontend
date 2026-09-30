/**
 * Reglas de validación PURAS del formulario de producto, por paso.
 *
 * Sin React ni DOM: cada función devuelve `{campo: mensaje}` para que el
 * modal pinte el error bajo cada control (el Input ya expone
 * aria-invalid/aria-describedby) y, con el MISMO mapa, construya el
 * resumen anunciable del paso ("2 campos con errores: Precio, Categoría").
 */

/** URL opcional: solo http/https y sin espacios (el regex \S lo garantiza). */
const RE_URL = /^https?:\/\/\S+$/;

/** Etiqueta legible de cada campo (para el resumen de errores). */
export const ETIQUETAS = {
  sku: "SKU",
  nombre: "Nombre",
  descripcion: "Descripción",
  precio: "Precio",
  categoria: "Categoría",
  imagenUrl: "URL de imagen",
};

const requerido = (valor) => String(valor ?? "").trim() !== "";
const excede = (valor, limite) => String(valor ?? "").length > limite;

/** Paso 1 · Datos básicos: SKU y nombre obligatorios; descripción opcional. */
export function validarBasicos(form) {
  const errores = {};
  if (!requerido(form.sku)) errores.sku = "El SKU es obligatorio.";
  else if (excede(form.sku, 64)) errores.sku = "Máximo 64 caracteres.";
  if (!requerido(form.nombre)) errores.nombre = "El nombre es obligatorio.";
  else if (excede(form.nombre, 120)) errores.nombre = "Máximo 120 caracteres.";
  if (excede(form.descripcion, 1000))
    errores.descripcion = "Máximo 1000 caracteres.";
  return errores;
}

/** Paso 2 · Comercial: precio ENTERO ≥ 1, categoría y URL de imagen. */
export function validarComercial(form) {
  const errores = {};
  const precio = String(form.precio ?? "").trim();
  if (!precio) errores.precio = "El precio es obligatorio.";
  else if (!Number.isInteger(Number(precio)) || Number(precio) < 1)
    errores.precio = "Ingresa un precio entero igual o mayor a 1.";
  if (!requerido(form.categoria)) errores.categoria = "La categoría es obligatoria.";
  else if (excede(form.categoria, 64)) errores.categoria = "Máximo 64 caracteres.";
  const imagen = String(form.imagenUrl ?? "").trim();
  if (imagen && !RE_URL.test(imagen))
    errores.imagenUrl = "Debe empezar por http:// o https:// y no llevar espacios.";
  return errores;
}

/** Validadores por paso; el 3 es resumen de solo lectura (sin reglas). */
const VALIDADORES = [validarBasicos, validarComercial];

/** Ejecuta las reglas del paso (1..3). Un paso sin validador devuelve {}. */
export const validarPaso = (paso, form) =>
  (VALIDADORES[paso - 1] ?? (() => ({})))(form);

/** "2 campos con errores: Precio, Categoría" — "" cuando no hay errores. */
export function resumenDeErrores(errores) {
  const campos = Object.keys(errores);
  if (campos.length === 0) return "";
  const etiquetas = campos.map((campo) => ETIQUETAS[campo] ?? campo).join(", ");
  const plural = campos.length > 1;
  return `${campos.length} ${plural ? "campos" : "campo"} con ${
    plural ? "errores" : "error"
  }: ${etiquetas}`;
}
