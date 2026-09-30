import { API_BASE_URL } from "../../../config/api";
import { errorDeUsuario, registrarFallo } from "../../../utils/errores";

/**
 * Ruta base del recurso catálogo. Vive aquí (y no en cada módulo) para que
 * lectura y escritura apunten SIEMPRE al mismo path: si el microservicio
 * cambia de versión se toca un único sitio.
 */
export const CATALOGO_BASE = "/api/v1/catalogo";

/**
 * Normaliza la respuesta del catálogo: el backend devuelve o una lista
 * plana o una página Spring (`{content:[...]}`). Vive en la capa de
 * lectura para que el listado de activos y el de dados de baja
 * interpreten LA MISMA forma con un único código (sin duplicarlo).
 */
export const aLista = (data) => (Array.isArray(data) ? data : data?.content || []);

/**
 * LECTURA del catálogo (FASE: capa partida desde catalogoService.js).
 *
 * - GET (listar / por SKU / por categoría): SIN Authorization. Es público
 *   POR DISEÑO: el SecurityConfig del microservicio define
 *   `GET /api/v1/catalogo/** -> permitAll()` (catálogo abierto). Adjuntar un
 *   token aquí sería contraproducente: si el token caducara, la petición
 *   pública dejaría de funcionar. Excepción: `listarInactivos` SÍ lleva
 *   Bearer (el endpoint exige rol ADMINISTRADOR) y por eso vive en
 *   catalogoEscritura.js.
 * - Todo error se registra en consola con su detalle; en la UI solo se
 *   muestran copias propias (ver src/utils/errores.js).
 *
 * Son funciones de MÓDULO (no del hook): su identidad es estable entre
 * renders, lo que permite usarlas como dependencia de useEffect sin
 * disparar bucles de carga.
 */

/** GET /api/v1/catalogo?page&size — página del catálogo activo. */
export async function listarProductos(page = 0, size = 100) {
  const res = await fetch(
    `${API_BASE_URL}${CATALOGO_BASE}?page=${page}&size=${size}`,
    { method: "GET" }
  );
  if (!res.ok) {
    registrarFallo("catalogo/listarProductos", `HTTP ${res.status}`);
    throw errorDeUsuario("Error al listar productos");
  }
  return res.json();
}

/**
 * GET /api/v1/catalogo/{sku} — detalle de un producto.
 * Devuelve `null` en 404 (SKU inexistente NO es un fallo técnico: la ficha
 * lo traduce a la página "Producto no encontrado").
 */
export async function getProductoBySku(sku) {
  const res = await fetch(
    `${API_BASE_URL}${CATALOGO_BASE}/${encodeURIComponent(sku)}`,
    { method: "GET" }
  );
  if (!res.ok) {
    if (res.status === 404) return null;
    registrarFallo("catalogo/getProductoBySku", `HTTP ${res.status}`);
    throw errorDeUsuario("Error al obtener producto");
  }
  return res.json();
}

/** GET /api/v1/catalogo/categoria/{nombre} — filtrado por categoría. */
export async function getProductosByCategoria(categoria) {
  const res = await fetch(
    `${API_BASE_URL}${CATALOGO_BASE}/categoria/${encodeURIComponent(categoria)}`,
    { method: "GET" }
  );
  if (!res.ok) {
    registrarFallo("catalogo/getProductosByCategoria", `HTTP ${res.status}`);
    throw errorDeUsuario("Error al filtrar por categoría");
  }
  return res.json();
}
