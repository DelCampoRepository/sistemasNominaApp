export const ReportesActSchema = {
    name: 'ReportesAct',
    properties: {
        CodigoActividad: 'string',
        CodigoAvance: 'string',
        Descripcion: 'string',
        CantidadSurcos: 'int',
    },
    //primaryKey: 'CodigoActividad', // si esperas que una actividad no se repita, si no, quítalo
};
