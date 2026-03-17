export const SemanaSchema = {
  name: "Semana",
  properties: {
    CodigoSemana: "int",
    CodigoTemporada: "int",
    FechaInicial: "string",
    FechaFinal: "string"
  },
  primaryKey: "CodigoSemana"
};
