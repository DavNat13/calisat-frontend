import { useCallback, useEffect, useRef, useState } from "react";
import useCatalogoService from "../services/catalogoService";
import useRecomendacionService from "../services/recomendacionService";
import useAuthSession from "../../../auth/useAuthSession";
import useTokenSesion from "../../../auth/tokenSesion";
import { registrarFallo } from "../../../utils/errores";

/** El backend devuelve una página Spring ({content:[...]}) o una lista. */
const aLista = (data) => (Array.isArray(data) ? data : data?.content || []);

/**
 * Ficha por SKU: `producto` (objeto, `null` en 404 o aún sin cargar),
 * `error` (fallo técnico → la página ofrece Reintentar), `personales` (Top-5
 * del usuario) y `generales` (respaldo del catálogo), que se cargan aparte
 * para que un fallo ahí no tumbe la ficha, y `reintentar`.
 */
export default function useProductoDetalle(sku) {
  const { getProductoBySku, listarProductos } = useCatalogoService();
  const { misRecomendaciones } = useRecomendacionService();
  const obtenerToken = useTokenSesion();
  const { cargando: cargandoSesion } = useAuthSession();
  const [producto, setProducto] = useState(null);
  const [personales, setPersonales] = useState([]);
  const [generales, setGenerales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Guard antiforja: StrictMode monta dos veces y sin este indicador se
  // harían DOS peticiones idénticas para el mismo SKU.
  const peticion = useRef(null);

  const cargar = useCallback(async () => {
    // Se espera a la sesión para que la vista quede a nombre del usuario.
    if (cargandoSesion) return;
    if (peticion.current === sku) return; // ya hay una petición en vuelo
    peticion.current = sku;
    setCargando(true); // el primer render ya pinta el esqueleto
    setError("");
    try {
      const token = await obtenerToken();
      const datos = await getProductoBySku(sku, token);
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
  }, [sku, getProductoBySku, obtenerToken, cargandoSesion]);

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

  // Recomendados: no dependen del SKU; la página filtra el que está en pantalla.
  // Se resuelven contra el listado (no por SKU) para no registrar vistas falsas.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const [top, data] = await Promise.all([
          misRecomendaciones(),
          listarProductos(0, 100),
        ]);
        if (cancelado) return;
        const catalogo = aLista(data);
        const porSku = new Map(catalogo.map((p) => [p.sku, p]));
        setPersonales(top.map((r) => porSku.get(r.itemId)).filter(Boolean));
        setGenerales(catalogo.slice(0, 8));
      } catch (err) {
        registrarFallo("productoDetalle/recomendados", err);
      }
    })();
    return () => {
      cancelado = true; // al desmontar no debe escribirse estado tardío
    };
  }, [listarProductos, misRecomendaciones]);

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

  return { cargando, producto, error, personales, generales, reintentar };
}
