import { Link } from "react-router-dom";
import "./Footer.css";

// Columnas de enlaces: la primera (marca) es estática y se renderiza aparte.
const COLUMNAS = [
  {
    id: "navegacion",
    titulo: "Navegación",
    enlaces: [
      { etiqueta: "Catálogo", ruta: "/productos" },
      { etiqueta: "Nosotros", ruta: "/nosotros" },
      { etiqueta: "Contacto", ruta: "/contacto" },
    ],
  },
  {
    id: "cuenta",
    titulo: "Cuenta",
    enlaces: [
      { etiqueta: "Mi perfil", ruta: "/perfil" },
      { etiqueta: "Iniciar sesión", ruta: "/login" },
    ],
  },
  {
    id: "legal",
    titulo: "Legal",
    enlaces: [
      { etiqueta: "Términos y Condiciones", ruta: "/terminos" },
      { etiqueta: "Política de Privacidad", ruta: "/privacidad" },
    ],
  },
];

/**
 * Pie de página del shell público (se monta FUERA de <main id="contenido">:
 * el skip-link no debe atravesarlo y el landmark role="contentinfo" debe
 * ser hermano de la región principal, no su hijo).
 *
 * Cada grupo de enlaces lleva su propio <nav aria-label> para que un screen
 * reader distinga la navegación del pie de la de la navbar.
 */
export default function Footer() {
  return (
    <footer role="contentinfo" className="pie-pagina">
      <div className="contenedor pie-pagina__rejilla">
        <div className="pie-pagina__marca">
          <p className="pie-pagina__logo">Calisat</p>
          <p className="pie-pagina__tagline">
            Equipamiento de calistenia en Chile.
          </p>
        </div>

        {COLUMNAS.map(({ id, titulo, enlaces }) => (
          <div key={id} className="pie-pagina__columna">
            <h2 className="pie-pagina__titulo">{titulo}</h2>
            <nav aria-label={`Enlaces de ${titulo}`}>
              <ul className="pie-pagina__lista">
                {enlaces.map(({ etiqueta, ruta }) => (
                  <li key={ruta}>
                    <Link className="pie-pagina__enlace" to={ruta}>
                      {etiqueta}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        ))}
      </div>

      <div className="contenedor pie-pagina__legal">
        <p className="pie-pagina__copy">
          © {new Date().getFullYear()} Calisat · Puerto Montt, Chile
        </p>
      </div>
    </footer>
  );
}
