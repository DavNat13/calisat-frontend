import { useMsal } from "@azure/msal-react";
import { apiRequest } from "../../../auth/AuthConfig";
import { API_BASE_URL } from "../../../config/api";
import { errorDeUsuario, registrarFallo } from "../../../utils/errores";
import { CATALOGO_BASE } from "./catalogoLectura";

/**
 * Cuerpo JSON de una respuesta correcta, con red de seguridad: `null` si el
 * cuerpo está vacío o no es JSON (HTTP 204/205 sin contenido). Sin esto,
 * res.json() rechazaba y una operación de escritura EXITOSA se mostraba en
 * la UI como error (y el listado no se recargaba).
 */
const jsonOPorNull = (res) => res.json().catch(() => null);

/**
 * ESCRITURA del catálogo (capa partida desde catalogoService.js).
 *
 * - POST/PUT/DELETE (y /reactivar): SIEMPRE con Bearer (rol ADMINISTRADOR).
 * - `listarInactivos` es un GET, pero el SecurityConfig protege
 *   `/api/v1/catalogo/inactivos` con `hasAnyRole("ADMINISTRADOR")`, así que
 *   también va con Bearer (la lectura pública vive en catalogoLectura.js).
 * - Todo error se registra en consola con su detalle; en la UI solo se
 *   muestran copias propias (ver src/utils/errores.js).
 */
export default function useCatalogoEscritura() {
  const { instance, accounts } = useMsal();

  const getToken = async () => {
    // La cuenta ACTIVA es la que refleja la sesión visible en la UI (la fija
    // src/main.jsx al arrancar). Usar `accounts[0]` a ciegas podría pedir un
    // token de otra cuenta cacheada y enviarlo a la API con esa identidad.
    const cuenta = instance.getActiveAccount() ?? accounts[0];
    const response = await instance.acquireTokenSilent({
      ...apiRequest,
      account: cuenta,
    });
    return response.accessToken;
  };

  /**
   * Maneja fallos de escritura. El cuerpo del servidor solo va a consola:
   * nunca se refleja en la UI (evita filtrar rutas/esquemas/trazas).
   */
  const manejarErrorEscritura = async (res, mensajePorDefecto) => {
    const cuerpo = await res.text().catch(() => "");
    registrarFallo(
      "catalogo/escritura",
      `HTTP ${res.status} ${res.statusText} — ${cuerpo.slice(0, 500)}`
    );
    if (res.status === 401) {
      throw errorDeUsuario("Tu sesión expiró. Cierra sesión y vuelve a entrar.");
    }
    if (res.status === 403) {
      throw errorDeUsuario("Se requiere rol administrador");
    }
    throw errorDeUsuario(mensajePorDefecto);
  };

  /**
   * Núcleo de TODAS las operaciones de este módulo: token de la cuenta
   * activa, fallo traducido a mensaje propio y cuerpo tolerante a 204/205.
   * `cuerpo === undefined` => petición sin entidad (DELETE, reactivar y
   * listado de inactivos), idéntico a la versión previa a la partición.
   */
  const pedir = async (metodo, ruta, cuerpo, mensajeError) => {
    const token = await getToken();
    const encabezados = { Authorization: `Bearer ${token}` };
    if (cuerpo !== undefined) encabezados["Content-Type"] = "application/json";
    const res = await fetch(`${API_BASE_URL}${ruta}`, {
      method: metodo,
      headers: encabezados,
      ...(cuerpo !== undefined && { body: JSON.stringify(cuerpo) }),
    });
    if (!res.ok) await manejarErrorEscritura(res, mensajeError);
    return jsonOPorNull(res);
  };

  const crearProducto = (producto) =>
    pedir("POST", CATALOGO_BASE, producto,
      "No se pudo crear el producto. Revisa los datos e inténtalo de nuevo.");

  const updateProducto = (sku, data) =>
    pedir("PUT", `${CATALOGO_BASE}/${encodeURIComponent(sku)}`, data,
      "No se pudo actualizar el producto. Revisa los datos e inténtalo de nuevo.");

  const deleteProducto = (sku) =>
    pedir("DELETE", `${CATALOGO_BASE}/${encodeURIComponent(sku)}`, undefined,
      "No se pudo eliminar el producto. Inténtalo de nuevo.");

  /**
   * Productos dados de baja (activo=false).
   *
   * A diferencia del resto de GET del catálogo, ESTE va con Bearer: el
   * SecurityConfig del microservicio protege `/api/v1/catalogo/inactivos`
   * con `hasAnyRole("ADMINISTRADOR")` (GET público solo para `/catalogo/**`
   * general). El manejo de fallos es el estándar del módulo (detalle en
   * consola, copia propia en la UI).
   */
  const listarInactivos = (page = 0, size = 100) =>
    pedir("GET", `${CATALOGO_BASE}/inactivos?page=${page}&size=${size}`, undefined,
      "No se pudieron cargar los productos dados de baja.");

  /**
   * Reactiva un producto dado de baja (POST /{sku}/reactivar, ADMINISTRADOR).
   * El backend es idempotente: 200 incluso si ya estaba activo; 404 si el
   * SKU no existe.
   */
  const reactivar = (sku) =>
    pedir("POST", `${CATALOGO_BASE}/${encodeURIComponent(sku)}/reactivar`, undefined,
      "No se pudo reactivar el producto. Inténtalo de nuevo.");

  return {
    crearProducto,
    updateProducto,
    deleteProducto,
    listarInactivos,
    reactivar,
  };
}
