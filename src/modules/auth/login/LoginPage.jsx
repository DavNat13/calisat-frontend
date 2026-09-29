import LoginOptionCard from "./LoginOptionCard";
import LoginSessionBanner from "./LoginSessionBanner";
import { LogoAws, LogoMicrosoft } from "./LoginLogos";
import useLoginActions from "./useLoginActions";
import {
  ACCIONES,
  CABECERA,
  OPCION_INSTITUCIONAL,
  OPCION_PUBLICO,
  PIE,
  SECCION,
} from "./loginCopy";
import "./LoginPage.css";

/**
 * Ruta /login · acceso dual (Microsoft Entra ID + AWS Cognito).
 * Página sin props: todo el comportamiento viene de useLoginActions()
 * (redirect a Entra ID o al Hosted UI de Cognito, sesión activa y cierre)
 * y todo el texto de loginCopy.js. Dos tarjetas, una por proveedor.
 */
export default function LoginPage() {
  const { institucional, publico, sesionActiva, error, cerrando } =
    useLoginActions();

  return (
    <div className="pagina">
      <div className="contenedor">
        <div className="login">
          <header className="pagina__cabecera">
            <div className="pagina__cabecera-texto">
              <h1 className="pagina__titulo">{CABECERA.titulo}</h1>
              <p className="pagina__descripcion">{CABECERA.subtitulo}</p>
            </div>
          </header>

          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}

          <LoginSessionBanner
            proveedor={sesionActiva.proveedor}
            identificador={sesionActiva.identificador}
            onCerrarSesion={sesionActiva.onCerrarSesion}
            cerrando={cerrando}
          />

          {/* Sin <h2> visible: el único h1 es el de la cabecera y los
              títulos de las tarjetas (h2) nombran a cada proveedor. */}
          <section className="login__rejilla" aria-label={SECCION.etiqueta}>
            <LoginOptionCard
              {...OPCION_INSTITUCIONAL}
              Logotipo={LogoMicrosoft}
              accion={{
                etiqueta: ACCIONES.continuar,
                onClick: institucional.onAcceder,
                loading: institucional.loading,
              }}
            />
            <LoginOptionCard
              {...OPCION_PUBLICO}
              Logotipo={LogoAws}
              accion={{
                etiqueta: ACCIONES.continuar,
                onClick: publico.onAcceder,
                loading: publico.loading,
              }}
              accionSecundaria={{
                etiqueta: ACCIONES.registrar,
                onClick: publico.onRegistro,
                loading: publico.registroLoading,
              }}
            />
          </section>

          <p className="login__pie">{PIE}</p>
        </div>
      </div>
    </div>
  );
}
