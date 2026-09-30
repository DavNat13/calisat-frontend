import { useState } from "react";
import { Send, CircleCheck } from "lucide-react";
import Input from "../../../components/ui/Input";
import {
  ASUNTOS,
  DATOS_CONTACTO,
  VALORES_INICIALES,
  validarContacto,
} from "../contacto";
import "./contacto.css";

/**
 * Ruta /contacto · dos columnas: datos de contacto con iconos y formulario
 * SOLO UI (validación en cliente + estado de éxito accesible). No hace fetch:
 * la constante y el validador viven en src/modules/informativas/contacto.js.
 */
export default function ContactoPage() {
  const [valores, setValores] = useState(VALORES_INICIALES);
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);

  const cambiar = (campo) => (evento) => {
    const { value } = evento.target;
    setValores((prev) => ({ ...prev, [campo]: value }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const fallos = validarContacto(valores);
    setErrores(fallos);
    if (Object.keys(fallos).length > 0) return;
    // TODO(fase posterior): POST del mensaje al backend de contacto.
    setEnviado(true);
  };

  return (
    <div className="pagina">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Contacto</h1>
            <p className="pagina__descripcion">
              Escríbenos y te respondemos dentro de un día hábil.
            </p>
          </div>
        </header>

        <div className="contacto__rejilla">
          <section className="contacto__datos" aria-label="Datos de contacto">
            {DATOS_CONTACTO.map(({ id, IconoDato, titulo, valor }) => (
              <div className="contacto__dato" key={id}>
                <span className="contacto__dato-icono" aria-hidden="true">
                  <IconoDato className="icono" />
                </span>
                <div>
                  <p className="contacto__dato-titulo">{titulo}</p>
                  <p>{valor}</p>
                </div>
              </div>
            ))}
          </section>

          {enviado ? (
            <div className="contacto__exito" role="status">
              <CircleCheck className="icono" aria-hidden="true" />
              <div>
                <p className="contacto__dato-titulo">Mensaje enviado</p>
                <p>
                  Gracias, {valores.nombre}. Te responderemos a{" "}
                  {valores.email} dentro de 1 día hábil.
                </p>
                <button
                  type="button"
                  className="boton boton--secundario boton--sm"
                  onClick={() => {
                    setValores(VALORES_INICIALES);
                    setEnviado(false);
                  }}
                >
                  Enviar otro mensaje
                </button>
              </div>
            </div>
          ) : (
            <form className="contacto__form" onSubmit={enviar} noValidate>
              <Input
                label="Nombre"
                name="nombre"
                value={valores.nombre}
                onChange={cambiar("nombre")}
                error={errores.nombre}
                autoComplete="name"
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={valores.email}
                onChange={cambiar("email")}
                error={errores.email}
                autoComplete="email"
              />
              <div className="campo">
                <label className="campo__label" htmlFor="contacto-asunto">Asunto</label>
                <select
                  id="contacto-asunto"
                  className="campo__control"
                  name="asunto"
                  value={valores.asunto}
                  onChange={cambiar("asunto")}
                  aria-invalid={errores.asunto ? "true" : undefined}
                  aria-describedby={errores.asunto ? "contacto-asunto-error" : undefined}
                >
                  <option value="">Selecciona una opción</option>
                  {ASUNTOS.map((asunto) => (
                    <option key={asunto} value={asunto}>{asunto}</option>
                  ))}
                </select>
                {errores.asunto && (
                  <p className="campo__error campo__estado" id="contacto-asunto-error" role="alert">
                    {errores.asunto}
                  </p>
                )}
              </div>
              <Input
                label="Mensaje"
                name="mensaje"
                multiline
                rows={5}
                value={valores.mensaje}
                onChange={cambiar("mensaje")}
                error={errores.mensaje}
              />
              <button type="submit" className="boton boton--primario">
                <Send className="icono icono--inicio" aria-hidden="true" />
                Enviar mensaje
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
