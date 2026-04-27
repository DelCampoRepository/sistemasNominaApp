import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import DropdownComponent from "../components/Dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import calendario from "../assets/calendario.png";
import agricultor from "../assets/agricultor.png";
import proteccion from "../assets/proteccion.png";

import {  useWindowDimensions } from 'react-native';
import { Dimensions } from "react-native";
import CustomOptions from "../src/components/CustomOptions";
import CustomTitle from "../src/components/CustomTitle";
const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_MARGIN = 8;
const ITEM_WIDTH = SCREEN_WIDTH / 3 - ITEM_MARGIN * 2;
import { getRealmInstance } from "../realm";

const ReportesScreen = () => {
  const navegacion = useNavigation();
  const { width, height } = useWindowDimensions();
  const [loadingActividades, setLoadingActividades] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);

  const [navesRealm, setNavesRealm] = useState([]);
  const [tablasRealm, setTablasRealm] = useState([]);

  const [naveSeleccionada, setNaveSeleccionada] = useState(null);
  const [tablaSeleccionada, setTablaSeleccionada] = useState(null);
  const [tablasFiltradas, setTablasFiltradas] = useState([]);

  const [mostrarFechaInicio, setMostrarFechaInicio] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [mostrarFechaFin, setMostrarFechaFin] = useState(false);
  const [fechaFin, setFechaFin] = useState(null);

  const [listaEmpleados, setListaEmpleados] = useState([]);

  const listaReporteEmpleados = [
    {
      codigoEmpleado: "01357",
      Nombre: "Dafne",
      ApellidoP: "Gaxiola",
      ApellidoM: "González",

      CantidadActividades: "2"
    },
    {
      codigoEmpleado: "01308",
      Nombre: "Dacia Margarita",
      ApellidoP: "González",
      ApellidoM: "Elizalde",

      CantidadActividades: "4"
    },

    {
      codigoEmpleado: "000123",
      Nombre: "Luis Fernando",
      ApellidoP: "González",
      ApellidoM: "Garcia",

      CantidadActividades: "2"
    },

    {
      codigoEmpleado: "000022",
      Nombre: "Janithzia Elizabeth",
      ApellidoP: "Castillo",
      ApellidoM: "Bustamante",

      CantidadActividades: "3"
    },

    {
      codigoEmpleado: "000023",
      Nombre: "Raúl",
      ApellidoP: "Armienta",
      ApellidoM: "Mendoza",

      CantidadActividades: "5"
    }
  ];
  const [realmInstance, setRealmInstance] = useState(null);

  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
  }, []);

  useEffect(() => {
    const cargarNavesDesdeRealm = async () => {
      try {
        const realm = await getRealmInstance();
        const naves = realm.objects("Nave");

        const opcionesNaves = naves.map(nave => ({
          label: `${nave.CodigoNave} - ${nave.DescripcionNave ||
            "Sin Descripción"}`,
          value: nave.CodigoNave
        }));
        setNavesRealm(opcionesNaves);
      } catch (error) {
        console.error("Error al cargar naves desde Realm:", error);
        Alert.alert(
          "Del Campo y Asociados",
          "No se pudieron cargar las naves."
        );
      }
    };

    cargarNavesDesdeRealm();
  }, []);

  useEffect(() => {
    const cargarTablasDesdeRealm = async () => {
      try {
        const realm = await getRealmInstance();
        const tablas = realm.objects("Tablas");

        // console.log("Tablas Obtenidas de Realm:", tablas);

        const opcionesTablas = tablas.map(tabla => ({
          label: `${tabla.CodigoTabla} - ${tabla.Descripcion ||
            "Sin Descripción"}`,
          value: String(tabla.CodigoTabla),
          naveRelacionada: String(tabla.CodigoNave)
        }));
        setTablasRealm(opcionesTablas);
      } catch (error) {
        console.error("Error al cargar tablas desde Realm:", error);
        Alert.alert(
          "Del Campo y Asociados",
          "No se pudieron cargar las tablas."
        );
      }
    };

    cargarTablasDesdeRealm();
  }, []);

  useEffect(
    () => {
      if (naveSeleccionada) {
        const filtradas = tablasRealm.filter(
          tabla => tabla.naveRelacionada === naveSeleccionada
        );
        setTablasFiltradas(filtradas);
        setTablaSeleccionada(null);
      } else {
        setTablasFiltradas([]);
        setTablaSeleccionada(null);
      }
    },
    [naveSeleccionada, tablasRealm]
  );

  const formatearFecha = fecha => {
    if (!fecha) return "";
    const day = String(fecha.getDate()).padStart(2, "0");
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const year = fecha.getFullYear();
    return `${day}-${month}-${year}`;
  };


  // Función para manejar el reporte por Actividades
  const manejarReporteActividades = async () => {
    // const OPCION_ACT = 1;

    try {
      if (!naveSeleccionada || !tablaSeleccionada) {
        Alert.alert("Del Campo y Asociados", "Seleccione nave y tabla.");
        return;
      }

      if (!fechaInicio || !fechaFin) {
        Alert.alert(
          "Del Campo y Asociados",
          "Seleccione las fechas de inicio y fin para el reporte."
        );
        return;
      }

      if (fechaInicio > fechaFin) {
        Alert.alert(
          "Del Campo y Asociados",
          "La fecha inicial no puede ser posterior a la final."
        );
        return;
      }

      if (realmInstance !== null) {
        const resultadosnave = realmInstance
          .objects("Nave")
          .filtered("CodigoNave == $0 ", naveSeleccionada);

        const resultados = realmInstance
          .objects("Tablas")
          .filtered(
            "CodigoTabla == $0 AND CodigoNave == $1",
            tablaSeleccionada,
            naveSeleccionada
          );

        if (resultados.length === 0) {
          Alert.alert(
            "Del Campo y Asociados",
            "No se encontró la tabla seleccionada."
          );
        }

        // console.log(obtenerFechaFormateada(fechaInicio).toISOString(), "cccc");
        // console.log(obtenerFechaFormateadaFin(fechaFin).toISOString(), "xxxx");

        const params = {
          numeroNave:
            resultadosnave[0].CodigoLote +
            " " +
            resultadosnave[0].DescripcionLote,
          nombreNave: resultadosnave[0].DescripcionNave,
          Descripcion: resultadosnave[0].DescripcionLote,
          descripcionTabla: resultados[0].Descripcion,
          nave: naveSeleccionada,
          cantidadSurcos: resultados[0].CantidadSurcos,
          tabla: tablaSeleccionada,
          codigoLote: resultados[0].CodigoLote,
          mostrarReporte: true,
          fechaIni: obtenerFechaFormateada(fechaInicio).toISOString(),
          fechaFin: obtenerFechaFormateadaFin(fechaFin).toISOString()
        };

        navegacion.navigate("ActividadesScreen", params);
      }
      //onsole.log(resultados, " resultados tablas");

      /* setLoadingActividades(true);

      const params = {
        codigoNave: naveSeleccionada,
        codigoTabla: tablaSeleccionada,
        fechaInicio: fechaInicio.toISOString().split("T")[0],
        fechaFin: fechaFin.toISOString().split("T")[0]
      };

      console.log(params, " parametros actividades");*/

      // const datosExtras = await cargarReportesAct(params);
    } catch (error) {
      console.error("Error al manejar reporte de actividades:", error);
      Alert.alert("Error", "Ocurrió un error al cargar el reporte.");
    } finally {
      setLoadingActividades(false);
    }
  };

  const obtenerFechaFormateada = fecha => {
    // 1️⃣ Crear fecha local plana (sin conversión de zona)
    const fechaLocalPlana = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
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

  const obtenerFechaFormateadaFin = fecha => {
    // 1️⃣ Crear fecha local plana (sin conversión de zona)
    const fechaLocalPlana = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
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
    // console.log(fechaFinDiaLocalSinUTC, "antes de ");
    return fechaFinDiaLocalSinUTC;
  };
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Función para manejar el reporte por Empleados
  const manejarReporteEmpleados = async () => {
    setLoadingEmpleados(true);

    try {
      if (!naveSeleccionada || !tablaSeleccionada) {
        Alert.alert("Del Campo y Asociados", "Seleccione nave y tabla.");
        return;
      }

      if (!fechaInicio || !fechaFin) {
        Alert.alert(
          "Del Campo y Asociados",
          "Seleccione las fechas de inicio y fin para el reporte."
        );
        return;
      }

      if (fechaInicio > fechaFin) {
        Alert.alert(
          "Del Campo y Asociados",
          "La fecha inicial no puede ser posterior a la final."
        );
        return;
      }

      if (realmInstance !== null) {
        const resultadosnave = realmInstance
          .objects("Nave")
          .filtered("CodigoNave == $0 ", naveSeleccionada);

        const resultados = realmInstance
          .objects("Tablas")
          .filtered(
            "CodigoTabla == $0 AND CodigoNave == $1",
            tablaSeleccionada,
            naveSeleccionada
          );

        if (resultados.length === 0) {
          Alert.alert(
            "Del Campo y Asociados",
            "No se encontró la tabla seleccionada."
          );
        }

        /* const FechInCero = new Date(fechaInicio.setUTCHours(0, 0, 0, 0));
        const FechaFinCero = new Date(fechaFin.setUTCHours(0, 0, 0, 0));
        console.log(FechInCero, FechaFinCero);*/

        //conos;
        const params = {
          numeroNave:
            resultadosnave[0].CodigoLote +
            " " +
            resultadosnave[0].DescripcionLote,
          nombreNave: resultadosnave[0].DescripcionNave,
          Descripcion: resultadosnave[0].DescripcionLote,
          descripcionTabla: resultados[0].Descripcion,
          nave: naveSeleccionada,
          cantidadSurcos: resultados[0].CantidadSurcos,
          tabla: tablaSeleccionada,
          codigoLote: resultados[0].CodigoLote,
          mostrarReporte: true,
          fechaIni: obtenerFechaFormateada(fechaInicio).toISOString(),
          fechaFin: obtenerFechaFormateadaFin(fechaFin).toISOString()
        };
        console.log(params);
        navegacion.navigate("Reporte Empleados", params);
      }

      //  console.log(params)
    } catch (error) {
      console.error("Error al manejar reporte de empleados:", error);
      Alert.alert("Error", "Ocurrió un error al cargar el reporte.");
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const [modales, setModales] = useState({});
  return (
    <View style={estilos.contenedor}>
        <View style={{height:"10%", display:"flex", justifyContent:"flex-start", alignItems:"center"}}>
          <CustomTitle title="- Reportes -" />
      </View>
     
    <View style={{paddingTop:30, width:"100%"}}>
         <DropdownComponent
          label="Naves"
          placeholder="Seleccione una nave"
          options={navesRealm}
          onChange={item => {
            if (item) {
              setNaveSeleccionada(item.value);
            } else {
              setNaveSeleccionada(null);
            }
          }}
          selectedValue={naveSeleccionada}
          style={{ backgroundColor: "white", borderRadius: 10 }}
        />
      <DropdownComponent

        label="Tabla"
        placeholder="Seleccione una tabla"
        options={tablasFiltradas}
        onChange={item => {
          if (item) {
            setTablaSeleccionada(item.value);
          } else {
            setTablaSeleccionada(null);
          }
        }}
        selectedValue={tablaSeleccionada}
        style={{ backgroundColor: "white", borderRadius: 10 }}
      />

      <View style={{ flexDirection: width > 600 ? "row" : "column", justifyContent: "space-between" }}>
        <TouchableOpacity
          onPress={() => setMostrarFechaInicio(true)}
          style={[estilos.selectorFecha, { width: width > 600 ? "45%" : "100%" }]}
        >
          <Text style={estilos.etiquetaFecha}>Fecha Inicial</Text>
          <View style={estilos.filaFecha}>
            <Text style={[estilos.textoFecha, { fontSize: width > 600 ? 16 : 13 }]}>
              {fechaInicio ? formatearFecha(fechaInicio) : "Seleccione fecha"}
            </Text>
            <Image
              source={calendario}
              style={estilos.iconoCalendario}
              resizeMode="center"
            />
          </View>
          {mostrarFechaInicio &&
            <DateTimePicker
              value={fechaInicio || new Date()}
              mode="date"
              display="default"
              onChange={(evento, fechaSeleccionada) => {
                setMostrarFechaInicio(false);
                if (fechaSeleccionada) setFechaInicio(fechaSeleccionada);
              }}
            />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMostrarFechaFin(true)}
          style={[estilos.selectorFecha, { width: width > 600 ? "45%" : "100%" }]}
        >
          <Text style={estilos.etiquetaFecha}>Fecha Final</Text>
          <View style={estilos.filaFecha}>
            <Text style={[estilos.textoFecha, { fontSize: width > 600 ? 16 : 14 }]}>
              {fechaFin ? formatearFecha(fechaFin) : "Seleccione fecha"}
            </Text>
            <Image
              source={calendario}
              style={estilos.iconoCalendario}
              resizeMode="center"
            />
          </View>
          {mostrarFechaFin &&
            <DateTimePicker
              value={fechaFin || new Date()}
              mode="date"
              display="default"
              onChange={(evento, fechaSeleccionada) => {
                setMostrarFechaFin(false);
                if (fechaSeleccionada) setFechaFin(fechaSeleccionada);
              }}
            />}
        </TouchableOpacity>
      </View>

      <View style={[estilos.contenedorBotones,{flexDirection: width > 600 ? "row" : "column"}]}>
        <TouchableOpacity
          onPress={manejarReporteActividades}
          style={[estilos.botonReporte, { width: width > 600 ? "45%" : "100%" , flexDirection: width > 600 ? "column" : "row" }]}
        >
          <Image
            source={proteccion}
            style={{width:width > 600 ? 90 : 60, height: width > 600 ? 90 : 70, marginRight: width > 600 ? 0 : 20}}
            resizeMode="contain"
          />
          <Text style={estilos.textoBoton}>Reporte por Actividades</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={manejarReporteEmpleados}
          style={[estilos.botonReporte, { width: width > 600 ? "45%" : "100%", flexDirection: width > 600 ? "column" : "row" }]}
        >
          <Image
            source={agricultor}
            style={{width:width > 600 ? 90 : 60, height: width > 600 ? 90 : 70, marginRight: width > 600 ? 0 : 20}}
            resizeMode="contain"
          />
          <Text style={estilos.textoBoton}>Reporte por Empleados</Text>
        </TouchableOpacity>
      </View>
    </View>
     <CustomOptions setModales={setModales}  visible={false} />
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {  
    flex: 1,  
    paddingHorizontal:20,  
    backgroundColor: "#f0fff0",
    paddingTop :5,
    zIndex:0,
     alignItems: "center",
  },
  contenedorDropdown: {
    marginBottom: 20
  },
  contenedorBotones: {
    
  },

  botonReporte: {
    backgroundColor: "white",
    marginHorizontal:"auto",
    borderRadius: 22,
    elevation: 7,
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 3,
    borderWidth: 0.5
  },

 
  imagenBoton2: {
    width: 90,
    height: 90
  },
  textoBoton: {
    fontSize: 15,
    textAlign: "center",
    color: "gray",
    fontWeight: "bold",
    marginTop: 10
  },
  selectorFecha: {
  
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10
  },
  etiquetaFecha: {
    width: 100,
    position: "relative",
    top: -10,
    marginHorizontal:'auto' ,
    zIndex: 1,
    backgroundColor: "#f0fff0",
    fontWeight: "bold",
    color: "black",
    textAlign: "center"
  },
  filaFecha: {
    flexDirection: "row",
    justifyContent: "center"
  },
  textoFecha: {
    textDecorationLine: "underline",
    textAlign: "center",
    paddingTop: 5,
    paddingBottom: 15,
    color: "#333",
    paddingLeft: 5,
   
  },
  iconoCalendario: {
    marginLeft: 10,
    width: 33,
    height: 33
  }
});


export default ReportesScreen;
