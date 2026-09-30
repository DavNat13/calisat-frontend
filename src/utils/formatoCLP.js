/**
 * Formateo de dinero y cantidades para toda la UI.
 *
 * Regla del proyecto: TODO precio se muestra en pesos chilenos con locale
 * `es-CL`. No se admite `es-MX` ni MXN: el catálogo, los envíos y el perfil
 * son chilenos y el separador de miles/decimal debe ser el de Chile.
 *
 * Uso:
 *   formatoCLP(49990)    // "$49.990"
 *   formatoEntero(1250)  // "1.250"
 */

// Se instancian una sola vez: construir el formatter en cada render es caro
// y estos dos se llaman en bucles (listados de productos, totales del carrito).
const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});
const ENTERO = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 });

/** Precio en CLP; "—" cuando el valor viene vacío/nulo o no es finito. */
export function formatoCLP(valor) {
  const numero = valor === "" || valor == null ? NaN : Number(valor);
  return Number.isFinite(numero) ? CLP.format(numero) : "—";
}

/** Entero localizado (stock, unidades); "—" si no hay dato utilizable. */
export function formatoEntero(valor) {
  const numero = valor === "" || valor == null ? NaN : Number(valor);
  return Number.isFinite(numero) ? ENTERO.format(numero) : "—";
}
