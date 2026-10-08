import { useEffect, useRef } from "react";
import useCarritoService from "../services/carritoService";
import useAuthSession from "../../../auth/useAuthSession";
import { getProductoBySku } from "../../catalogo/services/catalogoLectura";
import { registrarFallo } from "../../../utils/errores";

/** Clave estable de una lista de líneas para detectar cambios sin render. */
const clave = (lineas) =>
  JSON.stringify(lineas.map((l) => [l.sku, l.cantidad]));

/**
 * Puente entre el carrito local (localStorage) y `ms-carrito`.
 *
 *  - Hidratación: al haber sesión, lee el carrito remoto y lo convierte en
 *    las líneas que pinta la UI. `ms-carrito` solo guarda sku/cantidad/
 *    precio, así que nombre e imagen se resuelven contra el catálogo (y se
 *    reutilizan los que ya estaban en local si el catálogo no responde).
 *  - Persistencia: cada cambio local se envía como diff (alta → POST,
 *    cambio de cantidad → PUT, baja → DELETE). Best-effort: un fallo de
 *    red no descarta lo que el usuario está viendo.
 *
 * Sin sesión (o con 401/403, p. ej. sesión de Cognito) no hace nada: el
 * carrito sigue funcionando 100 % local.
 */
export default function useCarritoRemoto({ items, sustituir }) {
  const servicio = useCarritoService();
  const { isAuthenticated } = useAuthSession();
  const hidratado = useRef(false);
  const remoto = useRef("[]");

  // ---------------- Hidratación (una sola vez por sesión) ----------------
  useEffect(() => {
    if (!isAuthenticated || hidratado.current) return;
    let vivo = true;
    (async () => {
      const carrito = await servicio.obtener().catch(() => null);
      if (!vivo || !carrito) return;
      hidratado.current = true;
      const lineas = await enriquecer(carrito.items ?? [], items);
      if (!vivo) return;
      remoto.current = clave(lineas);
      sustituir(lineas);
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ---------------- Persistencia (diff contra el último remoto) ----------
  const actual = clave(items);
  useEffect(() => {
    if (!isAuthenticated || !hidratado.current || actual === remoto.current) {
      return;
    }
    const previo = remoto.current;
    remoto.current = actual;
    empujar(previo, items, servicio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actual, isAuthenticated]);
}

/** Serializa `[{sku,cantidad}]` de vuelta a una clave comparable. */
const parsear = (json) => {
  try {
    const filas = JSON.parse(json);
    return Array.isArray(filas) ? filas : [];
  } catch {
    return [];
  }
};

/** lineas API → líneas de UI, con nombre/imagen resueltos en el catálogo. */
async function enriquecer(lineas, locales) {
  const local = new Map((locales ?? []).map((l) => [l.sku, l]));
  return Promise.all(
    lineas.map(async (linea) => {
      const previa = local.get(linea.sku);
      let nombre = previa?.nombre ?? "";
      let imagenUrl = previa?.imagenUrl ?? "";
      if (!nombre) {
        try {
          const producto = await getProductoBySku(linea.sku);
          nombre = producto?.nombre ?? "";
          imagenUrl = producto?.imagenUrl ?? "";
        } catch (detalle) {
          registrarFallo("carritoRemoto/catalogo", detalle);
        }
      }
      return {
        sku: linea.sku,
        cantidad: linea.cantidad,
        nombre,
        imagenUrl,
        precio: previa?.precio ?? linea.precioUnitarioVisto ?? null,
      };
    })
  );
}

/** Aplica el diff local↔remoto contra la API. Best-effort (nunca lanza). */
async function empujar(clavePrevia, items, servicio) {
  const previas = new Map(parsear(clavePrevia).map((l) => [l.sku, l.cantidad]));
  const actuales = new Map(items.map((l) => [l.sku, l.cantidad]));
  try {
    for (const [sku, cantidad] of actuales) {
      const antes = previas.get(sku);
      if (antes === undefined) {
        await servicio.agregarItem(sku, cantidad);
      } else if (antes !== cantidad) {
        await servicio.actualizarItem(sku, cantidad);
      }
    }
    for (const sku of previas.keys()) {
      if (!actuales.has(sku)) await servicio.quitarItem(sku);
    }
  } catch (detalle) {
    registrarFallo("carritoRemoto/empujar", detalle);
  }
}
