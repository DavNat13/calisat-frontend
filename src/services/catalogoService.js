import { useMsal } from "@azure/msal-react";
import { apiRequest } from "../auth/AuthConfig";

const API_GATEWAY = "https://ho5p58iyu7.execute-api.us-east-1.amazonaws.com";
const CATALOGO_BASE = "/api/v1/catalogo";

export default function useCatalogoService() {
  const { instance, accounts } = useMsal();

  const getToken = async () => {
    const response = await instance.acquireTokenSilent({
      ...apiRequest,
      account: accounts[0],
    });
    return response.accessToken;
  };

  const listarProductos = async (page = 0, size = 100) => {
    const res = await fetch(
      `${API_GATEWAY}${CATALOGO_BASE}?page=${page}&size=${size}`,
      { method: "GET" }
    );
    if (!res.ok) throw new Error("Error al listar productos");
    return res.json();
  };

  const getProductoBySku = async (sku) => {
    const res = await fetch(`${API_GATEWAY}${CATALOGO_BASE}/${sku}`, {
      method: "GET",
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Error al obtener producto");
    }
    return res.json();
  };

  const getProductosByCategoria = async (categoria) => {
    const res = await fetch(
      `${API_GATEWAY}${CATALOGO_BASE}/categoria/${encodeURIComponent(categoria)}`,
      { method: "GET" }
    );
    if (!res.ok) throw new Error("Error al filtrar por categoría");
    return res.json();
  };

  const crearProducto = async (producto) => {
    const token = await getToken();
    const res = await fetch(`${API_GATEWAY}${CATALOGO_BASE}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(producto),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.mensaje || "Error al crear producto");
    }
    return res.json();
  };

  const updateProducto = async (sku, data) => {
    const token = await getToken();
    const res = await fetch(`${API_GATEWAY}${CATALOGO_BASE}/${sku}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.mensaje || "Error al actualizar producto");
    }
    return res.json();
  };

  const deleteProducto = async (sku) => {
    const token = await getToken();
    const res = await fetch(`${API_GATEWAY}${CATALOGO_BASE}/${sku}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.mensaje || "Error al eliminar producto");
    }
    return res.json();
  };

  return {
    listarProductos,
    getProductoBySku,
    getProductosByCategoria,
    crearProducto,
    updateProducto,
    deleteProducto,
  };
}
