import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SeccionLegal from "../components/SeccionLegal";
import "./informativas.css";

const SECCIONES = [
  {
    id: "objeto",
    titulo: "1. Objeto",
    parrafos: [
      "Estos términos regulan el uso del sitio calisat.cl y la compra de equipamiento de calistenia ofrecido por Calisat SpA (en adelante, «Calisat»), con domicilio en Puerto Montt, Chile.",
      "Al crear una cuenta o realizar un pedido declaras haber leído y aceptado estas condiciones. Si no estás de acuerdo, no uses el sitio.",
    ],
  },
  {
    id: "precios",
    titulo: "2. Precios y pagos",
    parrafos: [
      "Todos los precios se expresan en pesos chilenos (CLP) e incluyen IVA. El precio que ves en el catálogo es el precio final antes del envío, que se calcula al indicar tu comuna.",
      "Los medios de pago aceptados se muestran en el checkout; el pedido se considera confirmado recién cuando el pago es autorizado por el proveedor.",
    ],
  },
  {
    id: "envios",
    titulo: "3. Envíos y plazos",
    parrafos: [
      "Despachamos a todo Chile continental. Los plazos estimados son de 2 a 5 días hábiles para Santiago y de 3 a 8 días hábiles para regiones, contados desde la confirmación del pago.",
      "Si un producto viene en preventa, el plazo indicado en su ficha prevalece sobre este general.",
    ],
  },
  {
    id: "devoluciones",
    titulo: "4. Devoluciones y cambios",
    parrafos: [
      "Puedes ejercer el derecho de retracto dentro de los 10 días siguientes a la recepción, siempre que el producto se devuelva sin usar, en su empaque original y con todos sus accesorios.",
      "Si el producto llega defectuoso o no corresponde a lo pedido, asumimos el envío de retorno y te reembolsamos en un plazo máximo de 10 días hábiles.",
    ],
  },
  {
    id: "garantia",
    titulo: "5. Garantía",
    parrafos: [
      "El equipamiento cuenta con la garantía legal de la Ley N.º 19.496 por defectos de fabricación. El desgaste normal por uso intensivo y el mal montaje en estructuras no aprobadas no están cubiertos.",
    ],
  },
  {
    id: "ley",
    titulo: "6. Ley aplicable y jurisdicción",
    parrafos: [
      "Estas condiciones se rigen por la legislación chilena. Cualquier controversia se someterá a los tribunales competentes de Santiago, sin perjuicio de los derechos que la ley te otorga como consumidor.",
    ],
  },
];

/**
 * Ruta /terminos · Términos y Condiciones (placeholder redactable).
 * Secciones anclables vía SeccionLegal + document.title propio para que
 * la pestaña identifique la página desde la navbar o un marcador.
 */
export default function TerminosPage() {
  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = "Términos y Condiciones · Calisat";
    return () => {
      document.title = tituloAnterior;
    };
  }, []);

  return (
    <div className="pagina">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Términos y Condiciones</h1>
            <p className="pagina__descripcion">
              Última actualización: 30 de septiembre de 2026. Aplican a todas
              las compras realizadas en calisat.cl.
            </p>
          </div>
        </header>

        <article className="legal">
          {SECCIONES.map(({ id, titulo, parrafos }) => (
            <SeccionLegal key={id} id={id} titulo={titulo}>
              {parrafos.map((parrafo) => (
                <p key={parrafo}>{parrafo}</p>
              ))}
            </SeccionLegal>
          ))}
        </article>

        <div className="legal__acciones">
          <Link to="/" className="boton boton--secundario">
            <ArrowLeft className="icono icono--inicio" aria-hidden="true" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
