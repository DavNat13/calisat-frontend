import { useState } from "react";
import usePagoService, { redirigirAWebpay } from "../services/pagoService";
import { formatoCLP } from "../../../utils/formatoCLP";

/** Tarjeta de prueba pública de Transbank (ambiente de integración). */
const TARJETA_PRUEBA = "4051 8856 0044 6623";

/**
 * Panel de pago de un pedido ya creado. El número de tarjeta solo se usa
 * como identificador para el antifraude (se envía para hashearlo; el pago
 * real se completa en WebPay). Maneja el bloqueo preventivo (HTTP 429).
 */
export default function PagoWebpay({ ordenId, monto }) {
  const pagos = usePagoService();
  const [tarjeta, setTarjeta] = useState(TARJETA_PRUEBA);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [bloqueada, setBloqueada] = useState(false);

  const pagar = async () => {
    setEnviando(true);
    setError("");
    try {
      const r = await pagos.iniciar({ ordenId, monto: Math.round(Number(monto)), tarjeta });
      redirigirAWebpay(r);
    } catch (e) {
      setBloqueada(e.status === 429);
      setError(e.message);
      setEnviando(false);
    }
  };

  return (
    <section className="tarjeta checkout__exito-tarjeta" aria-label="Pago del pedido">
      <h2 className="checkout__subtitulo">Pagar con WebPay</h2>
      <p>
        Total a pagar: <strong>{formatoCLP(monto)}</strong>. Serás redirigido a WebPay
        (ambiente de pruebas de Transbank).
      </p>
      <label htmlFor="pago-tarjeta">Tarjeta de prueba (solo identificador antifraude)</label>
      <input
        id="pago-tarjeta"
        className="campo__control"
        value={tarjeta}
        onChange={(e) => setTarjeta(e.target.value)}
        inputMode="numeric"
        maxLength={23}
        autoComplete="off"
      />
      {error && (
        <p role="alert" className={bloqueada ? "checkout__error checkout__error--bloqueo" : "checkout__error"}>
          {error}
        </p>
      )}
      <div className="pagina__acciones">
        <button
          type="button"
          className="boton boton--primario"
          onClick={pagar}
          disabled={enviando || bloqueada || !tarjeta.trim()}
        >
          {enviando ? "Redirigiendo…" : "Pagar ahora"}
        </button>
      </div>
    </section>
  );
}
