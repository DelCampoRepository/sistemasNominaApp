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
                buscarSurcosDiaActual();
                buscarSurcosDiasAnteriores();
                actualizarSurcosRenderFraccion();
            }
        }
        
        inicializar();
    }

   
},
[realmInstance, modales.modalSurcos, datosActividad.codigoEmpleado]
);


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
                    avanceCompleto:0,
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

    if(surcoPresionado.estado ==="b" ||surcoPresionado.estado ==="g" || surcoPresionado.estado ==="r" )
    {
       
        setDatosSurcoTrabajado(surcoPresionado);
        setMostrarInfo(true);
        return;
    }

    if(surcoPresionado.estado =="o" )
    {
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

    const userData = realmInstance.objects("UserData");

      const ListasurcoSchema = listaSurcos
    .filter(item => item.avanceAcum !== 0)
    .map(item => ({
        idCompuesto: `L${datosActividad.codigoLote}N${datosActividad.codigoNave}T${datosActividad.codigoTabla}S${String(item.surco)}E${datosActividad.codigoEmpleado}A${ datosActividad.CodigoActividad}AV${datosActividad.CodigoAvance}J${userData[0].codigo}F${ahoraTimestamp().toISOString().split("T")[0]}`,
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
        primerFraccionado: item.primerFraccionado,
        jefeDeNave:userData[0].codigo
    }));

    const avanceAcum = ListasurcoSchema.reduce(function(acumulador,surco){

        return acumulador + surco.avanceAcum
    },0)
   
  
    const listaNumeroSurco = ListasurcoSchema.map(item => Number(item.surco));


    const emp = realmInstance
    .objects("EmpleadoCapturado")
    .filtered(`
        CodigoEmpleado == $0 AND 
        CodigoLote == $1 AND 
        CodigoNave == $2 AND  
        CodTabla == $3 AND 
        CodigoActividad == $4 AND 
        CodigoAvance == $5 AND 
        FechaCaptura >= $6 AND 
        FechaCaptura <= $7`,
        datosActividad.codigoEmpleado,
        datosActividad.codigoLote,        
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance,
        inicioDiaCuliacan(),
        finDiaCuliacan()
    )
    

   
    realmInstance.write(()=>{
        
       ListasurcoSchema.forEach(surco => { 
            realmInstance.create("Surco", surco,'modified');
        });

        if(emp)
        {
            emp[0].Avances =avanceAcum
            emp[0].surcos = listaNumeroSurco
        }

    });
   }
   catch(error){
        console.log(error);
   }
}

function buscarSurcosDiaActual(){
     const surcosGuardadosHoy= realmInstance.objects("Surco").filtered(`
       
        avanceAcum ==$0 AND
        fecha >=$1 AND
        fecha <=$2 AND
        lote == $3 AND
        nave == $4 AND 
        tabla == $5 AND 
        actividad == $6 AND  
        avance == $7
        `,
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
            estado: datosActividad.codigoEmpleado === encontrado.codEmpleado ? encontrado.estado:"g",
            avanceAcum: encontrado.avanceAcum,
            avanceTotalOtros: 0,
            codEmpleado:encontrado.codEmpleado,
            fecha:   new Date(encontrado.fecha).toLocaleDateString()
        }: item;
    }));
}

function buscarSurcosDiasAnteriores(){
    const dias =datosActividad.dias_frecuencia_surcos;
    
    const surcosGuardadosDiasAnteriores= realmInstance.objects("Surco").filtered(`
       
        avanceAcum ==$0 AND
        fecha >=$1 AND
        fecha <=$2 AND
        lote == $3 AND
        nave == $4 AND 
        tabla == $5 AND 
        actividad == $6 AND  
        avance == $7 
        `,
      
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
            estado: datosActividad.codigoEmpleado === encontrado.codEmpleado? "b":"r",
            avanceAcum: encontrado.avanceAcum,
            avanceTotalOtros: 0,
            codEmpleado:encontrado.codEmpleado,
            fecha:  new Date(encontrado.fecha).toLocaleDateString()
        }: item;
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

function BuscarSurcosFraccionadosPrimerRegistro(){
    
    
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
        avance == $8 AND
        primerFraccionado == $9
        `,
        0,
        1,
        restarDias(finDiaAyer(),dias),
        finDiaCuliacan(),
        datosActividad.codigoLote,
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance,
        true        
    )

  // console.log('primerRegistro',JSON.stringify(surcosFraccion,null,2));
    return surcosFraccion;
}

function BuscarsurcosFraccRestantes()
{
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
        avance == $8 AND
        primerFraccionado == $9
        `,
        0,
        1,
        restarDias(finDiaAyer(),dias),
        finDiaCuliacan(),
        datosActividad.codigoLote,
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance,
        false        
    )
 
    //console.log('registroFaltantes',JSON.stringify(surcosFraccion,null,2));
    return surcosFraccion;
}


function actualizarSurcosRenderFraccion() {
  try {
    const surcosFrac     = BuscarSurcosFraccionadosPrimerRegistro(); // primerFraccionado: true
    const surcosFraccRes = BuscarsurcosFraccRestantes();              // primerFraccionado: false

    if (surcosFrac.length === 0) return;

    // 1️⃣ Map del primer registro por surco (datos base)
    const surcosFracMap = new Map(
      surcosFrac.map(o => [String(o.surco), o])
    );

    // 2️⃣ Map de restantes agrupados por surco
    const surcosFraccResMap = surcosFraccRes.reduce((map, o) => {
      const key = String(o.surco);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(o);
      return map;
    }, new Map());

    setListaSurcos(prev => prev.map(item => {
      const primero = surcosFracMap.get(String(item.surco));

      if (!primero) return item; // no coincide, sin cambios

      // 3️⃣ Todos los registros del surco
      const restantes = surcosFraccResMap.get(String(item.surco)) ?? [];
      const todos     = [primero, ...restantes];

      // 4️⃣ Registros y aporte del empleado seleccionado
      const misRegistros     = todos.filter(o => o.codEmpleado === datosActividad.codigoEmpleado);
      const miAporte         = misRegistros.reduce((acc, o) => acc + o.avanceAcum, 0);
      const miPrimerRegistro = misRegistros[0]; // para tomar fecha y codEmpleado

      // 5️⃣ Aporte de otros empleados
      const aporteOtros = todos
        .filter(o => o.codEmpleado !== datosActividad.codigoEmpleado)
        .reduce((acc, o) => acc + o.avanceAcum, 0);

      return {
        ...item,
        seleccionado:      primero.seleccionado,
        estado:            primero.estado,
        primerFraccionado: primero.primerFraccionado,
        // ✅ Si yo aporté → mis datos, si no → datos del primero
        codEmpleado:       miPrimerRegistro ? miPrimerRegistro.codEmpleado : primero.codEmpleado,
        fecha:             miPrimerRegistro
                            ? new Date(miPrimerRegistro.fecha).toLocaleDateString()
                            : new Date(primero.fecha).toLocaleDateString(),
        avanceAcum:        miAporte,        // lo que yo aporté (0 si no aporté)
        avanceTotalOtros:  aporteOtros,     // lo que otros aportaron
        avanceCompleto:    miAporte + aporteOtros,
      };
    }));

  } catch (error) {
    console.log(error);
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




