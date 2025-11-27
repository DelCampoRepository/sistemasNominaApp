export const NaveSchema = {
    name: "Nave",
    properties: {
        CantidadSurcos: "int",
        CodigoLote: "int",
        CodigoNave: "string",
        CodigoTemporada: "int",
        CodigoUsuario: "string",
        DescripcionLote: "string",
        DescripcionNave: "string",
        TieneTablas: "bool",
        tieneSurcos: { type: "bool", default: false }

    },
    primaryKey: "CodigoNave",
}

