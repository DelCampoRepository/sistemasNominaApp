
import { Alert } from "react-native";
import { API_URL } from "../utils/constants";

export async function ObtenerNavesPorUsuario (codigo, temporada, token) {
  try {
 
    const response = await fetch(`${API_URL}/Naves/${codigo}/${temporada}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401) throw new Error("SESION_EXPIRADA"); 
    if (response.status === 500) throw new Error("ERROR_SERVIDOR");
    
    if (!response.ok) 
        {
          
         
      
          const errorData = await response.json();
            throw new Error( errorData.message || "Error al obtener las naves del usuario");
    }

    const data = await response.json();

    return data;
  } 
  catch (error) 
  {

    Alert.alert("Error", `${error}`);
  
  }
}

export const obtenerNavesPorUsuario = async (codigo, temporada, token) => {
  try {
  
  } catch (error) {
    Alert.alert("Error", `${error}`);
    console.log(error);
  }
};
