import {
  Circle,
  Columns2,
  Waves,
  Hand,
  Truck,
  ShieldCheck,
  RefreshCcw,
  Headset,
} from "lucide-react";

/**
 * Datos ESTÁTICOS de la home (categorías y beneficios).
 *
 * Vive en `.js` (y no en el JSX) porque los `.jsx` del proyecto solo
 * exportan componentes (eslint react-refresh/only-export-components) y
 * porque así el Hero reutiliza BENEFICIOS para su franja de confianza sin
 * duplicar copy. Cada ítem lleva el componente de lucide en mayúscula
 * (`Icono`) para renderizarlo como `<Icono />`.
 */

/** Las 4 categorías del catálogo, con su icono lucide. */
export const CATEGORIAS = [
  { nombre: "Anillas", descripcion: "Para muscle-up y dominadas", Icono: Circle },
  { nombre: "Paralelas", descripcion: "Para handstand y planche", Icono: Columns2 },
  { nombre: "Bandas", descripcion: "Resistencia y asistencia", Icono: Waves },
  { nombre: "Magnesia", descripcion: "Agarre perfecto", Icono: Hand },
];

/** Argumentos de compra: sección Beneficios + franja del Hero. */
export const BENEFICIOS = [
  {
    titulo: "Envíos a todo Chile",
    texto: "Despacho a regiones y RM con seguimiento, para que entrenes sin esperar.",
    Icono: Truck,
  },
  {
    titulo: "Pago seguro",
    texto: "Transacciones cifradas y proveedores locales: el precio que ves es el que pagas.",
    Icono: ShieldCheck,
  },
  {
    titulo: "Cambios simples",
    texto: "Si la talla o el modelo no calzan, cambiamos el producto sin vueltas.",
    Icono: RefreshCcw,
  },
  {
    titulo: "Soporte a deportistas",
    texto: "Atención en español de gente que entrena calistenia, no un bot de tickets.",
    Icono: Headset,
  },
];
