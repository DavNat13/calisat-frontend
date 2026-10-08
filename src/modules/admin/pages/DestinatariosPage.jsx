import { Check, CircleAlert, Pencil, Plus, RefreshCw, UserX } from "lucide-react";
import useDestinatarios from "../hooks/useDestinatarios";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import Badge from "../../../components/ui/Badge";
import "./DestinatariosPage.css";

/**
 * Destinatarios (solo ADMINISTRADOR) — `/admin/destinatarios`.
 *
 * Directorio de `ms-notificaciones`: los listeners de orden y de envío
 * resuelven aquí a quién mandar el correo. Solo hay GET + POST upsert
 * (por azureSub), así que la baja es `activo: false`.
 */
export default function DestinatariosPage() {
  const d = useDestinatarios();

  return (
    <div className="pagina destinatarios">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Destinatarios</h1>
            <p className="pagina__descripcion">
              Directorio al que se dirigen los correos del sistema: alta por
              azureSub (upsert) y baja lógica. {d.activos} activos de{" "}
              {d.total}.
            </p>
          </div>
          <div className="pagina__acciones">
            <Button
              variant="secundario"
              icon={<RefreshCw className="icono icono--sm" aria-hidden="true" />}
              disabled={d.cargando}
              onClick={d.recargar}
            >
              Recargar
            </Button>
            <Button
              variant="primario"
              icon={<Plus className="icono icono--sm" aria-hidden="true" />}
              onClick={d.abrirNuevo}
            >
              Nuevo destinatario
            </Button>
          </div>
        </header>

        <div className="destinatarios__barra">
          <Input
            label="Buscar destinatario"
            id="destinatarios-busqueda"
            type="search"
            value={d.consulta}
            onChange={(e) => d.setConsulta(e.target.value)}
            placeholder="correo, nombre o rol"
            hint="Búsqueda sobre la lista cargada (el backend no acepta filtros)."
          />
        </div>

        {d.exito && (
          <p className="destinatarios__mensaje destinatarios__mensaje--exito" role="status">
            <Check className="icono icono--sm" aria-hidden="true" />
            <span>{d.exito}</span>
          </p>
        )}
        {d.error && (
          <p className="destinatarios__mensaje destinatarios__mensaje--error" role="alert">
            <CircleAlert className="icono icono--sm" aria-hidden="true" />
            <span>{d.error}</span>
          </p>
        )}

        <section className="destinatarios__seccion" aria-busy={d.cargando}>
          {d.cargando && d.destinatarios.length === 0 ? (
            <p className="destinatarios__estado" role="status">Cargando directorio…</p>
          ) : d.destinatarios.length === 0 ? (
            <p className="destinatarios__estado" role="status">
              No hay destinatarios que coincidan con la búsqueda.
            </p>
          ) : (
            <div className="destinatarios__tabla-envoltorio">
              <table className="destinatarios__tabla" aria-label="Directorio">
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Correo</th>
                    <th scope="col">Rol</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {d.destinatarios.map((item) => (
                    <tr key={item.id ?? item.azureSub}>
                      <th scope="row">{item.nombre || "—"}</th>
                      <td className="destinatarios__email">{item.email}</td>
                      <td>{item.rol || "—"}</td>
                      <td>
                        <Badge tone={item.activo === false ? "neutral" : "exito"}>
                          {item.activo === false ? "Baja" : "Activo"}
                        </Badge>
                      </td>
                      <td>
                        <div className="destinatarios__acciones">
                          <Button
                            variant="secundario"
                            size="sm"
                            icon={<Pencil className="icono icono--sm" aria-hidden="true" />}
                            onClick={() => d.abrirEdicion(item)}
                            aria-label={`Editar ${item.email}`}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="peligro"
                            size="sm"
                            icon={<UserX className="icono icono--sm" aria-hidden="true" />}
                            onClick={() => d.setBajaPendiente(item)}
                            aria-label={`Dar de baja ${item.email}`}
                            disabled={d.enviando || item.activo === false}
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

      {/* -------------------- Modal: alta / edición --------------------- */}
      <Modal
        open={d.modal}
        title={d.form.id ? "Editar destinatario" : "Nuevo destinatario"}
        onClose={d.cerrarModal}
        footer={
          <>
            <Button variant="secundario" onClick={d.cerrarModal} disabled={d.enviando}>
              Cancelar
            </Button>
            <Button onClick={d.guardar} disabled={d.enviando}>
              {d.enviando ? "Guardando…" : "Guardar"}
            </Button>
          </>
        }
      >
        <div className="destinatarios__formulario">
          <Input
            label="azureSub (oid de Entra ID)"
            id="dest-sub"
            name="azureSub"
            value={d.form.azureSub}
            onChange={d.cambiar}
            required
            disabled={d.enviando}
            maxLength={255}
            hint="Clave única del upsert: si ya existe, se actualiza el registro."
          />
          <Input
            label="Correo electrónico"
            id="dest-email"
            name="email"
            type="email"
            value={d.form.email}
            onChange={d.cambiar}
            required
            disabled={d.enviando}
            maxLength={320}
          />
          <Input
            label="Nombre"
            id="dest-nombre"
            name="nombre"
            value={d.form.nombre}
            onChange={d.cambiar}
            disabled={d.enviando}
            maxLength={255}
          />
          <Input
            label="Rol (informativo)"
            id="dest-rol"
            name="rol"
            value={d.form.rol}
            onChange={d.cambiar}
            disabled={d.enviando}
            maxLength={100}
            hint="No implica permisos: es un dato del directorio."
          />
          <label className="destinatarios__checkbox">
            <input
              type="checkbox"
              name="activo"
              checked={d.form.activo !== false}
              onChange={d.cambiar}
              disabled={d.enviando}
            />
            Activo (recibe correos)
          </label>
          {d.errorFormulario && (
            <p className="destinatarios__mensaje destinatarios__mensaje--error" role="alert">
              <CircleAlert className="icono icono--sm" aria-hidden="true" />
              <span>{d.errorFormulario}</span>
            </p>
          )}
        </div>
      </Modal>

      {/* ------------------- Modal: confirmar baja ---------------------- */}
      <Modal
        open={Boolean(d.bajaPendiente)}
        title="Dar de baja al destinatario"
        onClose={() => d.setBajaPendiente(null)}
        footer={
          <>
            <Button
              variant="secundario"
              onClick={() => d.setBajaPendiente(null)}
              disabled={d.enviando}
            >
              Volver
            </Button>
            <Button variant="peligro" onClick={d.confirmarBaja} disabled={d.enviando}>
              {d.enviando ? "Procesando…" : "Dar de baja"}
            </Button>
          </>
        }
      >
        <p>
          {d.bajaPendiente?.email} dejará de recibir correos del sistema. El
          registro se conserva con <code>activo: false</code>.
        </p>
      </Modal>
    </div>
  );
}
