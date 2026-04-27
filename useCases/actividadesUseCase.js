
import { ObtenerActividades } from "../services/ObtenerActividadesService";
export async function syncActividades(realmInstance, codigo, temporada, token) {

    try{
            const respuesta = await ObtenerActividades(codigo, temporada, token);

            if(respuesta.estado !== 1)
            {
                return false;
            }
          
            const resultado = await guardarActividadesEnRealm(realmInstance, respuesta);
            return resultado;
    }
    catch (error) 
    {
      console.log(error);
      throw error;
    }
}


async function guardarActividadesEnRealm(realmInstance, data) {
    try
    {   

        realmInstance.write(() => {
            if (realmInstance.objects("Actividades") !== null)
            {
               console.log("se borraron las activiades")
                    realmInstance.delete(realmInstance.objects("Actividades"));
            }

            data.actividades.forEach(act => {
              realmInstance.create(
                "Actividades",
                {
                  CodigoUsuario: act.codigoUsuario,
                  CodigoLote: act.codigoLote,
                  CodigoCultivo: act.codigoCultivo,
                  CodigoActividad: act.codigoActividad,
                  CodigoAvance: act.codigoAvance,
                  Descripcion: act.descripcion,
                  Rendimiento: act.rendimiento,
                  CodigoTemporada: act.temporada,
                  tablaLabel: "",
                  RendimientoTope: act.rendimientoTope,
                  CodUnidad: act.codUnidad,
                  NomCortoUnidad: act.nomCortoUnidad,
                  NomCompletoUnidad: act.nomCompletoUnidad,
                  limiteMaximoCaptura: String(act.limiteMaximoCaptura)
                },
                "modified"
              );
            });
      });

        return true;

    }catch (error) {
        throw error;
       
    }
}



