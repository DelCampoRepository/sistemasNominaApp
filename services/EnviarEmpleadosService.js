import { API_URL } from "../utils/constants";

export const EnviarEmpleados = async (lista, token) => {
 
 try{
 
     const response = await fetch(
    `${API_URL}/Actividades/GuardarActividadesJson`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(lista)
    }
  );

    
   if (response.status === 401) throw new Error("SESION_EXPIRADA");
  if (response.status === 500) throw new Error("ERROR_SERVIDOR");

  const text = await response.text();

  
  return response.ok ? JSON.parse(text) : null;

 }catch(error)
 {
    throw error;
 }
};