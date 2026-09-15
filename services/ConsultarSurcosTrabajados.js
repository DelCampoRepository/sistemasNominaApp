import { API_URL } from "../utils/constants";

export const ConsultarSurcosTrabajados = async (codJefeDeNave,token) => {
 
 try{
 
     const response = await fetch(
    `${API_URL}/Surcos/consultaSurcosTrabajados/${codJefeDeNave}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(lista)
    }
  );

    
  if (response.status === 401) throw new Error("SESION_EXPIRADA");
  if (response.status === 500) throw new Error("ERROR_SERVIDOR");

  if (!response.ok) {
                            
            const errorText = await response.text();
            throw new Error(errorText || "Error al obtener los surcos trabajados");
        }

        return await response.json();
  
 }catch(error)
 {
    throw error;
 }
};