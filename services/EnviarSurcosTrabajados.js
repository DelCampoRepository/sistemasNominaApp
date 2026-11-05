
import { apiFetch } from "./apiClient";

export const EnviarSurcosTrabajados = async (lista, token) => {
  const datos = JSON.stringify(lista, null, 2);
  if (datos === undefined) return;

  return apiFetch("/Surcos/guardarSurcosTrabajados", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: datos
  });
};

export async function ConsultarSurcosTrabajados(token, jefeNave) {
  return apiFetch(`/Surcos/consultaSurcosTrabajados/${jefeNave}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });
}