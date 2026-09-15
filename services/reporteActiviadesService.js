import { finDiaCuliacanFecha, inicioDiaCuliacanFecha } from "../utils/obtenerHoraCuliacan";



export  function  obtenerActividadesLote(realm, params){
   
   
    if(realm === null || realm === undefined)
        return

    const res=  obtenerAvancesDeActividad(params.lote,params.nave,params.tabla, params.fechaIni, params.fechaFin,realm)
   const listActividadesTrabajadas = res.map(elemento => ({
  codActividad:  elemento.CodigoActividad,
  codAvance:     elemento.CodigoAvance,
  avance:        elemento.Avances,
  empleadoId:    elemento.CodigoEmpleado,   // ← agrega estos
  nombreEmpleado: elemento.Nombre,  // ← según tu schema
}));

       

  
        const actividadesReducidas = Object.values(
        listActividadesTrabajadas.reduce((acc, item) => {
    const key = `${item.codActividad}-${item.codAvance}`;

    if (acc[key]) {
      acc[key].avance += item.avance;

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
    avanceSumado: match ? match.avance : 0,
    jornales:     match ? (match.avance / item.Rendimiento).toFixed(2) : 0,
    empleados:    match ? match.empleados : [],     
    totalEmpleados: match ? match.empleados.length : 0, 
  };
});
}
 