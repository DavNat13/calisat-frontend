import { ShoppingCart } from "lucide-react";
import Proximamente from "../../../components/ui/Proximamente";

export default function CarritoPage() {
  return (
    <Proximamente
      Icono={ShoppingCart}
      titulo="Carrito"
      texto="Estamos preparando tu carrito de compras. Muy pronto podrás revisar tus productos antes de finalizar el pedido."
    />
  );
}
