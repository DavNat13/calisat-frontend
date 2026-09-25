import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import {
  Bell,
  Boxes,
  Calendar,
  CheckCircle2,
  CircleAlert,
  History,
  MapPin,
  Package,
  PackagePlus,
  Truck,
  Warehouse,
} from "lucide-react";
import useAuthRole from "../../../auth/useAuthRole";
import { ROLES } from "../../../auth/roles";
import useAdminService, { UMBRAL_BAJO_STOCK } from "../services/adminService";
import Badge from "../../../components/ui/Badge";
import "./DashboardPage.css";

/* ----------------------------- Formateo ------------------------------- */
const FORMATO_NUMERO = new Intl.NumberFormat("es-CL");

/** Número a texto; cualquier dato ausente se comunica como «—». */
const aTexto = (valor) =>
  typeof valor === "number" ? FORMATO_NUMERO.format(valor) : "—";

const aFecha = (valor) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? "—"
    : fecha.toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });
};

/* --------------------------- Envíos ----------------------------------- */
const ORDEN_ESTADOS = [
  "CREADO",
  "EN_PREPARACION",
  "DESPACHADO",
  "EN_TRANSITO",
  "ENTREGADO",
  "FALLIDO",
  "DEVUELTO",
];

const ETIQUETA_ESTADO = {
  CREADO: "Envíos creados",
  EN_PREPARACION: "En preparación",
  DESPACHADO: "Despachados",
  EN_TRANSITO: "En tránsito",
  ENTREGADO: "Entregados",
  FALLIDO: "Fallidos",
  DEVUELTO: "Devueltos",
};

const ICONO_ESTADO = {
  CREADO: Package,
  EN_PREPARACION: Boxes,
  DESPACHADO: Truck,
  EN_TRANSITO: MapPin,
  ENTREGADO: CheckCircle2,
  FALLIDO: CircleAlert,
  DEVUELTO: History,
};

const TONO_ESTADO = {
  ENTREGADO: "exito",
  FALLIDO: "peligro",
  DEVUELTO: "peligro",
};

const DATOS_INICIALES = {
  catalogo: { activos: null, inactivos: null },
  inventario: null,
  notificaciones: { total: null, fallidas: null },
  envios: null,
};

/* -------------------------- Componentes ------------------------------- */

/** Tarjeta de estadística: círculo de icono + etiqueta + valor grande. */
function StatTarjeta({ Icono, etiqueta, valor }) {
  return (
    <article className="stat-tarjeta">
      <span className="stat-tarjeta__icono">
        <Icono className="icono" aria-hidden="true" />
      </span>
      <div className="stat-tarjeta__texto">
        <p className="stat-tarjeta__label">{etiqueta}</p>
        <p className="stat-tarjeta__valor">{valor}</p>
      </div>
    </article>
  );
}

/** Sección del panel: <h2> con filete inferior + contenido (grid/lista). */
function Seccion({ id, titulo, children }) {
  return (
    <section className="admin-dashboard__seccion" aria-labelledby={id}>
      <h2 className="admin-dashboard__titulo-seccion" id={id}>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

/* ----------------------------- Página --------------------------------- */

/**
 * Dashboard del panel de administración (Fase 1).
 *
 * ADMIN: catálogo (activos/inactivos), inventario (registros/unidades/bajo
 * stock), notificaciones (total/fallidas), envíos (total + por estado),
 * acciones rápidas, últimos envíos y panel de bienvenida.
 * LOGISTICA: solo envíos, acciones rápidas y bienvenida.
 *
 * Cada llamada se envuelve en un `intentar()` propio: un fallo parcial deja
 * «—» en su tarjeta y suma un aviso, sin romper el resto del panel.
 */
export default function DashboardPage() {
  const { accounts } = useMsal();
  const { hasRole } = useAuthRole();
  const esAdministrador = hasRole(ROLES.ADMINISTRADOR);
  const {
    obtenerTotalProductosActivos,
    obtenerTotalProductosInactivos,
    obtenerResumenInventario,
    obtenerTotalNotificaciones,
    obtenerNotificacionesFallidas,
    obtenerResumenEnvios,
  } = useAdminService();

  const [cargando, setCargando] = useState(true);
  const [avisos, setAvisos] = useState([]);
  const [datos, setDatos] = useState(DATOS_INICIALES);

  useEffect(() => {
    let cancelado = false;

    const intentar = (promesa) =>
      promesa.then((datosNuevos) => ({ datos: datosNuevos })).catch((error) => ({ error }));
    const omitido = async () => ({ omitido: true });

    (async () => {
      // Promise.all con tolerancia a fallos parciales: si un bloque no
      // resuelve, sus tarjetas se pintan como «—» y se avisa al final.
      const peticiones = esAdministrador
        ? [
            intentar(obtenerTotalProductosActivos()),
            intentar(obtenerTotalProductosInactivos()),
            intentar(obtenerResumenInventario()),
            intentar(obtenerTotalNotificaciones()),
            intentar(obtenerNotificacionesFallidas()),
            intentar(obtenerResumenEnvios()),
          ]
        : [
            omitido(),
            omitido(),
            omitido(),
            omitido(),
            omitido(),
            intentar(obtenerResumenEnvios()),
          ];

      const [activos, inactivos, inventario, notificaciones, fallidas, envios] =
        await Promise.all(peticiones);

      if (cancelado) return;

      setDatos({
        catalogo: {
          activos: activos.datos?.total ?? null,
          inactivos: inactivos.datos?.total ?? null,
        },
        inventario: inventario.datos ?? null,
        notificaciones: {
          total: notificaciones.datos?.total ?? null,
          fallidas: fallidas.datos?.total ?? null,
        },
        envios: envios.datos ?? null,
      });

      const fallos = [];
      if (activos.error || inactivos.error) fallos.push("el catálogo");
      if (inventario.error) fallos.push("el inventario");
      if (notificaciones.error || fallidas.error) fallos.push("las notificaciones");
      if (envios.error) fallos.push("los envíos");
      setAvisos(fallos);
      setCargando(false);
    })();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- el servicio se recrea en cada render (mismo patrón que useProductos)
  }, []);

  /* --------------------------- Derivados ------------------------------ */
  const nombreCuenta = accounts[0]?.name || accounts[0]?.username;
  const nombre = nombreCuenta || (esAdministrador ? "Administrador" : "Logística");
  const subtitulo = esAdministrador
    ? "Resumen general de la actividad de Calisat."
    : "Panel de logística: estado actual de los envíos.";

  const inventario = datos.inventario;
  const envios = datos.envios;
  const recientes = envios?.recientes ?? [];
  const tarjetasEstado = ORDEN_ESTADOS.map((estado) => ({
    estado,
    valor: envios?.porEstado?.[estado] ?? 0,
  })).filter((tarjeta) => tarjeta.valor > 0);

  const acciones = esAdministrador
    ? [
        {
          etiqueta: "Nuevo producto",
          Icono: PackagePlus,
          ruta: "/admin/productos",
          variante: "primario",
        },
        {
          etiqueta: "Añadir stock",
          Icono: Warehouse,
          ruta: "/admin/inventario",
          variante: "secundario",
        },
        {
          etiqueta: "Gestionar envíos",
          Icono: Truck,
          ruta: "/admin/envios",
          variante: "secundario",
        },
        {
          etiqueta: "Notificaciones",
          Icono: Bell,
          ruta: "/admin/notificaciones",
          variante: "secundario",
        },
      ]
    : [
        {
          etiqueta: "Gestionar envíos",
          Icono: Truck,
          ruta: "/admin/envios",
          variante: "primario",
        },
      ];

  return (
    <div className="pagina admin-dashboard" aria-busy={cargando}>
      <div className="contenedor">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Bienvenido, {nombre}</h1>
            <p className="pagina__descripcion">{subtitulo}</p>
          </div>
        </header>

        {cargando ? (
          <p className="admin-dashboard__carga" role="status">
            <span className="admin-dashboard__carga-icono anim-spin" aria-hidden="true" />
            Cargando estadísticas del panel...
          </p>
        ) : (
          <>
            {avisos.length > 0 && (
              <p className="admin-dashboard__aviso" role="alert">
                {`No se pudo cargar ${avisos.join(", ")}. Sus datos se muestran como «—».`}
              </p>
            )}

            {esAdministrador && (
              <>
                <Seccion id="panel-catalogo" titulo="Catálogo">
                  <div className="admin-dashboard__grid">
                    <StatTarjeta
                      Icono={Package}
                      etiqueta="Productos activos"
                      valor={aTexto(datos.catalogo.activos)}
                    />
                    <StatTarjeta
                      Icono={Boxes}
                      etiqueta="Productos inactivos"
                      valor={aTexto(datos.catalogo.inactivos)}
                    />
                  </div>
                </Seccion>

                <Seccion id="panel-inventario" titulo="Inventario">
                  <div className="admin-dashboard__grid">
                    <StatTarjeta
                      Icono={Warehouse}
                      etiqueta="Registros de stock"
                      valor={aTexto(inventario?.registros)}
                    />
                    <StatTarjeta
                      Icono={Package}
                      etiqueta="Unidades disponibles"
                      valor={aTexto(inventario?.unidadesDisponibles)}
                    />
                    <StatTarjeta
                      Icono={CircleAlert}
                      etiqueta={`Bajo stock (≤ ${UMBRAL_BAJO_STOCK})`}
                      valor={aTexto(inventario?.bajoStock)}
                    />
                  </div>
                </Seccion>

                <Seccion id="panel-notificaciones" titulo="Notificaciones">
                  <div className="admin-dashboard__grid">
                    <StatTarjeta
                      Icono={Bell}
                      etiqueta="Notificaciones totales"
                      valor={aTexto(datos.notificaciones.total)}
                    />
                    <StatTarjeta
                      Icono={CircleAlert}
                      etiqueta="Notificaciones fallidas"
                      valor={aTexto(datos.notificaciones.fallidas)}
                    />
                  </div>
                </Seccion>
              </>
            )}

            <Seccion id="panel-envios" titulo="Envíos">
              <div className="admin-dashboard__grid">
                <StatTarjeta
                  Icono={Truck}
                  etiqueta="Envíos totales"
                  valor={aTexto(envios?.total)}
                />
                {tarjetasEstado.map((tarjeta) => (
                  <StatTarjeta
                    key={tarjeta.estado}
                    Icono={ICONO_ESTADO[tarjeta.estado] ?? Truck}
                    etiqueta={ETIQUETA_ESTADO[tarjeta.estado] ?? tarjeta.estado}
                    valor={aTexto(tarjeta.valor)}
                  />
                ))}
              </div>
            </Seccion>

            <Seccion id="panel-acciones" titulo="Acciones rápidas">
              <div className="admin-dashboard__acciones">
                {/* Navegación = <Link> (no <button>+navigate): el lector de
                    pantalla lo anuncia como enlace y permite abrir en otra
                    pestaña. El aspecto lo aporta la primitiva .boton. */}
                {acciones.map((accion) => (
                  <Link
                    key={accion.ruta}
                    to={accion.ruta}
                    className={`boton boton--${accion.variante}`}
                  >
                    <span className="boton__icono" aria-hidden="true">
                      <accion.Icono className="icono" />
                    </span>
                    {accion.etiqueta}
                  </Link>
                ))}
              </div>
            </Seccion>

            <Seccion id="panel-ultimos-envios" titulo="Últimos envíos">
              {recientes.length === 0 ? (
                /* Mismo nodo para los dos casos: vacío = status, fallo de
                   carga = alert (role dinámico según el origen del estado). */
                <p
                  className="admin-dashboard__vacio"
                  role={envios ? "status" : "alert"}
                >
                  {envios
                    ? "Todavía no hay envíos registrados."
                    : "No se pudieron cargar los envíos."}
                </p>
              ) : (
                <ul className="admin-dashboard__lista-envios">
                  {recientes.map((envio) => {
                    const estado = String(envio?.estado ?? "SIN_ESTADO").toUpperCase();
                    return (
                      <li
                        key={envio?.id ?? envio?.numeroGuia}
                        className="envio-tarjeta"
                      >
                        <div className="envio-tarjeta__info">
                          <span className="envio-tarjeta__guia">
                            {envio?.numeroGuia || "—"}
                          </span>
                          <span className="envio-tarjeta__transportista">
                            {envio?.transportista || "Sin transportista asignado"}
                          </span>
                          <span className="envio-tarjeta__fecha">
                            <Calendar className="icono icono--sm" aria-hidden="true" />
                            {aFecha(envio?.fechaCreacion)}
                          </span>
                        </div>
                        <div className="envio-tarjeta__acciones">
                          <Badge tone={TONO_ESTADO[estado] ?? "neutral"}>
                            {ETIQUETA_ESTADO[estado] ?? estado}
                          </Badge>
                          <Link
                            to="/admin/envios"
                            className="boton boton--secundario boton--sm"
                          >
                            Gestionar
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Seccion>

            <section
              className="admin-dashboard__seccion admin-dashboard__bienvenida"
              aria-labelledby="panel-bienvenida"
            >
              <h2 className="admin-dashboard__bienvenida-titulo" id="panel-bienvenida">
                {esAdministrador ? "Panel de Control Conectado" : "Panel de logística"}
              </h2>
              <p className="admin-dashboard__bienvenida-texto">
                {esAdministrador
                  ? "Desde aquí gestionas el catálogo, el inventario, los envíos y las notificaciones de Calisat. Todos los datos se cargan en vivo desde la API."
                  : "Consulta el estado de los envíos y accede a su gestión desde este panel. Todos los datos se cargan en vivo desde la API."}
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
