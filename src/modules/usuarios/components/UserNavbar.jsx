import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { User, LogOut, LogIn, LayoutDashboard } from "lucide-react";
import { loginRequest } from "../../../auth/AuthConfig";
import useUserSync from "../hooks/useUserSync";
import useAuthRole from "../../../auth/useAuthRole";
import { ROLES } from "../../../auth/roles";
import Button from "../../../components/ui/Button";
import enfocarContenido from "../../../utils/enfocarContenido";
import "./UserNavbar.css";

/** Opciones enfocables del desplegable, en orden visual. */
const listarOpciones = (contenedor) =>
  Array.from(contenedor?.querySelectorAll(".usuario__opcion") ?? []);

export default function UserNavbar() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const { hasAnyRole, roles } = useAuthRole();
  const [showMenu, setShowMenu] = useState(false);
  const contenedorRef = useRef(null);
  const botonRef = useRef(null);
  useUserSync();

  // Cerrar y sacar el foco del sitio que se desmonta: los enlaces del
  // desplegable desaparecen al navegar y, sin esto, el foco quedaría en
  // <body>; se traslada al contenido principal (tabindex="-1").
  const cerrarYEnfocarContenido = () => {
    setShowMenu(false);
    enfocarContenido();
  };

  // Cierre con Escape (devuelve el foco al botón), con clic fuera y con el
  // botón "atrás/adelante" del navegador: el clic fuera cubre la navegación
  // desde los enlaces de la navbar y el popstate la que hace el historial
  // (en ambos casos el desplegable dejaba de estar en la página nueva).
  useEffect(() => {
    if (!showMenu) return undefined;

    const alPulsarEscape = (evento) => {
      if (evento.key !== "Escape") return;
      const focoDentro = contenedorRef.current?.contains(document.activeElement);
      setShowMenu(false);
      if (focoDentro) botonRef.current?.focus();
    };
    const alPulsarFuera = (evento) => {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target)) {
        setShowMenu(false);
      }
    };
    const alCambiarHistoria = () => {
      const focoDentro = contenedorRef.current?.contains(document.activeElement);
      setShowMenu(false);
      if (focoDentro) botonRef.current?.focus();
    };

    document.addEventListener("keydown", alPulsarEscape);
    document.addEventListener("mousedown", alPulsarFuera);
    window.addEventListener("popstate", alCambiarHistoria);
    return () => {
      document.removeEventListener("keydown", alPulsarEscape);
      document.removeEventListener("mousedown", alPulsarFuera);
      window.removeEventListener("popstate", alCambiarHistoria);
    };
  }, [showMenu]);

  // Al abrir, el foco entra al primer elemento del desplegable
  // (patrón menu-button: Escape lo devuelve al botón).
  useEffect(() => {
    if (!showMenu) return;
    listarOpciones(contenedorRef.current)[0]?.focus();
  }, [showMenu]);

  // Flechas ↑/↓ para recorrer las opciones del desplegable
  const manejarTeclas = (evento) => {
    if (evento.key !== "ArrowDown" && evento.key !== "ArrowUp") return;

    if (!showMenu) {
      // Cerrado: el desplegable NO está montado, así que lista está siempre
      // vacía y comprobar su longitud dejaba este ramo inalcanzable (↓ no
      // abría nunca el menú). Al abrir, el efecto de arriba enfoca la 1ª opción.
      if (evento.key === "ArrowDown") {
        evento.preventDefault();
        setShowMenu(true);
      }
      return;
    }

    const lista = listarOpciones(contenedorRef.current);
    if (lista.length === 0) return;

    evento.preventDefault();
    const indice = lista.indexOf(document.activeElement);
    const delta = evento.key === "ArrowDown" ? 1 : -1;
    const siguiente =
      indice === -1
        ? delta > 0
          ? 0
          : lista.length - 1
        : (indice + delta + lista.length) % lista.length;
    lista[siguiente].focus();
  };

  const handleLogin = () => {
    instance
      .loginRedirect(loginRequest)
      .catch((e) => console.error("Error en login:", e));
  };

  const handleLogout = () => {
    instance.logoutRedirect().catch(e => console.error("Error en logout:", e));
  };

  if (isAuthenticated && accounts.length > 0) {
    const esCliente = hasAnyRole(ROLES.CLIENTE);
    const esAdministrador = hasAnyRole(ROLES.ADMINISTRADOR);
    const esLogistica = hasAnyRole(ROLES.LOGISTICA);
    // Acceso al panel: mismos roles que las rutas /admin.
    const puedePanel = hasAnyRole([ROLES.ADMINISTRADOR, ROLES.LOGISTICA]);
    const rolVisible = roles[0] ?? "SIN ROL";
    // Cuenta ACTIVA (misma regla que los servicios y que AdminSidebar);
    // accounts[0] solo como respaldo si MSAL no tiene activa.
    const cuenta = instance.getActiveAccount() ?? accounts[0];

    return (
      <div className="usuario" ref={contenedorRef} onKeyDown={manejarTeclas}>
        <button
          type="button"
          ref={botonRef}
          className="usuario__boton"
          onClick={() => setShowMenu((abierto) => !abierto)}
          aria-label="Menú de usuario"
          aria-haspopup="true"
          aria-expanded={showMenu}
        >
          <User className="icono" aria-hidden="true" />
          {/* name puede venir vacío en cuentas sin perfil visual: sin el
              respaldo a username, el botón quedaría con solo el icono. */}
          <span className="usuario__nombre">
            {cuenta?.name || cuenta?.username || "Mi cuenta"}
          </span>
        </button>
        {showMenu && (
          <div className="usuario__desplegable anim-slide-down sombra-panel redondeado-control">
            <p className="usuario__rol">Rol: {rolVisible}</p>
            {puedePanel && (
              <>
                <Link
                  to="/admin"
                  className="usuario__opcion"
                  onClick={cerrarYEnfocarContenido}
                >
                  <LayoutDashboard className="icono icono--sm" aria-hidden="true" />
                  Panel de administración
                </Link>
                <hr className="usuario__separador" />
              </>
            )}
            {esCliente && (
              <Link
                to="/perfil"
                className="usuario__opcion"
                onClick={cerrarYEnfocarContenido}
              >
                Mi Perfil
              </Link>
            )}
            {esAdministrador && (
              <Link
                to="/admin/productos"
                className="usuario__opcion"
                onClick={cerrarYEnfocarContenido}
              >
                Crear Productos
              </Link>
            )}
            {esLogistica && (
              <Link
                to="/productos"
                className="usuario__opcion"
                onClick={cerrarYEnfocarContenido}
              >
                Catálogo
              </Link>
            )}
            <button
              type="button"
              className="usuario__opcion usuario__opcion--salir"
              onClick={handleLogout}
            >
              <LogOut className="icono icono--sm" aria-hidden="true" />
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      variant="primario"
      size="sm"
      onClick={handleLogin}
      icon={<LogIn className="icono" aria-hidden="true" />}
    >
      Iniciar Sesión
    </Button>
  );
}
