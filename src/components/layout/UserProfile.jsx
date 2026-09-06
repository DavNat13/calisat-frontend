import { useState } from "react";
import useUserProfile from "../../hooks/useUserProfile";
import "./UserProfile.css";

export default function UserProfile() {
  const { perfil, loading, mensaje, obtenerPerfil, actualizarNombre, eliminarPerfil } = useUserProfile();
  const [nombre, setNombre] = useState("");

  const handleActualizar = () => {
    if (nombre.trim()) {
      actualizarNombre(nombre.trim());
      setNombre("");
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">Mi Perfil</h1>

      <div className="profile-actions">
        <button className="btn btn-primary" onClick={obtenerPerfil} disabled={loading}>
          {loading ? "Cargando..." : "GET /perfil"}
        </button>
      </div>

      {perfil && (
        <div className="profile-card">
          <div className="profile-field">
            <span className="field-label">ID:</span>
            <span className="field-value">{perfil.id}</span>
          </div>
          <div className="profile-field">
            <span className="field-label">Azure Sub:</span>
            <span className="field-value">{perfil.azureSub}</span>
          </div>
          <div className="profile-field">
            <span className="field-label">Email:</span>
            <span className="field-value">{perfil.email}</span>
          </div>
          <div className="profile-field">
            <span className="field-label">Nombre:</span>
            <span className="field-value">{perfil.nombreCompleto || "(sin nombre)"}</span>
          </div>
          <div className="profile-field">
            <span className="field-label">Activo:</span>
            <span className="field-value">{perfil.activo ? "Sí" : "No"}</span>
          </div>
        </div>
      )}

      <div className="update-section">
        <h2 className="section-title">Actualizar Nombre</h2>
        <div className="update-row">
          <input
            type="text"
            className="update-input"
            placeholder="Nuevo nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={handleActualizar} disabled={loading || !nombre.trim()}>
            PUT /perfil
          </button>
        </div>
      </div>

      <div className="delete-section">
        <h2 className="section-title">Eliminar Cuenta</h2>
        <button className="btn btn-danger" onClick={eliminarPerfil} disabled={loading}>
          DELETE /perfil
        </button>
      </div>

      {mensaje && <div className="profile-message">{mensaje}</div>}
    </div>
  );
}
