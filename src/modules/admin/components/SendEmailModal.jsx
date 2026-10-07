import { Check, CircleAlert, Mail } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import "./SendEmailModal.css";

const ID_FORM = "envio-manual-correo";

/**
 * Modal de envío manual de correo (ADMINISTRADOR).
 * Consume el estado de `useEnvioManual`; el backend crea la notificación
 * en estado PENDIENTE y el poller de ms-notificaciones la despacha.
 */
export default function SendEmailModal({ envio }) {
  const { abierto, campos, enviando, error, exito, cerrar, cambiar, enviar, reiniciar } =
    envio;

  const pie = exito ? (
    <>
      <Button variant="secundario" onClick={reiniciar}>
        Enviar otro
      </Button>
      <Button variant="primario" onClick={cerrar} data-foco-principal="">
        Cerrar
      </Button>
    </>
  ) : (
    <>
      <Button variant="secundario" onClick={cerrar} disabled={enviando}>
        Cancelar
      </Button>
      <Button
        type="submit"
        form={ID_FORM}
        variant="primario"
        disabled={enviando}
        data-foco-principal=""
      >
        {enviando ? "Enviando..." : "Enviar correo"}
      </Button>
    </>
  );

  return (
    <Modal open={abierto} title="Enviar correo manual" onClose={cerrar} footer={pie}>
      {exito ? (
        <div className="envio-manual__exito" role="status">
          <Check className="icono" aria-hidden="true" />
          <div>
            <p className="envio-manual__exito-titulo">Correo en cola</p>
            <p>
              Se creó la notificación y se enviará en los próximos segundos. Puedes
              verlo en el historial de esta misma pantalla.
            </p>
          </div>
        </div>
      ) : (
        <form
          id={ID_FORM}
          className="envio-manual"
          onSubmit={enviar}
          aria-busy={enviando}
        >
          {error && (
            <p className="envio-manual__alerta" role="alert">
              <CircleAlert className="icono icono--sm" aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}

          <div className="campo">
            <label className="campo__label" htmlFor="envio-destinatario">
              Email del destinatario
            </label>
            <input
              id="envio-destinatario"
              className="campo__control"
              type="email"
              maxLength={320}
              autoComplete="email"
              placeholder="cliente@ejemplo.com"
              value={campos.destinatarioEmail}
              onChange={cambiar("destinatarioEmail")}
              disabled={enviando}
            />
            <span className="envio-manual__ayuda">
              Opcional: déjalo vacío y el correo llegará a tu propia cuenta.
            </span>
          </div>

          <div className="campo">
            <label className="campo__label" htmlFor="envio-asunto">
              Asunto
            </label>
            <input
              id="envio-asunto"
              className="campo__control"
              type="text"
              maxLength={500}
              required
              placeholder="Tu pedido está en camino"
              value={campos.asunto}
              onChange={cambiar("asunto")}
              disabled={enviando}
            />
          </div>

          <div className="campo">
            <label className="campo__label" htmlFor="envio-cuerpo">
              Cuerpo del mensaje
            </label>
            <textarea
              id="envio-cuerpo"
              className="campo__control"
              rows={6}
              required
              placeholder="Hola, te escribimos para contarte..."
              value={campos.cuerpoTexto}
              onChange={cambiar("cuerpoTexto")}
              disabled={enviando}
            />
          </div>

          <p className="envio-manual__nota">
            <Mail className="icono icono--sm" aria-hidden="true" />
            <span>
              Se envía por correo electrónico (SMTP) y queda registrado en el
              historial con su traza de intentos.
            </span>
          </p>
        </form>
      )}
    </Modal>
  );
}
