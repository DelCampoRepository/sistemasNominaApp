import { SemanaSchema } from "./Semana";
import { NaveSchema } from "./Nave"; // Importa el esquema de Nave
import { TablaSchema } from "./Tablas";
import { ActividadesSchema } from "./Actividades"; // Importa el esquema de Actividades
import { EmpleadoSchema } from "./Empleados";
import { GuardarEmpleadoSchema } from "./GuardarEmp";
import { ReportesActSchema } from "./ReportesAct";
import { ReportesEmpleadosSchema } from "./ReportesEmp";
import { SurcoSchema } from "./Surcos";
import { EmpleadosXUsuarioYFechaSchema } from "./EmpleadosXUsuarioYFecha";
import { ActividadSchema } from "./GuardarAct";
import { GuardarSurcosSchema } from "./GuardarSurcos";
import { obtenerTrabajoSquema } from "./obtenerTrabajo";
import { GuardarJornalesSchema } from "./GuardarJornales";
import { UserDataSchema } from "./userData";
import { EmpleadoCapSchema } from "./EmpleadoCapturado";
import { Sincronizar } from "./SincronizarState";
import { SurcoDecimalSchema } from "./surcosConDecimal";
import { ActividadesPorEmpleadoSchema } from "./ActividadesPorEmpleado";
import { SurcoAvanceSchema } from "./SurcoAvanceSchema";
import { CredencialesSchema } from "./CredencialesSchema";
//importa nave schema

export const schemas = [
  SemanaSchema,
  NaveSchema,
  TablaSchema,
  ActividadesSchema,
  EmpleadoSchema,
  GuardarEmpleadoSchema,
  ReportesActSchema,
  ReportesEmpleadosSchema,
  SurcoSchema,
  EmpleadosXUsuarioYFechaSchema,
  ActividadSchema,
  GuardarSurcosSchema,
  obtenerTrabajoSquema,
  GuardarJornalesSchema,
  UserDataSchema,
  EmpleadoCapSchema,
  Sincronizar,
  SurcoDecimalSchema,
  ActividadesPorEmpleadoSchema,
  SurcoAvanceSchema,
  CredencialesSchema

];
