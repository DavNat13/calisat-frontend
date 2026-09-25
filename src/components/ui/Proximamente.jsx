import { Link } from "react-router-dom";
import Badge from "./Badge";
import "./Proximamente.css";

/**
 * Pantalla de estado "Próximamente" (páginas aún no implementadas).
 * Componente compartido: Carrito y Checkout usan exactamente el mismo
 * marcado y estilo (antes cada página duplicaba su propio CSS).
 *
 * Composición: .pagina .pagina--centrada > .contenedor > .proximamente
 * (primitivas de página en src/styles/paginas.css).
 *
 * - Icono:  componente de lucide-react (p. ej. ShoppingCart)
 * - titulo: h1 de la página
 * - texto:  descripción breve del estado
 * - accion: { etiqueta, ruta } del CTA secundario (por defecto catálogo)
 */
export default function Proximamente({
  Icono,
  titulo,
  texto,
  accion = { etiqueta: "Ver catálogo", ruta: "/productos" },
}) {
  return (
    <div className="pagina pagina--centrada">
      <div className="contenedor">
        <div className="proximamente">
          <span className="proximamente__icono" aria-hidden="true">
            <Icono className="icono icono--xl" />
          </span>
          <Badge tone="amarillo">Próximamente</Badge>
          <h1 className="pagina__titulo">{titulo}</h1>
          <p className="pagina__descripcion proximamente__texto">{texto}</p>
          <Link to={accion.ruta} className="boton boton--secundario">
            {accion.etiqueta}
          </Link>
        </div>
      </div>
    </div>
  );
}
