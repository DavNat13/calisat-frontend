import { formatoCLP } from "../../../../utils/formatoCLP";

/**
 * Paso 3 · Resumen de solo lectura antes de enviar.
 * El precio SIEMPRE se muestra con `formatoCLP` (pesos chilenos): es la
 * última oportunidad de ver el monto tal cual aparecerá en el catálogo.
 */
export default function PasoResumen({ form }) {
  const filas = [
    ["SKU", form.sku],
    ["Nombre", form.nombre],
    ["Descripción", form.descripcion || "—"],
    ["Precio", formatoCLP(form.precio)],
    ["Categoría", form.categoria],
  ];

  return (
    <div className="modal-pasos__resumen">
      {/* <div> dentro de <dl> agrupa cada dt/dd sin salir de la lista. */}
      <dl className="modal-pasos__datos">
        {filas.map(([etiqueta, valor]) => (
          <div className="modal-pasos__dato" key={etiqueta}>
            <dt className="modal-pasos__dato-etiqueta">{etiqueta}</dt>
            <dd className="modal-pasos__dato-valor">{valor || "—"}</dd>
          </div>
        ))}
      </dl>

      {form.imagenUrl && (
        <figure className="modal-pasos__preview">
          <img
            className="modal-pasos__preview-img"
            src={form.imagenUrl}
            alt={`Vista previa de ${form.nombre || "producto"}`}
            width={96}
            height={96}
            loading="lazy"
            decoding="async"
          />
        </figure>
      )}
    </div>
  );
}
