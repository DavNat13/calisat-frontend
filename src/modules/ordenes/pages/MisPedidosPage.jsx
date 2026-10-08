import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/ui/Button";
import TarjetaPedido from "../components/TarjetaPedido";
import useOrdenService from "../services/ordenService";
import "./MisPedidosPage.css";

/**
 * "Mis pedidos": listado de las órdenes del usuario con su detalle y la
 * posibilidad de cancelar mientras no estén en un estado final.
 * Datos de `ms-orden` (GET /api/v1/ordenes, solo las propias).
 */
export default function MisPedidosPage() {
  const servicio = useOrdenService();
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cancelando, setCancelando] = useState(null);

  // Arranque: la carga se escribe dentro del `async` (tras el `await`), no en
  // el cuerpo del efecto, para no encadenar renders. El refresco manual sí
  // marca "cargando" antes de consultar.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const datos = await servicio.misPedidos();
        if (cancelado) return;
        setOrdenes(datos);
        setError(null);
      } catch (detalle) {
        if (cancelado) return;
        setError(detalle.message);
        setOrdenes([]);
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [servicio]);

  const recargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setOrdenes(await servicio.misPedidos());
    } catch (detalle) {
      setError(detalle.message);
      setOrdenes([]);
    } finally {
      setCargando(false);
    }
  };

  const cancelar = async (id) => {
    setCancelando(id);
    try {
      await servicio.cancelar(id);
      await recargar();
    } catch (detalle) {
      setError(detalle.message);
    } finally {
      setCancelando(null);
    }
  };

  return (
    <div className="pagina">
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Mis pedidos</h1>
            <p className="pagina__descripcion">
              Historial de tus compras y su estado de envío.
            </p>
          </div>
          <div className="pagina__acciones">
            <Button variant="secundario" onClick={recargar} disabled={cargando}>
              {cargando ? "Cargando…" : "Recargar"}
            </Button>
          </div>
        </header>

        {error && (
          <p className="pedidos__error" role="alert">
            {error}
          </p>
        )}

        {!cargando && ordenes.length === 0 && !error && (
          <div className="tarjeta pedidos__vacio">
            <p>Todavía no has hecho ningún pedido.</p>
            <Link className="boton boton--primario" to="/productos">
              Ver productos
            </Link>
          </div>
        )}

        <ul className="pedidos__lista">
          {ordenes.map((orden) => (
            <TarjetaPedido
              key={orden.id}
              orden={orden}
              cancelando={cancelando}
              onCancel={cancelar}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
