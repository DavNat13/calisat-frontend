/**
 * Esqueleto de la ruta /login.
 *
 * El chunk ya está declarado en App.jsx con React.lazy: mientras @UI Designer
 * construye la pantalla de selección de acceso (tarjeta Institucional + tarjeta
 * Pública), esta versión mínima mantiene el build en verde y da título a la
 * ruta para lectores de pantalla.
 */
export default function LoginPage() {
  return (
    <div className="pagina">
      <div className="contenedor">
        <h1>Inicia sesión</h1>
        <p>Elige el tipo de acceso que necesitas.</p>
      </div>
    </div>
  );
}
