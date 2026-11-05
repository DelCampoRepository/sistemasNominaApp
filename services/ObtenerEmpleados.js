
import { apiFetch } from "./apiClient";

export async function ObtenerEmpleados(temporada, token) {
    return apiFetch(`/Empleados/${temporada}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });
}









     

 