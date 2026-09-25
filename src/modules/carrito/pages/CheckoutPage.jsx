import { CreditCard } from "lucide-react";
import Proximamente from "../../../components/ui/Proximamente";

export default function CheckoutPage() {
  return (
    <Proximamente
      Icono={CreditCard}
      titulo="Checkout"
      texto="El pago y el resumen del pedido estarán disponibles muy pronto. Mientras tanto, puedes seguir explorando el catálogo."
    />
  );
}
