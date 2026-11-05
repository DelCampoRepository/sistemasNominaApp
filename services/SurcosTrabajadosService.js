import { resolveUri } from "expo-asset/build/AssetSources";
import { finDiaCuliacanFecha, inicioDiaCuliacanFecha } from "../utils/obtenerHoraCuliacan"

export function consultarSurcosTrabajadosParaReporte(params,realm){

 
    const resultado = realm.objects("Surco").filtered(`
            lote == $0 AND
            nave == $1 AND
            tabla == $2 AND
            actividad == $3 AND
            avance == $4 AND
            fecha >= $5 AND
            fecha <= $6
            `,
            String(params.parametros.lote),
            params.parametros.nave,
            params.parametros.tabla,
            params.datosActivdad.CodigoActividad,
            params.datosActivdad.CodigoAvance,
            inicioDiaCuliacanFecha(params.parametros.fechaIni),
            finDiaCuliacanFecha(params.parametros.fechaFin)
        )
    
    const surcosAgrupados = Object.values(
        resultado.reduce((acc, item) => {

          if (!acc[item.surco]) {
            acc[item.surco] = {
              surco: item.surco,
              avanceTotal: 0,
              cantidadEmpleados: 0,
              trabajadoTotal: false,
              registros: [],
              porEmpleado: {}
            };
          }

          const grupo = acc[item.surco];
          const empleado = realm.objectForPrimaryKey("Empleado", item.codEmpleado);
          const nombreEmpleado = empleado?.Nombre ?? "Desconocido";

          grupo.avanceTotal += item.avanceAcum;
          grupo.trabajadoTotal ||= item.trabajadoTotal;

          grupo.registros.push({
            codEmpleado: item.codEmpleado,
            nombreEmpleado,
            fecha: item.fecha,
            avanceAcum: item.avanceAcum
          });

          if (!grupo.porEmpleado[item.codEmpleado]) {
            grupo.porEmpleado[item.codEmpleado] = {
              codEmpleado: item.codEmpleado,
              nombreEmpleado,
              avanceTotal: 0
            };
            grupo.cantidadEmpleados++;
          }
          grupo.porEmpleado[item.codEmpleado].avanceTotal += item.avanceAcum;

          return acc;

        }, {})


);

surcosAgrupados.forEach(grupo => {
  grupo.porEmpleado = Object.values(grupo.porEmpleado);
});

return surcosAgrupados

}

export  function obtenerEstatusSurco(params,realm){

  const resultado = realm.objects("Surco").filtered(`
            lote == $0 AND
            nave == $1 AND
            tabla == $2 AND
            actividad == $3 AND
            avance == $4 AND
            fecha >= $5 AND
            fecha <= $6
            `,
            String(params.parametros.lote),
            params.parametros.nave,
            params.parametros.tabla,
            params.datosActivdad.CodigoActividad,
            params.datosActivdad.CodigoAvance,
            inicioDiaCuliacanFecha(params.parametros.fechaIni),
            finDiaCuliacanFecha(params.parametros.fechaFin)
        )

        const surcos = Object.values(
        resultado.reduce((acc, item) => {

            if (!acc[item.surco]) {
              acc[item.surco] = {
                surco: item.surco,
                estado: item.estado,
                avanceAcum: item.avanceAcum
              };
            }

            return acc;

          }, {})

        );

        return surcos
     

}
