import { useCallback, useEffect, useState } from "react";
import useApiAdmin from "../services/apiAdmin";
import "./PlataformaAdmin.css";

const BASE = "/api/v1/rabbit";
const MENSAJES = {
  400: "Datos no válidos.",
  502: "RabbitMQ no está disponible o rechazó la operación.",
};

/** Administración de RabbitMQ (ms-rabbit-admin): colas, exchanges y bindings. */
export default function ColasRabbitPage() {
  const { obtener, enviar } = useApiAdmin();
  const [colas, setColas] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cola, setCola] = useState({ name: "", dlx: "calisat.dlx", dlk: "dlq.general" });
  const [ex, setEx] = useState({ name: "", type: "topic" });
  const [bind, setBind] = useState({ exchange: "calisat.exchange", queue: "", routingKey: "" });

  const cargar = useCallback(async () => {
    try {
      const [c, e] = await Promise.all([
        obtener(`${BASE}/queues`, { mensajes: MENSAJES }),
        obtener(`${BASE}/exchanges`, { mensajes: MENSAJES }),
      ]);
      setColas(c ?? []);
      setExchanges((e ?? []).filter((x) => x.name));
    } catch (err) {
      setMensaje(err.message);
    }
  }, [obtener]);

  useEffect(() => { Promise.resolve().then(cargar); }, [cargar]);

  const ejecutar = async (accion, ok) => {
    try {
      await accion();
      setMensaje(ok);
      await cargar();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  return (
    <div className="plataforma">
      <h1 className="pagina__titulo">Administración de RabbitMQ</h1>
      {mensaje && <p role="status">{mensaje}</p>}

      <div className="plataforma__grid">
        <form className="tarjeta" onSubmit={(e) => { e.preventDefault();
          ejecutar(() => enviar(`${BASE}/queues`, { cuerpo: { name: cola.name, durable: true,
            deadLetterExchange: cola.dlx || null, deadLetterRoutingKey: cola.dlk || null }, mensajes: MENSAJES }), "Cola creada."); }}>
          <h2>Crear cola</h2>
          <input className="input" placeholder="nombre" value={cola.name} required onChange={(e) => setCola({ ...cola, name: e.target.value })} />
          <input className="input" placeholder="DLX" value={cola.dlx} onChange={(e) => setCola({ ...cola, dlx: e.target.value })} />
          <input className="input" placeholder="routing key DLQ" value={cola.dlk} onChange={(e) => setCola({ ...cola, dlk: e.target.value })} />
          <button className="boton boton--primario" type="submit">Crear</button>
        </form>

        <form className="tarjeta" onSubmit={(e) => { e.preventDefault();
          ejecutar(() => enviar(`${BASE}/exchanges`, { cuerpo: { name: ex.name, type: ex.type, durable: true }, mensajes: MENSAJES }), "Exchange creado."); }}>
          <h2>Crear exchange</h2>
          <input className="input" placeholder="nombre" value={ex.name} required onChange={(e) => setEx({ ...ex, name: e.target.value })} />
          <select className="input" value={ex.type} onChange={(e) => setEx({ ...ex, type: e.target.value })}>
            {["topic", "direct", "fanout", "headers"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <button className="boton boton--primario" type="submit">Crear</button>
        </form>

        <form className="tarjeta" onSubmit={(e) => { e.preventDefault();
          ejecutar(() => enviar(`${BASE}/bindings`, { cuerpo: bind, mensajes: MENSAJES }), "Binding creado."); }}>
          <h2>Crear binding</h2>
          <input className="input" placeholder="exchange" value={bind.exchange} required onChange={(e) => setBind({ ...bind, exchange: e.target.value })} />
          <input className="input" placeholder="cola" value={bind.queue} required onChange={(e) => setBind({ ...bind, queue: e.target.value })} />
          <input className="input" placeholder="routing key" value={bind.routingKey} onChange={(e) => setBind({ ...bind, routingKey: e.target.value })} />
          <div className="plataforma__fila">
            <button className="boton boton--primario" type="submit">Crear</button>
            <button className="boton boton--secundario" type="button"
              onClick={() => ejecutar(() => enviar(`${BASE}/bindings`, { metodo: "DELETE", cuerpo: bind, mensajes: MENSAJES }), "Binding eliminado.")}>
              Eliminar
            </button>
          </div>
        </form>
      </div>

      <section className="tarjeta">
        <h2>Colas ({colas.length})</h2>
        <table className="plataforma__tabla">
          <thead><tr><th>Nombre</th><th>Mensajes</th><th>Consumidores</th><th /></tr></thead>
          <tbody>
            {colas.map((q) => (
              <tr key={q.name}>
                <td>{q.name}</td><td>{q.messages ?? 0}</td><td>{q.consumers ?? 0}</td>
                <td>
                  <button className="boton boton--secundario" type="button"
                    onClick={() => window.confirm(`¿Eliminar la cola ${q.name}?`) &&
                      ejecutar(() => enviar(`${BASE}/queues/${encodeURIComponent(q.name)}`, { metodo: "DELETE", mensajes: MENSAJES }), "Cola eliminada.")}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="tarjeta">
        <h2>Exchanges ({exchanges.length})</h2>
        <table className="plataforma__tabla">
          <thead><tr><th>Nombre</th><th>Tipo</th><th /></tr></thead>
          <tbody>
            {exchanges.map((x) => (
              <tr key={x.name}>
                <td>{x.name}</td><td>{x.type}</td>
                <td>
                  <button className="boton boton--secundario" type="button"
                    onClick={() => window.confirm(`¿Eliminar el exchange ${x.name}?`) &&
                      ejecutar(() => enviar(`${BASE}/exchanges/${encodeURIComponent(x.name)}`, { metodo: "DELETE", mensajes: MENSAJES }), "Exchange eliminado.")}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
