import { Link } from "react-router-dom";
import { BicepsFlexed } from "lucide-react";
import { BENEFICIOS } from "../constantes/homeDatos";
import "./Hero.css";

// Franja de confianza: los 3 primeros beneficios en versión compacta
// (icono + título), para no repetir el copy largo de la sección Beneficios.
const CONFIANZA = BENEFICIOS.slice(0, 3);

/**
 * Cabecera de la home.
 *
 * Dos CTAs: "Ver Catálogo" (primario, la acción que nos importa) y
 * "Conócenos" (secundario). Van como <Link> con las clases de la primitiva
 * .boton en vez de <button onClick=navigate>: son navegación, así que el
 * clic medio, "abrir en pestaña nueva" y el contexto del navegador siguen
 * funcionando.
 *
 * El bloque visual es decorado con gradiente de marca (aria-hidden) en lugar
 * de la foto hero.png: ese PNG es una losa morada y su morado choca con la
 * paleta amarillo/negra del sistema.
 */
export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-titulo">
      <div className="contenedor hero__grid">
        <div className="hero__contenido">
          <h1 className="hero__titulo" id="hero-titulo">
            Equipamiento de{" "}
            <span className="hero__destaque">Calistenia</span>
          </h1>
          <p className="hero__subtitulo">
            Anillas, paralelas para handstand, bandas y magnesia para dominar
            el muscle-up.
          </p>

          <div className="hero__acciones">
            <Link to="/productos" className="boton boton--primario boton--lg">
              Ver Catálogo
            </Link>
            <Link to="/nosotros" className="boton boton--secundario boton--lg">
              Conócenos
            </Link>
          </div>

          <ul className="hero__confianza">
            {CONFIANZA.map(({ titulo, Icono }) => (
              <li className="hero__confianza-item" key={titulo}>
                <Icono className="icono icono--sm" aria-hidden="true" />
                <span>{titulo}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <span className="hero__aro hero__aro--grande" />
          <span className="hero__aro hero__aro--chico" />
          <BicepsFlexed className="hero__dibujo" />
        </div>
      </div>
    </section>
  );
}
