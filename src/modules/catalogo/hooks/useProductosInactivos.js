import { useState } from "react";
import useCatalogoService from "../services/catalogoService";
import { aLista } from "../services/catalogoLectura";
import { mensajeParaUsuario, registrarFallo } from "../../../utils/errores";

/**
 * Vista de dados de baja (Fase 3): listado PARALELO al de activos.
 *
 * `setError`/`setExito` se inyectan desde el orquestador para que TODOS los
 * avisos del módulo salgan del mismo estado: si cada sub-hook tuviera el
 * suyo, la página tendría que decidir cuál de los dos enseñar.
 */
export default function useProductosInactivos({ recargar, setError, setExito }) {
  const { listarInactivos, reactivar } = useCatalogoService();
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [productosInactivos, setProductosInactivos] = useState([]);
  const [cargandoInactivos, setCargandoInactivos] = useState(false);
  const [reactivandoSku, setReactivandoSku] = useState(null);

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
   * Devuelve un producto dado de baja al catálogo activo. Al terminar se
   * recargan los activos y, si la vista visible es la de inactivos, también
   * ésta (el producto acaba de salir de ella).
   */
  const handleReactivar = async (sku) => {
    setReactivandoSku(sku);
    setError("");
    setExito("");
    try {
      await reactivar(sku);
      await recargar();
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

  return {
    mostrarInactivos,
    productosInactivos,
    cargandoInactivos,
    reactivandoSku,
    alternarInactivos,
    handleReactivar,
    cargarInactivos,
  };
}
