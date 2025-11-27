

export const EmpleadoSchema = {
    name: 'Empleado',
    primaryKey: 'CodigoEmpleado',
    properties: {
        CodigoEmpleado: 'string',
        Nombre: 'string',
        CodigoTemporada: 'string',
        CodigoLote: 'string',
        CodigoNave: 'string',
        CodigoActividad: 'string',
        CodigoAvance: 'string',
        surcos: {
            type: 'list',
            objectType: 'Surco',
            default: [],

        },
        tieneSurcos: { type: "bool", default: false }


    },
};