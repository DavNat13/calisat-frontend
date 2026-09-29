import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { ACCIONES } from "./loginCopy";
import "./LoginOptionCard.css";

/**
 * Tarjeta de opción de acceso: logotipo + "Iniciar sesión con …" + acciones.
 *
 * Props: { id, Logotipo, titulo, descripcion,
 *          accion{etiqueta,onClick,loading},
 *          accionSecundaria?{etiqueta,onClick,loading}, nivelTitulo?=2 }.
 * El artículo se enlaza con su título vía aria-labelledby="{id}-titulo".
 * El logotipo es decorativo (aria-hidden): el nombre accesible lo aporta
 * el título, que es literalmente el nombre del proveedor.
 */
export default function LoginOptionCard({
  id,
  Logotipo,
  titulo,
  descripcion,
  accion,
  accionSecundaria,
  nivelTitulo = 2,
}) {
  const Titulo = `h${nivelTitulo}`;
  const cargando = Boolean(accion.loading);
  const registrando = Boolean(accionSecundaria?.loading);

  return (
    <Card
      as="article"
      hover
      className={"opcion-acceso opcion-acceso--" + id}
      aria-labelledby={`${id}-titulo`}
    >
      <span className="opcion-acceso__logo" aria-hidden="true">
        <Logotipo />
      </span>

      <div className="opcion-acceso__cabecera">
        <Titulo className="opcion-acceso__titulo" id={`${id}-titulo`}>
          {titulo}
        </Titulo>
        <p className="opcion-acceso__descripcion">{descripcion}</p>
      </div>

      <div className="opcion-acceso__acciones">
        <Button
          variant="primario"
          size="lg"
          className="boton--bloque"
          onClick={accion.onClick}
          disabled={cargando}
          aria-busy={cargando}
        >
          {cargando ? ACCIONES.redirigiendo : accion.etiqueta}
        </Button>

        {accionSecundaria && (
          <Button
            variant="secundario"
            size="lg"
            className="boton--bloque"
            onClick={accionSecundaria.onClick}
            disabled={registrando}
            aria-busy={registrando}
          >
            {registrando
              ? ACCIONES.abriendoRegistro
              : accionSecundaria.etiqueta}
          </Button>
        )}
      </div>
    </Card>
  );
}
