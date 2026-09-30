import { RotateCcw } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";

/**
 * Barra de filtros del listado de productos.
 *
 * Extraída de la página para que ésta se lea como composición y no como
 * JSX embebido. En la vista de dados de baja desaparece el filtro por
 * categoría (la API de inactivos no admite ese criterio) pero se conserva
 * el conmutador, que es lo que mantiene visible esa vista.
 */
export default function BarraFiltros({
  puedeGestionar,
  mostrarInactivos,
  filtro,
  onFiltroChange,
  onFiltrar,
  onLimpiar,
  cargando,
  cargandoInactivos,
  onAlternar,
}) {
  return (
    <div className="productos__filtros">
      {!mostrarInactivos && (
        <>
          <div className="productos__campo-busqueda">
            <Input
              label="Filtrar por categoría"
              id="productos-filtro"
              type="text"
              value={filtro}
              onChange={onFiltroChange}
              placeholder="Ej. Anillas"
            />
          </div>
          <Button variant="secundario" onClick={onFiltrar} disabled={cargando}>
            Filtrar
          </Button>
          {filtro && (
            <Button variant="fantasma" onClick={onLimpiar} disabled={cargando}>
              Limpiar
            </Button>
          )}
        </>
      )}

      {puedeGestionar && (
        /* Relleno suave de marca al activarlo: el estado pasa a verse sin
           depender de la lectura de pantalla (aria-pressed). */
        <Button
          variant="secundario"
          className={
            mostrarInactivos
              ? "productos__alternar productos__alternar--activo"
              : "productos__alternar"
          }
          aria-pressed={mostrarInactivos}
          onClick={onAlternar}
          disabled={cargando || cargandoInactivos}
          icon={<RotateCcw className="icono" aria-hidden="true" />}
        >
          Ver dados de baja
        </Button>
      )}
    </div>
  );
}
