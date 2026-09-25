import { Link } from "react-router-dom";
import { Circle, Columns2, Waves, Hand } from "lucide-react";
import Card from "../../components/ui/Card";
import "./HomePage.css";

const CATEGORIAS = [
  {
    nombre: "Anillas",
    descripcion: "Para muscle-up y dominadas",
    IconoCategoria: Circle,
  },
  {
    nombre: "Paralelas",
    descripcion: "Para handstand y planche",
    IconoCategoria: Columns2,
  },
  {
    nombre: "Bandas",
    descripcion: "Resistencia y asistencia",
    IconoCategoria: Waves,
  },
  {
    nombre: "Magnesia",
    descripcion: "Agarre perfecto",
    IconoCategoria: Hand,
  },
];

export default function HomePage() {
  return (
    <div className="inicio">
      <section className="hero">
        <div className="contenedor hero__contenido">
          <h1 className="hero__titulo">
            Equipamiento de{" "}
            <span className="hero__destaque">Calistenia</span>
          </h1>
          <p className="hero__subtitulo">
            Anillas, paralelas para handstand, bandas y magnesia para dominar
            el muscle-up.
          </p>
          <Link to="/productos" className="boton boton--primario boton--lg">
            Ver Catálogo
          </Link>
        </div>
      </section>

      <section className="categorias">
        <div className="contenedor">
          <h2 className="categorias__titulo">Categorías</h2>
          <div className="categorias__grid">
            {CATEGORIAS.map(({ nombre, descripcion, IconoCategoria }) => (
              <Card key={nombre} columna className="categoria">
                <span className="categoria__icono">
                  <IconoCategoria
                    className="icono icono--lg"
                    aria-hidden="true"
                  />
                </span>
                <h3 className="categoria__nombre">{nombre}</h3>
                <p className="categoria__descripcion">{descripcion}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
