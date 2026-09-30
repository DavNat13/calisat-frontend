import useAuthSession from "../../../auth/useAuthSession";
import useAuthRole from "../../../auth/useAuthRole";
import Card from "../../../components/ui/Card";

/**
 * Tarjeta de datos del perfil (/perfil).
 *
 * Dos modos:
 *  - normal      → lo que devuelve `GET /api/v1/usuarios/perfil`
 *                  (id, email, nombreCompleto, activo).
 *  - `fallback`  → la API respondió 403/404 (el backend exige rol CLIENTE o
 *                  el usuario aún no existe en el servicio de usuarios). En
 *                  lugar de dejar la página en blanco se muestran los datos
 *                  de la SESIÓN local: identificador y roles que ya aportan
 *                  `useAuthSession` / `useAuthRole`, sin volver a llamar.
 *
 * Comparte las clases `.perfil__*` declaradas en UserProfile.css (página
 * dueña de la tarjeta), de modo que no se duplican reglas de presentación.
 */
export default function PerfilTarjeta({ perfil, fallback = false }) {
  const { identificador, proveedor } = useAuthSession();
  const { roles } = useAuthRole();

  const filas = fallback
    ? [
        { etiqueta: "Identificador", valor: identificador || "(sin sesión)" },
        {
          etiqueta: "Roles",
          valor: roles.length > 0 ? roles.join(", ") : "(sin roles asignados)",
        },
        { etiqueta: "Proveedor", valor: proveedor || "—" },
      ]
    : [
        { etiqueta: "ID", valor: String(perfil.id ?? "—") },
        { etiqueta: "Email", valor: perfil.email || "—" },
        { etiqueta: "Nombre", valor: perfil.nombreCompleto || "(sin nombre)" },
        { etiqueta: "Activo", valor: perfil.activo ? "Sí" : "No" },
      ];

  return (
    <Card className="perfil__datos">
      <h2 className="perfil__subtitulo">
        {fallback ? "Datos de tu sesión" : "Datos de la cuenta"}
      </h2>

      <dl className="perfil__lista">
        {filas.map(({ etiqueta, valor }) => (
          <div className="perfil__fila" key={etiqueta}>
            <dt className="perfil__etiqueta">{etiqueta}</dt>
            <dd className="perfil__valor">{valor}</dd>
          </div>
        ))}
      </dl>

      {fallback && (
        <p className="perfil__nota">
          El servicio de usuarios no devolvió la ficha completa para tu rol,
          así que mostramos los datos que ya tenemos en tu sesión.
        </p>
      )}
    </Card>
  );
}
