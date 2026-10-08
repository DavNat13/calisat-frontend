import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import useCarrito from "../hooks/useCarrito";
import useCrearOrden from "../../ordenes/hooks/useCrearOrden";
import useCotizacionService, {
  UMBRAL_GRATIS,
} from "../../ordenes/services/cotizacionService";
import { formatoCLP } from "../../../utils/formatoCLP";
import "./CheckoutPage.css";

/** Dirección por defecto: Puerto Montt, Chile (sede de CalisaT). */
const DIRECCION_INICIAL = {
  direccionCalle: "O'Higgins 680",
  direccionCiudad: "Puerto Montt",
  direccionPais: "Chile",
  direccionCodigoPostal: "5500000",
};

const vacia = (valor) => !String(valor ?? "").trim();

/**
 * Checkout: resumen del carrito, dirección de entrega, cálculo del envío y
 * confirmación del pedido en `ms-orden`.
 *
 * El envío se cotiza con `POST /api/v1/envios/cotizar` (y con la misma
 * tabla local como respaldo) y se suma al total antes de confirmar; la
 * orden se crea con `costoEnvio` y la dirección en el body.
 */
export default function CheckoutPage() {
  const {
    items,
    cargando,
    cantidadTotal,
    subtotal,
    preciosIncompletos,
    abrir,
  } = useCarrito();
  const { fase, orden, error, confirmar, reiniciar } = useCrearOrden();
  const cotizar = useCotizacionService();

  const [direccion, setDireccion] = useState(DIRECCION_INICIAL);
  const [envio, setEnvio] = useState(null);
  const [cotizando, setCotizando] = useState(false);

  const { direccionCalle, direccionCiudad, direccionPais, direccionCodigoPostal } =
    direccion;

  // Recotiza cuando cambia el destino o el subtotal (con debounce de 300 ms
  // para no martillear el backend mientras se escribe la calle).
  useEffect(() => {
    if (items.length === 0) return undefined;
    const pendiente = setTimeout(async () => {
      setCotizando(true);
      const resultado = await cotizar({
        ciudad: direccionCiudad,
        pais: direccionPais,
        subtotal,
      });
      setEnvio(resultado);
      setCotizando(false);
    }, 300);
    return () => clearTimeout(pendiente);
  }, [direccionCiudad, direccionPais, subtotal, items.length, cotizar]);

  const cambiar = (evento) => {
    const { name, value } = evento.target;
    setDireccion((prev) => ({ ...prev, [name]: value }));
  };

  const costoEnvio = envio?.costo ?? 0;
  const total = subtotal + costoEnvio;
  const direccionCompleta = ![
    direccionCalle,
    direccionCiudad,
    direccionPais,
    direccionCodigoPostal,
  ].some(vacia);

  // Sin ítems (y sin carga en curso) no hay nada que pagar. Tras confirmar
  // el carrito ya está vacío, así que la vista de éxito se protege aparte.
  if (fase !== "confirmado" && items.length === 0 && !cargando) {
    return <Navigate to="/productos" replace />;
  }

  if (fase === "confirmado") {
    return (
      <div className="pagina">
        <div className="contenedor checkout">
          <header className="pagina__cabecera">
            <div className="pagina__cabecera-texto">
              <h1 className="pagina__titulo">¡Pedido confirmado!</h1>
              <p className="pagina__descripcion">
                Enviamos la confirmación a tu correo. Sigue el estado desde
                "Mis pedidos".
              </p>
            </div>
          </header>
          <section className="tarjeta checkout__resumen" aria-label="Pedido creado">
            <p>
              Número de pedido: <strong>{orden?.id ?? "—"}</strong>
            </p>
            <p>
              Estado: <Badge tone="amarillo">{orden?.estado ?? "PENDIENTE"}</Badge>
            </p>
            <p className="checkout__destino">
              Entrega en {direccionCalle}, {direccionCiudad},{" "}
              {direccionCodigoPostal} ({direccionPais})
            </p>
            <div className="tarjeta__footer checkout__total">
              <span>Total (envío incluido)</span>
              <strong>{formatoCLP(orden?.total ?? total)}</strong>
            </div>
          </section>
          <div className="pagina__acciones">
            <Link className="boton boton--primario" to="/mis-pedidos">
              Ver mis pedidos
            </Link>
            <Link className="boton boton--secundario" to="/productos">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina">
      <div className="contenedor checkout">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Resumen del pedido</h1>
            <p className="pagina__descripcion">
              Confirma tu dirección para calcular el envío y revisa el total
              antes de pagar. Precios en pesos chilenos (CLP).
            </p>
          </div>
        </header>

        <section className="tarjeta checkout__resumen" aria-label="Productos">
          <ul className="checkout__lista">
            {items.map((item) => (
              <li key={item.sku} className="checkout__fila">
                <span className="checkout__nombre">
                  {item.nombre}
                  <span className="checkout__cantidad"> × {item.cantidad}</span>
                </span>
                <span className="checkout__precio">
                  {formatoCLP(item.precio == null ? null : item.precio * item.cantidad)}
                </span>
              </li>
            ))}
          </ul>
          <div className="checkout__lineas">
            <span>Subtotal ({cantidadTotal} producto{cantidadTotal === 1 ? "" : "s"})</span>
            <strong>{formatoCLP(subtotal)}</strong>
          </div>
          <div className="checkout__lineas">
            <span>
              Envío{envio ? ` · ${envio.etiquetaZona} · ${envio.plazo} días` : ""}
              {cotizando ? " (calculando…)" : ""}
            </span>
            <strong>{formatoCLP(costoEnvio)}</strong>
          </div>
          {envio?.gratisPorMonto && (
            <p className="checkout__aviso" role="status">
              Tu pedido supera los {formatoCLP(UMBRAL_GRATIS)}: el envío va por
              cuenta nuestra.
            </p>
          )}
          <div className="tarjeta__footer checkout__total">
            <span>Total a pagar</span>
            <strong>{formatoCLP(total)}</strong>
          </div>
        </section>

        <section className="tarjeta checkout__direccion" aria-label="Dirección de entrega">
          <h2 className="checkout__subtitulo">Dirección de entrega</h2>
          <form className="checkout__formulario" onSubmit={(e) => e.preventDefault()}>
            <Input
              label="Calle y número"
              id="co-calle"
              name="direccionCalle"
              value={direccionCalle}
              onChange={cambiar}
              maxLength={200}
              required
              placeholder="O'Higgins 680"
            />
            <Input
              label="Ciudad / comuna"
              id="co-ciudad"
              name="direccionCiudad"
              value={direccionCiudad}
              onChange={cambiar}
              maxLength={120}
              required
              placeholder="Puerto Montt"
            />
            <Input
              label="País"
              id="co-pais"
              name="direccionPais"
              value={direccionPais}
              onChange={cambiar}
              maxLength={64}
              required
              placeholder="Chile"
            />
            <Input
              label="Código postal"
              id="co-cp"
              name="direccionCodigoPostal"
              value={direccionCodigoPostal}
              onChange={cambiar}
              maxLength={20}
              required
              placeholder="5500000"
            />
          </form>
        </section>

        {preciosIncompletos && (
          <p className="checkout__aviso" role="status">
            Algunos precios no están disponibles; el total se confirma al pagar.
          </p>
        )}

        {error && (
          <p className="checkout__aviso checkout__aviso--error" role="alert">
            {error}
          </p>
        )}

        <section className="tarjeta checkout__pago" aria-label="Confirmación">
          <Badge tone="amarillo">Pedido en curso</Badge>
          <p className="checkout__pago-texto">
            Al confirmar se reserva el stock, se calcula el envío y se crea tu
            pedido con la dirección indicada.
          </p>
          <div className="pagina__acciones">
            <Button
              onClick={() => confirmar({ direccion, costoEnvio })}
              disabled={fase === "enviando" || !direccionCompleta}
            >
              {fase === "enviando" ? "Confirmando…" : "Confirmar pedido"}
            </Button>
            <Button variant="secundario" onClick={abrir}>
              Volver al carrito
            </Button>
            {fase === "error" && (
              <Button variant="secundario" onClick={reiniciar}>
                Intentar de nuevo
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
