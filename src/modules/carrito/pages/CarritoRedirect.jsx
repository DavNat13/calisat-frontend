import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCarrito from "../hooks/useCarrito";

/**
 * Ruta /carrito: no existe una "página de carrito", sino un PANEL LATERAL.
 *
 * Se llega aquí por un enlace guardado o por una URL escrita a mano: al
 * montar se abre el drawer y se reemplaza la ruta por "/", de modo que el
 * usuario queda en su página con el carrito desplegado y el historial no
 * acumula un paso intermedio (replace:true) que rompería el botón "atrás".
 *
 * Renderiza null: todo el peso visual lo aporta <CarritoDrawer/>, que vive
 * en PublicLayout (fuera de <main>) y que por tanto NO se desmonta al
 * cambiar de ruta.
 */
export default function CarritoRedirect() {
  const { abrir } = useCarrito();
  const navegar = useNavigate();

  useEffect(() => {
    abrir();
    navegar("/", { replace: true });
  }, [abrir, navegar]);

  return null;
}
