import { useCallback, useEffect, useRef, useState } from "react";
import useCatalogoService from "../services/catalogoService";
import { registrarFallo } from "../../../utils/errores";

/** El backend devuelve una página Spring ({content:[...]}) o una lista. */
const aLista = (data) => (Array.isArray(data) ? data : data?.content || []);

/**
 * Ficha por SKU: `producto` (objeto, `null` en 404 o aún sin cargar),
 * `error` (fallo técnico → la página ofrece Reintentar), `recomendados`
 * (carga aparte: un fallo ahí no debe tumbar la ficha) y `reintentar`.
 */
export default function useProductoDetalle(sku) {
  const { getProductoBySku, listarProductos } = useCatalogoService();
  const [producto, setProducto] = useState(null);
  const [recomendados, setRecomendados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Guard antiforja: StrictMode monta dos veces y sin este indicador se
  // harían DOS peticiones idénticas para el mismo SKU.
  const peticion = useRef(null);

  const cargar = useCallback(async () => {
    if (peticion.current === sku) return; // ya hay una petición en vuelo
    peticion.current = sku;
    setCargando(true); // el primer render ya pinta el esqueleto
    setError("");
    try {
      const datos = await getProductoBySku(sku);
      if (peticion.current !== sku) return; // navegamos a otro SKU: obsoleta
      setProducto(datos);
    } catch (err) {
      if (peticion.current !== sku) return;
      registrarFallo("productoDetalle/cargar", err);
      setError("No se pudo cargar el producto. Inténtalo de nuevo.");
    } finally {
      // Solo el último pedido libera la carga: si no, una respuesta tardía
      // de un SKU anterior la apagaría a mitad de camino.
      if (peticion.current === sku) setCargando(false);
    }
  }, [sku, getProductoBySku]);

  const reintentar = useCallback(() => {
    peticion.current = null;
    cargar();
  }, [cargar]);

  // Se despacha en el turno SIGUIENTE: invocar `cargar` en síncrono desde el
  // cuerpo del efecto escribiría setState al montar (renders en cascada y
  // `react-hooks/set-state-in-effect`); el guard cubre las 2 de StrictMode.
  useEffect(() => {
    Promise.resolve().then(cargar);
  }, [cargar]);

  // Recomendados: UNA sola vez (no dependen del SKU); el filtrado del SKU en pantalla lo hace la página.
  useEffect(() => {
    let cancelado = false;
    listarProductos(0, 8)
      .then((data) => !cancelado && setRecomendados(aLista(data)))
      .catch((err) => registrarFallo("productoDetalle/recomendados", err));
    return () => {
      cancelado = true; // al desmontar no debe escribirse estado tardío
    };
  }, [listarProductos]);

  // Título derivado del ESTADO (no de la respuesta): un fetch que llegue
  // tarde no deja un título huérfano tras salir.
  useEffect(() => {
    if (cargando || error) return;
    document.title = producto
      ? `${producto.nombre} · Calisat`
      : "Producto no encontrado · Calisat";
  }, [producto, cargando, error]);

  // El título que traía la pestaña al llegar se restaura al desmontar.
  useEffect(() => {
    const tituloAnterior = document.title;
    return () => {
      document.title = tituloAnterior;
    };
  }, []);

  return { cargando, producto, error, recomendados, reintentar };
}
