import { useEffect, useRef, useState } from "react";
import useUserProfile from "../hooks/useUserProfile";
import PerfilTarjeta from "../components/PerfilTarjeta";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import "./UserProfile.css";

/**
 * Ruta /perfil · datos de la cuenta. Carga SOLO con Bearer (el hook pide el
 * token a MSAL). Si el backend responde 403 (exige rol CLIENTE) o 404 (sin
 * ficha) la página no se rompe: avisa con role="alert" y sustituye la
 * tarjeta por el modo fallback de PerfilTarjeta (datos de la sesión local).
 */
export default function UserProfile() {
  const { perfil, loading, mensaje, codigoFallo, obtenerPerfil, actualizarNombre, eliminarPerfil } = useUserProfile();
  const [nombre, setNombre] = useState("");
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);
  const yaCargo = useRef(false);

  // Carga automática al montar. El guard ref evita la doble petición de
  // StrictMode (mount → unmount → mount), que repetiría el GET de perfil.
  useEffect(() => {
    if (yaCargo.current) return;
    yaCargo.current = true;
    obtenerPerfil();
  }, [obtenerPerfil]);

  // 403/404: no hay ficha servida → se muestran los datos de la sesión.
  const enFallback = codigoFallo === 403 || codigoFallo === 404;

  const handleActualizar = () => {
    if (nombre.trim()) {
      actualizarNombre(nombre.trim());
      setNombre("");
    }
  };

  // Acción destructiva: siempre mediada por diálogo de confirmación
  const handleEliminar = () => {
    setConfirmarEliminacion(false);
    eliminarPerfil();
  };

  return (
    <div className="pagina">
      <div className="contenedor">
        <div className="perfil" aria-busy={loading}>
          <header className="pagina__cabecera">
            <div className="pagina__cabecera-texto">
              <h1 className="pagina__titulo">Mi Perfil</h1>
              <p className="pagina__descripcion">Consulta y actualiza los datos de tu cuenta.</p>
            </div>
            <div className="pagina__acciones">
              <Button variant="primario" onClick={obtenerPerfil} disabled={loading}>
                {loading ? "Cargando..." : "Recargar"}
              </Button>
            </div>
          </header>

          {codigoFallo === 403 && (
            <p className="perfil__aviso" role="alert">Los datos completos de la cuenta no están disponibles para tu rol.</p>
          )}
          {perfil && <PerfilTarjeta perfil={perfil} />}
          {!perfil && enFallback && <PerfilTarjeta fallback />}

          <section className="perfil__seccion" aria-labelledby="perfil-actualizar">
            <h2 className="perfil__subtitulo" id="perfil-actualizar">Actualizar Nombre</h2>
            <div className="perfil__actualizar">
              <Input
                label="Nuevo nombre completo"
                id="perfil-nombre"
                type="text"
                placeholder="Ej. Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <Button variant="secundario" onClick={handleActualizar} disabled={loading || !nombre.trim()}>
                Guardar cambios
              </Button>
            </div>
          </section>

          <section className="perfil__seccion perfil__seccion--peligro" aria-labelledby="perfil-eliminar">
            <h2 className="perfil__subtitulo" id="perfil-eliminar">Eliminar Cuenta</h2>
            <p className="perfil__nota">La baja es permanente y desactivará tu acceso a la plataforma.</p>
            <Button variant="peligro" onClick={() => setConfirmarEliminacion(true)} disabled={loading}>
              Eliminar mi cuenta
            </Button>
          </section>

          {/* En un 403 el role="alert" anterior ya explica el motivo: aquí no
              se duplica el aviso genérico de la operación. */}
          {mensaje && codigoFallo !== 403 && (
            <div className="perfil__mensaje" role="status">
              {mensaje}
            </div>
          )}

          <Modal
            open={confirmarEliminacion}
            title="Eliminar mi cuenta"
            onClose={() => setConfirmarEliminacion(false)}
            footer={
              <>
                <Button variant="secundario" onClick={() => setConfirmarEliminacion(false)}>
                  Cancelar
                </Button>
                <Button variant="peligro" onClick={handleEliminar} data-foco-principal="">
                  Sí, eliminar
                </Button>
              </>
            }
          >
            <p>
              Esta acción dará de baja tu cuenta y no podrás recuperarla.
              ¿Quieres continuar?
            </p>
          </Modal>
        </div>
      </div>
    </div>
  );
}
