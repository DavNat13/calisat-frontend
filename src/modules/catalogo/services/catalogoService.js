import {
  listarProductos,
  getProductoBySku,
  getProductosByCategoria,
} from "./catalogoLectura";
import useCatalogoEscritura from "./catalogoEscritura";

/**
 * Servicio de catálogo — FACHADA (hook) del módulo.
 *
 * La implementación vive partida en dos módulos para que este archivo solo
 * componga y la API pública siga siendo EXACTAMENTE la de siempre:
 *   - `catalogoLectura.js`   → GET públicos (sin Authorization).
 *   - `catalogoEscritura.js` → POST/PUT/DELETE con Bearer + inactivos.
 *
 * Notas de diseño, conservadas tal cual:
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
 *
 * Al ser un hook, solo puede componer la parte que necesita MSAL: las
 * lecturas se importan directas (son funciones de módulo estables) y la
 * escritura se obtiene del hook interno.
 */
export default function useCatalogoService() {
  const {
    crearProducto,
    updateProducto,
    deleteProducto,
    listarInactivos,
    reactivar,
  } = useCatalogoEscritura();

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
