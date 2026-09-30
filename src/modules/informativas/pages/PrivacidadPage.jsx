import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SeccionLegal from "../components/SeccionLegal";
import "./informativas.css";

const SECCIONES = [
  {
    id: "responsable",
    titulo: "1. Responsable del tratamiento",
    parrafos: [
      "Calisat SpA, con domicilio en Santiago de Chile, es responsable de los datos personales que recabas en este sitio. Puedes contactarnos en hola@calisat.cl para cualquier consulta sobre esta política.",
    ],
  },
  {
    id: "datos",
    titulo: "2. Datos que recopilamos",
    parrafos: [
      "Datos de cuenta (nombre, email y rol) al iniciar sesión con Microsoft o AWS Cognito, y datos de envío (dirección, comuna, teléfono) al concretar un pedido.",
      "Datos de navegación básicos (IP, tipo de dispositivo y páginas visitadas) necesarios para el funcionamiento y la seguridad del sitio.",
    ],
  },
  {
    id: "finalidades",
    titulo: "3. Para qué los usamos",
    parrafos: [
      "Para procesar pedidos, gestionar tu cuenta, enviar mensajes relacionados con la compra y cumplir con las obligaciones fiscales y de protección al consumidor.",
      "No vendemos ni cedemos tus datos a terceros con fines comerciales. Solo se comparten con operadores logísticos y de pago cuando es imprescindible para entregarte el producto.",
    ],
  },
  {
    id: "derechos",
    titulo: "4. Tus derechos",
    parrafos: [
      "Puedes solicitar acceso, rectificación, actualización o supresión de tus datos, así como oponerte a su uso, conforme a la Ley N.º 19.628 sobre Protección de la Vida Privada.",
      "Escríbenos a hola@calisat.cl y responderemos dentro de 10 días hábiles.",
    ],
  },
  {
    id: "conservacion",
    titulo: "5. Conservación y seguridad",
    parrafos: [
      "Conservamos la información mientras exista relación comercial y los plazos que exige la ley. Aplicamos controles de acceso y cifrado en tránsito para reducir el riesgo de incidentes.",
    ],
  },
  {
    id: "cookies",
    titulo: "6. Cookies",
    parrafos: [
      "Usamos cookies propias para mantener la sesión iniciada y recordar preferencias. Puedes bloquearlas desde tu navegador; algunas funciones (como el carrito o el perfil) dejarán de operar correctamente.",
    ],
  },
];

/**
 * Ruta /privacidad · Política de Privacidad (placeholder redactable).
 * Mismo patrón que TerminosPage: secciones anclables + document.title.
 */
export default function PrivacidadPage() {
  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = "Política de Privacidad · Calisat";
    return () => {
      document.title = tituloAnterior;
    };
  }, []);

  return (
    <div className="pagina">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Política de Privacidad</h1>
            <p className="pagina__descripcion">
              Cómo recopilamos, usamos y protegemos tus datos personales en
              calisat.cl.
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
