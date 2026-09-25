import { useState } from "react";
import useUserProfile from "../hooks/useUserProfile";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import "./UserProfile.css";

export default function UserProfile() {
  const { perfil, loading, mensaje, obtenerPerfil, actualizarNombre, eliminarPerfil } = useUserProfile();
  const [nombre, setNombre] = useState("");
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);

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
        <div className="perfil">
          <header className="pagina__cabecera">
            <div className="pagina__cabecera-texto">
              <h1 className="pagina__titulo">Mi Perfil</h1>
              <p className="pagina__descripcion">
                Consulta y actualiza los datos de tu cuenta.
              </p>
            </div>
            <div className="pagina__acciones">
              <Button variant="primario" onClick={obtenerPerfil} disabled={loading}>
                {loading ? "Cargando..." : "Cargar datos"}
              </Button>
            </div>
          </header>

          {perfil && (
            <Card className="perfil__datos">
              <h2 className="perfil__subtitulo">Datos de la cuenta</h2>
              <dl className="perfil__lista">
                <div className="perfil__fila">
                  <dt className="perfil__etiqueta">ID:</dt>
                  <dd className="perfil__valor">{perfil.id}</dd>
                </div>
                <div className="perfil__fila">
                  <dt className="perfil__etiqueta">Email:</dt>
                  <dd className="perfil__valor">{perfil.email}</dd>
                </div>
                <div className="perfil__fila">
                  <dt className="perfil__etiqueta">Nombre:</dt>
                  <dd className="perfil__valor">
                    {perfil.nombreCompleto || "(sin nombre)"}
                  </dd>
                </div>
                <div className="perfil__fila">
                  <dt className="perfil__etiqueta">Activo:</dt>
                  <dd className="perfil__valor">{perfil.activo ? "Sí" : "No"}</dd>
                </div>
              </dl>
            </Card>
          )}

          <section className="perfil__seccion" aria-labelledby="perfil-actualizar">
            <h2 className="perfil__subtitulo" id="perfil-actualizar">
              Actualizar Nombre
            </h2>
            <div className="perfil__actualizar">
              <Input
                label="Nuevo nombre completo"
                id="perfil-nombre"
                type="text"
                placeholder="Ej. Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <Button
                variant="secundario"
                onClick={handleActualizar}
                disabled={loading || !nombre.trim()}
              >
                Guardar cambios
              </Button>
            </div>
          </section>

          <section
            className="perfil__seccion perfil__seccion--peligro"
            aria-labelledby="perfil-eliminar"
          >
            <h2 className="perfil__subtitulo" id="perfil-eliminar">
              Eliminar Cuenta
            </h2>
            <p className="perfil__nota">
              La baja es permanente y desactivará tu acceso a la plataforma.
            </p>
            <Button
              variant="peligro"
              onClick={() => setConfirmarEliminacion(true)}
              disabled={loading}
            >
              Eliminar mi cuenta
            </Button>
          </section>

          {mensaje && (
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
