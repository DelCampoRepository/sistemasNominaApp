export const TablaSchema = {
    name: "Tablas",
    properties: {
        CodigoTemporada: "int",
        CodigoLote: "int",
        CodigoNave: "string",
        CodigoTabla: "int",
        Descripcion: "string",
        CantidadSurcos: "int",
        CodigoJefeNave: "string",
        tieneSurcos: { type: "bool", default: false }
    },
    primaryKey: "CodigoTabla",
};