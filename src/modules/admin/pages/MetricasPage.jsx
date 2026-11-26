import { useEffect, useRef, useState } from "react";
import useApiAdmin from "../services/apiAdmin";
import Badge from "../../../components/ui/Badge";
import { WS_METRICAS_URL } from "../../../config/api";
import "./PlataformaAdmin.css";

const INTERVALO_MS = 5000;

/**
 * Métricas de ms-analytics: eventos por minuto, productos más vistos, eventos
 * por acción y alertas de fraude. Canal principal: WebSocket `/ws/metricas`;
 * mientras no esté conectado (p. ej. sitio HTTPS sin `wss://`) se consulta
 * `GET /api/v1/analytics/metricas` por el API Gateway cada 5 s.
 */
export default function MetricasPage() {
  const { getToken, obtener } = useApiAdmin();
  const [m, setM] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [alertas, setAlertas] = useState([]);
  const [error, setError] = useState("");
  const enVivo = useRef(false);

  useEffect(() => {
    let cerrado = false;
    let ws;
    let reintento;
    const conectar = async () => {
      try {
        const token = await getToken();
        if (cerrado) return;
        ws = new WebSocket(`${WS_METRICAS_URL}?token=${encodeURIComponent(token)}`);
        ws.onopen = () => { enVivo.current = true; setConectado(true); };
        ws.onmessage = (ev) => {
          try { setM(JSON.parse(ev.data)); } catch { /* mensaje no JSON: se ignora */ }
        };
        ws.onclose = () => {
          enVivo.current = false;
          setConectado(false);
          if (!cerrado) reintento = setTimeout(conectar, INTERVALO_MS);
        };
      } catch {
        // El navegador bloquea ws:// desde HTTPS: queda la consulta periódica.
        enVivo.current = false;
      }
    };
    conectar();
    return () => {
      cerrado = true;
      clearTimeout(reintento);
      ws?.close();
    };
  }, [getToken]);

  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      if (!enVivo.current) {
        try {
          const datos = await obtener("/api/v1/analytics/metricas");
          if (vivo) { setM(datos); setError(""); }
        } catch (err) {
          if (vivo) setError(err.message);
        }
      }
      obtener("/api/v1/pagos/alertas").then((d) => vivo && setAlertas(d ?? [])).catch(() => {});
    };
    cargar();
    const id = setInterval(cargar, INTERVALO_MS);
    return () => { vivo = false; clearInterval(id); };
  }, [obtener]);

  const acciones = Object.entries(m?.eventosPorAccion ?? {});
  const vistos = m?.productosMasVistos ?? [];

  return (
    <div className="pagina plataforma">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Métricas en vivo</h1>
            <p className="pagina__descripcion">
              Actividad de la tienda y alertas del antifraude.
            </p>
          </div>
          <Badge tone={conectado ? "exito" : "neutral"}>
            {conectado ? "En vivo (WebSocket)" : "Actualiza cada 5 s"}
          </Badge>
        </header>

        {error && <p className="plataforma__mensaje" role="alert">{error}</p>}

        <div className="plataforma__grid">
          <section className="plataforma-panel" aria-label="Eventos por minuto">
            <h2 className="plataforma-panel__titulo">Eventos por minuto</h2>
            <p className="plataforma__cifra">{m?.eventosUltimoMinuto ?? 0}</p>
            <p className="plataforma__nota">Total acumulado: {m?.eventosTotales ?? 0}</p>
          </section>
          <section className="plataforma-panel" aria-label="Alertas de fraude">
            <h2 className="plataforma-panel__titulo">Alertas de fraude</h2>
            <p className="plataforma__cifra">{m?.alertasFraude ?? 0}</p>
            <p className="plataforma__nota">Tarjetas bloqueadas por el antifraude</p>
          </section>
          <section className="plataforma-panel" aria-label="Eventos por acción">
            <h2 className="plataforma-panel__titulo">Eventos por acción</h2>
            {acciones.length === 0 ? <p className="plataforma__nota">Sin eventos todavía.</p> : (
              <ul className="plataforma__lista">
                {acciones.map(([accion, n]) => (
                  <li key={accion}><span>{accion}</span><strong>{n}</strong></li>
                ))}
              </ul>
            )}
          </section>
          <section className="plataforma-panel" aria-label="Productos más vistos">
            <h2 className="plataforma-panel__titulo">Productos más vistos</h2>
            {vistos.length === 0 ? <p className="plataforma__nota">Sin vistas todavía.</p> : (
              <ul className="plataforma__lista">
                {vistos.map((p) => (
                  <li key={p.itemId}><span>{p.itemId}</span><strong>{p.vistas}</strong></li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <h2 className="plataforma__titulo-seccion">Últimas alertas</h2>
        <div className="plataforma__tabla-marco">
          {alertas.length === 0 ? <p className="plataforma__vacio">Sin alertas.</p> : (
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
        </div>
      </div>
    </div>
  );
}
