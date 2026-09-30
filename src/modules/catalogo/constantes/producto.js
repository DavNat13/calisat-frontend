/**
 * Constantes y normalización del formulario de producto.
 *
 * Vive en un `.js` (y no en el `.jsx` del modal) porque es lógica PURA:
 * react-refresh solo admite componentes en los archivos `.jsx` y aquí no
 * debe entrar ni un solo hook de React.
 */

/** Estado inicial del formulario: SIEMPRE texto (los inputs son controlados). */
export const FORM_INICIAL = {
  sku: "",
  nombre: "",
  descripcion: "",
  precio: "",
  categoria: "",
  imagenUrl: "",
};

/**
 * Ids estables de cada campo. El modal los usa para llevar el foco al
 * PRIMER campo inválido tras validar un paso: `getElementById` sobre un id
 * único es mucho más simple (y más barato) que arrastrar refs por los tres
 * componentes de paso.
 */
export const ID_CAMPO = {
  sku: "producto-sku",
  nombre: "producto-nombre",
  descripcion: "producto-descripcion",
  precio: "producto-precio",
  categoria: "producto-categoria",
  imagenUrl: "producto-imagen",
};

/** Producto del backend → estado controlado del formulario. */
export const formDesdeProducto = (producto) => ({
  sku: producto.sku ?? "",
  nombre: producto.nombre ?? "",
  descripcion: producto.descripcion ?? "",
  precio: producto.precio == null ? "" : String(producto.precio),
  categoria: producto.categoria ?? "",
  imagenUrl: producto.imagenUrl ?? "",
});

/**
 * Estado del formulario → ProductoRequest. El precio viaja como NÚMERO
 * (CLP, sin decimales) y la imagen vacía como `""`: el backend declara
 * ese campo opcional y `null` lo rechaza.
 */
export const payloadDesdeForm = (form) => ({
  ...form,
  precio: Number(form.precio),
  imagenUrl: form.imagenUrl || "",
});
