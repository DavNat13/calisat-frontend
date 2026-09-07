import { useState, useEffect } from "react";
import useCatalogoService from "../services/catalogoService";

const INITIAL_FORM = {
  sku: "",
  nombre: "",
  descripcion: "",
  precio: "",
  categoria: "",
  imagenUrl: "",
};

export default function useProductos() {
  const {
    listarProductos,
    getProductoBySku,
    getProductosByCategoria,
    crearProducto,
    updateProducto,
    deleteProducto,
  } = useCatalogoService();

  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingSku, setEditingSku] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [filtro, setFiltro] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const cargarProductos = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listarProductos();
      setProductos(data.content || []);
    } catch {
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
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
      setError(err.message);
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
      }
    } catch {
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
      setError(err.message);
    } finally {
      setLoading(false);
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
      setProductos(Array.isArray(data) ? data : []);
    } catch {
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
  };
}
