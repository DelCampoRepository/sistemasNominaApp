export const SurcoSchema = {
  name: "Surco",
  properties: {
    surco: "string",
    tabla: "string",
    nave: "string",
    lote: "string",
    actividad: "string",
    avance: "string",
    codEmpleado: "string",
    fecha: "date",
    seleccionado: "bool",
    avanceAcum: "float",
    semanaActiva: "string",
    estado: {
      type: "string",
      default: "w"
    },
    trabajadoTotal: {
      type: "bool",
      optional: true,
      default: false
    }
  }
};
