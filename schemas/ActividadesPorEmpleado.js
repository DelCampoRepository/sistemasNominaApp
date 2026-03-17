export const ActividadesPorEmpleadoSchema = {
  name: "ActiviadesPorEmpleado",
  properties: {
    codigoEmpleado: "string",
    nombreEmpleado: "string",
    CodigoTemporada: "string",
    codigoLote: "string",
    codigoNave: "string",
    codigoTabla: "string",
    CodigoActividad: "string",
    CodigoAvance: "string",
    fecha: "date",
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
    avances: "float",
    CodigoUsuario: "string",
    CodigoCultivo: "string",
    Descripcion: "string",
    Rendimiento: "float",
    RendimientoTope: "float",
    CodUnidad: "string",
    NomCortoUnidad: "string",
    NomCompletoUnidad: "string",
    tieneSurcos: { type: "bool", default: false },
    tablaLabel: "string",
    jornal: "float"
  }
};

/*
export const ActividadesSchema = {
  name: "Actividades",
  properties: {
    CodigoUsuario: "string",
    CodigoLote: "string",
    CodigoCultivo: "string",
    CodigoActividad: "string",
    CodigoAvance: "string",
    Descripcion: "string",
    Rendimiento: "float",
    CodigoTemporada: "string",
    RendimientoTope: "float",
    CodUnidad: "string",
    NomCortoUnidad: "string",
    NomCompletoUnidad: "string",
    tieneSurcos: { type: "bool", default: false },
    tablaLabel: "string",
    limiteMaximoCaptura: "string"
  }
*/
//primaryKey: "CodigoActividad",
