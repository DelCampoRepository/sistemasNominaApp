import { API_URL } from "../utils/constants";

export async function ObtenerActividades( codigo, codigoTemporada, token){
    try{

        const response = await fetch(
            `${API_URL}/Actividades/${codigo}/${codigoTemporada}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                  }
                }
            );

        if (response.status === 401) throw new Error("SESION_EXPIRADA");
        if (response.status === 500) throw new Error("ERROR_SERVIDOR");

        if (!response.ok) {
              
                
            const errorText = await response.text();
            throw new Error(errorText || "Error al obtener las actividades del usuario");
        }

        return await response.json();
    }
    catch(error){
        console.error("Error al sincronizar actividades:", error);
        throw error;    
    }
}


