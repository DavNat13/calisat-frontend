import { PackageOpen } from "lucide-react";
import Proximamente from "../../../components/ui/Proximamente";

/**
 * Ruta /producto/:sku · ficha de producto.
 *
 * STUB temporal de la Fase 1: existe para que la ruta pública no caiga en el
 * comodín `*` (que redirige al inicio) y para poder enlazar desde el catálogo
 * desde ya. La Fase 3 lo reemplaza por la carga real del detalle por SKU.
 */
export default function ProductoDetalle() {
  return (
    <Proximamente
      Icono={PackageOpen}
      titulo="Ficha de producto"
      texto="Estamos preparando el detalle de cada producto: especificaciones, stock y precio en pesos chilenos."
    />
  );
}
