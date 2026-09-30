import { useState } from "react";
import { ImageOff } from "lucide-react";
import "./GaleriaProducto.css";

/**
 * Galería de la ficha de producto.
 *
 * - La imagen vive en un visor cuadrado con `object-fit: contain`: se ve
 *   COMPLETA, sin recortes ni deformarse, con el fondo ya reservado (la
 *   caja no salta al cargar).
 * - Miniaturas solo si hay más de una imagen; la activa lleva aria-current
 *   para que el estado también se pueda leer y recorrer con teclado.
 * - Sin imagen: marcador ImageOff + texto explícito (nunca un hueco en
 *   blanco que parezca un error de carga).
 */
export default function GaleriaProducto({ producto }) {
  const [activa, setActiva] = useState(0);

  // Acepta `imagenes` (lista nueva) o el clásico `imagenUrl` de la tarjeta.
  const fuente = producto.imagenes?.length
    ? producto.imagenes
    : [producto.imagenUrl];
  const imagenes = fuente.filter(Boolean);
  const imagenActual = imagenes[activa];

  return (
    <div className="detalle__galeria">
      <div className="detalle__visor">
        {imagenActual ? (
          <img
            className="detalle__imagen"
            src={imagenActual}
            alt={producto.nombre}
            width={800}
            height={800}
            decoding="async"
          />
        ) : (
          <p className="detalle__sin-imagen">
            <ImageOff className="icono icono--xl" aria-hidden="true" />
            Imagen no disponible
          </p>
        )}
      </div>

      {imagenes.length > 1 && (
        <ul className="detalle__miniaturas">
          {imagenes.map((src, i) => (
            <li key={`${src}-${i}`}>
              <button
                type="button"
                className="detalle__miniatura"
                aria-current={i === activa}
                aria-label={`Ver imagen ${i + 1} de ${imagenes.length}`}
                onClick={() => setActiva(i)}
              >
                <img
                  src={src}
                  alt=""
                  width={72}
                  height={72}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
