import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <p className="text-6xl font-bold text-accent mb-4">403</p>
      <h1 className="text-2xl font-semibold text-white mb-2">Acceso denegado</h1>
      <p className="text-text-muted text-sm mb-8">
        No tienes permisos para acceder a esta sección. Verifica que tu cuenta
        tenga el rol requerido.
      </p>
      <Link
        to="/"
        className="inline-block bg-primary hover:opacity-90 text-white text-sm px-6 py-2.5 rounded transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
