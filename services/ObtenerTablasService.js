import { Alert } from "react-native";
import { API_URL } from "../utils/constants";
export async function ObtenerTablasPorUsuario (codigo,  codigoTemporada,token){
  
   
   try{
        const response = await fetch(
        `${API_URL}/Naves/ObtenerTablasDeNaves/${codigo}/${codigoTemporada}`,
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
        if (response && !response.ok) {
            

            const errorData = await response.json();
            throw new Error(errorData.message || "Error al obtener las tablas del usuario");
            }

        return await response.json();

   }catch(error){
        Alert.alert("", `${error}`)
   }
}
