import { useEffect, useState } from "react";
import useCatalogoService from "../services/catalogoService";
import { aLista } from "../services/catalogoLectura";
import { registrarFallo } from "../../../utils/errores";
import useProductosCRUD from "./useProductosCRUD";
import useProductosInactivos from "./useProductosInactivos";

/**
 * Orquestador del catálogo de gestión (API pública intacta).
 *
 * Conserva lo COMPARTIDO —listado, filtro por categoría, `error` y `exito`—
 * y delega el resto en dos sub-hooks. Ambos se llaman SIEMPRE a nivel
 * superior (nunca dentro de un `if` o de un bucle): el número de llamadas a
 * hooks tendría que ser idéntico en cada render.
 *
 * `handleEdit` ya NO conmuta el `loading` global: el llenado del modal se
 * señala con `cargandoEdicion` para que la rejilla de fondo no parpadee.
 */
export default function useProductos({ onGuardado } = {}) {
  const { listarProductos, getProductosByCategoria } = useCatalogoService();
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  // Arranca en true: sin esto, el primer render (productos=[] y
  // loading=false) parpadea "No hay productos disponibles" antes de la
  // primera respuesta.
  const [loading, setLoading] = useState(true);

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

  // Sub-hooks a nivel superior, con el estado compartido inyectado.
  const crud = useProductosCRUD({
    onGuardado,
    recargar: cargarProductos,
    setLoading,
    setConfirmDelete,
    error,
    setError,
    exito,
    setExito,
  });
  const inactivos = useProductosInactivos({
    recargar: cargarProductos,
    setError,
    setExito,
  });

  return {
    productos,
    loading,
    filtro,
    confirmDelete,
    setFiltro,
    setConfirmDelete,
    handleFiltroCategoria,
    cargarProductos,
    // Re-exportación íntegra de los sub-hooks: los consumidores existentes
    // (ProductosPage y cualquier otro) no ven ningún cambio de API.
    ...crud,
    ...inactivos,
  };
}
