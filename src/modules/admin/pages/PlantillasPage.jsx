import { Check, CircleAlert, Pencil, Plus, Power, RefreshCw, Trash2 } from "lucide-react";
import usePlantillas from "../hooks/usePlantillas";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import Badge from "../../../components/ui/Badge";
import "./PlantillasPage.css";

/**
 * Plantillas (solo ADMINISTRADOR) — `/admin/plantillas`.
 *
 * CRUD de plantillas de `ms-notificaciones`: crear, editar (PUT parcial,
 * sube `version`), activar/desactivar y baja lógica (el DELETE del backend
 * nunca borra físicamente). Los placeholders van entre `{{var}}`.
 */
export default function PlantillasPage() {
  const p = usePlantillas();
  const esEdicion = p.modal?.modo === "editar";

  return (
    <div className="pagina plantillas">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Plantillas</h1>
            <p className="pagina__descripcion">
              Textos de los correos y notificaciones, con marcadores{" "}
              <code>{"{{variable}}"}</code>. {p.activas} activas de {p.total}.
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
            <Button
              variant="primario"
              icon={<Plus className="icono icono--sm" aria-hidden="true" />}
              onClick={p.abrirNuevo}
            >
              Nueva plantilla
            </Button>
          </div>
        </header>

        <div className="plantillas__barra">
          <Input
            label="Buscar plantilla"
            id="plantillas-busqueda"
            type="search"
            value={p.consulta}
            onChange={(e) => p.setConsulta(e.target.value)}
            placeholder="código o asunto"
            hint="Búsqueda sobre la lista cargada (el backend no acepta filtros)."
          />
        </div>

        {p.exito && (
          <p className="plantillas__mensaje plantillas__mensaje--exito" role="status">
            <Check className="icono icono--sm" aria-hidden="true" />
            <span>{p.exito}</span>
          </p>
        )}
        {p.error && (
          <p className="plantillas__mensaje plantillas__mensaje--error" role="alert">
            <CircleAlert className="icono icono--sm" aria-hidden="true" />
            <span>{p.error}</span>
          </p>
        )}

        <section className="plantillas__seccion" aria-busy={p.cargando}>
          {p.cargando && p.plantillas.length === 0 ? (
            <p className="plantillas__estado" role="status">Cargando plantillas…</p>
          ) : p.plantillas.length === 0 ? (
            <p className="plantillas__estado" role="status">
              No hay plantillas que coincidan con la búsqueda.
            </p>
          ) : (
            <div className="plantillas__tabla-envoltorio">
              <table className="plantillas__tabla" aria-label="Plantillas">
                <thead>
                  <tr>
                    <th scope="col">Código</th>
                    <th scope="col">Asunto</th>
                    <th scope="col" className="plantillas__celda--numerica">Versión</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {p.plantillas.map((plantilla) => (
                    <tr key={plantilla.codigo}>
                      <th scope="row">{plantilla.codigo}</th>
                      <td className="plantillas__asunto">{plantilla.asunto || "—"}</td>
                      <td className="plantillas__celda--numerica">
                        {plantilla.version ?? "—"}
                      </td>
                      <td>
                        <Badge tone={plantilla.activa === false ? "neutral" : "exito"}>
                          {plantilla.activa === false ? "Inactiva" : "Activa"}
                        </Badge>
                      </td>
                      <td>
                        <div className="plantillas__acciones">
                          <Button
                            variant="secundario"
                            size="sm"
                            icon={<Pencil className="icono icono--sm" aria-hidden="true" />}
                            onClick={() => p.abrirEdicion(plantilla)}
                            aria-label={`Editar la plantilla ${plantilla.codigo}`}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="secundario"
                            size="sm"
                            icon={<Power className="icono icono--sm" aria-hidden="true" />}
                            onClick={() => p.alternarActiva(plantilla)}
                            aria-label={`Alternar la plantilla ${plantilla.codigo}`}
                            disabled={p.enviando}
                          >
                            {plantilla.activa === false ? "Activar" : "Desactivar"}
                          </Button>
                          <Button
                            variant="peligro"
                            size="sm"
                            icon={<Trash2 className="icono icono--sm" aria-hidden="true" />}
                            onClick={() => p.setBajaPendiente(plantilla)}
                            aria-label={`Dar de baja la plantilla ${plantilla.codigo}`}
                            disabled={p.enviando || plantilla.activa === false}
                          >
                            Dar de baja
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* -------------------- Modal: crear / editar --------------------- */}
      <Modal
        open={Boolean(p.modal)}
        title={esEdicion ? `Editar ${p.modal?.plantilla?.codigo}` : "Nueva plantilla"}
        onClose={p.cerrarModal}
        className="plantillas__modal"
        footer={
          <>
            <Button variant="secundario" onClick={p.cerrarModal} disabled={p.enviando}>
              Cancelar
            </Button>
            <Button onClick={p.guardar} disabled={p.enviando}>
              {p.enviando ? "Guardando…" : "Guardar"}
            </Button>
          </>
        }
      >
        <div className="plantillas__formulario">
          <Input
            label="Código"
            id="plant-codigo"
            name="codigo"
            value={p.form.codigo}
            onChange={p.cambiar}
            required
            disabled={p.enviando || esEdicion}
            maxLength={100}
            hint={esEdicion ? "El código es la clave: no se puede modificar." : "Único, p. ej. BIENVENIDA."}
          />
          <Input
            label="Asunto"
            id="plant-asunto"
            name="asunto"
            value={p.form.asunto}
            onChange={p.cambiar}
            disabled={p.enviando}
            maxLength={500}
          />
          <Input
            label="Cuerpo (texto plano)"
            id="plant-texto"
            name="cuerpoTexto"
            value={p.form.cuerpoTexto}
            onChange={p.cambiar}
            multiline
            disabled={p.enviando}
            rows={5}
          />
          <Input
            label="Cuerpo (HTML)"
            id="plant-html"
            name="cuerpoHtml"
            value={p.form.cuerpoHtml}
            onChange={p.cambiar}
            multiline
            disabled={p.enviando}
            rows={5}
          />
          <Input
            label="Variables (array JSON)"
            id="plant-variables"
            name="variables"
            value={p.form.variables}
            onChange={p.cambiar}
            disabled={p.enviando}
            hint='P. ej. ["nombre","pedido"]: son las claves disponibles en {{...}}.'
          />
          <label className="plantillas__checkbox">
            <input
              type="checkbox"
              name="activa"
              checked={p.form.activa !== false}
              onChange={p.cambiar}
              disabled={p.enviando}
            />
            Plantilla activa
          </label>
          {p.errorFormulario && (
            <p className="plantillas__mensaje plantillas__mensaje--error" role="alert">
              <CircleAlert className="icono icono--sm" aria-hidden="true" />
              <span>{p.errorFormulario}</span>
            </p>
          )}
        </div>
      </Modal>

      {/* -------------------- Modal: confirmar baja --------------------- */}
      <Modal
        open={Boolean(p.bajaPendiente)}
        title="Dar de baja la plantilla"
        onClose={() => p.setBajaPendiente(null)}
        footer={
          <>
            <Button
              variant="secundario"
              onClick={() => p.setBajaPendiente(null)}
              disabled={p.enviando}
            >
              Volver
            </Button>
            <Button variant="peligro" onClick={p.confirmarBaja} disabled={p.enviando}>
              {p.enviando ? "Procesando…" : "Dar de baja"}
            </Button>
          </>
        }
      >
        <p>
          La plantilla <strong>{p.bajaPendiente?.codigo}</strong> quedará
          inactiva. Es una baja lógica: el backend no borra el registro.
        </p>
      </Modal>
    </div>
  );
}
