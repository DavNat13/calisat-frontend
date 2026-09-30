import { Link } from "react-router-dom";
import { ShieldCheck, HeartHandshake, MapPin } from "lucide-react";
import Card from "../../../components/ui/Card";
import "./informativas.css";

const VALORES = [
  {
    id: "seguridad",
    IconoValor: ShieldCheck,
    titulo: "Seguridad primero",
    texto: "Cada anilla, paralela y banda se verifica antes de salir de bodega: si no aguanta tu peso, no llega a tu casa.",
  },
  {
    id: "comunidad",
    IconoValor: HeartHandshake,
    titulo: "Comunidad calisténica",
    texto: "Nacimos entrenando en plazas y parques. Diseñamos para el muscle-up real, no para el catálogo.",
  },
  {
    id: "chile",
    IconoValor: MapPin,
    titulo: "Hecho para Chile",
    texto: "Precios en pesos, despacho a todo el país y soporte humano en español, sin tickets eternos.",
  },
];

/**
 * Ruta /nosotros · página informativa de la marca.
 * Composición: primitivas .pagina/.contenedor + tarjetas del kit (Card
 * con el modificador .tarjeta--columna) e iconos de lucide-react.
 */
export default function NosotrosPage() {
  return (
    <div className="pagina">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Sobre Calisat</h1>
            <p className="pagina__descripcion">
              Equipamiento de calistenia para quienes entrenan en plazas,
              gimnasios y casas de todo Chile.
            </p>
          </div>
        </header>

        <section aria-labelledby="mision">
          <h2 className="nosotros__subtitulo" id="mision">
            Nuestra misión
          </h2>
          <p className="nosotros__texto">
            Calisat existe para que nadie tenga que postergar su entrenamiento
            por falta de equipo. Seleccionamos y probamos anillas, paralelas
            para handstand, bandas y magnesia con un criterio simple: que
            resistan el uso diario de quien progreso en serio.
          </p>
          <p className="nosotros__texto">
            Trabajamos con talleres y proveedores locales cuando se puede, y
            publicamos precios finales en pesos chilenos para que compares sin
            sorpresas al final del checkout.
          </p>
        </section>

        <section aria-labelledby="valores">
          <h2 className="nosotros__subtitulo" id="valores">
            Nuestros valores
          </h2>
          <div className="nosotros__rejilla">
            {VALORES.map(({ id, IconoValor, titulo, texto }) => (
              <Card key={id} columna className="valor">
                <span className="valor__icono" aria-hidden="true">
                  <IconoValor className="icono" />
                </span>
                <h3 className="valor__titulo">{titulo}</h3>
                <p>{texto}</p>
              </Card>
            ))}
          </div>
        </section>

        <div className="pagina__acciones pagina__acciones--nosotros">
          <Link to="/contacto" className="boton boton--primario">
            Habla con nosotros
          </Link>
          <Link to="/productos" className="boton boton--secundario">
            Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
