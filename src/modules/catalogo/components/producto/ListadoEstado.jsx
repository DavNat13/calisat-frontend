import Button from "../../../../components/ui/Button";

/**
 * Sección del listado: encabezado con contador, avisos de error/éxito y
 * el estado que corresponda (cargando, vacío o rejilla con las tarjetas).
 *
 * `vacio` se recibe explícito en lugar de deducirse de `children`: React
 * convierte una lista vacía en `[]`, que NO es falsy para el navegador y
 * haría mostrar la rejilla cuando en realidad no hay nada.
 */
export default function ListadoEstado({
  titulo,
  contador,
  cargando,
  vacio,
  cargandoTexto,
  vacioTexto,
  error,
  exito,
  onRecargar,
  children,
}) {
  return (
    <section aria-labelledby="productos-listado" aria-busy={cargando}>
      <h2 className="productos__subtitulo" id="productos-listado">
        {titulo}
        <span className="productos__contador">({contador})</span>
      </h2>

      {error && (
        <p className="productos__estado productos__estado--error" role="alert">
          {error}
        </p>
      )}
      {exito && (
        <p className="productos__estado productos__estado--exito" role="status">
          {exito}
        </p>
      )}

      {/* La carga solo sustituye a la lista cuando NO hay tarjetas: si ya
          las hay (editar/filtrar/baja) se conservan y se marca aria-busy,
          en vez de desmontar la rejilla y hacerla reaparecer. */}
      {cargando && vacio ? (
        <p className="productos__estado" role="status">
          {cargandoTexto}
        </p>
      ) : vacio ? (
        <div className="productos__vacio">
          <p className="productos__estado" role="status">
            {vacioTexto}
          </p>
          <Button variant="secundario" onClick={onRecargar}>
            Recargar listado
          </Button>
        </div>
      ) : (
        <div className="productos__grid">{children}</div>
      )}
    </section>
  );
}
