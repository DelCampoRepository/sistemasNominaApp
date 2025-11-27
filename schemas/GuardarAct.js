export const ActividadSchema = {
    name: "listaActividades",
    properties: {
        CodigoActividad: "string",
        Descripcion: "string",
        CodigoAvance: "string",
        CodigoCultivo: "string",
        CodigoLote: "string",
        CodigoUsuario: "string",
        Rendimiento: "float",
        CodigoTemporada: "string",
        DisplayText: "string",
        TieneAvance: "bool",
    },
    //primaryKey: "CodigoActividad",
};
