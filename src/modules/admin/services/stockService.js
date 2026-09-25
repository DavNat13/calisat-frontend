import useApiAdmin, { segmento } from "./apiAdmin";

/**
 * Servicio del microservicio de inventario (ms-inventario).
 *
 * Endpoints (todos con Bearer; GET es authenticated y las escrituras exigen
 * rol ADMINISTRADOR):
 *   GET    /api/v1/stock?page&size&sort   → Page<StockResponse>
 *   GET    /api/v1/stock/sku/{sku}        → StockResponse | 404
 *   GET    /api/v1/stock/{id}             → StockResponse | 404
 *   POST   /api/v1/stock                  → 201
 *   PUT    /api/v1/stock/{id}             → 200 | 404
 *   DELETE /api/v1/stock/{id}             → 204 | 404
 *   POST   /api/v1/stock/{sku}/reservar|liberar|confirmar → StockResponse
 *          (404 SKU inexistente, 409 stock insuficiente / reglas de negocio)
 *
 * Los 4xx se traducen aquí a copias propias en español; el cuerpo real va a
 * la consola (src/utils/errores.js).
 */
const BASE = "/api/v1/stock";

const MENSAJES = {
  400: "Datos de stock no válidos: revisa el SKU y las cantidades (no pueden ser negativas).",
  404: "No se encontró el registro de stock indicado.",
  409: "El movimiento no se aplicó: la cantidad excede el stock disponible o viola una regla de negocio.",
};

/** Tamaño de página fijo del listado del panel. */
export const TAMANO_PAGINA_STOCK = 20;

export default function useStockService() {
  const { obtener, enviar } = useApiAdmin();

  const listar = (pagina = 0, tamano = TAMANO_PAGINA_STOCK) =>
    obtener(`${BASE}?page=${pagina}&size=${tamano}&sort=sku`, { mensajes: MENSAJES });

  /** Búsqueda exacta por SKU: null cuando no existe (404 → lista vacía). */
  const buscarPorSku = (sku) =>
    obtener(`${BASE}/sku/${segmento(sku)}`, { mensajes: MENSAJES, nullEn404: true });

  const crear = (registro) =>
    enviar(BASE, { metodo: "POST", cuerpo: registro, mensajes: MENSAJES });

  const actualizar = (id, registro) =>
    enviar(`${BASE}/${id}`, { metodo: "PUT", cuerpo: registro, mensajes: MENSAJES });

  const eliminar = (id) =>
    enviar(`${BASE}/${id}`, { metodo: "DELETE", mensajes: MENSAJES });

  /** Movimientos: "reservar" | "liberar" | "confirmar". */
  const movimiento = (sku, tipo, { cantidad, refOrden }) =>
    enviar(`${BASE}/${segmento(sku)}/${tipo}`, {
      metodo: "POST",
      cuerpo: refOrden ? { cantidad, refOrden } : { cantidad },
      mensajes: MENSAJES,
    });

  return { listar, buscarPorSku, crear, actualizar, eliminar, movimiento };
}
