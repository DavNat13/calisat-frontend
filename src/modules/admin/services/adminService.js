import { useMsal } from "@azure/msal-react";
import { apiRequest } from "../../../auth/AuthConfig";
import { API_BASE_URL } from "../../../config/api";
import { registrarFallo } from "../../../utils/errores";

/**
 * Servicios de datos del panel de administración (Fase 1).
 *
 * Patrón de token idéntico a `catalogoService.js`: SIEMPRE de la cuenta
 * ACTIVA (`getActiveAccount`, la que ve el usuario en la UI) y
 * `acquireTokenSilent` con `apiRequest`. Cada función lanza si la llamada
 * falla; el dashboard las envuelve en un `intentar()` individual para que
 * un fallo parcial solo pinte "—" en su tarjeta.
 *
 * Las respuestas son las de los microservicios:
 * - catalogo:  Page<ProductoResponse>  → { totalElements, content, ... }
 * - inventario: Page<StockResponse>   → content[] con cantidadDisponible
 * - notificaciones: Page<NotificacionResponse> → { totalElements, ... }
 * - envios:    List<EnvioResponse>     → array plano
 *
 * La Fase 3 ampliará este módulo (detalle, filtros, reintentos…).
 */

/** Páginas mínimas: para los totales solo hace falta `totalElements`. */
const RUTAS = {
  productosActivos: "/api/v1/catalogo?page=0&size=1",
  productosInactivos: "/api/v1/catalogo/inactivos?page=0&size=1",
  // size=100 (ver nota de la 1ª página en obtenerResumenInventario)
  stock: "/api/v1/stock?page=0&size=100&sort=sku",
  notificaciones: "/api/v1/notificaciones?page=0&size=1",
  // El enum del microservicio es EstadoNotificacion.FALLIDO: Spring convierte
  // el parámetro con valueOf y "FALLIDA" devolvería HTTP 400.
  notificacionesFallidas: "/api/v1/notificaciones?estado=FALLIDO&page=0&size=1",
  envios: "/api/v1/envios",
};

/** Unidades por debajo de las cuales un SKU entra en "bajo stock". */
export const UMBRAL_BAJO_STOCK = 5;

/** `totalElements` de una Page de Spring, o null si no lo es. */
const totalDePagina = (datos) =>
  datos && typeof datos === "object" && typeof datos.totalElements === "number"
    ? datos.totalElements
    : null;

/** Lista real de la respuesta: array plano, `content` de Page o vacío. */
const aLista = (datos) => {
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.content)) return datos.content;
  return [];
};

export default function useAdminService() {
  const { instance, accounts } = useMsal();

  const getToken = async () => {
    // Misma regla que en catalogoService: token de la cuenta ACTIVA, nunca
    // de `accounts[0]` a ciegas (podría ser otra cuenta cacheada).
    const cuenta = instance.getActiveAccount() ?? accounts[0];
    const response = await instance.acquireTokenSilent({
      ...apiRequest,
      account: cuenta,
    });
    return response.accessToken;
  };

  /**
   * GET JSON genérico. `conToken: false` solo para el catálogo público
   * (`GET /api/v1/catalogo/** -> permitAll()`): adjuntar un token ahí
   * acoplaria una petición pública a la vigencia de la sesión.
   */
  const getJSON = async (ruta, { conToken = false } = {}) => {
    const headers = conToken ? { Authorization: `Bearer ${await getToken()}` } : {};
    const res = await fetch(`${API_BASE_URL}${ruta}`, { headers });
    if (!res.ok) {
      registrarFallo("admin/getJSON", `${ruta} → HTTP ${res.status}`);
      throw new Error(`HTTP ${res.status}`);
    }
    // Red de seguridad: cuerpo vacío / 204 → null (nunca rompe el .json()).
    return res.json().catch(() => null);
  };

  /** Productos activos (endpoint público, sin token). */
  const obtenerTotalProductosActivos = async () => {
    const datos = await getJSON(RUTAS.productosActivos);
    return { total: totalDePagina(datos) };
  };

  /** Productos dados de baja (requiere rol ADMINISTRADOR). */
  const obtenerTotalProductosInactivos = async () => {
    const datos = await getJSON(RUTAS.productosInactivos, { conToken: true });
    return { total: totalDePagina(datos) };
  };

  /**
   * Registros, unidades disponibles y SKU con bajo stock.
   *
   * NOTA: unidadesDisponibles y bajoStock se calculan sobre la PRIMERA
   * página (size=100, ordenado por sku). Si el panel supera 100 registros
   * de stock, ambos valores son parciales (el total de registros sí es
   * exacto porque sale de totalElements). La Fase 3 paginará o pedirá un
   * agregado al backend.
   */
  const obtenerResumenInventario = async () => {
    const datos = await getJSON(RUTAS.stock, { conToken: true });
    const contenido = aLista(datos);
    const unidades = (registro) => Number(registro?.cantidadDisponible) || 0;
    return {
      registros: totalDePagina(datos) ?? contenido.length,
      unidadesDisponibles: contenido.reduce(
        (suma, registro) => suma + unidades(registro),
        0
      ),
      bajoStock: contenido.filter(
        (registro) => unidades(registro) <= UMBRAL_BAJO_STOCK
      ).length,
    };
  };

  const obtenerTotalNotificaciones = async () => {
    const datos = await getJSON(RUTAS.notificaciones, { conToken: true });
    return { total: totalDePagina(datos) };
  };

  const obtenerNotificacionesFallidas = async () => {
    const datos = await getJSON(RUTAS.notificacionesFallidas, { conToken: true });
    return { total: totalDePagina(datos) };
  };

  /**
   * Listado global de envíos (ADMINISTRADOR | LOGISTICA): total, reparto
   * por estado y los 5 más recientes por fecha de creación.
   */
  const obtenerResumenEnvios = async () => {
    const datos = await getJSON(RUTAS.envios, { conToken: true });
    const lista = aLista(datos);

    const porEstado = lista.reduce((conteo, envio) => {
      const estado = String(envio?.estado ?? "SIN_ESTADO").toUpperCase();
      conteo[estado] = (conteo[estado] ?? 0) + 1;
      return conteo;
    }, {});

    const recientes = [...lista]
      .sort(
        (a, b) =>
          new Date(b?.fechaCreacion ?? 0).getTime() -
          new Date(a?.fechaCreacion ?? 0).getTime()
      )
      .slice(0, 5);

    return { total: lista.length, porEstado, recientes };
  };

  return {
    obtenerTotalProductosActivos,
    obtenerTotalProductosInactivos,
    obtenerResumenInventario,
    obtenerTotalNotificaciones,
    obtenerNotificacionesFallidas,
    obtenerResumenEnvios,
  };
}
