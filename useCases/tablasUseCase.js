
import { ObtenerTablasPorUsuario } from "../services/ObtenerTablasService";

export async function syncTablas(realmInstance,codigo, codigoTemporada, token) {    
    try {
        
        const respuesta = await ObtenerTablasPorUsuario(codigo, codigoTemporada, token);


        if(respuesta !== undefined && respuesta.estado !==1)
        {
             
             return false;
        }

        const resultado = guardarTablasEnRealm(realmInstance,respuesta);
       
        return resultado;
    }catch(error)
    {
        throw error;
    }
}


async function guardarTablasEnRealm(realmInstance, data ) {

    try{
        if (realmInstance.objects("Tablas") !== null && data !== undefined){
                realmInstance.write(() => {
                
                     console.log("se borraron las tablas")
                    realmInstance.delete(realmInstance.objects("Tablas"));

                       data.tablasDeNave.forEach(tabla => {
                const idUnico = `${tabla.codigoLote}-${tabla.codigoNave}-${tabla.codigoTabla}`;

                realmInstance.create(
                  "Tablas",
                  {
                    idCompuesto: idUnico,
                    CodigoTemporada: parseInt(tabla.temporada),
                    CodigoLote: parseInt(tabla.codigoLote),
                    CodigoNave: tabla.codigoNave,
                    CodigoTabla: parseInt(tabla.codigoTabla),
                    Descripcion: tabla.descripcion,
                    CantidadSurcos: parseInt(tabla.cantidadSurcos),
                    CodigoJefeNave: tabla.codigoUsuario
                  },
                  "modified"
                );
                });
            });

            return true;
       }
     
        else
        {
           return false;
        }

        
    }catch(error)
    {
        throw error;
    }

    
}
 

