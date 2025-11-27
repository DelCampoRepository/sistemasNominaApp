
export const SemanaSchema = {
    name: "Semana",
    properties: {
        CodigoSemana: "int",
        CodigoTemporada: "int",
        FechaInicial: "date",
        FechaFinal: "date",
    },
    primaryKey: "CodigoSemana",
}