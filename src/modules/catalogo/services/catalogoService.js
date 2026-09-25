import { useMsal } from "@azure/msal-react";
import { apiRequest } from "../../../auth/AuthConfig";
import { API_BASE_URL } from "../../../config/api";
import { errorDeUsuario, registrarFallo } from "../../../utils/errores";

const CATALOGO_BASE = "/api/v1/catalogo";

/**
 * Cuerpo JSON de una respuesta correcta, con red de seguridad: `null` si el
 * cuerpo está vacío o no es JSON (HTTP 204/205 sin contenido). Sin esto,
 * res.json() rechazaba y una operación de escritura EXITOSA se mostraba en
 * la UI como error (y el listado no se recargaba).
 */
const jsonOPorNull = (res) => res.json().catch(() => null);

/**
 * Servicio de catálogo.
 *
 * - GET (listar / por SKU / por categoría): SIN Authorization. Es público
 *   POR DISEÑO: el SecurityConfig del microservicio define
 *   `GET /api/v1/catalogo/** -> permitAll()` (catálogo abierto). Adjuntar un
 *   token aquí sería contraproducente: si el token caducara, la petición
 *   pública dejaría de funcionar. Excepción: `listarInactivos` SÍ lleva
 *   Bearer (el endpoint exige rol ADMINISTRADOR).
 * - POST/PUT/DELETE (y /reactivar): SIEMPRE con Bearer (rol ADMINISTRADOR).
 * - Todo error se registra en consola con su detalle; en la UI solo se
 *   muestran copias propias (ver src/utils/errores.js).
 */
export default function useCatalogoService() {
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

  const listarProductos = async (page = 0, size = 100) => {
    const res = await fetch(
      `${API_BASE_URL}${CATALOGO_BASE}?page=${page}&size=${size}`,
      { method: "GET" }
    );
    if (!res.ok) {
      registrarFallo("catalogo/listarProductos", `HTTP ${res.status}`);
      throw errorDeUsuario("Error al listar productos");
    }
    return res.json();
  };

  const getProductoBySku = async (sku) => {
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
  };

  const getProductosByCategoria = async (categoria) => {
    const res = await fetch(
      `${API_BASE_URL}${CATALOGO_BASE}/categoria/${encodeURIComponent(categoria)}`,
      { method: "GET" }
    );
    if (!res.ok) {
      registrarFallo("catalogo/getProductosByCategoria", `HTTP ${res.status}`);
      throw errorDeUsuario("Error al filtrar por categoría");
    }
    return res.json();
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

  const crearProducto = async (producto) => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}${CATALOGO_BASE}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(producto),
    });
    if (!res.ok) {
      await manejarErrorEscritura(
        res,
        "No se pudo crear el producto. Revisa los datos e inténtalo de nuevo."
      );
    }
    return jsonOPorNull(res);
  };

  const updateProducto = async (sku, data) => {
    const token = await getToken();
    const res = await fetch(
      `${API_BASE_URL}${CATALOGO_BASE}/${encodeURIComponent(sku)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) {
      await manejarErrorEscritura(
        res,
        "No se pudo actualizar el producto. Revisa los datos e inténtalo de nuevo."
      );
    }
    return jsonOPorNull(res);
  };

  const deleteProducto = async (sku) => {
    const token = await getToken();
    const res = await fetch(
      `${API_BASE_URL}${CATALOGO_BASE}/${encodeURIComponent(sku)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) {
      await manejarErrorEscritura(
        res,
        "No se pudo eliminar el producto. Inténtalo de nuevo."
      );
    }
    return jsonOPorNull(res);
  };

  /**
   * Productos dados de baja (activo=false).
   *
   * A diferencia del resto de GET del catálogo, ESTE va con Bearer: el
   * SecurityConfig del microservicio protege `/api/v1/catalogo/inactivos`
   * con `hasAnyRole("ADMINISTRADOR")` (GET público solo para `/catalogo/**`
   * general). El manejo de fallos es el estándar del módulo (detalle en
   * consola, copia propia en la UI).
   */
  const listarInactivos = async (page = 0, size = 100) => {
    const token = await getToken();
    const res = await fetch(
      `${API_BASE_URL}${CATALOGO_BASE}/inactivos?page=${page}&size=${size}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) {
      await manejarErrorEscritura(
        res,
        "No se pudieron cargar los productos dados de baja."
      );
    }
    return jsonOPorNull(res);
  };

  /**
   * Reactiva un producto dado de baja (POST /{sku}/reactivar, ADMINISTRADOR).
   * El backend es idempotente: 200 incluso si ya estaba activo; 404 si el
   * SKU no existe.
   */
  const reactivar = async (sku) => {
    const token = await getToken();
    const res = await fetch(
      `${API_BASE_URL}${CATALOGO_BASE}/${encodeURIComponent(sku)}/reactivar`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) {
      await manejarErrorEscritura(
        res,
        "No se pudo reactivar el producto. Inténtalo de nuevo."
      );
    }
    return jsonOPorNull(res);
  };

  return {
    listarProductos,
    getProductoBySku,
    getProductosByCategoria,
    crearProducto,
    updateProducto,
    deleteProducto,
    listarInactivos,
    reactivar,
  };
}
