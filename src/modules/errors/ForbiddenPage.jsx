import { Link } from "react-router-dom";
import "./ForbiddenPage.css";

export default function ForbiddenPage() {
  return (
    <div className="pagina pagina--centrada">
      <div className="contenedor">
        <div className="error-403">
          <p className="error-403__codigo">403</p>
          <h1 className="error-403__titulo">Acceso denegado</h1>
          <p className="error-403__texto">
            No tienes permisos para acceder a esta sección. Verifica que tu cuenta
            tenga el rol requerido.
          </p>
          <Link to="/" className="boton boton--primario">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
