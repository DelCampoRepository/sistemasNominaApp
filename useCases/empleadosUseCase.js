import { ObtenerEmpleados } from "../services/ObtenerEmpleados";

export  async function syncEmpleados(realmInstance, temporada, token){

    try{

        const respuesta = await ObtenerEmpleados( temporada, token);
        if (respuesta.estado !== 1) {
            throw new Error( `Error al obtener empleados de la api  estado: ${respuesta.estado}`);
        }

        const resultado = await guardarEmpleadosEnRealm(realmInstance, respuesta);
        return resultado;
    }
    catch(error)
    {
            throw error;
    }
}


async function guardarEmpleadosEnRealm(realmInstance, data) {

    try{
         realmInstance.write(() => {

             if (realmInstance.objects("Empleado") !== null)
             {
                 console.log("se borraron los empleados")
                   
                realmInstance.delete(realmInstance.objects("Empleado"));

             }

            data.empleados.forEach(emp => {
                realmInstance.create(
                "Empleado",
                {
                  CodigoEmpleado: emp.codigoEmpleado,
                  Nombre: emp.nombre,
                  CodigoTemporada: emp.temporada,
                  CodigoLote: emp.codigoLote,
                  CodigoNave: emp.codigoNave,
                  CodigoJefeNave:
                    emp.codigoJefeNave === null ? "" : emp.codigoJefeNave
                },
                "modified"
            );
        });
      });

      return true;
      
    }catch(error)
    {
            throw error;
    }
}



      