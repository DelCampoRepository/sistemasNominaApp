import { SurcoSchema } from "./Surcos";
export const EmpleadoCapSchema = {
  name: "EmpleadoCapturado",
  primaryKey:"id",
  properties: {
    id:"string",
    CodigoEmpleado: {
  type: "string",
  indexed: true
},
    Nombre: "string",
    CodigoTemporada: "string",
    CodigoLote: "string",
    CodigoNave: "string",
    CodTabla: "string",
    CodigoActividad: "string",
    CodigoAvance: "string",
    FechaCaptura: "date",
    horaInicioActividad: {
      type: "date",
      optional: true
    },
    horaFinalActividad: {
      type: "date",
      default: () => {
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
    },
    limiteMaximoDeCaptura: {
      type: "date",
      optional: true
    },
    tienePermiso: "bool",
    solicitoPermiso: "bool",
    Avances: "float",
    rendimientoApli: "float",
    codUnidad: "string",
    CodigoJefe: "string",
    surcos: {
      type: "list",
      objectType: "int",
      default: []
    },
    surcosAvances: {
      type: "list",
      objectType: "SurcoAvance",
      default: []
    },
    tieneSurcos: { type: "bool", default: false },
    estado: { type: "int", default: 0 },
    semana: {
      type: "int",
      default:0,
      optional: true
    }
  }
};
