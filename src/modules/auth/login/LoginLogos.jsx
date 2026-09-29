/**
 * Logotipos de los proveedores de identidad para las tarjetas de /login.
 *
 * No existe un paquete de marcas en el proyecto y `lucide-react` no incluye
 * logotipos de marca, así que se dibujan aquí en SVG inline:
 *  - Microsoft: las cuatro cuadrículas clásicas con sus colores de marca.
 *  - AWS: el wordmark "aws" en el navy de Amazon + la sonrisa en naranja.
 *
 * Los colores de marca son identidad del tercero, no tokens del design
 * system: NO sustituyen a los tokens para fondos, texto ni estados.
 * Todo el bloque va envuelto en `aria-hidden` por el consumidor: el nombre
 * accesible lo aporta el título de la tarjeta.
 */

/** Cuatro cuadrículas de Microsoft (23×23, gap de 3px). */
export function LogoMicrosoft() {
  return (
    <svg viewBox="0 0 23 23" width="24" height="24" focusable="false">
      <rect x="0" y="0" width="10" height="10" fill="#f25022" />
      <rect x="13" y="0" width="10" height="10" fill="#7fba00" />
      <rect x="0" y="13" width="10" height="10" fill="#00a4ef" />
      <rect x="13" y="13" width="10" height="10" fill="#ffb900" />
    </svg>
  );
}

/** Wordmark "aws" + sonrisa con punta de flecha (naranja Amazon). */
export function LogoAws() {
  return (
    <span className="logotipo-aws">
      <span className="logotipo-aws__texto">aws</span>
      <svg
        className="logotipo-aws__sonrisa"
        viewBox="0 0 72 16"
        focusable="false"
      >
        <path
          d="M4 5c18 13 46 13 60 2"
          fill="none"
          stroke="#ff9900"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path d="M70 0 58 1.5 63.5 10.5Z" fill="#ff9900" />
      </svg>
    </span>
  );
}
