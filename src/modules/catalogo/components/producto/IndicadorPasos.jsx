/**
 * Indicador de los pasos del modal (lista ordenada semántica).
 *
 * `aria-current="step"` marca el paso visible y `aria-label` da el texto
 * completo ("Paso 2 de 3: …"): sin él, un lector de pantalla se quedaría
 * solo con el número suelto y perdería el nombre del paso.
 * Los estados visibles son `--activo` (en curso) y `--completado` (✓).
 */
export default function IndicadorPasos({ pasos, actual }) {
  return (
    <ol className="modal-pasos__pasos">
      {pasos.map((nombre, indice) => {
        const numero = indice + 1;
        const activo = numero === actual;
        const completado = numero < actual;
        const clases = [
          "modal-pasos__paso",
          activo ? "modal-pasos__paso--activo" : "",
          completado ? "modal-pasos__paso--completado" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <li
            key={nombre}
            className={clases}
            aria-current={activo ? "step" : undefined}
            aria-label={`Paso ${numero} de ${pasos.length}: ${nombre}`}
          >
            {/* El ✓ es SOLO visual: por eso va aria-hidden y el nombre real
                lo aporta el aria-label del <li>. */}
            <span className="modal-pasos__paso-numero" aria-hidden="true">
              {completado ? "✓" : numero}
            </span>
            <span className="modal-pasos__paso-texto">{nombre}</span>
          </li>
        );
      })}
    </ol>
  );
}
