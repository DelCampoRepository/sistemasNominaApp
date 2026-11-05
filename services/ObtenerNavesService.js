
import { apiFetch } from "./apiClient";

export async function ObtenerNavesPorUsuario(codigo, temporada, token) {
  return apiFetch(`/Naves/${codigo}/${temporada}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });
}
