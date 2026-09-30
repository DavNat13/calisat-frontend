import { useEffect, useRef, useState } from "react";
import { aLista, listarProductos } from "../../catalogo/services/catalogoLectura";
import { registrarFallo } from "../../../utils/errores";

/**
 * Destacados de la home: primera página del catálogo PÚBLICO (GET sin
 * Authorization, igual que /productos en vitrina).
 *
 * Contrato deliberado: la home NUNCA muestra errores de API. Si el GET
 * falla o devuelve la página vacía, `productos` queda en `[]` y la sección
 * Destacados no se renderiza; el detalle real solo va a consola vía
 * `registrarFallo`. Así un catálogo caído nunca rompe la portada.
 *
 * El guard `ref` evita la doble petición del StrictMode de desarrollo
 * (mount → unmount → mount), que en fase 1-4 solo duplicaba llamadas y aquí
 * además parpadearía dos veces el esqueleto de carga.
 */
export default function useDestacados() {
  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState([]);
  const yaPidio = useRef(false);

  useEffect(() => {
    if (yaPidio.current) return;
    yaPidio.current = true;

    // `vigente` evita escribir estado tras desmontar (o en el segundo monte).
    let vigente = true;
    (async () => {
      try {
        const data = await listarProductos(0, 4);
        if (vigente) setProductos(aLista(data));
      } catch (err) {
        registrarFallo("home/destacados", err);
      } finally {
        if (vigente) setCargando(false);
      }
    })();

    return () => {
      vigente = false;
    };
  }, []);

  return { cargando, productos };
}
