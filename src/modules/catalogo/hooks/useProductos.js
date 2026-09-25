import { useState, useEffect } from "react";
import useCatalogoService from "../services/catalogoService";
import { mensajeParaUsuario, registrarFallo } from "../../../utils/errores";

const INITIAL_FORM = {
  sku: "",
  nombre: "",
  descripcion: "",
  precio: "",
  categoria: "",
  imagenUrl: "",
};

const aLista = (data) => (Array.isArray(data) ? data : data?.content || []);

export default function useProductos() {
  const {
    listarProductos,
    getProductoBySku,
    getProductosByCategoria,
    crearProducto,
    updateProducto,
    deleteProducto,
    listarInactivos,
    reactivar,
  } = useCatalogoService();

  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingSku, setEditingSku] = useState(null);
  // Arranca en true: la carga inicial es la PRIMERA petición y, sin esto, el
  // primer render (productos=[] && loading=false) parpadea el estado vacío
  // "No hay productos disponibles" antes de que llegue la respuesta.
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [filtro, setFiltro] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  // Vista de dados de baja (Fase 3): listado PARALELO al de activos.
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [productosInactivos, setProductosInactivos] = useState([]);
  const [cargandoInactivos, setCargandoInactivos] = useState(false);
  const [reactivandoSku, setReactivandoSku] = useState(null);

  const cargarProductos = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listarProductos();
      setProductos(aLista(data));
    } catch (err) {
      registrarFallo("productos/cargar", err);
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  /** Productos dados de baja (solo ADMINISTRADOR, endpoint con token). */
  const cargarInactivos = async () => {
    setCargandoInactivos(true);
    setError("");
    try {
      const data = await listarInactivos();
      setProductosInactivos(aLista(data));
    } catch (err) {
      registrarFallo("productos/cargarInactivos", err);
      setError(
        mensajeParaUsuario(
          err,
          "No se pudieron cargar los productos dados de baja."
        )
      );
    } finally {
      setCargandoInactivos(false);
    }
  };

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const data = await listarProductos();
        if (!cancelado) setProductos(aLista(data));
      } catch (err) {
        registrarFallo("productos/cargaInicial", err);
        if (!cancelado) setError("Error al cargar productos");
      } finally {
        // Siempre se libera el estado de carga (también en el error): con
        // loading inicial en true, si no, la lista se quedaría en "Cargando".
        if (!cancelado) setLoading(false);
      }
    })();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo carga inicial; listarProductos no está memoizado
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setExito("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setExito("");
    try {
      const payload = {
        ...form,
        precio: parseFloat(form.precio),
        imagenUrl: form.imagenUrl || "",
      };
      if (editingSku) {
        await updateProducto(editingSku, payload);
        setExito("Producto actualizado correctamente");
        setEditingSku(null);
      } else {
        await crearProducto(payload);
        setExito("Producto creado correctamente");
      }
      setForm(INITIAL_FORM);
      await cargarProductos();
    } catch (err) {
      // Detalle real en consola; en la alerta solo copia propia en español
      // (nunca el texto crudo que devuelva el servidor).
      registrarFallo("productos/guardar", err);
      setError(
        mensajeParaUsuario(
          err,
          "No se pudo guardar el producto. Revisa los datos e inténtalo de nuevo."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (sku) => {
    setLoading(true);
    setError("");
    try {
      const producto = await getProductoBySku(sku);
      if (producto) {
        setForm({
          sku: producto.sku,
          nombre: producto.nombre,
          descripcion: producto.descripcion || "",
          precio: producto.precio.toString(),
          categoria: producto.categoria,
          imagenUrl: producto.imagenUrl || "",
        });
        setEditingSku(sku);
        setExito("");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // 404 del servicio: sin este ramo, pulsar "Editar" no hacía NADA
        // visible (solo un parpadeo de carga) y el usuario lo repetía.
        setError("No se encontró el producto a editar. Actualiza el listado.");
      }
    } catch (err) {
      registrarFallo("productos/obtenerParaEditar", err);
      setError("Error al cargar producto para editar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sku) => {
    setLoading(true);
    setError("");
    setConfirmDelete(null);
    try {
      await deleteProducto(sku);
      setExito("Producto dado de baja correctamente");
      await cargarProductos();
    } catch (err) {
      registrarFallo("productos/eliminar", err);
      setError(
        mensajeParaUsuario(
          err,
          "No se pudo eliminar el producto. Inténtalo de nuevo."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Alterna la vista de dados de baja. Al activarla carga (siempre) la
   * lista de inactivos: así nunca se muestra una rejilla desactualizada.
   */
  const alternarInactivos = async () => {
    const siguiente = !mostrarInactivos;
    setMostrarInactivos(siguiente);
    setExito("");
    if (siguiente) await cargarInactivos();
  };

  /**
   * Devuelve un producto dado de baja al catálogo activo.
   * Al terminar se recarga la lista de activos y, si la vista visible es la
   * de inactivos, también la de dados de baja (el producto sale de ella).
   */
  const handleReactivar = async (sku) => {
    setReactivandoSku(sku);
    setError("");
    setExito("");
    try {
      await reactivar(sku);
      await cargarProductos();
      if (mostrarInactivos) await cargarInactivos();
      setExito("Producto reactivado correctamente");
    } catch (err) {
      registrarFallo("productos/reactivar", err);
      setError(
        mensajeParaUsuario(
          err,
          "No se pudo reactivar el producto. Inténtalo de nuevo."
        )
      );
    } finally {
      setReactivandoSku(null);
    }
  };

  const handleFiltroCategoria = async () => {
    if (!filtro.trim()) {
      await cargarProductos();
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getProductosByCategoria(filtro.trim());
      setProductos(aLista(data));
    } catch (err) {
      registrarFallo("productos/filtrar", err);
      setError("Error al filtrar por categoría");
    } finally {
      setLoading(false);
    }
  };

  const cancelarEdicion = () => {
    setEditingSku(null);
    setForm(INITIAL_FORM);
    setError("");
    setExito("");
  };

  return {
    productos,
    form,
    editingSku,
    loading,
    submitting,
    error,
    exito,
    filtro,
    confirmDelete,
    setFiltro,
    setConfirmDelete,
    handleChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleFiltroCategoria,
    cancelarEdicion,
    cargarProductos,
    // Fase 3: productos dados de baja + reactivación
    mostrarInactivos,
    productosInactivos,
    cargandoInactivos,
    reactivandoSku,
    alternarInactivos,
    handleReactivar,
    cargarInactivos,
  };
}
