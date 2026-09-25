import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import Button from "../../../components/ui/Button";
import "./AdminLayout.css";

/**
 * Shell del panel de administración: panel lateral fijo a la izquierda +
 * contenido con <Outlet/>. Sustituye a la navbar pública.
 *
 * En pantallas ≤992px el panel lateral entra como cajón deslizante con
 * overlay y una hamburguesa en la barra superior del contenido. El estado
 * solo cambia dentro de handlers/listeners (patrón de Navbar.jsx): nunca
 * hay un setState "a pie" en el cuerpo de un useEffect.
 *
 * - Abrir: el foco entra al primer enlace del panel.
 * - Escape: cierra y devuelve el foco a la hamburguesa.
 * - Clic fuera (overlay incluido): cierra y devuelve el foco si estaba dentro.
 * - Navegar desde el panel: cierra y mueve el foco a #contenido.
 */
export default function AdminLayout() {
  const [panelAbierto, setPanelAbierto] = useState(false);
  const panelRef = useRef(null);
  const botonRef = useRef(null);

  const cerrarPanel = () => setPanelAbierto(false);

  // Escape cierra y devuelve el foco a la hamburguesa; el clic fuera del
  // panel (el overlay es el caso habitual) lo cierra y, si el foco estaba
  // dentro, lo devuelve también (ver efecto de foco de abajo).
  useEffect(() => {
    if (!panelAbierto) return undefined;

    const alPulsarEscape = (evento) => {
      if (evento.key !== "Escape") return;
      setPanelAbierto(false);
      botonRef.current?.focus();
    };
    const alPulsarFuera = (evento) => {
      // La hamburguesa alterna: si este listener la cerrara, el `click`
      // posterior la volvería a abrir y el botón parecería roto.
      if (botonRef.current?.contains(evento.target)) return;
      if (panelRef.current && !panelRef.current.contains(evento.target)) {
        // Si el foco está dentro del cajón, el mousedown lo expulsaría a
        // <body> al ocultarse (visibility:hidden): se cancela el comportamiento
        // por defecto para que el efecto de cierre lo devuelva a la hamburguesa.
        if (panelRef.current.contains(document.activeElement)) {
          evento.preventDefault();
        }
        setPanelAbierto(false);
      }
    };

    document.addEventListener("keydown", alPulsarEscape);
    document.addEventListener("mousedown", alPulsarFuera);
    return () => {
      document.removeEventListener("keydown", alPulsarEscape);
      document.removeEventListener("mousedown", alPulsarFuera);
    };
  }, [panelAbierto]);

  // Al abrir, el foco entra al primer enlace del panel lateral
  // (patrón menu-button: Escape lo devuelve al botón). Al cerrar, si el foco
  // quedó dentro del cajón recién ocultado, se devuelve a la hamburguesa:
  // si no, visibility:hidden lo expulsaría a <body> y el siguiente Tab
  // empezaría en el documento. La navegación mueve el foco a #contenido y
  // Escape lo lleva a la hamburguesa en su handler, así que en esos dos
  // casos esta rama no hace nada.
  useEffect(() => {
    if (panelAbierto) {
      panelRef.current
        ?.querySelector("a[href], button:not([disabled])")
        ?.focus();
      return;
    }
    if (panelRef.current?.contains(document.activeElement)) {
      botonRef.current?.focus();
    }
  }, [panelAbierto]);

  return (
    <div className="admin-layout">
      <AdminSidebar
        isOpen={panelAbierto}
        onClose={cerrarPanel}
        panelRef={panelRef}
      />

      <main id="contenido" tabIndex={-1} className="admin-layout__contenido">
        {/* Solo existe en móvil (≤992px): la barra se oculta en escritorio. */}
        <div className="admin-layout__barra">
          <Button
            ref={botonRef}
            variant="fantasma"
            size="sm"
            className="admin-layout__boton-menu"
            icon={<Menu className="icono" aria-hidden="true" />}
            aria-expanded={panelAbierto}
            aria-controls="panel-lateral"
            aria-label={panelAbierto ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setPanelAbierto((abierto) => !abierto)}
          />
        </div>
        <Outlet />
      </main>

      {/* Capa de fondo del cajón móvil: click/tap cierra el panel. */}
      {panelAbierto && (
        <div
          className="admin-layout__overlay"
          onClick={cerrarPanel}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
