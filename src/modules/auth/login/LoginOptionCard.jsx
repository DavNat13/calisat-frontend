import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { ACCIONES } from "./loginCopy";
import "./LoginOptionCard.css";

/**
 * Tarjeta de opción de acceso (Institucional / Público).
 *
 * Props: { id, etiqueta?, icono, titulo, audiencia, beneficios[], consecuencia,
 * accion{etiqueta,onClick,loading,icono?}, accionSecundaria?{etiqueta,onClick,
 * loading}, nota?, nivelTitulo?=3 }.
 * El artículo se enlaza con su título vía aria-labelledby="{id}-titulo".
 */
export default function LoginOptionCard({
  id,
  etiqueta,
  icono: Icono,
  titulo,
  audiencia,
  beneficios,
  consecuencia,
  accion,
  accionSecundaria,
  nota,
  nivelTitulo = 3,
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
      <div className="opcion-acceso__cabecera">
        {etiqueta && (
          <span className="opcion-acceso__pildora">
            {Icono && <Icono className="icono icono--sm" aria-hidden="true" />}
            {etiqueta}
          </span>
        )}
        <Titulo className="opcion-acceso__titulo" id={`${id}-titulo`}>
          {titulo}
        </Titulo>
        <p className="opcion-acceso__audiencia">{audiencia}</p>
      </div>

      <ul className="opcion-acceso__beneficios">
        {beneficios.map((beneficio) => (
          <li key={beneficio} className="opcion-acceso__beneficio">
            {beneficio}
          </li>
        ))}
      </ul>

      <p className="opcion-acceso__consecuencia">{consecuencia}</p>

      <div className="opcion-acceso__acciones">
        <Button
          variant="primario"
          size="lg"
          className="boton--bloque"
          icon={accion.icono}
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

        {nota && <p className="opcion-acceso__nota">{nota}</p>}
      </div>
    </Card>
  );
}
