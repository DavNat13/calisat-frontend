import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import useApiAdmin from "../services/apiAdmin";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import "./PlataformaAdmin.css";

const BASE = "/api/v1/rabbit";
const MENSAJES = {
  400: "Datos no válidos.",
  502: "RabbitMQ no está disponible o rechazó la operación.",
};

/** Campo de texto con etiqueta, con el estilo común de formularios. */
function Campo({ etiqueta, valor, onChange, requerido = false }) {
  return (
    <label className="campo">
      <span className="campo__label">{etiqueta}</span>
      <input className="campo__control" value={valor} required={requerido} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

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

  const alEnviar = (ruta, cuerpo, ok) => (e) => {
    e.preventDefault();
    ejecutar(() => enviar(`${BASE}/${ruta}`, { cuerpo, mensajes: MENSAJES }), ok);
  };

  const eliminar = (tipo, nombre, ok) => {
    if (!window.confirm(`¿Eliminar ${nombre}?`)) return;
    ejecutar(
      () => enviar(`${BASE}/${tipo}/${encodeURIComponent(nombre)}`, { metodo: "DELETE", mensajes: MENSAJES }),
      ok
    );
  };

  return (
    <div className="pagina plataforma">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">RabbitMQ</h1>
            <p className="pagina__descripcion">
              Administra las colas, exchanges y bindings de la mensajería interna.
            </p>
          </div>
          <Button variant="secundario" onClick={cargar}>
            <RefreshCw className="icono icono--sm" aria-hidden="true" />
            Recargar
          </Button>
        </header>

        {mensaje && <p className="plataforma__mensaje" role="status">{mensaje}</p>}

        <div className="plataforma__grid">
          <form className="plataforma-panel" onSubmit={alEnviar("queues", {
            name: cola.name, durable: true,
            deadLetterExchange: cola.dlx || null, deadLetterRoutingKey: cola.dlk || null,
          }, "Cola creada.")}>
            <h2 className="plataforma-panel__titulo">Crear cola</h2>
            <Campo etiqueta="Nombre" valor={cola.name} requerido onChange={(v) => setCola({ ...cola, name: v })} />
            <Campo etiqueta="Dead letter exchange" valor={cola.dlx} onChange={(v) => setCola({ ...cola, dlx: v })} />
            <Campo etiqueta="Routing key de la DLQ" valor={cola.dlk} onChange={(v) => setCola({ ...cola, dlk: v })} />
            <div className="plataforma-panel__acciones">
              <Button type="submit">Crear cola</Button>
            </div>
          </form>

          <form className="plataforma-panel" onSubmit={alEnviar("exchanges", { name: ex.name, type: ex.type, durable: true }, "Exchange creado.")}>
            <h2 className="plataforma-panel__titulo">Crear exchange</h2>
            <Campo etiqueta="Nombre" valor={ex.name} requerido onChange={(v) => setEx({ ...ex, name: v })} />
            <label className="campo">
              <span className="campo__label">Tipo</span>
              <select className="campo__control" value={ex.type} onChange={(e) => setEx({ ...ex, type: e.target.value })}>
                {["topic", "direct", "fanout", "headers"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <div className="plataforma-panel__acciones">
              <Button type="submit">Crear exchange</Button>
            </div>
          </form>

          <form className="plataforma-panel" onSubmit={alEnviar("bindings", bind, "Binding creado.")}>
            <h2 className="plataforma-panel__titulo">Binding</h2>
            <Campo etiqueta="Exchange" valor={bind.exchange} requerido onChange={(v) => setBind({ ...bind, exchange: v })} />
            <Campo etiqueta="Cola" valor={bind.queue} requerido onChange={(v) => setBind({ ...bind, queue: v })} />
            <Campo etiqueta="Routing key" valor={bind.routingKey} onChange={(v) => setBind({ ...bind, routingKey: v })} />
            <div className="plataforma-panel__acciones">
              <Button type="submit">Crear</Button>
              <Button variant="peligro" onClick={() => ejecutar(
                () => enviar(`${BASE}/bindings`, { metodo: "DELETE", cuerpo: bind, mensajes: MENSAJES }),
                "Binding eliminado."
              )}>
                Eliminar
              </Button>
            </div>
          </form>
        </div>

        <h2 className="plataforma__titulo-seccion">
          Colas <span className="plataforma__contador">({colas.length})</span>
        </h2>
        <div className="plataforma__tabla-marco">
          {colas.length === 0 ? <p className="plataforma__vacio">Sin colas que mostrar.</p> : (
            <table className="plataforma__tabla">
              <thead><tr><th>Nombre</th><th>Mensajes</th><th>Consumidores</th><th className="plataforma__celda-acciones">Acciones</th></tr></thead>
              <tbody>
                {colas.map((q) => (
                  <tr key={q.name}>
                    <td>{q.name}</td>
                    <td>{q.messages ?? 0}</td>
                    <td><Badge tone={q.consumers > 0 ? "exito" : "neutral"}>{q.consumers ?? 0}</Badge></td>
                    <td className="plataforma__celda-acciones">
                      <Button variant="peligro" size="sm" onClick={() => eliminar("queues", q.name, "Cola eliminada.")}>Eliminar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <h2 className="plataforma__titulo-seccion">
          Exchanges <span className="plataforma__contador">({exchanges.length})</span>
        </h2>
        <div className="plataforma__tabla-marco">
          {exchanges.length === 0 ? <p className="plataforma__vacio">Sin exchanges que mostrar.</p> : (
            <table className="plataforma__tabla">
              <thead><tr><th>Nombre</th><th>Tipo</th><th className="plataforma__celda-acciones">Acciones</th></tr></thead>
              <tbody>
                {exchanges.map((x) => (
                  <tr key={x.name}>
                    <td>{x.name}</td>
                    <td><Badge tone="neutral">{x.type}</Badge></td>
                    <td className="plataforma__celda-acciones">
                      {/* Los exchanges amq.* son del broker y no se pueden eliminar. */}
                      {!x.name.startsWith("amq.") && (
                        <Button variant="peligro" size="sm" onClick={() => eliminar("exchanges", x.name, "Exchange eliminado.")}>Eliminar</Button>
                      )}
                    </td>
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
