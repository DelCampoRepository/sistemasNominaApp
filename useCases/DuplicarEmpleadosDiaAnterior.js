import { Alert } from "react-native";
import Realm, { UpdateMode } from "realm";
function obtenerDiaAnterior(){
  const ahora = new Date();
  
  const hoy = new Date(Date.UTC(
    ahora.getUTCFullYear(),
    ahora.getUTCMonth(),
    ahora.getUTCDate(),
    0, 0, 0, 0
  ));

  
const ayer = new Date(Date.UTC(
  ahora.getUTCFullYear(),
  ahora.getUTCMonth(),
  ahora.getUTCDate() -1,
  0, 0, 0, 0
));

//si el numero del dia es 0 (Domingo), restamos un dia mas a ayer para que sea sabado
  if (ayer.getDay() === 0) {
    ayer.setDate(ayer.getDate() - 1);
  }



return ayer;
}

function obtener_fechaFinal(){
 
        const ahora = new Date();

        const fechaLocalSinUTC = new Date(
          Date.UTC(
            ahora.getFullYear(),
            ahora.getMonth(),
            ahora.getDate(),
            ahora.getHours(),
            ahora.getMinutes(),
            ahora.getSeconds(),
            ahora.getMilliseconds()
          )
        );

        fechaLocalSinUTC.setHours(23, 59, 59, 999);
        return fechaLocalSinUTC;
      
}
export async function ObtenerEmpleadosDiaAnteriorRealm(realmInstance) {

  try{
       
      const ayer = obtenerDiaAnterior();
       const inicioAyer = new Date(ayer);
        inicioAyer.setHours(0, 0, 0, 0);

        const finAyer = new Date(ayer);
          finAyer.setHours(23, 59, 59, 999);

        const registrosAyer =
      realmInstance.objects("EmpleadoCapturado")
      .filtered(
        "FechaCaptura >= $0 AND FechaCaptura <= $1",
        inicioAyer,
        finAyer
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

/**
 * const hoy = new Date(
  ahora.getFullYear(),
  ahora.getMonth(),
  ahora.getDate(),
  0, 0, 0, 0
);
 */

function replicarRegistrosDelDiaAnterior(registrosAyer, realmInstance) {
 const hoy = new Date();

const inicioHoy = new Date(
  hoy.getFullYear(),
  hoy.getMonth(),
  hoy.getDate(),
  0,0,0,0
);

const finHoy = new Date(
  hoy.getFullYear(),
  hoy.getMonth(),
  hoy.getDate(),
  23,59,59,999
);

const registrosHoy =
  realmInstance.objects("EmpleadoCapturado")
  .filtered(
    "FechaCaptura >= $0 AND FechaCaptura <= $1",
    inicioHoy,
    finHoy
  );

if (registrosHoy.length > 0) {

  console.log("Ya existen registros hoy");

  return;

}

  realmInstance.write(() => {
    registrosAyer.forEach(emp => {
      const id = `${emp.CodigoEmpleado}-${emp.CodigoLote}-${emp.CodigoNave}-${emp.CodTabla}-${emp.CodigoActividad}-${emp.CodigoAvance}-${ new Date(GenerarFecha(false, true)).getTime()}`;
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
        FechaCaptura:new Date(GenerarFecha(false, true)),                // fecha de hoy
        horaInicioActividad: null,             // en blanco
        horaFinalActividad: obtener_fechaFinal(),              // en blanco
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
    
  const GenerarFecha = (horaExtra = false, SoloFecha = true) => {
    //   console.log(limiteMaximoCaptura, "limiteMaximoCaptura");
    const ahora = new Date();

    //if (horaExtra) ahora.setHours(ahora.() + limiteMaximoCaptura);

    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    let horas = String(ahora.getHours()).padStart(2, "0");

    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const segundos = String(ahora.getSeconds()).padStart(2, "0");
    let fechaFormateada = ``;

    if (SoloFecha) {
      fechaFormateada = `${año}-${mes}-${dia}`;
    } else {
      fechaFormateada = `${año}-${mes}-${dia} ${horas}:${horaExtra ? Number(minutos) + Number(2) : minutos}:${segundos}`;
    }
    return fechaFormateada;
  };