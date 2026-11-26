import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import useApiAdmin from "../services/apiAdmin";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import "./PlataformaAdmin.css";

const BASE = "/api/v1/kafka";
const MENSAJES = {
  400: "Datos no válidos.",
  404: "Recurso no encontrado.",
  409: "El recurso ya existe o está en uso.",
  502: "Kafka no está disponible o rechazó la operación.",
};

const NUEVO_TOPICO = {
  name: "",
  partitions: 3,
  replicationFactor: 1,
  retention: "604800000",
  cleanup: "delete",
};

/** Administración de Kafka (ms-kafka-admin): tópicos y consumer groups. */
export default function KafkaPage() {
  const { obtener, enviar } = useApiAdmin();
  const [topicos, setTopicos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [nuevo, setNuevo] = useState(NUEVO_TOPICO);

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

  const ver = async (ruta) => {
    try {
      setDetalle(await obtener(`${BASE}/${ruta}`, { mensajes: MENSAJES }));
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const cambiar = (campo) => (e) => setNuevo({ ...nuevo, [campo]: e.target.value });

  const crear = (e) => {
    e.preventDefault();
    ejecutar(
      () =>
        enviar(`${BASE}/topics`, {
          cuerpo: {
            name: nuevo.name,
            partitions: Number(nuevo.partitions),
            replicationFactor: Number(nuevo.replicationFactor),
            configs: {
              "retention.ms": String(nuevo.retention),
              "cleanup.policy": nuevo.cleanup,
            },
          },
          mensajes: MENSAJES,
        }),
      "Tópico creado."
    );
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
            <h1 className="pagina__titulo">Kafka</h1>
            <p className="pagina__descripcion">
              Administra los tópicos y consumer groups del clúster de streaming.
            </p>
          </div>
          <Button variant="secundario" onClick={cargar}>
            <RefreshCw className="icono icono--sm" aria-hidden="true" />
            Recargar
          </Button>
        </header>

        {mensaje && <p className="plataforma__mensaje" role="status">{mensaje}</p>}

        <form className="plataforma-panel" onSubmit={crear}>
          <h2 className="plataforma-panel__titulo">Crear tópico</h2>
          <div className="plataforma__campos">
            <label className="campo">
              <span className="campo__label">Nombre</span>
              <input className="campo__control" required value={nuevo.name} onChange={cambiar("name")} />
            </label>
            <label className="campo">
              <span className="campo__label">Particiones</span>
              <input className="campo__control" type="number" min="1" value={nuevo.partitions} onChange={cambiar("partitions")} />
            </label>
            <label className="campo">
              <span className="campo__label">Réplicas</span>
              <input className="campo__control" type="number" min="1" value={nuevo.replicationFactor} onChange={cambiar("replicationFactor")} />
            </label>
            <label className="campo">
              <span className="campo__label">Retención (ms)</span>
              <input className="campo__control" inputMode="numeric" value={nuevo.retention} onChange={cambiar("retention")} />
            </label>
            <label className="campo">
              <span className="campo__label">Limpieza</span>
              <select className="campo__control" value={nuevo.cleanup} onChange={cambiar("cleanup")}>
                <option>delete</option>
                <option>compact</option>
              </select>
            </label>
          </div>
          <div className="plataforma-panel__acciones">
            <Button type="submit">Crear tópico</Button>
          </div>
        </form>

        <h2 className="plataforma__titulo-seccion">
          Tópicos <span className="plataforma__contador">({topicos.length})</span>
        </h2>
        <div className="plataforma__tabla-marco">
          {topicos.length === 0 ? <p className="plataforma__vacio">Sin tópicos que mostrar.</p> : (
            <table className="plataforma__tabla">
              <thead><tr><th>Nombre</th><th className="plataforma__celda-acciones">Acciones</th></tr></thead>
              <tbody>
                {topicos.map((t) => (
                  <tr key={t}>
                    <td>{t}</td>
                    <td className="plataforma__celda-acciones">
                      <Button variant="secundario" size="sm" onClick={() => ver(`topics/${encodeURIComponent(t)}`)}>Detalle</Button>
                      <Button variant="peligro" size="sm" onClick={() => eliminar("topics", t, "Tópico eliminado.")}>Eliminar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <h2 className="plataforma__titulo-seccion">
          Consumer groups <span className="plataforma__contador">({grupos.length})</span>
        </h2>
        <div className="plataforma__tabla-marco">
          {grupos.length === 0 ? <p className="plataforma__vacio">Sin grupos que mostrar.</p> : (
            <table className="plataforma__tabla">
              <thead><tr><th>Grupo</th><th>Estado</th><th className="plataforma__celda-acciones">Acciones</th></tr></thead>
              <tbody>
                {grupos.map((g) => (
                  <tr key={g.groupId}>
                    <td>{g.groupId}</td>
                    <td><Badge tone={String(g.state).toUpperCase() === "STABLE" ? "exito" : "neutral"}>{g.state}</Badge></td>
                    <td className="plataforma__celda-acciones">
                      <Button variant="secundario" size="sm" onClick={() => ver(`groups/${encodeURIComponent(g.groupId)}`)}>Lag</Button>
                      <Button variant="peligro" size="sm" onClick={() => eliminar("groups", g.groupId, "Grupo eliminado.")}>Eliminar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {detalle && (
          <>
            <h2 className="plataforma__titulo-seccion">Detalle de {detalle.name ?? detalle.groupId}</h2>
            <pre className="plataforma__pre">{JSON.stringify(detalle, null, 2)}</pre>
          </>
        )}
      </div>
    </div>
  );
}
