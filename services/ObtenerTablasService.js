import { apiFetch } from "./apiClient";

export async function ObtenerTablasPorUsuario(codigo, codigoTemporada, token) {
   return apiFetch(`/Naves/ObtenerTablasDeNaves/${codigo}/${codigoTemporada}`, {
       method: "GET",
       headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`
       }
   });
}
