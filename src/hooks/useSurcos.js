import { useState, useEffect } from "react";
import { ahoraTimestamp, finDiaAyer, finDiaCuliacan, inicioDiaCuliacan } from "../../utils/obtenerHoraCuliacan";
import { Alert } from "react-native";


export const useSurcos =(realmInstance, datosActividad, modales, datosEmpleadoSeleccionado)=>{

    const [listaSurcos,setListaSurcos]= useState([]);
    const [semana,setSemana] = useState([]);
    const [modalFraccionado, SetModalFraccionado] = useState(false);
    const [avanceSurco, setAvanceSurco] = useState("");
    const [datosSurcoTrabajado,setDatosSurcoTrabajado]= useState({});
    const [mostraInfo, setMostrarInfo] = useState(false);
    const [datosSurcoFraccionSelec,setDatosSurcoFraccionSele]= useState({});
    
useEffect(() =>{

    if(realmInstance && modales.modalSurcos === true)
    {   
         function inicializar(){
            setSemana(realmInstance.objects("Semana")[0]?.CodigoSemana ||"");

            const cantidadSurcosTabla = realmInstance
            .objects("Tablas")
            .filtered(
                `
                CodigoLote  == $0 AND 
                CodigoNave  == $1 AND
                CodigoTabla == $2`,
                datosActividad.codigoLote,
                datosActividad.codigoNave,
                datosActividad.codigoTabla
            )[0].CantidadSurcos;

            if(cantidadSurcosTabla){
                generarListaBase(cantidadSurcosTabla);
                buscarSurcosVerdes();
                buscarSurcosGrises();
                buscarSurcosAzules();
                buscarDiasMorados();
                calculoAvanceFraccParaCadaSurco(cantidadSurcosTabla);
            
            }
        }
        
        inicializar();
    }

   
},
[realmInstance, modales.modalSurcos, datosActividad.codigoEmpleado]
);

useEffect(()=>{
//console.log(JSON.stringify(datosSurcoFraccionSelec,null,2));
    
},[datosSurcoFraccionSelec])
useEffect(()=>{

console.log(JSON.stringify(listaSurcos[0],null,2));
console.log(JSON.stringify(listaSurcos[1],null,2));
console.log(JSON.stringify(listaSurcos[2],null,2));
    
},[listaSurcos])

function generarListaBase(cantidad){
        const listaBase = [];

        if(cantidad > 0)
        {
            for(let i =1; i<=cantidad; i++)
            {
                const SurcoBase ={
                    surco: i,
                    avanceAcum: 0,
                    avanceTotalOtros:0,
                    estado: "w",
                    codEmpleado:"",
                    seleccionado:false,
                    fecha:"",
                    primerFraccionado: false
                };

                listaBase.push(SurcoBase);
            }

            setListaSurcos(listaBase);
        }
}

function handlePress(surcoPresionado) {


    if(surcoPresionado.estado =="o" && surcoPresionado.avanceTotalOtros > 0)
    {
        return;
    }

    if(surcoPresionado.estado =="g" && surcoPresionado.avanceTotalOtros > 0)
    {
        return;
    }
    if(surcoPresionado.estado =="r" && surcoPresionado.avanceTotalOtros > 0)
    {
        return;
    }
    if(surcoPresionado.estado =="b" && surcoPresionado.avanceTotalOtros > 0)
    {
        return;
    }

    if(surcoPresionado.estado ==="b" ||surcoPresionado.estado ==="g" || surcoPresionado.estado ==="r" && surcoPresionado.avanceAcum === 1)
    {
       
        setDatosSurcoTrabajado(surcoPresionado);
        setMostrarInfo(true);
        return;
    }
    setMostrarInfo(false);
  const seleccionando = !surcoPresionado.seleccionado;

  const cambios = seleccionando
    ? { seleccionado: true,  estado: "gr", codEmpleado: datosActividad.codigoEmpleado, avanceAcum: 1 }
    : { seleccionado: false, estado: "w",  codEmpleado: "",                             avanceAcum: 0 };

  setListaSurcos(prev => prev.map(surco =>
    surco.surco === surcoPresionado.surco ? { ...surco, ...cambios } : surco
  ));
}

function handleLongPress(surcoPresionado){


    if(surcoPresionado.estado ==="w" || surcoPresionado.estado ==="o" )
    {
         
        SetModalFraccionado(true);
       setDatosSurcoFraccionSele(surcoPresionado);
    }
   
}

function guardarSurcosSeleccionados(){
   
    const surcosSelec = listaSurcos.filter(surco =>  surco.estado === "gr" || surco.estado ==="o");

   // console.log(JSON.stringify(surcosSelec,null,2));
    eliminarRegistrosAnteriores();
    guardarSurcosNuevos(surcosSelec);
  Alert.alert("avances  guardados")
}

function eliminarRegistrosAnteriores(){

   realmInstance.write(()=>{
     const surcosPrevios = realmInstance.objects("Surco").filtered(
        `   
        tabla == $0 AND
        nave == $1 AND 
        lote == $2 AND 
        codEmpleado == $3  AND 
        actividad == $4 AND 
        avance == $5  AND
        semanaActiva == $6 AND 
        fecha >= $7 AND 
        fecha <= $8
        `,
        datosActividad.codigoTabla,
        datosActividad.codigoNave,
        datosActividad.codigoLote,
        datosActividad.codigoEmpleado,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance,
        String(semana),
        inicioDiaCuliacan(),
        finDiaCuliacan()
    )

     realmInstance.delete(surcosPrevios);
   })

}

function guardarSurcosNuevos(listaSurcos){
 //console.log(JSON.stringify(listaSurcos,null,2))
    if(listaSurcos.length === 0)
        return;
   try{

      const ListasurcoSchema = listaSurcos
    .filter(item => item.avanceAcum !== 0)
    .map(item => ({
        surco: String(item.surco),
        tabla: datosActividad.codigoTabla,
        nave: datosActividad.codigoNave,
        lote: datosActividad.codigoLote,
        actividad: datosActividad.CodigoActividad,
        avance: datosActividad.CodigoAvance,
        codEmpleado: datosActividad.codigoEmpleado,
        avanceAcum: Number(item.avanceAcum.toFixed(2)),
        estado: item.estado,
        fecha: ahoraTimestamp(),
        semanaActiva: String(semana),
        trabajadoTotal: item.avanceAcum + item.avanceTotalOtros === 1 ? true : false,
        seleccionado: item.seleccionado,
        primerFraccionado: item.primerFraccionado
    }));
     realmInstance.write(()=>{
        
       ListasurcoSchema.forEach(surco => { 
        realmInstance.create("Surco", surco,'modified');
      });
    });
   }
   catch(error){
        console.log(error);
   }


}

function buscarSurcosVerdes(){

   const surcosGuardadosHoy= realmInstance.objects("Surco").filtered(`
        codEmpleado ==$0 AND
        avanceAcum ==$1 AND
        fecha >=$2 AND
        fecha <=$3 AND
        lote == $4 AND
        nave == $5 AND 
        tabla == $6 AND 
        actividad == $7 AND  
        avance == $8
        `,
        datosActividad.codigoEmpleado,
        1,
        inicioDiaCuliacan(),
        finDiaCuliacan(),
        datosActividad.codigoLote,
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance
    )
        setListaSurcos(prev => prev.map(item =>{

        const encontrado = surcosGuardadosHoy.find((o) => o.surco == item.surco);

            
        return encontrado ? 
        {...item, 
            seleccionado: encontrado.seleccionado, 
            estado:encontrado.estado,
            avanceAcum: encontrado.avanceAcum, 
            avanceTotalOtros: 0,
            codEmpleado:encontrado.codEmpleado 
        }: item;
    }));


}

function buscarSurcosGrises(){

     const surcosGuardadosHoy= realmInstance.objects("Surco").filtered(`
        codEmpleado !=$0 AND
        avanceAcum ==$1 AND
        fecha >=$2 AND
        fecha <=$3 AND
        lote == $4 AND
        nave == $5 AND 
        tabla == $6 AND 
        actividad == $7 AND  
        avance == $8 

        `,
        datosActividad.codigoEmpleado,
        1,
        inicioDiaCuliacan(),
        finDiaCuliacan(),
        datosActividad.codigoLote,
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance
    )

    if(surcosGuardadosHoy.length > 0)
     
        setListaSurcos(prev => prev.map(item =>{

        const encontrado = surcosGuardadosHoy.find((o) => o.surco == item.surco);
        
        return encontrado ? 
        {...item, 
            seleccionado: encontrado.seleccionado, 
            estado:"g",
            avanceAcum: encontrado.avanceAcum,
            avanceTotalOtros: 0,
            codEmpleado:encontrado.codEmpleado,
            fecha:   new Date(encontrado.fecha).toLocaleDateString()
        }: item;
    }));

}

function buscarSurcosAzules(){

    const dias = datosActividad.dias_frecuencia_surcos;
    
    const surcosGuardadosDiasAnteriores= realmInstance.objects("Surco").filtered(`
        codEmpleado ==$0 AND
        avanceAcum ==$1 AND
        fecha >=$2 AND
        fecha <=$3 AND
        lote == $4 AND
        nave == $5 AND 
        tabla == $6 AND 
        actividad == $7 AND  
        avance == $8 
        `,
        datosActividad.codigoEmpleado,
        1,
        restarDias(finDiaAyer(),dias),
        finDiaAyer(),
        datosActividad.codigoLote,
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance
        
    )


    setListaSurcos(prev => prev.map(item =>{

        const encontrado = surcosGuardadosDiasAnteriores.find((o) => o.surco == item.surco);
        
      
        return encontrado? 
        {...item, 
            seleccionado: encontrado.seleccionado, 
            estado:"b",
            avanceAcum: encontrado.avanceAcum, 
            avanceTotalOtros: 0,
            codEmpleado:encontrado.codEmpleado ,
            fecha:   new Date(encontrado.fecha).toLocaleDateString()
        }: item;
    }));
}

function buscarDiasMorados(){

   
    const dias =datosActividad.dias_frecuencia_surcos;
    
    const surcosGuardadosDiasAnteriores= realmInstance.objects("Surco").filtered(`
        codEmpleado !=$0 AND
        avanceAcum ==$1 AND
        fecha >=$2 AND
        fecha <=$3 AND
        lote == $4 AND
        nave == $5 AND 
        tabla == $6 AND 
        actividad == $7 AND  
        avance == $8 
        `,
        datosActividad.codigoEmpleado,
        1,
        restarDias(finDiaAyer(),dias),
        finDiaAyer(),
        datosActividad.codigoLote,
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance
        
    )


    setListaSurcos(prev => prev.map(item =>{

         const encontrado = surcosGuardadosDiasAnteriores.find((o) => o.surco == item.surco);
         
        return encontrado ? 
        {...item, 
            seleccionado: encontrado.seleccionado, 
            estado:"r",
            avanceAcum: encontrado.avanceAcum,
            avanceTotalOtros: 0,
            codEmpleado:encontrado.codEmpleado,
            fecha:  new Date(encontrado.fecha).toLocaleDateString()
        }: item;
    }));
}

//buscamos todos los surcos fracc filtrando
function BuscarSurcosNaranjas(){

    const dias =datosActividad.dias_frecuencia_surcos;
    const surcosFraccion= realmInstance.objects("Surco").filtered(`
       
        avanceAcum >$0 AND
        avanceAcum <$1 AND
        fecha >=$2 AND
        fecha <=$3 AND
        lote == $4 AND
        nave == $5 AND 
        tabla == $6 AND 
        actividad == $7 AND  
        avance == $8 
        `,
        0,
        1,
        restarDias(finDiaAyer(),dias),
        finDiaCuliacan(),
        datosActividad.codigoLote,
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance        
    )

    return surcosFraccion;
   
}

//sirve para renderizar cada surco que sea naranja , se iteran todos los surcos para buscar coincidencias con lso surcosfracc encontrados
function calculoAvanceFraccParaCadaSurco(cantidadSurcosTabla)
{
    const surcosFraccion = BuscarSurcosNaranjas();
  
    if(surcosFraccion.length === 0)
    return;

    const actualizaciones = {};
    const registrosEmp = {};
    const registrosOtrosEmp ={};
    for(let i = 1; i<= cantidadSurcosTabla; i++)
    {
       // const surcosOtrsEmp = surcosFraccion.filter(surco =>  surco.codEmpleado != datosActividad.codigoEmpleado && surco.surco == i );
       // const totalAvanceOtros = surcosOtrsEmp.reduce((acc, curr) => acc + curr.avanceAcum,0);
       // const surcosEmpSele = surcosFraccion.filter(surco =>  surco.codEmpleado == datosActividad.codigoEmpleado && surco.surco == i);
       
        

         const surcosOtrsEmp = surcosFraccion.filter(
            surco => surco.codEmpleado !== datosActividad.codigoEmpleado && surco.surco == i
        );
        const totalAvanceOtros = surcosOtrsEmp.reduce((acc, curr) => acc + curr.avanceAcum, 0);

        const surcosEmpSele = surcosFraccion.filter(
            surco => surco.codEmpleado == datosActividad.codigoEmpleado && surco.surco == i
        );
        
       
           
        const avanceAcum = surcosEmpSele.reduce((acc, curr) => acc + curr.avanceAcum, 0);
       
        // Solo guardamos surcos que realmente tienen fracción
        if (surcosOtrsEmp.length > 0 || surcosEmpSele.length > 0) {
                

            actualizaciones[i] = { totalAvanceOtros, avanceAcum,
                codEmpleado: surcosEmpSele.length > 0 ? datosActividad.codigoEmpleado : "",
             };
             registrosEmp[i] = surcosEmpSele[0];
        
             registrosOtrosEmp[i-1] = surcosOtrsEmp[i-1];
        }
    }

    //datosActividad.codigoEmpleado,
    
   setListaSurcos(prev => prev.map(item => {
        const datos = actualizaciones[item.surco];
        
        if (!datos) return item; // no es naranja, no se toca
            

        return {
            ...item,
            estado: Number(datos.totalAvanceOtros.toFixed(2)) ===1 ? "g":  "o",
             seleccionado: datos.codEmpleado === datosActividad.codigoEmpleado? true: false, 
            avanceAcum: datos.avanceAcum,
            avanceTotalOtros: Number(datos.totalAvanceOtros.toFixed(2)),
            codEmpleado:datos.codEmpleado
        };
    }));


        
    setListaSurcos(prev => prev.map(item => {
    
    const datos = actualizaciones[item.surco];
    const datosFecha =registrosEmp[item.surco]
   
  
    if (!datos ||!datosFecha) return item; 
  
        const fechaReg = datosFecha.fecha !== undefined?  new Date(registrosEmp[item.surco].fecha).getTime()< inicioDiaCuliacan().getTime() :false;
        const sumAva = Number(datosFecha.avanceAcum.toFixed(2) ) + Number( datos.totalAvanceOtros.toFixed(2))
        const avOtros = Number(datos.totalAvanceOtros.toFixed(2))
    
        return {
            ...item,
            estado:avOtros   ===1? "g":fechaReg && sumAva ===1 ? "b": "o",
             seleccionado: datos.codEmpleado === datosActividad.codigoEmpleado? true: false, 
            avanceAcum: datos.avanceAcum,
            avanceTotalOtros: Number(datos.totalAvanceOtros.toFixed(2)),
            codEmpleado:datos.codEmpleado,
            fecha:datosFecha.fecha
        };
    }));
        
    
    setListaSurcos(prev => prev.map(item => {
    
    const datos = actualizaciones[item.surco];
    const datosFecha =registrosOtrosEmp[item.surco-1]
   
    if (!datos ||!datosFecha) return item; 
  
       // const fechaReg = datosFecha.fecha !== undefined?  new Date(registrosOtrosEmp[item.surco-1].fecha).getTime()< inicioDiaCuliacan().getTime() :false;
        
        const avOtros = Number(datos.totalAvanceOtros.toFixed(2))
        
        return {
            ...item,
            estado:avOtros   ===1 && datos.avanceAcum == 0?  "r":  "b",
             seleccionado: datos.codEmpleado === datosActividad.codigoEmpleado? true: false, 
            avanceAcum: datos.avanceAcum,
            avanceTotalOtros: Number(datos.totalAvanceOtros.toFixed(2)),
            codEmpleado:datos.codEmpleado,
            fecha:datosFecha.fecha
        };
    }));
    
    




}


function BuscarFraccionesDeSurco(avance)
{
    const dias =datosActividad.dias_frecuencia_surcos;
    const surcoFraccion = realmInstance.objects("Surco").filtered(`
        surco ==$0 AND
        avanceAcum >$1 AND
        avanceAcum <$2 AND
        fecha >=$3 AND
        fecha <=$4 AND
        lote == $5 AND
        nave == $6 AND 
        tabla == $7 AND 
        actividad == $8 AND  
        avance == $9 
        `,
        String (datosSurcoFraccionSelec.surco),
        0,
        1,
        restarDias(finDiaAyer(),dias),
        finDiaCuliacan(),
        datosActividad.codigoLote,
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance
    )

     const totalAvanceOtros = surcoFraccion.reduce((acc, curr) => acc + curr.avanceAcum,0);

     if((avance + totalAvanceOtros).toFixed(2) > 1)
     {
        return {estado:false, totalOtros: Number(totalAvanceOtros), disponible:1-totalAvanceOtros}
     }
     else{

         return {estado:true, totalOtros: Number(totalAvanceOtros), disponible:(1-totalAvanceOtros-avance).toFixed(2)}
     }
}

const restarDias = (fecha, dias) => {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() - dias);
  return nueva;
};

return{
    listaSurcos,
    modalFraccionado,
    avanceSurco,
    handlePress,
    setAvanceSurco,
    guardarSurcosSeleccionados,
    handleLongPress,
    SetModalFraccionado,
    datosSurcoTrabajado,
    mostraInfo, 
    setMostrarInfo,
    datosSurcoFraccionSelec,
    setDatosSurcoFraccionSele,
    setListaSurcos,
    BuscarFraccionesDeSurco
};

}