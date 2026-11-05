// Estado global de sincronizacion (Schema "Sincronizar", id fijo 0).
// sincronizado:false => hay captura local (EmpleadoCapturado/ActiviadesPorEmpleado/Surco)
// que aun no se ha enviado al servidor.
// sincronizado:true  => la ultima sincronizacion con el servidor termino sin errores.
//
// Debe llamarse SIEMPRE que se cree o modifique un registro de captura
// (empleado agregado, avance editado, surco marcado, etc.) para que el
// indicador en HomeScreen sea preciso.

export function marcarPendienteSincronizacion(realmInstance) {
  realmInstance.create("Sincronizar", { id: 0, sincronizado: false }, "modified");
}

export function marcarSincronizado(realmInstance) {
  realmInstance.create("Sincronizar", { id: 0, sincronizado: true }, "modified");
}
