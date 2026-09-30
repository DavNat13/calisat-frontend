import Card from "../../../components/ui/Card";
import { BENEFICIOS } from "../constantes/homeDatos";
import "./Beneficios.css";

/**
 * Sección "Beneficios" de la home.
 *
 * Cada ítem es una Card en modo columna (misma altura en la rejilla) con su
 * icono de lucide sobre el chip de marca. El copy sale de `homeDatos.js`
 * para que la franja de confianza del Hero y esta sección compartan una
 * única fuente de verdad.
 */
export default function Beneficios() {
  return (
    <section className="beneficios" aria-labelledby="beneficios-titulo">
      <div className="contenedor">
        <h2 className="beneficios__titulo" id="beneficios-titulo">
          Por qué entrenar con Calisat
        </h2>

        <div className="beneficios__grid">
          {BENEFICIOS.map(({ titulo, texto, Icono }) => (
            <Card key={titulo} columna className="beneficio">
              <span className="beneficio__icono">
                <Icono className="icono icono--lg" aria-hidden="true" />
              </span>
              <h3 className="beneficio__titulo">{titulo}</h3>
              <p className="beneficio__texto">{texto}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
