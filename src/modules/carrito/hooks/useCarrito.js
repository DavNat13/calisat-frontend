import { useContext } from "react";
import { carritoContexto } from "../context/carritoContexto";

/** Valor de rescate para producción: un carrito inerte antes que tumbar la app. */
const SIN_PROVEEDOR = {
  items: [],
  abierto: false,
  cargando: false,
  error: null,
  abrir() {},
  cerrar() {},
  agregar() {},
  actualizarCantidad() {},
  quitar() {},
  vaciar() {},
  reintentar() {},
  cantidadTotal: 0,
  subtotal: 0,
  preciosIncompletos: false,
};

/**
 * Consumidor del carrito (navbar, drawer, checkout…).
 *
 * El guard es deliberado: usarlo fuera de <CarritoProvider> es un error de
 * integración, y en desarrollo conviene fallar ruidosa y temprana con un
 * mensaje que diga exactamente qué falta envolver.
 */
export default function useCarrito() {
  const contexto = useContext(carritoContexto);

  if (!contexto) {
    if (import.meta.env.DEV) {
      throw new Error(
        "useCarrito() se usó fuera de <CarritoProvider>. Envuelve <App/> (o la rama que lo necesita) con el proveedor del carrito."
      );
    }
    return SIN_PROVEEDOR;
  }

  return contexto;
}
