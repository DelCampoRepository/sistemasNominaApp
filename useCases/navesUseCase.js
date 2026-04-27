
import { ObtenerNavesPorUsuario } from "../services/ObtenerNavesService";


export async  function syncNaves( realmInstance,codigo, temporada, token){

 try{

    const datosRespuesta = await ObtenerNavesPorUsuario(codigo, temporada,token);
   
    
    if(datosRespuesta && datosRespuesta.estado !== 1)
    {
      
        return false;
    }
    const data =  datosRespuesta;
    const resultado = await guardarNavesEnRealm(realmInstance, data);
    
    return resultado;
 }
 catch (error) {
    console.log(error);
   
    return false;
 }
        
}

async function guardarNavesEnRealm(realmInstance, data) {
    try
    {
     

             realmInstance.write(() => {
            const navesEnRealm = realmInstance.objects("Nave");
            if(navesEnRealm.length > 0)
            {
                console.log("se borraron las naves")
                 realmInstance.delete(navesEnRealm);
            }
                
            data.naves.forEach(nave => {
                realmInstance.create(
                    "Nave",
                    {
                        _id: `${nave.codigoLote}_${nave.codigo}_${nave.temporada}`,
                        CantidadSurcos: nave.cantidadSurcos,
                        CodigoLote: Number(nave.codigoLote),
                        CodigoNave: nave.codigo,
                        CodigoTemporada: Number(nave.temporada),
                        CodigoUsuario: nave.codigoUsuario,
                        DescripcionLote: nave.descripcionLote,
                        DescripcionNave: nave.descripcion,
                        TieneTablas: nave.tieneTablas
                    },
                    "modified"
                );
            });
            
        });
        
        return true;
    }
    catch (error) 
    {
        console.log(error)
        return false;
    }
}

