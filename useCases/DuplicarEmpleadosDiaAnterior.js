import { Alert } from "react-native";
import Realm, { UpdateMode } from "realm";
import { ahoraTimestamp, finDiaAyer, finDiaCuliacan, formatearFechaCuliacan, inicioDiaAyer, inicioDiaCuliacan } from "../utils/obtenerHoraCuliacan";



export async function ObtenerEmpleadosDiaAnteriorRealm(realmInstance) {

  try{
       
        const registrosAyer =
      realmInstance.objects("EmpleadoCapturado")
      .filtered(
        "FechaCaptura >= $0 AND FechaCaptura <= $1",
        inicioDiaAyer(),
        finDiaAyer()
      );

    console.log("registros ayer:", registrosAyer.length);

    if (registrosAyer.length > 0) {
      replicarRegistrosDelDiaAnterior(registrosAyer,realmInstance);
    } else {
      Alert.alert("","No se encontraron registros del día anterior");
    }
  }catch(error)
  {
    console.log(error);
  }

}


function replicarRegistrosDelDiaAnterior(registrosAyer, realmInstance) {


const registrosHoy =
  realmInstance.objects("EmpleadoCapturado")
  .filtered(
    "FechaCaptura >= $0 AND FechaCaptura <= $1",
    inicioDiaCuliacan(),
    finDiaCuliacan()
  );

if (registrosHoy.length > 0) {

  console.log("Ya existen registros hoy");

  return;

}

  realmInstance.write(() => {
    registrosAyer.forEach(emp => {
      const id = `${emp.CodigoEmpleado}-${emp.CodigoLote}-${emp.CodigoNave}-${emp.CodTabla}-${emp.CodigoActividad}-${emp.CodigoAvance}-${ inicioDiaCuliacan().getTime()}`;
        //const id = `${emp.CodigoEmpleado}-000-00-00-000-000-${ new Date(GenerarFecha(false, true)).getTime()}`;

      realmInstance.create("EmpleadoCapturado", {
        id,
        CodigoEmpleado: emp.CodigoEmpleado,
        Nombre: emp.Nombre,
        CodigoTemporada: emp.CodigoTemporada,
        CodigoLote: "000",
        CodigoNave: "00",
        CodTabla: "00",
        CodigoActividad: "000",
        CodigoAvance: "000",
        FechaCaptura:ahoraTimestamp(),                // fecha de hoy
        horaInicioActividad: null,             // en blanco
        horaFinalActividad: finDiaCuliacan(),              // en blanco
        limiteMaximoDeCaptura: null,           // en blanco
        tienePermiso: false,
        solicitoPermiso: false,
        Avances: 0,                            // reiniciado
        rendimientoApli: emp.rendimientoApli,                    // reiniciado
        codUnidad: emp.codUnidad,
        CodigoJefe: emp.CodigoJefe,
        surcos: [],                            // vacío
        surcosAvances: [],                     // vacío
        tieneSurcos: false,
        estado: 3,                             // reiniciado
        semana: emp.semana,
      },
       Realm.UpdateMode.Modified);
    });
  });
}
    
 