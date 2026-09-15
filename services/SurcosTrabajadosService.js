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
              registros: []
            };
          }
      
          acc[item.surco].avanceTotal += item.avanceAcum;
          acc[item.surco].trabajadoTotal ||= item.trabajadoTotal;
          acc[item.surco].cantidadEmpleados++;
      
          acc[item.surco].registros.push(item);
      
          return acc;
      
        }, {})

        
);

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
