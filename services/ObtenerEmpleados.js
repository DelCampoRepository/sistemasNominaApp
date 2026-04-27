
import { API_URL } from "../utils/constants";

export async function ObtenerEmpleados(temporada, token){

    try{
        const response = await fetch(`${API_URL}/Empleados/${temporada}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
        });
        
        if (response.status === 401) throw new Error("SESION_EXPIRADA");
        if (response.status === 500) throw new Error("ERROR_SERVIDOR");
        if (!response.ok) {
           
            const errorData = await response.json();
           throw new Error(errorData.message || "Error al obtener empleados de la api");
        }

        return await response.json();
    }catch(error)
    {
        throw error;

    }
}









     

 