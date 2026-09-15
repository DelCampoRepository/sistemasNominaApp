
import { API_URL } from "../utils/constants";

export const EnviarSurcosTrabajados = async (lista, token) => {
 
 try{
 
   
      const datos= JSON.stringify(lista,null,2)
      if(datos === undefined)
        return
      
      const response = await fetch(
        `${API_URL}/Surcos/guardarSurcosTrabajados`,
        {
          method: "POST",
          headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
          },
          body: datos
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

export async function ConsultarSurcosTrabajados(token,jefeNave)
{
  
  const response = await fetch(
           `${API_URL}/Surcos/consultaSurcosTrabajados/${jefeNave}`,
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