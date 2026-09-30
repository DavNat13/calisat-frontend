import { createContext } from "react";

/**
 * Contexto del carrito de compras.
 *
 * Vive en un archivo `.js` (sin JSX) a propósito: la regla
 * react-refresh/only-export-components exige que los `.jsx` exporten
 * únicamente componentes, así que el createContext() se declara aquí y el
 * <CarritoProvider> (CarritoContext.jsx) es quien lo rellena.
 *
 * El valor por defecto `null` es deliberado: permite que useCarrito()
 * distinga "usado fuera del provider" y falle con un error claro en
 * desarrollo en lugar de romper en silencio con undefined.
 */
export const carritoContexto = createContext(null);
