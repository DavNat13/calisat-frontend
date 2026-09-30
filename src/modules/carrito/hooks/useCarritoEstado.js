import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { escribirCarrito, leerCarrito } from "../services/carritoStorage";
import enfocarContenido from "../../../utils/enfocarContenido";

/**
 * Estado del carrito: ítems, panel lateral y sincronía con localStorage.
 * Devuelve exactamente la API que consume carritoContexto.
 */

// Rango compartido por el stepper del drawer y por todas las acciones.
const MIN_CANTIDAD = 1;
const MAX_CANTIDAD = 99;

/** Clamp 1..99: cualquier entrada no numérica o vacía cae al mínimo. */
const limitar = (valor) => {
  const numero = Math.trunc(Number(valor));
  return Number.isFinite(numero)
    ? Math.min(MAX_CANTIDAD, Math.max(MIN_CANTIDAD, numero))
    : MIN_CANTIDAD;
};

// Precio "incompleto" = el que no se formatea en CLP: el drawer lo avisa con
// role="status" en vez de sumar 0 y falsear el total.
const precioValido = (precio) =>
  precio !== null && precio !== "" &&
  Number.isFinite(Number(precio)) && Number(precio) >= 0;

export default function useCarritoEstado() {
  // Lectura perezosa y única: localStorage es síncrono, así que hoy no hay
  // carga real (cargando:false se conserva para una futura hidratación remota).
  const [guardado] = useState(leerCarrito);
  const [items, setItems] = useState(guardado.items);
  const [error, setError] = useState(guardado.fallo);
  const [abierto, setAbierto] = useState(false);
  const focoDeApertura = useRef(null);

  // Espejo de los ítems leídos al arrancar: permite saltarse la primera
  // escritura (el estado YA viene del almacenamiento) sin depender de cuántas
  // veces ejecute el efecto el navegador (StrictMode lo duplica en dev).
  const itemsDeArranque = useRef(items);

  useEffect(() => {
    if (items === itemsDeArranque.current) return;
    setError(escribirCarrito(items));
  }, [items]);

  // Al abrir se recuerda quién lo hizo para devolverle el foco al cerrar.
  const abrir = useCallback(() => {
    focoDeApertura.current = document.activeElement;
    setAbierto(true);
  }, []);

  const cerrar = useCallback(() => {
    setAbierto(false);
    const disparador = focoDeApertura.current;
    focoDeApertura.current = null;
    // Sin disparador visible (menú móvil ya cerrado, o <body>): el foco va
    // al contenido principal, que siempre puede recibirlo (tabindex="-1").
    const visible =
      disparador && disparador !== document.body &&
      disparador.getClientRects().length > 0;
    if (visible) {
      disparador.focus();
    } else {
      enfocarContenido();
    }
  }, []);

  const agregar = useCallback((producto, cantidad = 1) => {
    if (!producto?.sku) return;
    const aSumar = limitar(cantidad);
    setItems((prev) => {
      if (prev.some((i) => i.sku === producto.sku)) {
        // Upsert por sku: se suma la cantidad, siempre tope 99 por línea.
        return prev.map((i) =>
          i.sku === producto.sku
            ? { ...i, cantidad: limitar(i.cantidad + aSumar) }
            : i
        );
      }
      return [
        ...prev,
        {
          sku: producto.sku,
          // Datos YA resueltos (los aporta quien agrega: tarjeta o detalle).
          nombre: producto.nombre ?? "",
          imagenUrl: producto.imagenUrl ?? "",
          precio: producto.precio ?? null,
          cantidad: aSumar,
        },
      ];
    });
  }, []);

  const actualizarCantidad = useCallback((sku, cantidad) => {
    const nueva = limitar(cantidad);
    setItems((prev) =>
      prev.map((i) => (i.sku === sku ? { ...i, cantidad: nueva } : i))
    );
  }, []);

  const quitar = useCallback(
    (sku) => setItems((prev) => prev.filter((i) => i.sku !== sku)),
    []
  );

  const vaciar = useCallback(() => setItems([]), []);

  // Reintenta el guardado fallido (si esta vez entra, limpia el error).
  const reintentar = useCallback(() => setError(escribirCarrito(items)), [items]);

  const { cantidadTotal, subtotal, preciosIncompletos } = useMemo(() => {
    let total = 0;
    let suma = 0;
    let incompletos = false;
    for (const item of items) {
      total += item.cantidad;
      if (precioValido(item.precio)) suma += Number(item.precio) * item.cantidad;
      else incompletos = true;
    }
    return { cantidadTotal: total, subtotal: suma, preciosIncompletos: incompletos };
  }, [items]);

  // Acciones agrupadas: todos los useCallback estables ⇒ este memo solo se
  // rompe cuando cambia `items` (reintentar).
  const acciones = useMemo(
    () => ({ abrir, cerrar, agregar, actualizarCantidad, quitar, vaciar, reintentar }),
    [abrir, cerrar, agregar, actualizarCantidad, quitar, vaciar, reintentar]
  );

  // Memoizado: navbar, drawer y checkout no se re-renderizan sin cambios.
  return useMemo(
    () => ({
      items,
      abierto,
      cargando: false, // localStorage es síncrono: hoy no hay carga real
      error,
      ...acciones,
      cantidadTotal,
      subtotal,
      preciosIncompletos,
    }),
    [items, abierto, error, acciones, cantidadTotal, subtotal, preciosIncompletos]
  );
}
