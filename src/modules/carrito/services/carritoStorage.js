import { registrarFallo } from "../../../utils/errores";

/**
 * Persistencia del carrito en localStorage.
 *
 * Forma guardada: { v: 1, items: [{ sku, nombre, imagenUrl, precio, cantidad }] }
 * La versión `v` protege contra cambios de esquema: si el guardado no es
 * reconocido se descarta (nunca se "adivina" una migración) y la UI recibe
 * un mensaje propio en español, jamás el error crudo del navegador.
 *
 * Lectura: nunca lanza (try/catch + validación de v===1 ⇒ [] + registrarFallo).
 * Escritura: devuelve null si guardó o el mensaje si falló (cuota llena,
 * modo privado o almacenamiento bloqueado).
 */

const CLAVE = "calisat.carrito.v1";
const VERSION = 1;
const MIN_CANTIDAD = 1;
const MAX_CANTIDAD = 99;

/** Acepta solo lo que la UI puede pintar: sku string y cantidad entera 1..99. */
const normalizarItem = (crudo) => {
  if (!crudo || typeof crudo.sku !== "string" || crudo.sku.trim() === "") {
    return null;
  }
  const cantidad = Math.trunc(Number(crudo.cantidad));
  const precio =
    crudo.precio === null || crudo.precio === "" ? NaN : Number(crudo.precio);
  return {
    sku: crudo.sku,
    nombre: typeof crudo.nombre === "string" ? crudo.nombre : "",
    imagenUrl: typeof crudo.imagenUrl === "string" ? crudo.imagenUrl : "",
    precio: Number.isFinite(precio) && precio >= 0 ? precio : null,
    cantidad: Number.isFinite(cantidad)
      ? Math.min(MAX_CANTIDAD, Math.max(MIN_CANTIDAD, cantidad))
      : MIN_CANTIDAD,
  };
};

/** Lee el carrito guardado; ante cualquier fallo ⇒ [] + mensaje de la UI. */
export function leerCarrito() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return { items: [], fallo: null };
    const datos = JSON.parse(crudo);
    if (!datos || datos.v !== VERSION || !Array.isArray(datos.items)) {
      throw new Error(`estructura no reconocida (v=${datos?.v})`);
    }
    return {
      items: datos.items.map(normalizarItem).filter(Boolean),
      fallo: null,
    };
  } catch (detalle) {
    // El detalle real va a la consola (solo visible en DevTools); la UI
    // muestra únicamente copias propias escritas por el equipo.
    registrarFallo("carritoStorage.lectura", detalle);
    return {
      items: [],
      fallo: "No pudimos leer tu carrito guardado; se reinició para que puedas seguir comprando.",
    };
  }
}

/** Guarda el carrito completo. Devuelve null si guardó o un mensaje si falló. */
export function escribirCarrito(items) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ v: VERSION, items }));
    return null;
  } catch (detalle) {
    registrarFallo("carritoStorage.escritura", detalle);
    return "No pudimos guardar tu carrito en este navegador. Revisa el almacenamiento e inténtalo de nuevo.";
  }
}
