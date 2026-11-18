import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import usePagoService from "../services/pagoService";
import useOrdenService from "../../ordenes/services/ordenService";
import { formatoCLP } from "../../../utils/formatoCLP";

/**
 * Retorno desde WebPay (`/checkout/retorno?token_ws=…`). Confirma el pago en
 * `ms-pago` y, si fue autorizado, marca la orden como PAGADA (lo que
 * dispara la confirmación de stock y el correo de confirmación).
 */
export default function RetornoPagoPage() {
  const [params] = useSearchParams();
  const pagos = usePagoService();
  const ordenes = useOrdenService();
  const token = params.get("token_ws");
  const abortado = Boolean(params.get("TBK_TOKEN")) && !token;
  const [estado, setEstado] = useState({ fase: abortado ? "abortado" : "cargando", pago: null, error: "" });
  const lanzado = useRef(false);

  useEffect(() => {
    if (abortado || lanzado.current) return;
    lanzado.current = true;
    if (!token) {
      Promise.resolve().then(() =>
        setEstado({ fase: "error", pago: null, error: "No recibimos el token de pago." })
      );
      return;
    }
    (async () => {
      try {
        const pago = await pagos.confirmar(token);
        if (pago?.estado === "PAGADO") {
          // Best-effort: el pago ya quedó registrado aunque la orden no avance.
          await ordenes.cambiarEstado(pago.ordenId, "PAGADA").catch(() => null);
        }
        setEstado({ fase: "listo", pago, error: "" });
      } catch (e) {
        setEstado({ fase: "error", pago: null, error: e.message });
      }
    })();
  }, [token, abortado, pagos, ordenes]);

  const { fase, pago, error } = estado;
  return (
    <div className="pagina">
      <div className="contenedor checkout">
        {fase === "cargando" && <p role="status">Confirmando tu pago…</p>}
        {fase === "abortado" && (
          <>
            <h1 className="pagina__titulo">Pago cancelado</h1>
            <p>Cancelaste el pago en WebPay. Tu pedido sigue pendiente.</p>
          </>
        )}
        {fase === "error" && (
          <>
            <h1 className="pagina__titulo">No pudimos confirmar el pago</h1>
            <p role="alert">{error}</p>
          </>
        )}
        {fase === "listo" && (
          <>
            <h1 className="pagina__titulo">
              {pago?.estado === "PAGADO" ? "¡Pago aprobado!" : "Pago rechazado"}
            </h1>
            <section className="tarjeta checkout__exito-tarjeta">
              <p>Pedido: <strong>{pago?.ordenId}</strong></p>
              <p>Monto: <strong>{formatoCLP(pago?.monto ?? 0)}</strong></p>
              {pago?.tarjetaUltimos4 && <p>Tarjeta: ****{pago.tarjetaUltimos4}</p>}
              {pago?.codigoAutorizacion && <p>Autorización: {pago.codigoAutorizacion}</p>}
            </section>
          </>
        )}
        <div className="pagina__acciones">
          <Link className="boton boton--primario" to="/mis-pedidos">Ver mis pedidos</Link>
          <Link className="boton boton--secundario" to="/productos">Seguir comprando</Link>
        </div>
      </div>
    </div>
  );
}
