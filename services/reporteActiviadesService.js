import { finDiaCuliacanFecha, inicioDiaCuliacanFecha } from "../utils/obtenerHoraCuliacan";

const redondear2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;



export  function  obtenerActividadesLote(realm, params){
   
   
    if(realm === null || realm === undefined)
        return

    const res=  obtenerAvancesDeActividad(params.lote,params.nave,params.tabla, params.fechaIni, params.fechaFin,realm)
   const listActividadesTrabajadas = res
  .map(elemento => ({
  codActividad:  elemento.CodigoActividad,
  codAvance:     elemento.CodigoAvance,
  avance:        avanceRealDeEmpleado(elemento, realm),
  empleadoId:    elemento.CodigoEmpleado,   // ← agrega estos
  nombreEmpleado: elemento.Nombre,  // ← según tu schema
}))
  // Si a un empleado le borraron/corrigieron todo su aporte (ej. desde el
  // modal de avance por surcos), ya no cuenta como alguien que trabajó la
  // actividad.
  .filter(item => item.avance > 0);

       

  
        const actividadesReducidas = Object.values(
        listActividadesTrabajadas.reduce((acc, item) => {
    const key = `${item.codActividad}-${item.codAvance}`;

    if (acc[key]) {
      acc[key].avance = redondear2(acc[key].avance + item.avance);

      // Agregar empleado si no está ya en la lista
      const yaExiste = acc[key].empleados.some(e => e.id === item.empleadoId);
      if (!yaExiste) {
        acc[key].empleados.push({
          id:     item.empleadoId,
          nombre: item.nombreEmpleado,
        });
      }

    } else {
      acc[key] = {
        ...item,
        empleados: [{           // ← primer empleado
          id:     item.empleadoId,
          nombre: item.nombreEmpleado,
        }],
      };
    }

    return acc;
  }, {})
);
        const listaParaRender= agregarJornalesYAvancesALasActividades(realm, actividadesReducidas);
        console.log(JSON.stringify(listaParaRender,null,2))
        return listaParaRender
    
        
    
    
}

// EmpleadoCapturado.Avances es una "foto" que solo se actualiza al guardar
// avances; si después se borra/corrige un aporte individual en el modal de
// avance por surcos, esa foto puede quedar vieja. Para SCO se recalcula en
// vivo sumando los registros reales de Surco de ese mismo día.
function avanceRealDeEmpleado(elemento, realm){
    if (elemento.codUnidad?.trim() !== "SCO") {
        return elemento.Avances;
    }

    const surcos = realm.objects("Surco").filtered(
        "codEmpleado == $0 AND lote == $1 AND nave == $2 AND tabla == $3 AND actividad == $4 AND avance == $5 AND fecha >= $6 AND fecha <= $7",
        elemento.CodigoEmpleado,
        elemento.CodigoLote,
        elemento.CodigoNave,
        elemento.CodTabla,
        elemento.CodigoActividad,
        elemento.CodigoAvance,
        inicioDiaCuliacanFecha(elemento.FechaCaptura),
        finDiaCuliacanFecha(elemento.FechaCaptura)
    );

    return redondear2(
        Array.from(surcos).reduce((acc, s) => acc + s.avanceAcum, 0)
    );
}

function obtenerAvancesDeActividad(lote,nave,tabla,fechaIni,fechaFin,realm)
{
    const resultados = realm
        .objects("EmpleadoCapturado")
        .filtered(
        "CodigoLote == $0 AND CodigoNave == $1 AND CodTabla == $2 AND FechaCaptura >= $3 AND FechaCaptura <= $4",
        String(lote),
        nave,
        String(tabla),
        inicioDiaCuliacanFecha(fechaIni),
        finDiaCuliacanFecha(fechaFin)
    );
    
    return Array.from(resultados);
                    
}

function agregarJornalesYAvancesALasActividades(realm,actividadesReducidas ){

    if (actividadesReducidas.length === 0) return [];

    const filtros = actividadesReducidas.map((item, index) =>
            `(CodigoActividad == $${index * 2} AND CodigoAvance == $${index * 2 + 1})`
            ).join(' OR ');
        
    const parametros = actividadesReducidas.flatMap(item => 
        [item.codActividad, item.codAvance]
    );
       
    const encontrados = Array.from(
        realm.objects('Actividades').filtered(filtros, ...parametros)
    );
        
    return encontrados.map(item => {
  const match = actividadesReducidas.find(
    a => a.codActividad === item.CodigoActividad 
      && a.codAvance    === item.CodigoAvance
  );

  return {
    ...item,
    avanceSumado: match ? redondear2(match.avance).toFixed(2) : "0.00",
    jornales:     match ? redondear2(match.avance / item.Rendimiento).toFixed(2) : "0.00",
    empleados:    match ? match.empleados : [],
    totalEmpleados: match ? match.empleados.length : 0,
  };
});
}
 