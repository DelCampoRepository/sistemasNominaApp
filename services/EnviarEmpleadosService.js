import { apiFetch } from "./apiClient";

export const EnviarEmpleados = async (lista, token) => {
  return apiFetch("/Actividades/GuardarActividadesJson", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(lista)
  });
};