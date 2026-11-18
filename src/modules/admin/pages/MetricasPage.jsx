import { useEffect, useRef, useState } from "react";
import useApiAdmin from "../services/apiAdmin";
import { WS_METRICAS_URL } from "../../../config/api";
import "./PlataformaAdmin.css";

/**
 * Dashboard de métricas en tiempo real (WebSocket `/ws/metricas` de ms-analytics):
 * 1) eventos por minuto, 2) productos más vistos, 3) eventos por acción,
 * 4) alertas de fraude. Se reconecta solo si se corta.
 */
export default function MetricasPage() {
  const { getToken, obtener } = useApiAdmin();
  const [m, setM] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [alertas, setAlertas] = useState([]);
  const [error, setError] = useState("");
  const cierre = useRef(false);

  useEffect(() => {
    cierre.current = false;
    let ws;
    let reintento;
    const conectar = async () => {
      try {
        const token = await getToken();
        ws = new WebSocket(`${WS_METRICAS_URL}?token=${encodeURIComponent(token)}`);
        ws.onopen = () => { setConectado(true); setError(""); };
        ws.onmessage = (ev) => {
          try { setM(JSON.parse(ev.data)); } catch { /* mensaje no JSON: se ignora */ }
        };
        ws.onclose = () => {
          setConectado(false);
          if (!cierre.current) reintento = setTimeout(conectar, 3000);
        };
        ws.onerror = () => setError("No se pudo conectar al canal de métricas.");
      } catch {
        setError("No se pudo obtener el token de sesión.");
      }
    };
    conectar();
    return () => {
      cierre.current = true;
      clearTimeout(reintento);
      ws?.close();
    };
  }, [getToken]);

  useEffect(() => {
    let vivo = true;
    const cargar = () =>
      obtener("/api/v1/pagos/alertas").then((d) => vivo && setAlertas(d ?? [])).catch(() => {});
    cargar();
    const id = setInterval(cargar, 10000);
    return () => { vivo = false; clearInterval(id); };
  }, [obtener]);

  return (
    <div className="plataforma">
      <h1 className="pagina__titulo">Métricas en tiempo real</h1>
      <p className={conectado ? "plataforma__estado plataforma__estado--ok" : "plataforma__estado"}>
        {conectado ? "● Conectado (WebSocket)" : "○ Desconectado — reintentando…"}
      </p>
      {error && <p role="alert">{error}</p>}

      <div className="plataforma__grid">
        <section className="tarjeta" aria-label="Eventos por minuto">
          <h2>Eventos / minuto</h2>
          <p className="plataforma__cifra">{m?.eventosUltimoMinuto ?? 0}</p>
          <small>Total acumulado: {m?.eventosTotales ?? 0}</small>
        </section>
        <section className="tarjeta" aria-label="Alertas de fraude">
          <h2>Alertas de fraude</h2>
          <p className="plataforma__cifra">{m?.alertasFraude ?? 0}</p>
          <small>Tarjetas bloqueadas por el antifraude</small>
        </section>
        <section className="tarjeta" aria-label="Eventos por acción">
          <h2>Eventos por acción</h2>
          <ul>
            {Object.entries(m?.eventosPorAccion ?? {}).map(([accion, n]) => (
              <li key={accion}>{accion}: <strong>{n}</strong></li>
            ))}
          </ul>
        </section>
        <section className="tarjeta" aria-label="Productos más vistos">
          <h2>Productos más vistos</h2>
          <ol>
            {(m?.productosMasVistos ?? []).map((p) => (
              <li key={p.itemId}>{p.itemId} — <strong>{p.vistas}</strong></li>
            ))}
          </ol>
        </section>
      </div>

      <section className="tarjeta" aria-label="Últimas alertas de fraude">
        <h2>Últimas alertas</h2>
        {alertas.length === 0 ? <p>Sin alertas.</p> : (
          <table className="plataforma__tabla">
            <thead><tr><th>Fecha</th><th>Tarjeta</th><th>Intentos</th><th>Bloqueada hasta</th></tr></thead>
            <tbody>
              {alertas.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.creada).toLocaleString("es-CL")}</td>
                  <td>****{a.tarjetaUltimos4}</td>
                  <td>{a.intentos} en {a.ventanaSegundos}s</td>
                  <td>{a.bloqueadoHasta ? new Date(a.bloqueadoHasta).toLocaleString("es-CL") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
