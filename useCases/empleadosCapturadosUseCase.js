import { EnviarEmpleados } from "../services/EnviarEmpleadosService";
import { exportarRealmAJSON } from "../utils/CreadorArchivos";
import { fecha } from "../utils/generarHoraLimite";

export async function syncEmpleadosCapturados(token)
{
    try{
        
        const Empleados = await ObtenerEmpleadosCapturadosRealm();
       await exportarRealmAJSON(realmInstance);
        const response  = await EnviarEmpleados(Empleados, token);

        if (response && response.length > 0) {
        
          await  GuardarEmpleadosSincronizados(response);
          await  GuardarEmpleadosSincronizadosActividades(response);
          await  exportarRealmAJSON(realmInstance);
        }
        return true;
    }
    catch(error)
    {
        throw error;
    }
}

//obtenemos lista de empleados capturados del schema EmpleadoCapturado
async function  ObtenerEmpleadosCapturadosRealm() {
const obtenerFechaCuliacan = () => {
  const ahora = new Date(Date.now() - 7 * 60 * 60 * 1000);
  return new Date(Date.UTC(
    ahora.getUTCFullYear(),
    ahora.getUTCMonth(),
    ahora.getUTCDate(),
    0, 0, 0, 0
  ));
};
 const hoy = obtenerFechaCuliacan()
  console.log(hoy.toLocaleDateString(),'asdasd');
  console.log(hoy.toISOString());
    try{
        const EmpleadosAEnviar = realmInstance
        .objects("EmpleadoCapturado")
        .filtered(`
            CodigoActividad !=$0 AND
            CodigoAvance !=$1 AND
            FechaCaptura ==$2
          `, 
          "000", 
          '000', 
          hoy);
      
        
          console.log(EmpleadosAEnviar.length )
     await   realmInstance.write(() => {
            EmpleadosAEnviar.forEach(empleado => {
                //buscamos los surcos que coincidan con lso datos del empleado
                const surcosEmpleadoEnRealm = BuscaSurcosDeEmpleado(empleado);
                //limpiamos los surcosAvances  del empleado
                empleado.surcosAvances.splice(0);
               
                //por cada surco encontrado que pertenece al empleado iterado, llenamos su clave surcosAvances con un objeto nuevo
                surcosEmpleadoEnRealm.forEach(surco => {
                    empleado.surcosAvances.push({
                    numeroSurco: Number(surco.surco),
                    avance: surco.avanceAcum
                    });
                });
            });
        });

      //retornamos la lista de empleados modificada
      return EmpleadosAEnviar;
    }
    catch(error){
        throw error;
    }
}

//buscamos todos los Surcos que coincidan con la informacion del empleado
function BuscaSurcosDeEmpleado(empleado)
{
     const surcosEmpleadoAEnviar = realmInstance.objects("Surco")
            .filtered(`
                codEmpleado == $0 AND
                lote == $1 AND
                nave == $2 AND
                tabla ==$3 AND
                actividad == $4 AND 
                avance ==$5 
             `,
                empleado.CodigoEmpleado,
                empleado.CodigoLote,
                empleado.CodigoNave,
                empleado.CodTabla,
                empleado.CodigoActividad,
                empleado.CodigoAvance
            );
    return surcosEmpleadoAEnviar;
}

//guardamos los empleados en  el Schema EmpleadoCapturado
async function GuardarEmpleadosSincronizados(empleados)
{


    


     try{
        await   realmInstance.write(() => {
           if (realmInstance.objects("EmpleadoCapturado") !== null)
             {
                 console.log("se borraron los empleados")
                   
                realmInstance.delete(realmInstance.objects("EmpleadoCapturado").filtered(`
            CodigoActividad ==$0 AND
            CodigoAvance ==$1
          
          `, 
          "000", 
          '000'));

             }
            empleados.forEach(empResp => {
            const empleado = realmInstance
              .objects("EmpleadoCapturado")
              .filtered(
                `   CodigoEmpleado == $0 AND
                    CodigoLote == $1 AND
                    CodigoNave == $2 AND
                    CodTabla == $3 AND
                    CodigoActividad == $4 AND
                    CodigoAvance == $5 AND
                    FechaCaptura == $6
                `,
                    empResp.codigoEmpleado,
                    empResp.codigoLote,
                    empResp.codigoNave,
                    empResp.codTabla,
                    empResp.codigoActividad,
                    empResp.codigoAvance,
                    new Date(empResp.fechaCaptura)
              )[0];

            if (empleado && empleado.solicitoPermiso === true && empResp.tienePermiso ===true) {
              // actualizar campos
              console.log(empResp.estado)
              Object.assign(empleado, {
                estado: empResp.estado,
                solicitoPermiso: empResp.solicitoPermiso,
                tienePermiso: empResp.tienePermiso,
                limiteMaximoDeCaptura:
                  empleado.tienePermiso === false
                    ? fecha()
                    : empleado.limiteMaximoCaptura,
                horaFinalActividad:
                  empleado.tienePermiso === false
                    ? fecha()
                    : new Date(empleado.horaFinalActividad)
              });
            }else{
                
              Object.assign(empleado, {
                estado: empResp.estado
                });
            }
          });
        });
     }catch(error)
     {

     }
}

//guardamos la sincronizacion de los empleados en el Schema ActiviadesPorEmpleado
async function GuardarEmpleadosSincronizadosActividades(empleados){
  console.log("EMP",JSON.stringify(empleados,null,2))
    try{
       await realmInstance.write(() => {
          

          empleados.forEach(empResp =>
             {
              console.log(empResp)
              if(empleados !== undefined && empResp.codigoActividad !== '000' &&  empResp.codigoAvance !== '000')
              {
                 const actividad = realmInstance
              .objects("ActiviadesPorEmpleado")
              .filtered(
                `   codigoEmpleado == $0 AND
                    codigoLote == $1 AND
                    codigoNave == $2 AND
                    codigoTabla == $3 AND
                    CodigoActividad == $4 AND
                    CodigoAvance == $5 AND
                    fecha == $6
                `,
                    empResp.codigoEmpleado,
                    empResp.codigoLote,
                    empResp.codigoNave,
                    empResp.codTabla,
                    empResp.codigoActividad,
                    empResp.codigoAvance,
                    new Date(empResp.fechaCaptura)
              )[0];

            if (actividad && actividad.solicitoPermiso === true && empResp.tienePermiso ===true) {
              
              Object.assign(actividad, {
                estado: empResp.estado,
                solicitoPermiso: empResp.solicitoPermiso,
                tienePermiso: empResp.tienePermiso,
                limiteMaximoDeCaptura:
                actividad.tienePermiso === false
                    ? fecha()
                    : actividad.limiteMaximoCaptura
                });
            }
            else{
                
              Object.assign(actividad, {
                estado: empResp.estado
                });
            }
              }
          });
        });

        return true;

    }catch(error)
    {
            throw error;
    }
}

     
   
      
   
  