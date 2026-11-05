import { apiFetch } from "./apiClient";

export async function ObtenerActividades(codigo, codigoTemporada, token) {
    return apiFetch(`/Actividades/${codigo}/${codigoTemporada}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });
}


