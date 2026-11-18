import { useCallback, useEffect, useState } from "react";
import useApiAdmin from "../services/apiAdmin";
import "./PlataformaAdmin.css";

const BASE = "/api/v1/kafka";
const MENSAJES = {
  400: "Datos no válidos.",
  404: "Recurso no encontrado.",
  409: "El recurso ya existe o está en uso.",
  502: "Kafka no está disponible o rechazó la operación.",
};

/** Administración de Kafka (ms-kafka-admin): tópicos y consumer groups. */
export default function KafkaPage() {
  const { obtener, enviar } = useApiAdmin();
  const [topicos, setTopicos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [nuevo, setNuevo] = useState({ name: "", partitions: 3, replicationFactor: 1,
    retention: "604800000", cleanup: "delete" });

  const cargar = useCallback(async () => {
    try {
      const [t, g] = await Promise.all([
        obtener(`${BASE}/topics`, { mensajes: MENSAJES }),
        obtener(`${BASE}/groups`, { mensajes: MENSAJES }),
      ]);
      setTopicos(t ?? []);
      setGrupos(g ?? []);
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

  const verTopico = async (name) => {
    try { setDetalle(await obtener(`${BASE}/topics/${encodeURIComponent(name)}`, { mensajes: MENSAJES })); }
    catch (err) { setMensaje(err.message); }
  };

  return (
    <div className="plataforma">
      <h1 className="pagina__titulo">Administración de Kafka</h1>
      {mensaje && <p role="status">{mensaje}</p>}

      <form className="tarjeta" onSubmit={(e) => { e.preventDefault();
        ejecutar(() => enviar(`${BASE}/topics`, { cuerpo: {
          name: nuevo.name, partitions: Number(nuevo.partitions), replicationFactor: Number(nuevo.replicationFactor),
          configs: { "retention.ms": String(nuevo.retention), "cleanup.policy": nuevo.cleanup } }, mensajes: MENSAJES }), "Tópico creado."); }}>
        <h2>Crear tópico</h2>
        <div className="plataforma__fila">
          <input className="input" placeholder="nombre" required value={nuevo.name} onChange={(e) => setNuevo({ ...nuevo, name: e.target.value })} />
          <input className="input" type="number" min="1" title="particiones" value={nuevo.partitions} onChange={(e) => setNuevo({ ...nuevo, partitions: e.target.value })} />
          <input className="input" type="number" min="1" title="réplicas" value={nuevo.replicationFactor} onChange={(e) => setNuevo({ ...nuevo, replicationFactor: e.target.value })} />
          <input className="input" title="retention.ms" value={nuevo.retention} onChange={(e) => setNuevo({ ...nuevo, retention: e.target.value })} />
          <select className="input" value={nuevo.cleanup} onChange={(e) => setNuevo({ ...nuevo, cleanup: e.target.value })}>
            <option>delete</option><option>compact</option>
          </select>
          <button className="boton boton--primario" type="submit">Crear</button>
        </div>
      </form>

      <section className="tarjeta">
        <h2>Tópicos ({topicos.length})</h2>
        <ul className="plataforma__lista">
          {topicos.map((t) => (
            <li key={t}>
              <span>{t}</span>
              <button className="boton boton--secundario" type="button" onClick={() => verTopico(t)}>Detalle</button>
              <button className="boton boton--secundario" type="button"
                onClick={() => window.confirm(`¿Eliminar el tópico ${t}?`) &&
                  ejecutar(() => enviar(`${BASE}/topics/${encodeURIComponent(t)}`, { metodo: "DELETE", mensajes: MENSAJES }), "Tópico eliminado.")}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
        {detalle && (
          <pre className="plataforma__pre" aria-label="Detalle del tópico">{JSON.stringify(detalle, null, 2)}</pre>
        )}
      </section>

      <section className="tarjeta">
        <h2>Consumer groups ({grupos.length})</h2>
        <ul className="plataforma__lista">
          {grupos.map((g) => (
            <li key={g.groupId}>
              <span>{g.groupId} <small>({g.state})</small></span>
              <button className="boton boton--secundario" type="button"
                onClick={async () => { try { setDetalle(await obtener(`${BASE}/groups/${encodeURIComponent(g.groupId)}`, { mensajes: MENSAJES })); } catch (err) { setMensaje(err.message); } }}>
                Lag
              </button>
              <button className="boton boton--secundario" type="button"
                onClick={() => window.confirm(`¿Eliminar el grupo ${g.groupId}?`) &&
                  ejecutar(() => enviar(`${BASE}/groups/${encodeURIComponent(g.groupId)}`, { metodo: "DELETE", mensajes: MENSAJES }), "Grupo eliminado.")}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
