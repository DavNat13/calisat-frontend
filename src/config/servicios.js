/**
 * Microservicios desplegados. Inventario y envíos quedan fuera del despliegue
 * actual (límite de 9 instancias en AWS Academy): con `false` se ocultan sus
 * menús, rutas y tarjetas. El código se conserva; para reactivarlos basta con
 * poner `true` y publicar sus rutas en el API Gateway.
 */
export const SERVICIOS = {
  inventario: false,
  envios: false,
};
