import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { getRealmInstance } from "../realm";

import CustomModal from "../src/components/Modal/MotalComponent";
import ModalBuscarEmpleado from "../src/components/Modal/ModalBuscarEmpleado";
import ListaEmpleadosAgregados from "../src/components/Listas/ListaEmpleadosAgregados";
import ModalAgregarAvance from "../src/components/Modal/ModalAgregarAvance";
import ModalSurcos from "../src/components/Modal/ModalSurcos";
import {  useWindowDimensions } from 'react-native';
import CustomTitle from "../src/components/CustomTitle";
import CustomOptions from "../src/components/CustomOptions";
import { finDiaCuliacan, inicioDiaCuliacan } from "../utils/obtenerHoraCuliacan";

const ListaEmpleados = ({ route }) => {
  const [realmInstance, setRealmInstance] = useState(null);

  const [modales, setModales] = useState({
    modalNave: false,
    modalEmpleados: false,
    modalActividades: false,
    mainModal: false,
    modalTablas: false,
    modalActiviadesEmpleado: false,
    modalAvance: false,
    modalSurcos: false
  });



  const [datosActividad, setDatosActividad] = useState({});
  const { width, height } = useWindowDimensions();
  const [ListaEmpleadosEnRealm, setListaDeEmpleadosEnRealm] = useState([]);
  const [datosEmpleadoNuevo, setDatosEmpleadoNuevo] = useState({
    CodigoEmpleado: "",
    Nombre: "",
    CodigoTemporada: "",
    CodigoLote: "",
    CodigoNave: "",
    CodTabla: "",
    CodigoActividad: "",
    CodigoAvance: "",
    FechaCaptura: null,
    horaInicioActividad: null,
    horaFinalActividad: null,
    limiteMaximoDeCaptura: null,
    tienePermiso: false,
    solicitoPermiso: false,
    Avances: 0,
    rendimientoApli: 0,
    codUnidad: "",
    CodigoJefe: "",
    surcos: [],
    tieneSurcos: false,
    estado: 0
  });
  const [datosEmpleadoSeleccionado, setDatosEmpleadoSeleccionado] = useState(
    {}
  );

 

  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
  }, []);

  useEffect(
    () => {
      const hoy = new Date(GenerarFecha(false, true));
        console.log(hoy)
      if (realmInstance !== null) {

     


        const empleadosRealm = realmInstance
          .objects("EmpleadoCapturado")
          .filtered(`FechaCaptura >= $0 AND FechaCaptura <= $1`, inicioDiaCuliacan(),finDiaCuliacan());

        // Definimos la función que procesa los datos
        const actualizarLista = () => {
          try {
            // 1. Convertimos a plano para evitar problemas de "objetos vivos" de Realm
            const empleadosPlano = JSON.parse(JSON.stringify(empleadosRealm));

            // 2. Quitamos duplicados (Aquí es donde se define empleadosUnicos)
            const empleadosUnicos = Object.values(
              empleadosPlano.reduce((acc, emp) => {
                acc[emp.CodigoEmpleado] = emp; // Si el código ya existe, lo sobrescribe (pisa duplicados)
                return acc;
              }, {})
            );
              console.log(empleadosUnicos.length)
            // 3. Guardamos en el estado
            setListaDeEmpleadosEnRealm(empleadosUnicos);
           /** console.log(
              "Listener de Realm: Lista actualizada con",
              empleadosUnicos.length,
              "empleados."
            ); */
          } catch (err) {
            console.error("Error procesando datos de Realm:", err);
          }
        };

        // Ejecutar inmediatamente al cargar para ver los datos actuales
        actualizarLista();

        // Suscribir el listener para cambios futuros
        empleadosRealm.addListener(actualizarLista);





        return () => {
          // Limpieza vital para evitar fugas de memoria o errores de "Object is invalidated"
          if (empleadosRealm) {
            empleadosRealm.removeAllListeners();
          }
        };

      
      }
    
   
    },
    [realmInstance]
  );

  
 



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
      fechaFormateada = `${año}-${mes}-${dia} ${horas}:${horaExtra
        ? Number(minutos) + Number(2)
        : minutos}:${segundos}`;
    }
    return fechaFormateada;
  };
  return (
    
    <View style={styles.mainContainer}>
      <CustomTitle title="Actividades por empleado" style={{ elevation: 0 }} />
      <ModalBuscarEmpleado
        visible={modales.modalEmpleados}
        setModales={setModales}
        setDatosEmpleadoNuevo={setDatosEmpleadoNuevo}
      />

      <CustomModal
        modales={modales}
        setModales={setModales}
        setDatosEmpleadoNuevo={setDatosEmpleadoNuevo}
        datosEmpleadoNuevo={datosEmpleadoNuevo}
        setDatosEmpleadoSeleccionado={setDatosEmpleadoSeleccionado}
        datosEmpleadoSeleccionado={datosEmpleadoSeleccionado}
        setDatosActividad={setDatosActividad}
        datosActividad={datosActividad}
      />

      <ListaEmpleadosAgregados
        listaEmpleados={ListaEmpleadosEnRealm}
        modales={modales}
        setModales={setModales}
        setDatosEmpleadoSeleccionado={setDatosEmpleadoSeleccionado}
        setDatosEmpleadoNuevo={setDatosEmpleadoNuevo}
      />

      {
        <ModalAgregarAvance
          modales={modales}
          setModales={setModales}
          datosEmpleadoSeleccionado={datosEmpleadoSeleccionado}
          datosActividad={datosActividad}
          setDatosActividad={setDatosActividad}
        />
      }

      {Object.keys(datosActividad).length > 0 &&
        datosActividad.NomCortoUnidad === "SCO" &&
        realmInstance !== null &&
        <ModalSurcos
          modales={modales}
          setModales={setModales}
          datosActividad={datosActividad}
          setDatosActividad={setDatosActividad}
          datosEmpleadoSeleccionado={datosEmpleadoSeleccionado}
          realmInstance={realmInstance}
        />}

        {realmInstance !== null && <CustomOptions setModales={setModales} realmInstance={realmInstance}/>}

      <View/>
    </View>
  );
};


const styles = StyleSheet.create({
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10
  },
  botonTablas: {
    position: "absolute",
    bottom: 0,
    left: 50,
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
    shadowRadius: 3.84,
    zIndex: 10
  },

  mainContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#f1fff1",
    zIndex: -2
  }
});

export default ListaEmpleados;
/*
f1fff1
v
      <TouchableOpacity
        style={styles.botonTablas}
        onPress={() => {
          navigation.navigate("pantallaTablaDatos");
        }}
      >
        <Ionicons name="person-add" size={35} color="white" />
      </TouchableOpacity>
*/
