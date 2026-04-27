import { controller, timeOutId } from "./TimeOutController";
import { API_URL } from "../utils/constants";
import { Alert } from "react-native";
export const ConsultarDatosSemanaActiva = async token => {
  try {
       
 
     
  
    const response = await fetch(`${API_URL}/Semana`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
     console.log(data);
    if (data.estado === 1) {
      return data;
    } else {
      Alert.alert(
        "Del campo y asociados",
        "La consulta de la semana no retorno estado: 1, revisar con el departamento de sistemas"
      );
      return null;
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("La petición superó el tiempo límite");
      Alert.alert("error",`${error}`)
    } else {
      console.error("Error en la petición:", error);
        Alert.alert("error",`${error}`)
    }
    return null;
  }
};
