import { useMemo } from "react";
import { carritoContexto } from "./carritoContexto";
import useCarritoEstado from "../hooks/useCarritoEstado";

/**
 * Proveedor del carrito: arma el estado con useCarritoEstado() y lo reparte
 * por carritoContexto a navbar, drawer, checkout y cualquier consumidor.
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
  const valor = useMemo(() => estado, [estado]);

  return (
    <carritoContexto.Provider value={valor}>
      {children}
    </carritoContexto.Provider>
  );
}
