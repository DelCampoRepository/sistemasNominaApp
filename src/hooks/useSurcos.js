import { useState, useEffect } from "react";
import { ahoraTimestamp, finDiaAyer, finDiaCuliacan, inicioDiaCuliacan, inicioDiaCuliacanFecha } from "../../utils/obtenerHoraCuliacan";
import { marcarPendienteSincronizacion } from "../../utils/sincronizacionEstado";
import { Alert } from "react-native";

const redondear2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const useSurcos =(realmInstance, datosActividad, modales, datosEmpleadoSeleccionado)=>{

    const [listaSurcos,setListaSurcos]= useState([]);
    const [semana,setSemana] = useState([]);
    const [modalFraccionado, SetModalFraccionado] = useState(false);
    const [avanceSurco, setAvanceSurco] = useState("");
    const [datosSurcoTrabajado,setDatosSurcoTrabajado]= useState({});
    const [mostraInfo, setMostrarInfo] = useState(false);
    const [datosSurcoFraccionSelec,setDatosSurcoFraccionSele]= useState({});
    const [aportesSurco, setAportesSurco] = useState([]);
    const [mostrarAportes, setMostrarAportes] = useState(false);
    const [aportesEditable, setAportesEditable] = useState(false);
    const [surcoAportesActual, setSurcoAportesActual] = useState(null);
    
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

function obtenerNombreEmpleado(codEmpleado){
    if(!codEmpleado) return "";

    const empleado = realmInstance
        .objects("EmpleadoCapturado")
        .filtered("CodigoEmpleado == $0", codEmpleado)[0];

    return empleado ? empleado.Nombre : "";
}

function handlePress(surcoPresionado) {

    if(surcoPresionado.estado ==="b" ||surcoPresionado.estado ==="g" || surcoPresionado.estado ==="r" || surcoPresionado.estado ==="o" )
    {
        mostrarAportesDeSurco(surcoPresionado.surco);
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

function diasTranscurridosDesde(fecha){
    return Math.round(
        (inicioDiaCuliacan() - inicioDiaCuliacanFecha(fecha)) / 86400000
    );
}

// Única función que decide si un surco fraccionado tiene un ciclo vigente y,
// si es así, cuánto lleva acumulado. La usan TANTO el render de la lista de
// surcos COMO la validación al guardar una fracción nueva, para que nunca se
// calculen totales distintos en un lado y en otro (eso fue lo que causó que
// se pudiera superar la unidad la vez pasada).
//
// Regla: el lapso de dias_frecuencia_surcos se cuenta desde la fecha del
// registro "primerFraccionado" (ancla fija) y NO se extiende con aportes
// posteriores. Si ya se superó, el ciclo expira y se ignoran todos sus
// registros, sin importar qué tan recientes sean.
function resolverCiclo(ancla, candidatos, dias){
    if (!ancla) return null;
    if (diasTranscurridosDesde(ancla.fecha) > dias) return null;

    const registros = candidatos.filter(
        o => new Date(o.fecha) >= new Date(ancla.fecha)
    );

    if (registros.length === 0) return null;

    const avanceCompleto = redondear2(
        registros.reduce((acc, o) => acc + o.avanceAcum, 0)
    );

    return { ancla, registros, avanceCompleto };
}

function buscarAnclaDeSurco(numeroSurco){
    const primeros = realmInstance.objects("Surco").filtered(
        `
        surco == $0 AND
        primerFraccionado == $1 AND
        lote == $2 AND
        nave == $3 AND
        tabla == $4 AND
        actividad == $5 AND
        avance == $6
        `,
        String(numeroSurco),
        true,
        datosActividad.codigoLote,
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance
    );

    if (primeros.length === 0) return null;

    return Array.from(primeros).sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
    )[0];
}

function buscarCandidatosFraccionDeSurco(numeroSurco){
    return Array.from(realmInstance.objects("Surco").filtered(
        `
        surco == $0 AND
        avanceAcum > $1 AND
        avanceAcum < $2 AND
        lote == $3 AND
        nave == $4 AND
        tabla == $5 AND
        actividad == $6 AND
        avance == $7
        `,
        String(numeroSurco),
        0,
        1,
        datosActividad.codigoLote,
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance
    ));
}

function resolverCicloDeSurco(numeroSurco){
    const dias = datosActividad.dias_frecuencia_surcos;
    const ancla = buscarAnclaDeSurco(numeroSurco);
    const candidatos = buscarCandidatosFraccionDeSurco(numeroSurco);
    return resolverCiclo(ancla, candidatos, dias);
}

function formatearAportes(registros){
    return [...registros]
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .map(item => ({
            idCompuesto: item.idCompuesto,
            codEmpleado: item.codEmpleado,
            nombreEmpleado: obtenerNombreEmpleado(item.codEmpleado),
            avanceAcum: item.avanceAcum,
            fecha: new Date(item.fecha).toLocaleDateString()
        }));
}

function mostrarAportesDeSurco(numeroSurco){
    setSurcoAportesActual(numeroSurco);

    // Caso fraccionado: varios aportes (<1) que pertenecen al mismo ciclo.
    const ciclo = resolverCicloDeSurco(numeroSurco);

    if (ciclo) {
        const inicioHoy = inicioDiaCuliacan();
        const finHoy = finDiaCuliacan();
        const masReciente = [...ciclo.registros].sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
        )[0];
        const fechaMasReciente = new Date(masReciente.fecha);
        const completadoHoy = fechaMasReciente >= inicioHoy && fechaMasReciente <= finHoy;

        // Mientras no llegue a la unidad siempre se puede corregir. Si ya
        // llegó, solo se puede corregir el mismo día que se completó (al
        // día siguiente ya queda bloqueado como cualquier surco trabajado).
        const editable = ciclo.avanceCompleto < 1 || completadoHoy;

        setAportesSurco(formatearAportes(ciclo.registros));
        setAportesEditable(editable);
        setMostrarAportes(true);
        return;
    }

    setAportesEditable(false);

    // Sin ciclo fraccionado vigente: puede ser un surco trabajado completo
    // en un solo registro (avanceAcum == 1). Se busca en la misma ventana
    // que usa el bloqueo de surcos completos (hoy + días anteriores dentro
    // del lapso de dias_frecuencia_surcos).
    const dias = datosActividad.dias_frecuencia_surcos;
    const completos = realmInstance.objects("Surco").filtered(
        `
        surco == $0 AND
        avanceAcum == $1 AND
        fecha >= $2 AND
        fecha <= $3 AND
        lote == $4 AND
        nave == $5 AND
        tabla == $6 AND
        actividad == $7 AND
        avance == $8
        `,
        String(numeroSurco),
        1,
        restarDias(finDiaAyer(), dias),
        finDiaCuliacan(),
        datosActividad.codigoLote,
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance
    );

    setAportesSurco(formatearAportes(Array.from(completos)));
    setMostrarAportes(true);
}

// Permite corregir un aporte fraccionado por error: borra ese registro de
// Realm. Si el registro borrado era el "primerFraccionado" (ancla del
// ciclo) y todavía quedan otros aportes, se promueve el más antiguo de los
// restantes como nueva ancla para que el ciclo no se pierda.
//
// Tras borrar, la cuadrícula visible debe reflejar de inmediato el nuevo
// total de ESE surco (ya sea que el ciclo siga vigente con menos avance,
// que ahora quede un registro completo, o que quede totalmente libre).
// Antes esto dependía del recálculo masivo (actualizarSurcosRenderFraccion),
// que solo toca un surco si encuentra una ancla "primerFraccionado" vigente
// en TODA la actividad; si el surco borrado era la única ancla restante,
// la función salía temprano sin actualizar nada, dejando el chip naranja
// con el valor viejo hasta cerrar y reabrir el modal. Esta función recalcula
// un único surco directamente contra Realm, sin depender de ese barrido.
function recalcularSurcoIndividual(numeroSurcoParam){
    // registro.surco (Realm) llega como string ("1"); surco.surco en
    // listaSurcos siempre es number. Se normaliza aquí una sola vez para
    // que el "surco.surco === numeroSurco" de abajo realmente coincida.
    const numeroSurco = Number(numeroSurcoParam);
    const dias = datosActividad.dias_frecuencia_surcos;
    const ciclo = resolverCicloDeSurco(numeroSurco);

    if (ciclo) {
        const { registros, avanceCompleto } = ciclo;
        const yaCompleto = avanceCompleto >= 1;

        const miAporte = redondear2(registros
            .filter(o => o.codEmpleado === datosActividad.codigoEmpleado)
            .reduce((acc, o) => acc + o.avanceAcum, 0));

        const aporteOtros = redondear2(registros
            .filter(o => o.codEmpleado !== datosActividad.codigoEmpleado)
            .reduce((acc, o) => acc + o.avanceAcum, 0));

        const masReciente = [...registros].sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
        )[0];

        const fechaMasReciente = new Date(masReciente.fecha);
        const esDeHoy = fechaMasReciente >= inicioDiaCuliacan() && fechaMasReciente <= finDiaCuliacan();

        let nuevoEstado;
        if (!yaCompleto) {
            nuevoEstado = "o";
        } else if (!esDeHoy) {
            const soyYo = registros.some(o => o.codEmpleado === datosActividad.codigoEmpleado);
            nuevoEstado = soyYo ? "b" : "r";
        } else {
            nuevoEstado = miAporte > 0 ? masReciente.estado : "g";
        }

        setListaSurcos(prev => prev.map(surco =>
            surco.surco === numeroSurco
                ? {
                    ...surco,
                    seleccionado: yaCompleto && esDeHoy ? masReciente.seleccionado : false,
                    estado: nuevoEstado,
                    primerFraccionado: false,
                    codEmpleado: masReciente.codEmpleado,
                    fecha: new Date(masReciente.fecha).toLocaleDateString(),
                    avanceAcum: miAporte,
                    avanceTotalOtros: aporteOtros,
                    avanceCompleto
                  }
                : surco
        ));
        return;
    }

    // Sin ciclo fraccionado vigente: puede quedar un registro completo (1)
    // trabajado por alguien, o el surco queda totalmente libre.
    const completos = realmInstance.objects("Surco").filtered(
        `
        surco == $0 AND
        avanceAcum == $1 AND
        fecha >= $2 AND
        fecha <= $3 AND
        lote == $4 AND
        nave == $5 AND
        tabla == $6 AND
        actividad == $7 AND
        avance == $8
        `,
        String(numeroSurco),
        1,
        restarDias(finDiaAyer(), dias),
        finDiaCuliacan(),
        datosActividad.codigoLote,
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance
    );

    if (completos.length > 0) {
        const registro = completos[0];
        setListaSurcos(prev => prev.map(surco =>
            surco.surco === numeroSurco
                ? {
                    ...surco,
                    seleccionado: registro.seleccionado,
                    estado: datosActividad.codigoEmpleado === registro.codEmpleado ? registro.estado : "g",
                    avanceAcum: registro.avanceAcum,
                    avanceTotalOtros: 0,
                    avanceCompleto: 1,
                    codEmpleado: registro.codEmpleado,
                    fecha: new Date(registro.fecha).toLocaleDateString(),
                    primerFraccionado: false
                  }
                : surco
        ));
        return;
    }

    setListaSurcos(prev => prev.map(surco =>
        surco.surco === numeroSurco
            ? {
                ...surco,
                avanceAcum: 0,
                avanceTotalOtros: 0,
                avanceCompleto: 0,
                estado: "w",
                codEmpleado: "",
                seleccionado: false,
                fecha: "",
                primerFraccionado: false
              }
            : surco
    ));
}

// EmpleadoCapturado.Avances / .surcos son una "foto" que solo se recalcula
// al presionar "Agregar avances" (guardarSurcosNuevos). Si se borra un
// aporte fuera de ese flujo (ej. desde el modal de aportes), hay que volver
// a calcular esa foto a partir de los registros reales que queden en Surco,
// o pantallas como "Reporte por empleados" siguen mostrando datos viejos.
function sincronizarEmpleadoCapturado(codEmpleado){
    const misSurcosHoy = realmInstance.objects("Surco").filtered(
        `
        codEmpleado == $0 AND
        lote == $1 AND
        nave == $2 AND
        tabla == $3 AND
        actividad == $4 AND
        avance == $5 AND
        fecha >= $6 AND
        fecha <= $7
        `,
        codEmpleado,
        datosActividad.codigoLote,
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance,
        inicioDiaCuliacan(),
        finDiaCuliacan()
    );

    const listaSurcosHoy = Array.from(misSurcosHoy);
    const avanceTotal = redondear2(
        listaSurcosHoy.reduce((acc, s) => acc + s.avanceAcum, 0)
    );
    const numerosSurco = listaSurcosHoy.map(s => Number(s.surco));

    const emp = realmInstance.objects("EmpleadoCapturado").filtered(
        `
        CodigoEmpleado == $0 AND
        CodigoLote == $1 AND
        CodigoNave == $2 AND
        CodTabla == $3 AND
        CodigoActividad == $4 AND
        CodigoAvance == $5 AND
        FechaCaptura >= $6 AND
        FechaCaptura <= $7
        `,
        codEmpleado,
        datosActividad.codigoLote,
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance,
        inicioDiaCuliacan(),
        finDiaCuliacan()
    );

    if (emp.length > 0) {
        emp[0].Avances = avanceTotal;
        emp[0].surcos = numerosSurco;
        // Si ya estaba sincronizado (estado 1) o rechazado (2), un cambio
        // posterior a los avances lo vuelve a dejar pendiente de enviar.
        if (emp[0].estado === 1 || emp[0].estado === 2) {
            emp[0].estado = 0;
        }
    }
}

function eliminarAporteDeSurco(aporte){
    if (!realmInstance || !aporte?.idCompuesto) return;

    let numeroSurcoAfectado = null;

    try {
        realmInstance.write(() => {
            const registro = realmInstance
                .objects("Surco")
                .filtered("idCompuesto == $0", aporte.idCompuesto)[0];

            if (!registro) return;

            const eraAncla = registro.primerFraccionado;
            const codEmpleadoAfectado = registro.codEmpleado;
            numeroSurcoAfectado = registro.surco;

            realmInstance.delete(registro);
            sincronizarEmpleadoCapturado(codEmpleadoAfectado);

            if (eraAncla) {
                const restantes = realmInstance.objects("Surco").filtered(
                    `
                    surco == $0 AND
                    avanceAcum > $1 AND
                    avanceAcum < $2 AND
                    lote == $3 AND
                    nave == $4 AND
                    tabla == $5 AND
                    actividad == $6 AND
                    avance == $7
                    `,
                    numeroSurcoAfectado,
                    0,
                    1,
                    datosActividad.codigoLote,
                    datosActividad.codigoNave,
                    datosActividad.codigoTabla,
                    datosActividad.CodigoActividad,
                    datosActividad.CodigoAvance
                );

                if (restantes.length > 0) {
                    const masAntiguo = Array.from(restantes).sort(
                        (a, b) => new Date(a.fecha) - new Date(b.fecha)
                    )[0];
                    masAntiguo.primerFraccionado = true;
                }
            }

            marcarPendienteSincronizacion(realmInstance);
        });

        // Refresca tanto la lista visible del modal de aportes como el
        // chip de ese surco en la cuadrícula, de inmediato.
        if (surcoAportesActual !== null) {
            mostrarAportesDeSurco(surcoAportesActual);
        }

        if (numeroSurcoAfectado !== null) {
            recalcularSurcoIndividual(numeroSurcoAfectado);
        }
    } catch (error) {
        console.log(error);
    }
}

function confirmarEliminarAporteDeSurco(aporte){
    Alert.alert(
        "Eliminar aporte",
        `¿Seguro que deseas eliminar el aporte de ${aporte.nombreEmpleado || aporte.codEmpleado} (${aporte.avanceAcum.toFixed(2)})? Esta acción no se puede deshacer.`,
        [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar",
                style: "destructive",
                onPress: () => eliminarAporteDeSurco(aporte)
            }
        ]
    );
}

function handleLongPress(surcoPresionado){


    if(surcoPresionado.estado ==="w" || surcoPresionado.estado ==="o" )
    {
        const avanceCompleto = redondear2(surcoPresionado.avanceCompleto ?? 0);

        if(avanceCompleto >= 1){
            Alert.alert(
                "Límite alcanzado",
                "Este surco ya tiene el avance completo (1), no se puede agregar más."
            );
            return;
        }

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
    .map(item => {
        // No confiamos en item.primerFraccionado (un flag de UI que se
        // decide al teclear el avance decimal y puede quedar desactualizado
        // si para cuando se guarda ya cambió el ciclo real, por ejemplo
        // porque eliminarRegistrosAnteriores() acaba de borrar el aporte
        // previo de este mismo empleado). Se recalcula aquí contra Realm,
        // en el momento exacto del guardado, para nunca dejar un registro
        // fraccionado sin ancla (huérfano) que luego no se reconozca al
        // reabrir el modal.
        const esFraccionado = item.avanceAcum > 0 && item.avanceAcum < 1;
        const primerFraccionado = esFraccionado
            ? !resolverCicloDeSurco(item.surco)
            : false;

        return {
            idCompuesto: `L${datosActividad.codigoLote}N${datosActividad.codigoNave}T${datosActividad.codigoTabla}S${String(item.surco)}E${datosActividad.codigoEmpleado}A${ datosActividad.CodigoActividad}AV${datosActividad.CodigoAvance}J${userData[0].codigo}F${ahoraTimestamp().toISOString().split("T")[0]}`,
            surco: String(item.surco),
            tabla: datosActividad.codigoTabla,
            nave: datosActividad.codigoNave,
            lote: datosActividad.codigoLote,
            actividad: datosActividad.CodigoActividad,
            avance: datosActividad.CodigoAvance,
            codEmpleado: datosActividad.codigoEmpleado,
            avanceAcum: redondear2(item.avanceAcum),
            estado: item.estado,
            fecha: ahoraTimestamp(),
            semanaActiva: String(semana),
            trabajadoTotal: redondear2(item.avanceAcum + item.avanceTotalOtros) === 1,
            seleccionado: item.seleccionado,
            primerFraccionado,
            jefeDeNave:userData[0].codigo
        };
    });

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

        if(emp && emp.length > 0)
        {
            emp[0].Avances =avanceAcum
            emp[0].surcos = listaNumeroSurco
            // Si ya estaba sincronizado (1) o rechazado (2), confirmar
            // nuevos avances lo vuelve a dejar pendiente de enviar.
            if (emp[0].estado === 1 || emp[0].estado === 2) {
                emp[0].estado = 0;
            }
        }

        marcarPendienteSincronizacion(realmInstance);

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
    const ciclo = resolverCicloDeSurco(datosSurcoFraccionSelec.surco);
    const totalAvanceOtros = ciclo ? ciclo.avanceCompleto : 0;

    const sumaConAvance = redondear2(avance + totalAvanceOtros);

    if(sumaConAvance > 1)
    {
        return {estado:false, totalOtros: totalAvanceOtros, disponible: redondear2(1 - totalAvanceOtros)}
    }

    return {estado:true, totalOtros: totalAvanceOtros, disponible: redondear2(1 - totalAvanceOtros - avance)}
}


function actualizarSurcosRenderFraccion() {
  try {
    const dias = datosActividad.dias_frecuencia_surcos;

    // Última ancla ("primerFraccionado") por surco, de toda esta actividad.
    const primeros = Array.from(realmInstance.objects("Surco").filtered(
      `
      primerFraccionado == $0 AND
      lote == $1 AND
      nave == $2 AND
      tabla == $3 AND
      actividad == $4 AND
      avance == $5
      `,
      true,
      datosActividad.codigoLote,
      datosActividad.codigoNave,
      datosActividad.codigoTabla,
      datosActividad.CodigoActividad,
      datosActividad.CodigoAvance
    ));

    if (primeros.length === 0) return;

    const anclaPorSurco = new Map();
    primeros.forEach(o => {
      const key = String(o.surco);
      const actual = anclaPorSurco.get(key);
      if (!actual || new Date(o.fecha) > new Date(actual.fecha)) {
        anclaPorSurco.set(key, o);
      }
    });

    // Todos los aportes fraccionados candidatos de esta actividad (cualquier
    // fecha); resolverCiclo decide, por surco, cuáles pertenecen al ciclo
    // vigente a partir de su ancla.
    const todosFraccion = Array.from(realmInstance.objects("Surco").filtered(
      `
      avanceAcum > $0 AND
      avanceAcum < $1 AND
      lote == $2 AND
      nave == $3 AND
      tabla == $4 AND
      actividad == $5 AND
      avance == $6
      `,
      0,
      1,
      datosActividad.codigoLote,
      datosActividad.codigoNave,
      datosActividad.codigoTabla,
      datosActividad.CodigoActividad,
      datosActividad.CodigoAvance
    ));

    const candidatosPorSurco = todosFraccion.reduce((map, o) => {
      const key = String(o.surco);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(o);
      return map;
    }, new Map());

    const inicioHoy = inicioDiaCuliacan();
    const finHoy = finDiaCuliacan();
    const esDeHoy = fecha => {
      const f = new Date(fecha);
      return f >= inicioHoy && f <= finHoy;
    };

    setListaSurcos(prev => prev.map(item => {
      const ancla = anclaPorSurco.get(String(item.surco));
      const candidatos = candidatosPorSurco.get(String(item.surco)) || [];

      const ciclo = resolverCiclo(ancla, candidatos, dias);
      if (!ciclo) return item; // sin ciclo vigente: libre ("w")

      const { registros, avanceCompleto } = ciclo;
      const yaCompleto = avanceCompleto >= 1;

      const miAporte = redondear2(registros
        .filter(o => o.codEmpleado === datosActividad.codigoEmpleado)
        .reduce((acc, o) => acc + o.avanceAcum, 0));

      const aporteOtros = redondear2(registros
        .filter(o => o.codEmpleado !== datosActividad.codigoEmpleado)
        .reduce((acc, o) => acc + o.avanceAcum, 0));

      const masReciente = [...registros].sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      )[0];

      // Mientras el surco NO llegue a la unidad y el ciclo siga vigente,
      // queda abierto ("o") para que cualquier empleado siga aportando.
      if (!yaCompleto) {
        return {
          ...item,
          seleccionado: false,
          estado: "o",
          primerFraccionado: false,
          codEmpleado: masReciente.codEmpleado,
          fecha: new Date(masReciente.fecha).toLocaleDateString(),
          avanceAcum: miAporte,
          avanceTotalOtros: aporteOtros,
          avanceCompleto
        };
      }

      // Ya llegó a la unidad: si el último aporte fue hoy se mantiene
      // interactivo (editable si yo participé, "g" si solo aportaron
      // otros); si fue en días anteriores queda bloqueado para todos
      // ("b"/"r") hasta que el ciclo expire.
      if (!esDeHoy(masReciente.fecha)) {
        const soyYo = registros.some(
          o => o.codEmpleado === datosActividad.codigoEmpleado
        );

        return {
          ...item,
          seleccionado: false,
          estado: soyYo ? "b" : "r",
          primerFraccionado: false,
          codEmpleado: masReciente.codEmpleado,
          fecha: new Date(masReciente.fecha).toLocaleDateString(),
          avanceAcum: miAporte,
          avanceTotalOtros: aporteOtros,
          avanceCompleto
        };
      }

      const miPrimerRegistro = registros.find(
        o => o.codEmpleado === datosActividad.codigoEmpleado
      );

      return {
        ...item,
        seleccionado: masReciente.seleccionado,
        estado: miAporte > 0 ? masReciente.estado : "g",
        primerFraccionado: false,
        codEmpleado: miPrimerRegistro ? miPrimerRegistro.codEmpleado : masReciente.codEmpleado,
        fecha: miPrimerRegistro
          ? new Date(miPrimerRegistro.fecha).toLocaleDateString()
          : new Date(masReciente.fecha).toLocaleDateString(),
        avanceAcum: miAporte,
        avanceTotalOtros: aporteOtros,
        avanceCompleto
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
    BuscarFraccionesDeSurco,
    aportesSurco,
    mostrarAportes,
    setMostrarAportes,
    aportesEditable,
    confirmarEliminarAporteDeSurco
};

}




