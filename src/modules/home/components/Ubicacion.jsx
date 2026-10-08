import { DIRECCION_CONTACTO, HORARIO } from "../../informativas/contacto";

const MAPA_SRC =
  "https://www.google.com/maps?q=Puerto+Montt,+Los+Lagos,+Chile&output=embed";

/**
 * Ubicación de la tienda en Puerto Montt: dirección, horario y mapa embebido
 * de Google Maps (sin API key, con `?output=embed`).
 *
 * El iframe necesita `frame-src` de Google en la CSP de `nginx.conf`.
 */
export default function Ubicacion() {
  return (
    <section className="ubicacion" aria-labelledby="ubicacion-titulo">
      <div className="contenedor ubicacion__grid">
        <div className="ubicacion__texto">
          <h2 className="ubicacion__titulo" id="ubicacion-titulo">
            Te esperamos en Puerto Montt
          </h2>
          <p className="ubicacion__descripcion">
            Nuestra tienda y centro de despacho están en el sur de Chile, a
            orillas del canal de Chacao. Enviamos a todo el país con las mismas
            tarifas que ves en el checkout.
          </p>
          <dl className="ubicacion__datos">
            <div>
              <dt>Dirección</dt>
              <dd>{DIRECCION_CONTACTO}</dd>
            </div>
            <div>
              <dt>Horario</dt>
              <dd>{HORARIO}</dd>
            </div>
          </dl>
        </div>
        <div className="ubicacion__mapa">
          <iframe
            title="Mapa de Calisat en Puerto Montt"
            src={MAPA_SRC}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
