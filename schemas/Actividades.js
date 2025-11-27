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
        tieneSurcos: { type: "bool", default: false },
        tablaLabel: 'string?',

    },
    //primaryKey: "CodigoActividad",
};
