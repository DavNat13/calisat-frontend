import { useState } from "react";
import useCatalogoService from "../services/catalogoService";
import { mensajeParaUsuario, registrarFallo } from "../../../utils/errores";
import {
  FORM_INICIAL,
  formDesdeProducto,
  payloadDesdeForm,
} from "../constantes/producto";

/**
 * CRUD del producto: formulario, guardar, editar y dar de baja.
 *
 * `error`/`exito` y los setters del listado viven en el orquestador
 * (useProductos) y aquí solo SE RECIBEN: así el modal, la página y la vista
 * de inactivos leen siempre el mismo mensaje y no compiten dos fuentes de
 * verdad por el mismo hueco de la UI.
 *
 * `onGuardado()` se invoca SOLO tras un guardado exitoso: es el gancho que
 * el panel usa para cerrar el modal, porque este hook no conoce la UI.
 */
export default function useProductosCRUD({
  onGuardado, recargar, setLoading, setConfirmDelete,
  error, setError, exito, setExito,
}) {
  const { getProductoBySku, crearProducto, updateProducto, deleteProducto } =
    useCatalogoService();
  const [form, setForm] = useState(FORM_INICIAL);
  const [editingSku, setEditingSku] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // Carga del producto a editar: SEPARADA de `loading` para que abrir el
  // modal no parpadee la rejilla de fondo (el listado no se toca).
  const [cargandoEdicion, setCargandoEdicion] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setExito("");
  };

  /**
   * Guarda (crear o actualizar) y devuelve true/false: el modal solo se
   * cierra si la respuesta fue buena. En fallo, el mensaje se pinta DENTRO
   * del diálogo y el paso se conserva para no perder lo escrito.
   */
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setSubmitting(true);
    setError("");
    setExito("");
    try {
      const payload = payloadDesdeForm(form);
      if (editingSku) {
        await updateProducto(editingSku, payload);
        setExito("Producto actualizado correctamente");
        setEditingSku(null);
      } else {
        await crearProducto(payload);
        setExito("Producto creado correctamente");
      }
      setForm(FORM_INICIAL);
      await recargar();
      onGuardado?.();
      return true;
    } catch (err) {
      // Detalle real en consola; en la alerta solo copia propia en español
      // (nunca el texto crudo que devuelva el servidor).
      registrarFallo("productos/guardar", err);
      setError(mensajeParaUsuario(err, "No se pudo guardar el producto. Revisa los datos e inténtalo de nuevo."));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Precarga el formulario SIN conmutar el `loading` del listado (si no,
   * abrir el modal haría parpadear la rejilla de fondo). Devuelve false si
   * el producto no se pudo cargar, para que quien lo abre pueda cerrar el
   * diálogo y dejar el fallo visible en la página.
   */
  const handleEdit = async (sku) => {
    setCargandoEdicion(true);
    setError("");
    setExito("");
    try {
      const producto = await getProductoBySku(sku);
      if (producto) {
        setForm(formDesdeProducto(producto));
        setEditingSku(sku);
        return true;
      }
      // 404 del servicio: sin este ramo, "Editar" no hacía nada visible.
      setError("No se encontró el producto a editar. Actualiza el listado.");
      return false;
    } catch (err) {
      registrarFallo("productos/obtenerParaEditar", err);
      setError("Error al cargar producto para editar");
      return false;
    } finally {
      setCargandoEdicion(false);
    }
  };

  const handleDelete = async (sku) => {
    setLoading(true);
    setError("");
    setConfirmDelete(null);
    try {
      await deleteProducto(sku);
      setExito("Producto dado de baja correctamente");
      await recargar();
    } catch (err) {
      registrarFallo("productos/eliminar", err);
      setError(mensajeParaUsuario(err, "No se pudo eliminar el producto. Inténtalo de nuevo."));
    } finally {
      setLoading(false);
    }
  };

  /** Cierra el modal y borra rastros: formulario, error y éxito. */
  const cancelarEdicion = () => {
    setEditingSku(null);
    setForm(FORM_INICIAL);
    setError("");
    setExito("");
  };

  return {
    form, handleChange, handleSubmit, editingSku, cargandoEdicion, submitting,
    error, exito, cancelarEdicion, handleEdit, handleDelete,
  };
}
