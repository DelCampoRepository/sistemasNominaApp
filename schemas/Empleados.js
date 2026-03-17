export const EmpleadoSchema = {
  name: "Empleado",
  primaryKey: "CodigoEmpleado",
  properties: {
    CodigoEmpleado: "string",
    Nombre: "string",
    CodigoTemporada: "string",
    CodigoLote: "string",
    CodigoNave: "string",
    CodigoJefeNave: "string"
  }
};
