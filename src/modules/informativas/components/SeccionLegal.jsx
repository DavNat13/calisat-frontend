/**
 * Sección de texto legal reutilizada por Términos y Política de Privacidad.
 *
 * - `id`: anclaje accesible desde el exterior (#objeto, #cookies, …). El
 *   scroll-margin-top del CSS compensa la navbar fija.
 * - El h2 lleva el id efectivo y nombra a la sección (aria-labelledby), lo
 *   que convierte a <section> en una región navegable por screen reader.
 * - `children`: párrafos/listas del contenido (uno o varios).
 */
export default function SeccionLegal({ id, titulo, children }) {
  const idTitulo = `legal-tit-${id}`;

  return (
    <section className="legal__seccion" id={id} aria-labelledby={idTitulo}>
      <h2 className="legal__titulo" id={idTitulo}>
        {titulo}
      </h2>
      <div className="legal__contenido">{children}</div>
    </section>
  );
}
