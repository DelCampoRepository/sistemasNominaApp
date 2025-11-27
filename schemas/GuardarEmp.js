export const GuardarEmpleadoSchema = {
    name: "GuardarEmpleado",
    properties: {
        CodigoEmpleado: "string",
        CodigoLote: "string",
        CodigoNave: "string",
        CodigoTemporada: "string",
        Nombre: "string",
        Surco: "int",
        Avance: "int",
    },
    primaryKey: "CodigoEmpleado",
};
