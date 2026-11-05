import { apiFetch } from "./apiClient";
import { Alert } from "react-native";
export const ConsultarDatosSemanaActiva = async token => {
  const data = await apiFetch("/Semana", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (data.estado === 1) {
    return data;
  }

  Alert.alert(
    "Del campo y asociados",
    "La consulta de la semana no retorno estado: 1, revisar con el departamento de sistemas"
  );
  return null;
};
