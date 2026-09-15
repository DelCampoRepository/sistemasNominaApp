import { ConsultarSurcosTrabajados } from "../services/EnviarSurcosTrabajados";
import { EnviarSurcosTrabajados } from "../services/EnviarSurcosTrabajados";

export async function EnviarRegistrosSurcosTrabajados(realmInstance,token){

 try{
       const listaParaenviar = await realmInstance.objects("Surco")

    if(listaParaenviar.length === 0)
     return;
 
    const response = await EnviarSurcosTrabajados(listaParaenviar,token)
    console.log('sressss', response)
 }catch(error){
    console.log("Error completo:", error);
  console.log("Mensaje:", error.message);
  console.log("Stack:", error.stack);
 }
}

export async function GuardarSurcosTrabajados(realmInstace, token){
 

    const  RegistrosEncontrados = realmInstace.objects("Surco")
    
    if(RegistrosEncontrados.length === 0)
        return;

    const jefeNave = realmInstace.objects("UserData")
    if(jefeNave.length>0)
    {
        const respuesta = ConsultarSurcosTrabajados(token,jefeNave[0].codigo)
    }
}