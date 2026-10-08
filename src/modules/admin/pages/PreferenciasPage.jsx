import { Check, CircleAlert, Plus, RefreshCw } from "lucide-react";
import usePreferencias from "../hooks/usePreferencias";
import { CANALES, ETIQUETA_CANAL, TIPOS_CAMPANA } from "../services/preferenciaService";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import "./PreferenciasPage.css";

/**
 * Preferencias — `/admin/preferencias`.
 *
 * Suscripciones a campañas del USUARIO AUTENTICADO en ms-notificaciones
 * (no hay listado global): GET devuelve las suyas y el PUT hace upsert por
 * (tipoCampana, canal). Borrar no existe en el backend, así que la única
 * baja es dejar la fila en `optIn: false`.
 */
export default function PreferenciasPage() {
  const p = usePreferencias();

  return (
    <div className="pagina preferencias">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Preferencias de notificación</h1>
            <p className="pagina__descripcion">
              Tus altas y bajas de campañas (opt-in explícito). Las
              notificaciones transaccionales de tus pedidos no se pueden
              desactivar aquí.
            </p>
          </div>
          <div className="pagina__acciones">
            <Button
              variant="secundario"
              icon={<RefreshCw className="icono icono--sm" aria-hidden="true" />}
              onClick={p.recargar}
              disabled={p.cargando}
            >
              Recargar
            </Button>
          </div>
        </header>

        {p.exito && (
          <p className="preferencias__mensaje preferencias__mensaje--exito" role="status">
            <Check className="icono icono--sm" aria-hidden="true" />
            <span>{p.exito}</span>
          </p>
        )}
        {p.error && (
          <p className="preferencias__mensaje preferencias__mensaje--error" role="alert">
            <CircleAlert className="icono icono--sm" aria-hidden="true" />
            <span>{p.error}</span>
          </p>
        )}

        {/* -------------------------- Alta ------------------------------ */}
        <section className="tarjeta preferencias__alta" aria-labelledby="pref-alta">
          <h2 className="preferencias__titulo" id="pref-alta">
            Añadir preferencia
          </h2>
          <form
            className="preferencias__formulario"
            onSubmit={(evento) => {
              evento.preventDefault();
              p.agregar();
            }}
          >
            <div className="campo">
              <label className="campo__label" htmlFor="pref-tipo">
                Tipo de campaña
              </label>
              <input
                id="pref-tipo"
                className="campo__control"
                list="pref-tipos"
                value={p.form.tipoCampana}
                onChange={p.cambiar}
                name="tipoCampana"
                maxLength={100}
                disabled={p.enviando}
                placeholder="NOVEDADES"
              />
              <datalist id="pref-tipos">
                {TIPOS_CAMPANA.map((tipo) => (
                  <option key={tipo} value={tipo} />
                ))}
              </datalist>
            </div>

            <div className="campo">
              <label className="campo__label" htmlFor="pref-canal">
                Canal
              </label>
              <select
                id="pref-canal"
                className="campo__control"
                value={p.form.canal}
                onChange={p.cambiar}
                name="canal"
                disabled={p.enviando}
              >
                {CANALES.map((canal) => (
                  <option key={canal} value={canal}>
                    {ETIQUETA_CANAL[canal] ?? canal}
                  </option>
                ))}
              </select>
            </div>

            <label className="preferencias__checkbox">
              <input
                type="checkbox"
                name="optIn"
                checked={p.form.optIn !== false}
                onChange={p.cambiar}
                disabled={p.enviando}
              />
              Quiero recibirla
            </label>

            <Button
              type="submit"
              icon={<Plus className="icono icono--sm" aria-hidden="true" />}
              disabled={p.enviando}
            >
              {p.enviando ? "Guardando…" : "Guardar"}
            </Button>
          </form>
          {p.errorFormulario && (
            <p className="preferencias__mensaje preferencias__mensaje--error" role="alert">
              <CircleAlert className="icono icono--sm" aria-hidden="true" />
              <span>{p.errorFormulario}</span>
            </p>
          )}
        </section>

        {/* ------------------------- Listado ---------------------------- */}
        <section className="tarjeta preferencias__listado" aria-busy={p.cargando}>
          <h2 className="preferencias__titulo">Tus suscripciones</h2>
          {p.cargando && p.preferencias.length === 0 ? (
            <p className="preferencias__estado" role="status">Cargando preferencias…</p>
          ) : p.preferencias.length === 0 ? (
            <p className="preferencias__estado" role="status">
              Todavía no has guardado ninguna preferencia.
            </p>
          ) : (
            <ul className="preferencias__lista">
              {p.preferencias.map((item) => {
                const activa = item.optIn === true;
                const clave = `${item.tipoCampana}|${item.canal}`;
                return (
                  <li key={clave} className="preferencias__fila">
                    <span className="preferencias__tipo">{item.tipoCampana}</span>
                    <span className="preferencias__canal">
                      {ETIQUETA_CANAL[item.canal] ?? item.canal}
                    </span>
                    <Badge tone={activa ? "exito" : "neutral"}>
                      {activa ? "Recibiendo" : "Sin recibir"}
                    </Badge>
                    <Button
                      variant={activa ? "peligro" : "primario"}
                      size="sm"
                      onClick={() => p.alternar(item)}
                      disabled={p.enviando}
                      aria-label={`${activa ? "Darte de baja de" : "Darte de alta en"} ${item.tipoCampana}`}
                    >
                      {activa ? "Darme de baja" : "Darme de alta"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
