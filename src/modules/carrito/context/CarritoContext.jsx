import { useMemo } from "react";
import { carritoContexto } from "./carritoContexto";
import useCarritoEstado from "../hooks/useCarritoEstado";
import useCarritoRemoto from "../hooks/useCarritoRemoto";

/**
 * Proveedor del carrito: arma el estado con useCarritoEstado(), lo reparte
 * por carritoContexto a navbar, drawer, checkout y cualquier consumidor.
 *
 * `useCarritoRemoto` sincroniza ese estado con `ms-carrito` cuando hay
 * sesión (hidratación al entrar y envío de diffs al cambiar); sin sesión se
 * queda en localStorage, igual que siempre.
 *
 * El valor se memoiza porque el carrito es "alto ruido": sin esto, cada
 * tecleo en el stepper regeneraría el objeto y re-renderizaría TODOS los
 * consumidores (navbar + panel + página) aunque los datos no hubieran
 * cambiado. El hook ya estabiliza su retorno; este memo es la garantía del
 * propio proveedor.
 *
 * Va dentro de <BrowserRouter>: varios de sus consumidores navegan
 * (useNavigate / <Link>).
 */
export default function CarritoProvider({ children }) {
  const estado = useCarritoEstado();
  useCarritoRemoto({ items: estado.items, sustituir: estado.sustituir });
  const valor = useMemo(() => estado, [estado]);

  return (
    <carritoContexto.Provider value={valor}>
      {children}
    </carritoContexto.Provider>
  );
}
