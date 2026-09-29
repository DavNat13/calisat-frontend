import Button from "../../../components/ui/Button";
import { ACCIONES, textoSesion } from "./loginCopy";
import "./LoginSessionBanner.css";

/**
 * Banner de sesión activa (se pinta sobre el h2 de la sección de opciones).
 * role="status" va en el <p>: la región viva contiene SOLO texto, para no
 * meter contenido interactivo dentro de un live region.
 * Si no hay proveedor autenticado no se pinta nada (return null).
 */
export default function LoginSessionBanner({
  proveedor,
  identificador,
  onCerrarSesion,
  cerrando = false,
}) {
  if (!proveedor) return null;

  return (
    <div className="sesion-activa">
      <p className="sesion-activa__texto" role="status">
        {textoSesion(proveedor, identificador)}
      </p>
      <Button
        variant="secundario"
        size="sm"
        className="sesion-activa__accion"
        onClick={onCerrarSesion}
        disabled={cerrando}
        aria-busy={cerrando}
      >
        {cerrando ? ACCIONES.cerrandoSesion : ACCIONES.cerrarSesion}
      </Button>
    </div>
  );
}
