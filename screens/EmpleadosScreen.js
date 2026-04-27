import React, { useState, useEffect } from "react";
import Tabla from "../src/components/HeaderTabla/Tabla";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Alert,
  TextInput,
 
  Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
//import { obtenerEmpleadosPorTemporada } from '../services/Empleados';
import { getRealmInstance } from "../realm";

//import { da } from "date-fns/locale";

import { Dimensions } from "react-native";


const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_MARGIN = 32;
const ITEM_WIDTH = SCREEN_WIDTH / 2 - ITEM_MARGIN * 3;

const EmpleadosScreen = ({ route }) => {
  const navigation = useNavigation();
  const [empleadosCapturados, setEmpleados] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [AvanceAGuardar, SetAvanceAGuardar] = useState(0);
  const [avanceRecortado,setAvanceRecortado]= useState(0);
  const [modalAvanceRecortado,setModalAvanceRecortado] = useState(false);
  const data = route?.params?? {}; 
  const[surcoSelec,setSurcoSele] = useState(0);
  const actividadSeleccionada = data.actividadSeleccionada ?? {};
  const {
    CodigoActividad = "",
    CodigoAvance = "",
    CodigoCultivo = "",
    CodigoLote = "",
    CodigoTemporada =" ",
    CodigoUsuario = "",
    Descripcion = "",
    Rendimiento = 0,
    tieneSurcos = false
  } = actividadSeleccionada;

  const naveSeleccionada = data.naveSeleccionada ?? {};
  const {
  codigoActividad = "",
  nombreNave = "",
  numeroNave = "",
  DescripcionTabla = "",
  nave = "",
  rendimientoTope = 0,
  codUnidad = "",
  nomCortoUnidad = "",
  nomCompletoUnidad = "",
  actividadTieneSurcos = false,
  cantidadSurcos = 0,
  limiteMaximoCaptura = 0,
  codigoTabla = ""
} = naveSeleccionada;

  const [datosEncabezado, setDatosEncabezado] = useState({
    numeroNaveEncabezado: "S/Nave",
    nombreNaveEncabezado: "Sin Nombre de Nave",
    descripcionActividadEncabezado: "Sin Actividad",
    numeroActividadEncabezado: "0 - 0",
    seccionNaveEncabezado: "",
    tablaSeleccionada: DescripcionTabla,
    rendimiento: Rendimiento,
    tabla: DescripcionTabla === "NORTE" ? "1" : "2",
    codTabla: codigoTabla
  });

  const [addEmpleado, setAddEmpleado] = useState({
    CodigoEmpleado: "",
    Nombre: "",
    CodigoTemporada: CodigoTemporada || "",
    CodigoLote: CodigoLote,
    CodigoNave: nave,
    CodTabla: datosEncabezado.codTabla,
    CodigoActividad: CodigoActividad,
    CodigoAvance: CodigoAvance,
    FechaCaptura: "",
    horaInicioActividad: "",
    horaFinalActividad: "",
    limiteMaximoDeCaptura: "",
    tienePermiso: false,
    solicitoPermiso: false,
    Avances: 0.0,
    rendimientoApli: 0.0,
    codUnidad: "",
    CodigoJefe: "",
    surcos: [],
    tieneSurcos: false
  });

  const [mostrarModalAvances, setMostrarModalAvances] = useState(false);
  const [modalAvanceNomralVisible, setModalAvanceNormalVisible] = useState(
    false
  );
  const [realmInstance, setRealmInstance] = useState(null);
  const [datosModalEmpleado, setDatosModalEmpleado] = useState({
    codEmpleado: "",
    NombreEmpleado: ""
  });

  const [EmpleadoSeleccionado, setEmpleadoSeleccionado] = useState({});
  const [surcoModal, setSurcoModal] = useState([]);
  const [listoParaGuardar, setListoParaGuardar] = useState(false);
  const [SoliciPermiso, SetSolicitarPermiso] = useState(false);
  const [modalAvanceSumado, setModalAvanceSumado] = useState(false);
  const [limitesSurcos, setLimitesSurcos] = useState({

    surcoInicio: 0,
    surcoFinal: 0
  });

const [AvanceSumado, setAvanceSumado] = useState({
  surco: 0,
  AvanceDecimal: '' 
});
const [terminaLoad, setTerminaLoad] = useState(false);

useEffect(()=>{
  if(terminaLoad)
  {   
      versurcosTrabajados();
  }
},[terminaLoad])
  useEffect(() => {
    setDatosEncabezado({
      numeroNaveEncabezado: "",
      nombreNaveEncabezado: nombreNave,
      descripcionActividadEncabezado:
        CodigoActividad.trim() + "-" + CodigoAvance.trim(),
      numeroActividadEncabezado: Descripcion.trim(),
      seccionNaveEncabezado: "",
      tablaSeleccionada: DescripcionTabla,
      rendimiento: Rendimiento.toFixed(2),
      codLote: CodigoLote,
      tabla: DescripcionTabla === "NORTE" ? "1" : "2"
    });

    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
  }, [terminaLoad]);

  useEffect(
    () => {
      let empleadosRealm;

      if (!realmInstance) return;

      const setupRealmListener = async () => {
        try {

           if (!realmInstance) return;

        const empleadosRealm = realmInstance
            .objects("EmpleadoCapturado")
            .filtered(
              `CodigoTemporada == $0 AND 
              CodigoLote == $1 AND 
              CodigoNave == $2  AND 
              CodigoActividad == $3  AND 
              CodigoAvance == $4 AND 
              CodTabla == $5 AND 
              FechaCaptura >= $6`,
              addEmpleado.CodigoTemporada,
              addEmpleado.CodigoLote,
              addEmpleado.CodigoNave,
              addEmpleado.CodigoActividad,
              addEmpleado.CodigoAvance,
              String(  addEmpleado.CodTabla),
              new Date(GenerarFecha(false, true))
            );

          const listener = () => {
            setEmpleados(JSON.parse(JSON.stringify(empleadosRealm)));
          };
       
          empleadosRealm.addListener(listener);

        
          return () => {
            if (!empleadosRealm.isValid()) return;
            empleadosRealm.removeListener(listener);
          };
        } catch (error) {
          console.error("Error al configurar el listener de Realm:", error);
        }
      };

      const verlista = async () => {
        realmInstance.write(() => {
          const empleadosABorrar = realmInstance
            .objects("EmpleadoCapturado")
            .filtered("CodigoEmpleado == $0", "");

          realmInstance.delete(empleadosABorrar);
        });
      };

      if (realmInstance != null) {

            const tablas = realmInstance
        .objects("Tablas")
        .filtered(
          "CodigoLote == $0 AND CodigoNave == $1",
          CodigoLote,
          nave
        );

      
        const tablasSimpli = tablas.map(tabla => ({
            CodigoTabla : tabla.CodigoTabla,
            CantidadSurcos: tabla.CantidadSurcos

        }))
    
       let surcosAcumu = 0;
       let surcosTablaSelec = 0;
       for(let i = codigoTabla; i >= 1; i--)
       {

            if(codigoTabla === tablasSimpli[i-1].CodigoTabla)
            {
              surcosTablaSelec = tablasSimpli[i-1].CantidadSurcos;
            }
        
            if(i === tablasSimpli[i-1].CodigoTabla)
            {
                surcosAcumu +=  tablasSimpli[i-1].CantidadSurcos;
              //console.log('es igual', i,tablasSimpli[i-1].CodigoTabla)
            }
       }
   
       let surcoInicio = (surcosAcumu - surcosTablaSelec) + 1;
       
         setLimitesSurcos({
          surcoInicio :surcoInicio,
          surcoFinal : surcosAcumu
         })

        setupRealmListener();
        verlista();
      }
      return () => {
        if (empleadosRealm) {
         empleadosRealm.removeListener(listener);
        }
      };
    },
    [realmInstance, addEmpleado,codigoTabla, CodigoLote,nave]
  );

useEffect(
  ()=>{ 
},[limitesSurcos])


  //agrega las propiedades al empleado para guardarlas en el relam tras seleccionar un empleado buscado por codigo
  useEffect(
    () => {
      if (addEmpleado.CodigoEmpleado !== "") {
        //  console.log(addEmpleado.CodigoEmpleado, "aaaa");
        try {
          const userData = realmInstance.objects("UserData");

          const duplicado = realmInstance
            .objects("EmpleadoCapturado")
            .filtered(
              `CodigoTemporada == $0 AND 
              CodigoLote == $1 AND 
              CodigoNave == $2 AND 
              CodigoEmpleado == $3  AND 
              CodigoActividad == $4  AND 
              CodigoAvance == $5 AND
              CodTabla == $6 AND
                FechaCaptura == $7`,
              addEmpleado.CodigoTemporada,
              addEmpleado.CodigoLote,
              addEmpleado.CodigoNave,
              addEmpleado.CodigoEmpleado,
              addEmpleado.CodigoActividad,
              addEmpleado.CodigoAvance,
              String( addEmpleado.CodTabla),
              new Date(GenerarFecha(false, true))
            );

       
          if (duplicado.length > 0) {
            Alert.alert(
              "Del Campo y Asociados",
              "Este empleado ya está agregado"
            );
            setDatosModalEmpleado({
              codEmpleado: "",
              NombreEmpleado: ""
            });
            setAddEmpleado(prev => ({
              ...prev,
              Nombre: "",
              CodigoEmpleado: ""
            }));
            return;
          }

          //LLENAMOS LOS DATOS DEL EMPLEADO  A GUARDAR
          const datosEmp = {
            CodigoTemporada: addEmpleado.CodigoTemporada,
            CodigoLote: addEmpleado.CodigoLote,
            CodigoNave: addEmpleado.CodigoNave,
            CodigoEmpleado: addEmpleado.CodigoEmpleado,
            CodigoActividad: addEmpleado.CodigoActividad,
            CodigoAvance: addEmpleado.CodigoAvance,
            FechaCaptura: GenerarFecha(),
            Nombre: addEmpleado.Nombre,
            horaInicioActividad: null,
            horaFinalActividad: obtenerFechaFormateada(),
            limiteMaximoDeCaptura: null,
            tienePermiso: false,
            solicitoPermiso: false,
            Avances: 0.0,
            rendimientoApli: Rendimiento,
            codUnidad: nomCortoUnidad,
            surcos: [],
            CodigoJefe: userData[0].codigo,
            CodTabla:String(codigoTabla),
            tieneSurcos: false
          };
        //  console.log('datos a guardar', datosEmp )
          //GUARDAMOS EL EMPLEADO EN EL REAL
          realmInstance.write(() => {
            realmInstance.create("EmpleadoCapturado", datosEmp);
          });

          setDatosModalEmpleado({
            codEmpleado: "",
            NombreEmpleado: ""
          });

          setAddEmpleado(prev => ({
            ...prev,
            CodigoEmpleado: ""
          }));

     
        } catch (error) {
          console.error(error);
        }
      }
    },
    [addEmpleado.CodigoEmpleado]
  );

  useEffect(
    () => {
      if (mostrarModalAvances) {
        cargarSurcos_Avances();
        setTerminaLoad(true);
      } 
    },
    [mostrarModalAvances]
  );

  useEffect(
    ()=>{
      if(surcoModal.length > 0)
      {
      
      }
  },[surcoModal])
  useEffect(
    () => {
      if (listoParaGuardar) {
        


    
    //para ello debo recorrero el objeto surcos modal , ver cuales son los que  tiene su clave seleccionado en true  y
    //tomar la clave surco y su valor asignarselo al empleado seleccionado y guardarlo en la base de datos realm
    setMostrarModalAvances(false);
    
    realmInstance.write(() => {
      const sync = realmInstance.objectForPrimaryKey("Sincronizar", 0);
      if (sync) {
        sync.sincronizado = true;
      }
    });

      setTerminaLoad(false);
        guardarSurcosEnRealm();
       
      }
    },
    [listoParaGuardar]
  );

  useEffect(()=>{

    if(Object.keys(EmpleadoSeleccionado).length !== 0)
    {
     
    }
      else{
      
      }
  },[EmpleadoSeleccionado])
  const obtenerFechaFormateada = () => {
    const ahora = new Date();

    // 1️⃣ Crear fecha local plana (sin conversión de zona)
    const fechaLocalPlana = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      23,
      59,
      59,
      999
    );

    // 2️⃣ Convertir a UTC manteniendo la hora plana
    const fechaFinDiaLocalSinUTC = new Date(
      Date.UTC(
        fechaLocalPlana.getFullYear(),
        fechaLocalPlana.getMonth(),
        fechaLocalPlana.getDate(),
        fechaLocalPlana.getHours(),
        fechaLocalPlana.getMinutes(),
        fechaLocalPlana.getSeconds(),
        fechaLocalPlana.getMilliseconds()
      )
    );

    return fechaFinDiaLocalSinUTC;
  };

  //console.log(JSON.stringify(EmpleadoSeleccionado,2,null))
  const obtenerFechaCeros = () => {
    const ahora = new Date();

    // 1️⃣ Crear fecha local plana (sin conversión de zona)
    const fechaLocalPlana = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      0,
      0,
      0,
      0
    );

    // 2️⃣ Convertir a UTC manteniendo la hora plana
    const fechaFinDiaLocalSinUTC = new Date(
      Date.UTC(
        fechaLocalPlana.getFullYear(),
        fechaLocalPlana.getMonth(),
        fechaLocalPlana.getDate(),
        fechaLocalPlana.getHours(),
        fechaLocalPlana.getMinutes(),
        fechaLocalPlana.getSeconds(),
        fechaLocalPlana.getMilliseconds()
      )
    );

    return fechaFinDiaLocalSinUTC;
  };
  const obtnerFechaActual = () => {
    const ahora = new Date();

    // tomar componentes locales
    const fechaLocalSinUTC = new Date(
      Date.UTC(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
        ahora.getHours(),
        ahora.getMinutes(),
        ahora.getSeconds(),
        ahora.getMilliseconds()
      )
    );

    return fechaLocalSinUTC;
  };
  //guardamos en el Realm empleadoSeleccionado el empleado buscado en el modal tras presionar el boton agregar
  const guardarEmpleado = async () => {
    if (
      datosModalEmpleado.NombreEmpleado === "" ||
      datosModalEmpleado.codEmpleado === ""
    ) {
      Alert.alert(
        "Del Campo y Asociados",
        "Por favor, ingresa un código de empleado válido antes de agregar."
      );
      return;
    }

    setAddEmpleado(prev => ({
      ...prev,
      Nombre: datosModalEmpleado.NombreEmpleado.toUpperCase(),
      CodigoEmpleado: datosModalEmpleado.codEmpleado
    }));

    Alert.alert("Del Campo y Asociados", "Empleado agregado correctamente");
    setModalVisible(false);
  };

  //genera gecha actual
  const GenerarFecha = (horaExtra = false, SoloFecha = true) => {
    //   console.log(limiteMaximoCaptura, "limiteMaximoCaptura");
    const ahora = new Date();

    //if (horaExtra) ahora.setHours(ahora.() + limiteMaximoCaptura);

    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    let horas = String(ahora.getHours()).padStart(2, "0");

    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const segundos = String(ahora.getSeconds()).padStart(2, "0");
    let fechaFormateada = ``;

    if (SoloFecha) {
      fechaFormateada = `${año}-${mes}-${dia}`;
    } else {
      fechaFormateada = `${año}-${mes}-${dia} ${horas}:${horaExtra ? Number(minutos) + Number(2): minutos}:${segundos}`;
    }
    return fechaFormateada;
  };
    // console.log( "asasa",)

  //se ejecuta cuando presionamos el boton de buscar tras ingresar el codigo de empleado en el modal
  const buscarEmpleadoPorCodigo = async () => {
    if (datosModalEmpleado.codEmpleado === "") {
      Alert.alert(
        "Del Campo y Asociados",
        "Por favor, ingresa un código de empleado para buscar."
      );

      return;
    }

    try {
      const empleado = realmInstance.objectForPrimaryKey(
        "Empleado",
        String(datosModalEmpleado.codEmpleado)
      );

      if (empleado) {
        setDatosModalEmpleado(prev => ({
          ...prev,
          NombreEmpleado: empleado.Nombre
        }));
      } else {
        Alert.alert(
          "Del Campo y Asociados",
          `No se encontró el codigo de empleado "${datosModalEmpleado.codEmpleado}"`
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Del Campo y Asociados", err);
    }
  };

  //inicia la posibilidad de capturar
  const handleIniciar = item => {
    try {
      realmInstance.write(() => {
        const duplicados = realmInstance
          .objects("EmpleadoCapturado")
          .filtered(
            "CodigoTemporada == $0 AND CodigoLote == $1 AND CodigoNave == $2 AND CodigoEmpleado == $3 AND CodigoActividad == $4 AND CodigoAvance == $5 AND CodTabla == $6 AND FechaCaptura == $7",
            item.CodigoTemporada,
            item.CodigoLote,
            item.CodigoNave,
            item.CodigoEmpleado,
            item.CodigoActividad,
            item.CodigoAvance,
            item.CodTabla,
            new Date(GenerarFecha(false, true))
          );

        const registro = duplicados[0];

        const ahora = new Date();

        // tomar componentes locales
        const fechaLocalSinUTC = new Date(
          Date.UTC(
            ahora.getFullYear(),
            ahora.getMonth(),
            ahora.getDate(),
            ahora.getHours(),
            ahora.getMinutes(),
            ahora.getSeconds(),
            ahora.getMilliseconds()
          )
        );
        if (registro) {
          registro.horaInicioActividad = fechaLocalSinUTC;
        } else {
          console.log("No se encontró registro para iniciar");
        }
      });
    } catch (e) {
      console.log("Error en handleIniciar:", e);
    }
  };

  //finaliza la posibilidad de capturar
  const handleFinalizar = item => {
    try {
      realmInstance.write(() => {
        const duplicados = realmInstance
          .objects("EmpleadoCapturado")
          .filtered(
            "CodigoTemporada == $0 AND CodigoLote == $1 AND CodigoNave == $2 AND CodigoEmpleado == $3 AND CodigoActividad == $4 AND CodigoAvance == $5 AND CodTabla == $6 AND FechaCaptura == $7",
            item.CodigoTemporada,
            item.CodigoLote,
            item.CodigoNave,
            item.CodigoEmpleado,
            item.CodigoActividad,
            item.CodigoAvance,
            item.CodTabla,
            new Date(GenerarFecha(false, true))
          );

        const registro = duplicados[0]; // <--- IMPORTANTE

        const ahora = new Date();

        // tomar componentes locales
        const fechaLocalSinUTC = new Date(
          Date.UTC(
            ahora.getFullYear(),
            ahora.getMonth(),
            ahora.getDate(),
            ahora.getHours(),
            ahora.getMinutes(),
            ahora.getSeconds(),
            ahora.getMilliseconds()
          )
        );
        const fechaLocalSinUTCMas = new Date(
          Date.UTC(
            ahora.getFullYear(),
            ahora.getMonth(),
            ahora.getDate(),
            ahora.getHours() + 2,
            ahora.getMinutes(),
            ahora.getSeconds(),
            ahora.getMilliseconds()
          )
        );

        if (registro) {
          registro.horaFinalActividad = fechaLocalSinUTC;
          registro.limiteMaximoDeCaptura = fechaLocalSinUTCMas;
        } else {
          console.log("No se encontró registro para iniciar");
        }

        const ahoraMas2Min = new Date();
        ahoraMas2Min.setMinutes(ahoraMas2Min.getMinutes() + 2);
        //    console.log(ahoraMas2Min, "ssss");
      });
    } catch (e) {
      console.log("Error en handleIniciar:", e);
    }
  };
  // console.log(JSON.stringify(EmpleadoSeleccionado, null, 2));
  //se ejecuta cuanto tocamos el  cuadro del surco y pone a true el key seleccionad del objeto surco de la lista
  const agregarSurcos_Avances = item => {
      
     
    if(!VerificarTopeJornalEmpleado() && !item.seleccionado)
          {
            
         Alert.alert(
            "Errror",
            "El avance excede el rendimiento tope permitido."
          );
       
        return;
          }
             if(!VerificarTopeAlSeleccionarEmpleado() && !item.seleccionado)
          {
            Alert.alert('Tope alcanzado de la actividad, ya no se puede agregar mas!')
         //   setMostrarModalAvances(false);
            return;
          }

//    console.log(item)
    if (EmpleadoSeleccionado.limiteMaximoDeCaptura === null) {
       
      try{
    
        const semana = realmInstance.objects("Semana");
        
      const surcos = realmInstance.objects("Surco").filtered(
        `
          surco == $0 AND
          tabla == $1 AND
          nave == $2 AND
          lote == $3 AND
          actividad == $4 AND
          avance == $5 AND
          semanaActiva == $6 AND
          avanceAcum > 0
        `,
        String(item.surco),
        EmpleadoSeleccionado.CodTabla,
        EmpleadoSeleccionado.CodigoNave,
        EmpleadoSeleccionado.CodigoLote,
        EmpleadoSeleccionado.CodigoActividad,
        EmpleadoSeleccionado.CodigoAvance,
        String(semana[0].CodigoSemana)
      );

     
      var avanceAcusmulado = 0;
    
      surcos.forEach(s => {
       // console.log(s)

        avanceAcusmulado += s.avanceAcum;
      });

      
      if (avanceAcusmulado !== 0 && new Date(surcos[0].fecha).getTime() !==  obtenerFechaCeros().getTime()) {
        Alert.alert("", "Surco ya trabajado en esta semana");
        return;
      }
      }catch(error){
        console.log(error)
      }
            if (nomCortoUnidad === "SCO") {
        setSurcoModal(prev =>
          prev.map(
            emp =>
              emp.surco === item.surco
                ? { ...emp, seleccionado: !emp.seleccionado } // <--- actualización
                : emp
          )
        );
      }

            setSurcoModal(prev =>
          prev.map(emp => {
    if (emp.surco === item.surco) {
      return {
        ...emp,
      
        avanceAcum: emp.avanceAcum === 0 ? 1 : 0
      };
    }
    return emp;
  }))
        

      
    } else {
        
        try{
    
        const semana = realmInstance.objects("Semana");
   
      const surcos = realmInstance.objects("Surco").filtered(
        `
    surco == $0 AND
    tabla == $1 AND
    nave == $2 AND
    lote == $3 AND
    actividad == $4 AND
    avance == $5 AND
    semanaActiva == $6 AND
    avanceAcum > 0
    `,
        String(item.surco),
        EmpleadoSeleccionado.CodTabla,
        EmpleadoSeleccionado.CodigoNave,
        EmpleadoSeleccionado.CodigoLote,
        EmpleadoSeleccionado.CodigoActividad,
        EmpleadoSeleccionado.CodigoAvance,
        String(semana[0].CodigoSemana)
      );
 
   
      var avanceAcusmulado = 0;
    
      surcos.forEach(s => {
       // console.log(s)

        avanceAcusmulado += s.avanceAcum;
      });
   
      if (avanceAcusmulado !== 0 && item.estado !== 'propio') {
        Alert.alert("", "Surco ya trabajado en esta semana");
        return;
      }
      }catch(error){
        console.log(error)
      }
      
      if (obtnerFechaActual() >= EmpleadoSeleccionado.limiteMaximoDeCaptura) {
        Alert.alert(
          "Del Campo y Asociados",
          "El tiempo para asignarle surco/avance a este empleado ha expirado."
        );
        return;
      } else {
        if (nomCortoUnidad === "SCO") {
          setSurcoModal(prev =>
            prev.map(
              emp =>
                emp.surco === item.surco
                  ? { ...emp, seleccionado: !emp.seleccionado } // <--- actualización
                  : emp
            )
          );
        }

          setSurcoModal(prev =>
          prev.map(emp => {
    if (emp.surco === item.surco) {
      return {
        ...emp,
      
        avanceAcum: emp.avanceAcum === 1 ? 0 : 1
      };
    }
    return emp;
  }))
      }
     
    }
  };

  const generarFechaFinDia = () => {
    const ahora = new Date();

    ahora.setHours(23, 59, 59, 0);

    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    const horas = String(ahora.getHours()).padStart(2, "0");
    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const segundos = String(ahora.getSeconds()).padStart(2, "0");

    return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
  };
  //mostramos el modal con los surcos disponibles y ocupados tras presionar la tarjeta de empleado
  const cargarSurcos_Avances = () => {
    const surcosLista = [];

    const surcosEnRealm = realmInstance
      .objects("Surco")
      .filtered(
        "lote == $0 AND nave == $1  AND actividad == $2 AND avance == $3 AND tabla == $4 AND fecha == $5",
        String(CodigoLote),
        String(nave),
        String(CodigoActividad),
        String(CodigoAvance),
        String(codigoTabla ),
        new Date(GenerarFecha(false, true))
      );

    //  console.log('aaaaaa',surcosOcupados)
    const surcosOcupados = surcosEnRealm.map(s => ({
      surco: s.surco,
      codEmpleado: s.codEmpleado,
      avanceAcum: s.avanceAcum
    }));
    
    //console.log(surcosOcupados,'qqqqqqqqqqqq')
    surcosOcupados.forEach(element => ({
      surco: element.surco,
      codEmpleado: element.codEmpleado,
      avanceAcum: element.avanceAcum
    }));

    
    // 1. Construir la lista base de surcos
  //for (let i = limitesSurcos.surcoInicio; i <= limitesSurcos.surcoFinal; i++)
    for (let i = 1; i <= cantidadSurcos; i++) {
      surcosLista.push({
        surco: i,
        tabla: codigoTabla,
        nave: nave,
        lote: CodigoLote,
        actividad: CodigoActividad,
        avance: CodigoAvance,
        codEmpleado: "",
        fecha: new Date(GenerarFecha()),
        seleccionado: false,
        bloqueado: false,
        avanceAcum: surcosOcupados[i]?.avanceAcum ?? 0
      });
    }

    // 2. Si el empleado tiene surcos, marcarlos como seleccionados
    if (EmpleadoSeleccionado.surcos.length > 0) {
      const surcosFinal = surcosLista.map(s => ({
        ...s,
        seleccionado: EmpleadoSeleccionado.surcos.includes(s.surco)
      }));

      const empleadoActual = EmpleadoSeleccionado.CodigoEmpleado;
      const surcosRealmArray = [...surcosOcupados];
      const surcosFusionados = surcosFinal.map(surcoGeneral => {
        // Buscar si este surco existe en Realm
        const surcoEnRealm = surcosRealmArray.find(
          sr => Number(sr.surco) === Number(surcoGeneral.surco)
        );

        // NO existe → libre
        if (!surcoEnRealm) {
          return {
            ...surcoGeneral,
            estado: "libre", // blanco
            bloqueado: false,
            seleccionado: false
          };
        }

        // Existe y es del MISMO empleado → verde
        if (surcoEnRealm.codEmpleado === empleadoActual) {
          return {
            ...surcoGeneral,
            estado: "propio", // verde
            bloqueado: false,
            seleccionado: true
          };
        }

        // Existe pero es de OTRO empleado → rojo
        return {
          ...surcoGeneral,
          estado: "ocupado", // rojo
          bloqueado: true,
          seleccionado: false
        };
      });
//console.log(surcosFusionados)
      setSurcoModal(surcosFusionados);
    } else {
      const empleadoActual = EmpleadoSeleccionado.CodigoEmpleado;
      const surcosRealmArray = [...surcosOcupados];

      const surcosFusionados = surcosLista.map(surcoGeneral => {
        // Buscar si este surco existe en Realm

        const surcoEnRealm = surcosRealmArray.find(
          sr => Number(sr.surco) === Number(surcoGeneral.surco)
        );

        // NO existe → libre
        if (!surcoEnRealm) {
          return {
            ...surcoGeneral,
            estado: "libre", // blanco
            bloqueado: false,
            seleccionado: false
          };
        }

        // Existe y es del MISMO empleado → verde
        if (surcoEnRealm.codEmpleado === empleadoActual) {
          return {
            ...surcoGeneral,
            estado: "propio", // verde
            bloqueado: false,
            seleccionado: true
          };
        }

        // Existe pero es de OTRO empleado → rojo
        return {
          ...surcoGeneral,
          estado: "ocupado", // rojo
          bloqueado: true,
          seleccionado: false
        };
      });
      // console.log("fusion", surcosFusionados);

      setSurcoModal(surcosFusionados);
    }
  };

  const versurcosTrabajados =() =>{
   
 const semana = realmInstance.objects("Semana")[0];


  const surcosRealm = realmInstance
    .objects("Surco")
    .filtered(
      `
      tabla == $0 AND
      nave == $1 AND
      lote == $2 AND
      actividad == $3 AND
      avance == $4 AND
      semanaActiva == $5 AND
      avanceAcum > 0
      `,
      EmpleadoSeleccionado.CodTabla,
      EmpleadoSeleccionado.CodigoNave,
      EmpleadoSeleccionado.CodigoLote,
      EmpleadoSeleccionado.CodigoActividad,
      EmpleadoSeleccionado.CodigoAvance,
      String(semana.CodigoSemana)
    )
    .map(s => ({
      surco: String(s.surco),
      avanceAcum: s.avanceAcum,
      fecha: s.fecha
    }));
   
  
const surcoMap = new Map(
    surcosRealm.map(s => [s.surco, s.avanceAcum, s.fecha])
  );

 //console.log(surcosRealm)
  const surcosActualizados = surcoModal.map(surco => ({
    ...surco,
    avanceAcum: surcoMap.get(String(surco.surco)) ?? 0,
    fecha : surcoMap.get(String(surco.fecha)) ?? obtenerFechaCeros()
  }));

// console.log(surcosActualizados)
  setSurcoModal(surcosActualizados)
  }

  const SolicitarPermiso = () => {
    SetSolicitarPermiso(true);
    try {
      realmInstance.write(() => {
        const empleados = realmInstance
          .objects("EmpleadoCapturado")
          .filtered(
            "CodigoTemporada == $0 AND CodigoLote == $1 AND CodigoNave == $2 AND CodigoEmpleado == $3 AND CodigoActividad == $4 AND CodigoAvance == $5 AND CodTabla == $6 AND FechaCaptura == $7",
            EmpleadoSeleccionado.CodigoTemporada,
            EmpleadoSeleccionado.CodigoLote,
            EmpleadoSeleccionado.CodigoNave,
            EmpleadoSeleccionado.CodigoEmpleado,
            EmpleadoSeleccionado.CodigoActividad,
            EmpleadoSeleccionado.CodigoAvance,
            EmpleadoSeleccionado.CodTabla,
            new Date(GenerarFecha(false, true))
          );

        if (empleados.length === 0) {
          //le.log("Empleado no encontrado");
          return;
        }

        //  Normalmente solo debería existir uno
        const emp = empleados[0];

        // 🔄 actualizar propiedad
        emp.solicitoPermiso = true;
        emp.tienePermiso = false;
        SetAvanceAGuardar(0);
        Alert.alert("Aviso", "Permiso solicitado correctamente");
      });
    } catch (error) {
      console.log("Error al solicitar permiso:", error);
    }
  };

  const GuardarAvanceNormal = () => {
    try {
      const avanceNumero = Number(AvanceAGuardar);
      if (isNaN(avanceNumero)) {
        Alert.alert("Error", "Avance inválido");
        return;
      }

      if (avanceNumero === 0) {
        Alert.alert("Error", "Avance inválido");
        return;
      }

      if (avanceNumero / Rendimiento > Number(rendimientoTope)) {
        Alert.alert(
          "Errror",
          "El avance excede el rendimiento tope permitido."
        );
        return;
      }
      realmInstance.write(() => {
        const empleados = realmInstance
          .objects("EmpleadoCapturado")
          .filtered(
            "CodigoTemporada == $0 AND CodigoLote == $1 AND CodigoNave == $2 AND CodigoEmpleado == $3 AND CodigoActividad == $4 AND CodigoAvance == $5 AND CodTabla == $6 AND FechaCaptura == $7",
            EmpleadoSeleccionado.CodigoTemporada,
            EmpleadoSeleccionado.CodigoLote,
            EmpleadoSeleccionado.CodigoNave,
            EmpleadoSeleccionado.CodigoEmpleado,
            EmpleadoSeleccionado.CodigoActividad,
            EmpleadoSeleccionado.CodigoAvance,
            EmpleadoSeleccionado.CodTabla,
            new Date(GenerarFecha(false, true))
          );

        if (empleados.length === 0) {
          console.warn("Empleado no encontrado");
          return;
        }

        //Normalmente solo debería existir uno
        const emp = empleados[0];

        //console.log("Avance a guardar:", avanceNumero);
        //  actualizar propiedad
        emp.Avances = avanceNumero;
        SetAvanceAGuardar(0);
        //  console.log("Actividades actualizadas correctamente");
      });
      setModalAvanceNormalVisible(false);
    } catch (error) {
      console.log("Error al guardar avance normal:", error);
    }
  };

  
  //tras seleccionas en el modal de surcos los surcos que el empleado seleccionado  trabajo, se guardan tras presionar el boton surco
  const GuardarSurcosAEmpleado = () => {
   
        if(!VerificarTopeJornalEmpleado())
        {
          Alert.alert('No se pueden agregar mas actividades, se alcanzo el tope!')
          return;
        }
     console.log('Continua')
    const surcosParaEmpleado = surcoModal
      .filter(surco => surco.seleccionado === true)
      .map(surco => surco.surco);

    setEmpleadoSeleccionado(prev => ({
      ...prev,
      surcos: surcosParaEmpleado
    }));

  
    setListoParaGuardar(true);
      
    //Alert.alert("Del  Campo y Asociados", "Surcos agregados correctamente.");
  };


  const VerificarTopeAlSeleccionarEmpleado = () =>{

       const resultado = realmInstance.objects("EmpleadoCapturado")
  .filtered( 
    `

    CodigoLote == $0 AND 
    CodigoEmpleado == $1  AND
    CodigoActividad == $2  AND 
    CodigoAvance == $3 aND 
    FechaCaptura == $4`,
      EmpleadoSeleccionado.CodigoLote,
      EmpleadoSeleccionado.CodigoEmpleado,
      EmpleadoSeleccionado.CodigoActividad,
      EmpleadoSeleccionado.CodigoAvance,
      new Date(  EmpleadoSeleccionado.FechaCaptura)
      
    )

    const AvancesGuardados = resultado.map(registro => ({

          avance: registro.Avances,
          rendi: registro.rendimientoApli

    }))
    console.log(AvancesGuardados);
    let AvanceAcum = 0;
    AvancesGuardados.forEach(registro => {
        AvanceAcum += registro.avance;

    });

    const jornal = (1/AvancesGuardados[0].rendi)
    const jornalAcum = (AvanceAcum/AvancesGuardados[0].rendi)
    
    console.log('jornalAcum',jornalAcum)
    console.log('jornal',jornal)

    if((jornal + jornalAcum) > rendimientoTope)
    {
      return false;
    }
    return true;
  }
 // console.log(JSON.stringify(EmpleadoSeleccionado, null,2))
const VerificarTopeJornalEmpleado =() =>{

  const resultado = realmInstance.objects("EmpleadoCapturado")
  .filtered( 
    `

    CodigoLote == $0 AND 
    CodigoEmpleado == $1  AND
    CodigoActividad == $2  AND 
    CodigoAvance == $3 aND 
    FechaCaptura == $4`,
      EmpleadoSeleccionado.CodigoLote,
      EmpleadoSeleccionado.CodigoEmpleado,
      EmpleadoSeleccionado.CodigoActividad,
      EmpleadoSeleccionado.CodigoAvance,
      new Date(  EmpleadoSeleccionado.FechaCaptura)
      
    )

      const AvancesEmp = resultado.map(registro =>({

          avances: registro.Avances,
          rendimiento: registro.rendimientoApli

      }))
    //calculamos total de avances por actividad diaria guardada en Realm
      let totalAv= 0;
      AvancesEmp.forEach(avance => {
      
         const valor = Number(avance.avances) || 0;
          totalAv += valor
      });

      //sumamos todos los surcos seleccionados para usarlo como avances
        const surcoSele=  surcoModal.map(registro =>({
            surco: registro.surco,
            selec : registro.seleccionado
          }))

          let totalAcumulado  =0;

          surcoSele.forEach(element => {
                if(element.selec)
                  totalAcumulado +=1;
          });


          
          
        console.log(AvancesEmp )
         console.log('rendimiento tope:',rendimientoTope )
          console.log('rendiminetoApli:',AvancesEmp[0].rendimiento )
           console.log('TotalAvanceEmp:',totalAv )
            console.log('totalMas1',totalAcumulado +1 )
            console.log('acumuladojorn:',(totalAcumulado) / AvancesEmp[0].rendimiento )
            console.log("surcosEmp:",EmpleadoSeleccionado.surcos.length)
            console.log('avancesSeleccion')
      if(((totalAcumulado) / AvancesEmp[0].rendimiento) > rendimientoTope)
      {
       
        return false;

      }
      return true;
      
}

  const guardarSurcosEnRealm = () => {
    
    
    try {


      if (realmInstance === null) {
        Alert.alert(
          "Error",
          "La instancia de la base de datos es null, no se realizo el guardado de surcos para este empleado"
        );
        return;
      }

     

      const semana = realmInstance.objects("Semana");
     // console.log(semana[0].CodigoSemana);

      //borramos los registros previos
      realmInstance.write(() => {
       
        const surcosPrevios = realmInstance
          .objects("Surco")
          .filtered(
            "tabla == $0 AND nave == $1 AND lote == $2 AND codEmpleado == $3  AND actividad == $4 AND avance == $5 AND fecha == $6 AND  semanaActiva == $7",
            EmpleadoSeleccionado.CodTabla,
            EmpleadoSeleccionado.CodigoNave,
            EmpleadoSeleccionado.CodigoLote,
            EmpleadoSeleccionado.CodigoEmpleado,
            EmpleadoSeleccionado.CodigoActividad,
            EmpleadoSeleccionado.CodigoAvance,
            new Date(GenerarFecha(false, true)),
            String(semana[0].CodigoSemana)
          );
          
   
        //borraamos los surcos previos encontrados en realm Surco para este empleado
        realmInstance.delete(surcosPrevios);
           
        //surcos para el empleado
        const surcosSeleccionados = surcoModal
          .filter(s => s.seleccionado)
          .map(s => s.surco);

        //surcosObjetos para guardarlos en realm Surco
       //   console.log('asdasdasdasd', JSON.stringify(surcoModal, 2,null))
        const surcosObjetos = surcoModal.filter(s => s.seleccionado).map(s => ({
          surco: String(s.surco),
          tabla: String(s.tabla),
          nave: s.nave,
          lote: s.lote,
          codEmpleado: EmpleadoSeleccionado.CodigoEmpleado,
          actividad: s.actividad,
          avance: s.avance,
          fecha: s.fecha,
          seleccionado: s.seleccionado,
          avanceAcum: 1,
          semanaActiva: String(semana[0].CodigoSemana)
        }));

        //guardamos
        surcosObjetos.forEach(surco => {
          realmInstance.create("Surco", surco);
        });
        //buscamos el empleado para actualizarle sus surcos
        const emp = realmInstance
          .objects("EmpleadoCapturado")
          .filtered(
            "CodigoTemporada == $0 AND CodigoLote == $1 AND CodigoNave == $2 AND CodigoEmpleado == $3  AND CodigoActividad == $4  AND CodigoAvance == $5 AND CodTabla == $6 AND FechaCaptura == $7",
            EmpleadoSeleccionado.CodigoTemporada,
            EmpleadoSeleccionado.CodigoLote,
            EmpleadoSeleccionado.CodigoNave,
            EmpleadoSeleccionado.CodigoEmpleado,
            EmpleadoSeleccionado.CodigoActividad,
            EmpleadoSeleccionado.CodigoAvance,
            EmpleadoSeleccionado.CodTabla,
            new Date(GenerarFecha(false, true))
          );
        if (
          surcosSeleccionados.length / Rendimiento >
          Number(rendimientoTope)
        ) {
          Alert.alert(
            "Errror",
            "El avance excede el rendimiento tope permitido."
          );
          return;
        }
        if (emp) {
          const empleado = emp[0];
          /*   console.log("surcosSeleccionados", surcosSeleccionados);
          console.log("empleado", empleado);
          console.log("aaaa", empleado.surcos);
          console.log("surcos, para empleado", surcosSeleccionados.length);*/
          empleado.Avances = surcosSeleccionados.length;
          empleado.surcos = surcosSeleccionados;
          empleado.tieneSurcos = surcosSeleccionados.length > 0;
        }

        //   navigation.navigate("pantallaTablaDatos");
      });

      //console.log(JSON.stringify(surcoModal, null, 2));
      //console.log(JSON.stringify(EmpleadoSeleccionado, null, 2));
       //  navigation.navigate("pantallaTablaDatos")
      setListoParaGuardar(false);
      //  navigation.navigate("pantallaTablaDatos");
    } catch (error) {
      console.log("Error al guardar surcos en Realm:", error);
    }
  };

  //asigna a empleadoSeleccionad a aque que  cuya tarjeta sea presionada para mostra la info de sus surcos, los disponibles y los trabajados por otros
  const AsignarEmpleadoSeleccionad = item => {
    /*console.log("item seleccionado", item.horaIncioActividad);
    console.log("item seleccionad2", item.horaFinalActividad);*/
    SetSolicitarPermiso(item.solicitoPermiso);
    nomCortoUnidad === "SCO"
      ? setMostrarModalAvances(true)
      : setModalAvanceNormalVisible(true);

    setEmpleadoSeleccionado(JSON.parse(JSON.stringify(item)));
  };
const getFechaLocal = () => {
  const hoy = new Date();

const anio = hoy.getFullYear();
const mes = String(hoy.getMonth() + 1).padStart(2, '0');
const dia = String(hoy.getDate()).padStart(2, '0');

const fechaFinal = `${anio}-${mes}-${dia}`;

  return fechaFinal // Retorna exactamente 10 caracteres: "2026-02-04"

};

const handleUpdateAvance = () => {
  try {

    
      const semana = realmInstance.objects("Semana");
    realmInstance.write(() => {
      // 1. Buscamos el registro usando un query de Realm
      // Ejemplo: buscando por surco, lote y tabla simultáneamente
      let registros = realmInstance.objects("SurcoDecimal") .filtered(`
        surco == $0 AND
        lote == $1 AND
        actividad == $2 AND
        avance == $3 AND
        codEmpleado == $4 AND
        semanaActiva == $5
      `,
        String(surcoSelec),
        EmpleadoSeleccionado.CodigoLote,
        EmpleadoSeleccionado.CodigoActividad,
        EmpleadoSeleccionado.CodigoAvance,
        EmpleadoSeleccionado.CodigoEmpleado,
         String(semana[0].CodigoSemana),
        );
 
      // 2. Verificamos que encontramos el registro
      if (registros.length > 0) {
        // Actualizamos el primero que coincida
        registros[0].avanceAcum = Number(AvanceSumado.AvanceDecimal) || 0;
        console.log("Actualizado por filtro con éxito");
      } else {
        console.warn("No se encontró ningún registro con esos filtros");
      }
    });
  } catch (error) {
    console.error("Error en la actualización:", error);
  }
};
  const GuardarAvancesDecimalesAEmpleado  = () =>{

      const semana = realmInstance.objects("Semana");
   

    const registros = realmInstance.objects("SurcoDecimal")
    .filtered(`
        surco == $0 AND
        lote == $1 AND
        actividad == $2 AND
        avance == $3 AND
        codEmpleado == $4 AND
        semanaActiva == $5
      `,
        String(surcoSelec),
        EmpleadoSeleccionado.CodigoLote,
        EmpleadoSeleccionado.CodigoActividad,
        EmpleadoSeleccionado.CodigoAvance,
        EmpleadoSeleccionado.CodigoEmpleado,
        String(semana[0].CodigoSemana),
        )


     

      if(registros.length > 0)
      {
        handleUpdateAvance(); 
        Alert.alert('Aviso','Empleado actualizado')
        return;
      }
    const AvanceAcum = EmpleadoSeleccionado.Avances + Number(AvanceSumado.AvanceDecimal);
    
      const jornalAcum = (AvanceAcum/EmpleadoSeleccionado.rendimientoApli)
      
           if((jornalAcum) > rendimientoTope)
           {
                

              Alert.alert('Se esta exediendo el tope maximo por empleado');
              return;
           }
         //  console.log('ssssurco',surcoSelec)
      const datosSurcoDecimal ={

            surco: String(surcoSelec),
            tabla: EmpleadoSeleccionado.CodTabla,
            nave: EmpleadoSeleccionado.CodigoNave,
            lote: EmpleadoSeleccionado.CodigoLote,
            actividad: EmpleadoSeleccionado.CodigoActividad,
            avance: EmpleadoSeleccionado.CodigoAvance,
            codEmpleado: EmpleadoSeleccionado.CodigoEmpleado,
            fecha: getFechaLocal(),
            avanceAcum: Number(AvanceSumado.AvanceDecimal),
            semanaActiva:  String(semana[0].CodigoSemana),
            nombreEmpleado: EmpleadoSeleccionado.Nombre,
            descripcionAct: Descripcion
          }
  
   console.log('empleado',datosSurcoDecimal);

        
        realmInstance.write(() => {
            realmInstance.create("SurcoDecimal", datosSurcoDecimal);
          });



    setEmpleadoSeleccionado(prev => ({
      ...prev,
      Avances : EmpleadoSeleccionado.Avances + Number(AvanceSumado.AvanceDecimal)
    }))

   // setModalAvanceRecortado(false)
    }
  const renderItemPreview = ({ item }) => {
  
  {
     return (
      <Pressable
        disabled={item.bloqueado}
        style={
          item.bloqueado
            ? styles.itemPreviewBlock
            : item.seleccionado ? styles.itemPreviewSelected : styles.itemPreview
        }
        onPress={() => agregarSurcos_Avances(item)}
        onLongPress={()=> {
          setSurcoSele(item.surco);
          setModalAvanceRecortado(true)
        }}
      >
        { item.avanceAcum > 0 &&
            <Image
            source={require("../assets/check-bold.png")}
            style={styles.surcoTrabajado}
          />
        }

     
        <Text
          style={
            item.bloqueado
              ? styles.surcoPreviewBlock
              : item.seleccionado
                ? styles.surcoPreviewSelected
                : styles.surcoPreview
          }
        >
          {item.surco}
        </Text>
      </Pressable>
    );
  }
  };

  const renderIntem = ({ item }) =>
   {
    return( <TouchableOpacity
      style={styles.card}
      onPress={() => { AsignarEmpleadoSeleccionad(item); }}
      >
      {item.horaInicioActividad === null &&
        <TouchableOpacity
          style={{
            width: 50,
            position: "absolute",
            top: 0,
            right: 0,
            borderRadius: 100,
            height: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            
          }}
          onPress={() => handleIniciar(item)}
        >
          <Image
            source={require("../assets/timer-play.png")}
            style={styles.cardButton}
          />
        </TouchableOpacity>}
      {item.horaInicioActividad !== null &&
        item.limiteMaximoDeCaptura === null &&
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            right: 0  ,
            width: 40,
            marginVertical: 2,
            marginHorizontal: "auto",
            borderRadius: 100,
            height: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => handleFinalizar(item)}
        >
          <Image
            source={require("../assets/timer-check.png")}
            style={styles.cardButton}
          />
        </TouchableOpacity>}

      {item.Avances > 0 &&
        <Image
          source={require("../assets/check...png")}
          style={styles.checkIcon}
        />}

      <View
        style={styles.imageContainer}
      >
        <Image
        resizeMode="contain"
          source={require("../assets/usuario2.png")}
          style={styles.icon}
        />
      </View>
      <View
      
      >
        <View
          style={{
            marginTop:50,
            marginBottom:50,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
         
          }}
        >
          <Text style={styles.codigo}>
            {item.CodigoEmpleado}
          </Text>
          <Text style={styles.nombre}>
            {item.Nombre}
          </Text>
          <Text style={{ marginTop: -4, fontSize: 14, fontWeight: "bold" }}>
            {nomCortoUnidad}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>
            Avances: {item.Avances.toFixed(2)}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "bold", marginTop: 3 }}>
            Jornal:{" "}
            {(Number(item.Avances) / Number(Rendimiento).toFixed(2)).toFixed(2)}
          </Text>
          
        </View>
      </View>
    </TouchableOpacity>);
   }
//console.log('sssss',AvanceSumado)
  /* console.log(
    toDate(GenerarFecha(false, false)),
    toDate(EmpleadoSeleccionado.limiteMaximoDeCaptura)
  );*/

  return (
    <View style={styles.container}>
      <View style={styles.infoSuperior}>
        <Text style={styles.infoText}>
          {numeroNave}
        </Text>
        <Text style={styles.infoText}>
          {datosEncabezado.nombreNaveEncabezado}
        </Text>
        <Text style={styles.infoText}>
          {datosEncabezado.numeroActividadEncabezado} -{" "}
          {datosEncabezado.descripcionActividadEncabezado}
        </Text>
        <Text style={styles.infoText}>
          TABLA: {datosEncabezado.tablaSeleccionada}
        </Text>
        <Text style={styles.unidad}>
          UNIDAD: {nomCortoUnidad}
        </Text>
        <View style={styles.rowInfo}>
          <Text style={styles.rendimiento2}>
            RENDIMIENTO: {datosEncabezado.rendimiento}
          </Text>
          <Text style={styles.fecha}>
            {GenerarFecha(false, true)}
          </Text>
        </View>
        <View style={styles.rowInfo} />
      </View>
      <View style={{ flex:1}}>
        
          <FlatList
            data={empleadosCapturados}
            renderItem={renderIntem}
            keyExtractor={item => item.CodigoEmpleado.toString()}
            numColumns={2}
          
             columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: ITEM_MARGIN
        }}
        showsVerticalScrollIndicator={true}
          />
     

        <TouchableOpacity
          style={styles.botonAgregar}
          onPress={() => {
            setModalVisible(true);
          }}
        >
          <Ionicons name="person-add" size={35} color="white" />
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.nuevoModalContent}>
              <TouchableOpacity
                style={styles.cerrarIcono}
                onPress={() => {
                  setModalVisible(false);
                  setDatosModalEmpleado({
                    codEmpleado: "",
                    NombreEmpleado: ""
                  });
             
                }}
              >
                <Image
                  source={require("../assets/cerraar.png")}
                  style={{ width: 30, height: 30 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <View style={styles.filaCodigoBuscar}>
                <View style={styles.inputCodigoBox}>
                  <Text style={styles.label}>Código Empleado</Text>
                  <TextInput
                    style={styles.input}
                    value={datosModalEmpleado.codEmpleado}
                    onChangeText={text =>
                      setDatosModalEmpleado(prev => ({
                        ...prev,
                        codEmpleado: text
                      }))}
                    autoCapitalize="none"
                    keyboardType="numeric"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.botonBuscar,
                    !datosModalEmpleado.codEmpleado && {
                      backgroundColor: "green"
                    }
                  ]}
                  onPress={buscarEmpleadoPorCodigo}
                  disabled={!datosModalEmpleado.codEmpleado}
                >
                  <Text style={styles.botonTexto}>Buscar</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Nombre</Text>
              <TextInput
                value={datosModalEmpleado.NombreEmpleado}
                style={[styles.input, styles.nombreBloqueado]}
                onChangeText={text =>
                  setDatosModalEmpleado(prev => ({
                    ...prev,
                    NombreEmpleado: text
                  }))}
                editable={false}
              />

              <TouchableOpacity
                style={styles.botonAceptar}
                onPress={() => guardarEmpleado()}
              >
                <Text style={styles.botonTexto}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={mostrarModalAvances} transparent animationType="fade">
          {EmpleadoSeleccionado.horaInicioActividad !== null
            ? <View style={styles.modalContainer}>
                <View style={styles.nuevoModalContent}>
                  <TouchableOpacity
                    style={styles.cerrarIcono}
                    onPress={() => {
                      setMostrarModalAvances(false);
                           setTerminaLoad(false);
                    }}
                  >
                    <Image
                      source={require("../assets/cerraar.png")}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>

                  {
                    <View style={styles.zonaGrisPreview}>
                      <FlatList
                        data={surcoModal}
                        renderItem={renderItemPreview}
                        keyExtractor={item => item.surco.toString()}
                        horizontal={false}
                        numColumns={4}
                        contentContainerStyle={styles.flatlistContent}
                      />
                    </View>
                  }
                  <TouchableOpacity
                    style={styles.botonAceptar}
                    onPress={GuardarSurcosAEmpleado}
                    disabled={
                      EmpleadoSeleccionado.solicitoPermiso === true
                        ? true
                        : false
                    }
                  >              
                    <Text style={styles.botonTexto}>Agregar</Text>
                  </TouchableOpacity>
                  {EmpleadoSeleccionado.limiteMaximoDeCaptura !== null &&
                    obtnerFechaActual() >
                      EmpleadoSeleccionado.limiteMaximoDeCaptura &&
                    !EmpleadoSeleccionado.SoliciPermiso &&
                    <TouchableOpacity
                      style={styles.botonAceptar}
                      onPress={SolicitarPermiso}
                    >
                      <Text style={styles.botonTexto}>Solicitar permiso</Text>
                    </TouchableOpacity>}
                </View>
              </View>
            : <View style={styles.modalContainer}>
                <View style={styles.nuevoModalContent}>
                  <TouchableOpacity
                    style={styles.cerrarIcono}
                    onPress={() => {
                      setMostrarModalAvances(false);
                      setDatosModalEmpleado({
                        codEmpleado: "",
                        NombreEmpleado: ""
                      });
                    }}
                  >
                    <Image
                      source={require("../assets/cerraar.png")}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>
                    No se ha iniciado actividad
                  </Text>
                </View>
              </View>}
        </Modal>

        <Modal
          visible={modalAvanceNomralVisible}
          transparent
          animationType="fade"
        >
          {EmpleadoSeleccionado.horaInicioActividad !== null
            ? <View style={styles.modalContainer}>
                <View style={styles.nuevoModalContent}>
                  <TouchableOpacity
                    style={styles.cerrarIcono}
                    onPress={() => {
                      setModalAvanceNormalVisible(false);
                      setDatosModalEmpleado({
                        codEmpleado: "",
                        NombreEmpleado: ""
                      });
                    }}
                  >
                    <Image
                      source={require("../assets/cerraar.png")}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>

                  <View style={styles.filaCodigoBuscar}>
                    {
                      <View style={{ width: "50%" }}>
                        <Text style={styles.label}>Avance</Text>
                        <TextInput
                          readOnly={
                            EmpleadoSeleccionado.solicitoPermiso === true
                              ? true
                              : false
                          }
                          style={styles.input}
                          value={AvanceAGuardar}
                          autoCapitalize="none"
                          keyboardType="numeric"
                          onChangeText={text => SetAvanceAGuardar(text)}
                        />
                      </View>
                    }
                  </View>

                  {
                    <TouchableOpacity
                      disabled={
                        EmpleadoSeleccionado.solicitoPermiso === true
                          ? true
                          : false
                      }
                      style={styles.botonAceptar}
                      onPress={GuardarAvanceNormal}
                    >
                      <Text style={styles.botonTexto}>Aceptar</Text>
                    </TouchableOpacity>
                  }
                  {EmpleadoSeleccionado.limiteMaximoDeCaptura !== null &&
                    obtnerFechaActual() >
                      EmpleadoSeleccionado.limiteMaximoDeCaptura &&
                    !EmpleadoSeleccionado.SoliciPermiso &&
                    <TouchableOpacity
                      style={styles.botonAceptar}
                      onPress={SolicitarPermiso}
                    >
                      <Text style={styles.botonTexto}>Solicitar permiso</Text>
                    </TouchableOpacity>}
                </View>
              </View>
            : <View style={styles.modalContainer}>
                <View style={styles.nuevoModalContent}>
                  <TouchableOpacity
                    style={styles.cerrarIcono}
                    onPress={() => {
                      setModalAvanceNormalVisible(false);
                      setDatosModalEmpleado({
                        codEmpleado: "",
                        NombreEmpleado: ""
                      });
                    }}
                  >
                    <Image
                      source={require("../assets/cerraar.png")}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>
                    No se ha inicializado actividad
                  </Text>
                </View>
              </View>}
        </Modal>

        <Modal
          visible={modalAvanceRecortado}
          transparent
          animationType="fade"
        >
          {EmpleadoSeleccionado.horaInicioActividad !== null
            ? <View style={styles.modalContainer}>
                <View style={{backgroundColor:"white", width:'90%', height:'90%', borderRadius:10}}>
                  <View style={{display:"flex",flexDirection:'column', marginTop:10, height:'17%'}}>
                      <View>
                        <TouchableOpacity
                          style={{display:'flex', justifyContent:'flex-end', alignItems:'flex-end', margin: 10}}
                          onPress={() => {
                            setModalAvanceRecortado(false)
                            setDatosModalEmpleado({
                              codEmpleado: "",
                              NombreEmpleado: ""
                            });
                          }}
                      >
                      <Image
                        source={require("../assets/cerraar.png")}
                        style={{ width: 30, height: 30 }}
                        resizeMode="contain"
                      />
                        </TouchableOpacity>
                      </View>
                      <View style={{ backgroundColor:"" }}>
                          <View style={{ width: "50%", backgroundColor:"", margin:'auto' }}>
                            <Text style={styles.label}>Avance</Text>
                            <TextInput
                              style={styles.input}
                              value={AvanceSumado.AvanceDecimal}
                              keyboardType="decimal-pad"
                              onChangeText={text => {
                                 // Permite: "", "0", "0.", "0.5", ".5", "1", "1."
                                  if (/^(|0|0\.|0\.\d*|1|1\.|1\.0*)$/.test(text)) {
                                   setAvanceSumado(prev => ({
                                     ...prev,
                                      AvanceDecimal: text
                                   }));
                               }
                             }}
                            />
                          </View>
                          <View  style={{ width: "50%", backgroundColor:"", margin:'auto', paddingBottom:10 }}>
                            <TouchableOpacity
                            disabled={
                            EmpleadoSeleccionado.solicitoPermiso === true
                              ? true
                              : false
                            }
                            style={styles.botonAceptar}
                            onPress={GuardarAvancesDecimalesAEmpleado}
                          >
                          <Text style={styles.botonTexto}>Aceptar</Text>
                          </TouchableOpacity>
                          </View>
                      </View>                          
                  </View>
                  <View style={{backgroundColor:'#e1e1e1', height:'81%',marginHorizontal:10}}>
                     <Tabla/>
                  </View>
                  
                </View>
              </View>
            : <View style={styles.modalContainer}>
                <View style={styles.nuevoModalContent}>
                  <TouchableOpacity
                    style={styles.cerrarIcono}
                    onPress={() => {
                      setModalAvanceNormalVisible(false);
                      setDatosModalEmpleado({
                        codEmpleado: "",
                        NombreEmpleado: ""
                      });
                    }}
                  >
                    <Image
                      source={require("../assets/cerraar.png")}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>
                    No se ha inicializado actividad
                  </Text>
                </View>
              </View>}
        </Modal>
      </View>
    </View>
  );
};

export default EmpleadosScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fff0",
    padding: 3
  },
  checkIcon: {
    width: 23,
    height: 23,
    position: "absolute",
    top: 8,
    left: 8
  },

  botonContainer: { marginTop: 10 },

  infoSuperior: {
    padding: 10,
    backgroundColor: "#B3E0B3",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    height: "18%"
  },
  infoText: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#333",
    marginRight: 50
  },
  rendimiento2: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#333",
    marginRight: 50,
    marginTop: -3
  },
  unidad: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#333",
    marginRight: 50,
    marginTop: 1
  },
  fecha: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#333",
    marginRight: 3
  },
  rowInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 5
  },
  lista: {
    paddingBottom: 100,
    justifyContent: "center",

    width: "100%",
    display: "flex"
  },
  card: {
  width: ITEM_WIDTH,
    margin: ITEM_MARGIN,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    elevation: 3
  },  
  imageContainer: {
    width: "80%",
    aspectRatio:1.5, // 🔥 cuadrado y responsive
    justifyContent: "center",
    alignItems: "center"
  },

  icon: {
    width: "60%",
    height: "60%"
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 20,
    marginBottom: 5
  },
  cardButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5
  },
  surcoTrabajado: {
    width: 20,
    height: 20,
    borderRadius: 20,
    marginBottom: 5,
    left: 40,
    bottom: 30,
    color: "green",
    position: "absolute"
  },
  codigo: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2
  },
  nombre: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 10,
    paddingTop: -2,
    textTransform: "capitalize",
    color: "#666",
    fontWeight: "bold"
  },
  surc: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: "bold"
  },
  avanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5
  },
  avanceLabel: {
    color: "green",
    fontSize: 12,
    fontWeight: "bold"
  },
  avanceBox: {
    backgroundColor: "green",
    paddingHorizontal: 6,
    borderRadius: 3,
    marginLeft: 6
  },
  avanceText: {
    color: "white",
    fontWeight: "bold"
  },
  botonAgregar: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "green",
    borderRadius: 40,
    width: 66,
    height: 66,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center"
  },
  cerrar: {
    position: "absolute",
    top: 10,
    right: 10
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20
  },
  label: {
    alignSelf: "flex-start",
    fontWeight: "bold",
    marginTop: 7,
    fontSize: 14
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    width: "100%",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 5
  },
  nombreBloqueado: {
    backgroundColor: "#ddd"
  },
  botonBuscar: {
    backgroundColor: "green",
    marginTop: 15,
    paddingVertical: 7,
    borderRadius: 5,
    alignItems: "center",
    width: "100%"
  },
  botonTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13
  },
  botonModal: {
    backgroundColor: "green",
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center"
  },
  nuevoModalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "60%",
    alignItems: "center",
  },
  cerrarIcono: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1
  },
  filaCodigoBuscar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    width: "100%",
    gap: 11,
    marginBottom: 8
  },
  filaSurcoAvance: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    gap: 10,
    marginTop: 15
  },
  boxInputChico: {
    flex: 1
  },
  botonAgregarMini: {
    backgroundColor: "green",
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end"
  },
  zonaGrisPreview: {
    backgroundColor: "#ccc",
    height: 200,
    width: "100%",
    marginTop: 40,
    borderRadius: 10
  },
  flatlistContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center"
  },
  botonAceptar: {
    backgroundColor: "green",
    marginTop: 18,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    width: "100%"
  },
  botonBuscar: {
    backgroundColor: "green",
    paddingVertical: 6.5,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center"
  },
  itemPreview: {
    backgroundColor: "white",
    margin: 7,
    padding: 2,
    borderRadius: 10,
    alignItems: "center",
    width: 60,
    height: 50,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "green",
    position: "relative"
  },
  itemPreviewSelected: {
    backgroundColor: "green",
    margin: 7,
    padding: 2,
    borderRadius: 10,
    alignItems: "center",
    width: 60,
    height: 50,
    display: "flex",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
    position: "relative"
  },
  surcoPreview: {
    fontSize: 13.5,
    color: "#666",
    fontWeight: "bold",
    textAlign: "center"
  },
  surcoPreviewSelected: {
    fontSize: 13.5,
    color: "#ffffffff",
    fontWeight: "bold",
    textAlign: "center"
  },
  surcoPreviewBlock: {
    fontSize: 13.5,
    color: "#ffffffff",
    fontWeight: "bold",
    textAlign: "center"
  },
  itemPreviewBlock: {
    backgroundColor: "gray",
    margin: 7,
    padding: 2,
    borderRadius: 10,
    alignItems: "center",
    width: 60,
    height: 50,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
    position: "relative"
  },surcoConaAvance: {
    backgroundColor: "#c16969",
    margin: 7,
    padding: 2,
    borderRadius: 10,
    alignItems: "center",
    width: 60,
    height: 50,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
    position: "relative"
  },
  avancePreview: {
    fontSize: 12,
    color: "green",
    textAlign: "center",
    marginTop: 2,
    fontWeight: "bold"
  },
  eliminarBoton: {
    position: "absolute",
    top: -10,
    right: -10,
    zIndex: 1
  },
  loadingOverlay: {
    flex: 1, // 👈 Importante: Esto hace que ocupe todo el espacio vertical disponible
    justifyContent: "center", // 👈 Centra el contenido (ActivityIndicator) verticalmente
    alignItems: "center" // 👈 Centra el contenido horizontalmente
  }
});
