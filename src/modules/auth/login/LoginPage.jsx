import LoginOptionCard from "./LoginOptionCard";
import LoginSessionBanner from "./LoginSessionBanner";
import useLoginActions from "./useLoginActions";
import {
  ACCIONES,
  CABECERA,
  ID_SECCION,
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
 * y todo el texto de loginCopy.js.
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

          <section aria-labelledby={ID_SECCION}>
            <h2 className="login__titulo-seccion" id={ID_SECCION}>
              {SECCION.titulo}
            </h2>

            <div className="login__rejilla">
              <LoginOptionCard
                {...OPCION_INSTITUCIONAL}
                accion={{
                  etiqueta: ACCIONES.microsoft,
                  onClick: institucional.onAcceder,
                  loading: institucional.loading,
                }}
              />
              <LoginOptionCard
                {...OPCION_PUBLICO}
                accion={{
                  etiqueta: ACCIONES.entrar,
                  onClick: publico.onAcceder,
                  loading: publico.loading,
                }}
                accionSecundaria={{
                  etiqueta: ACCIONES.registrar,
                  onClick: publico.onRegistro,
                  loading: publico.registroLoading,
                }}
              />
            </div>
          </section>

          <p className="login__pie">{PIE}</p>
        </div>
      </div>
    </div>
  );
}
