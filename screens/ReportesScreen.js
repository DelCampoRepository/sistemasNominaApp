import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DropdownComponent from "../components/Dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import agricultor from "../assets/agricultor.png";
import proteccion from "../assets/proteccion.png";

import {  useWindowDimensions } from 'react-native';
import { Dimensions } from "react-native";
import CustomOptions from "../src/components/CustomOptions";
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
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);

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
          label: `${nave.CodigoLote}- ${nave.CodigoNave} - ${nave.DescripcionNave ||
            "Sin Descripción"}`,
          value: nave.CodigoNave,
          lote:nave.CodigoLote
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

        const datosTabla = realmInstance
          .objects("Tablas")
          .filtered(
            "CodigoTabla == $0 AND CodigoNave == $1",
            tablaSeleccionada,
            naveSeleccionada
          );

        if (datosTabla.length === 0) {
          Alert.alert(
            "Del Campo y Asociados",
            "No se encontró la tabla seleccionada."
          );
        }

        
          //console.log(resultados);
        // console.log(obtenerFechaFormateada(fechaInicio).toISOString(), "cccc");
        // console.log(obtenerFechaFormateadaFin(fechaFin).toISOString(), "xxxx");

        const params = {
          nave: naveSeleccionada,
          tabla:tablaSeleccionada,
          lote: loteSeleccionado,
          fechaIni: fechaInicio.getTime(),
          fechaFin: fechaFin.getTime(),
          cantidadSurcos: datosTabla[0].CantidadSurcos,
          descLote: resultadosnave[0].DescripcionLote,
          descNave: resultadosnave[0].DescripcionNave,
          descTabla: datosTabla[0].Descripcion
        };

        navegacion.navigate("ReporteAct", params);
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
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      <View style={[estilos.header, { paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 18 : 18 }]}>
        <Text style={estilos.headerTexto}>Reportes</Text>
        <Text style={estilos.headerSubtexto}>Genera reportes por actividad o por empleado</Text>
      </View>

      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={estilos.scrollContenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.filtroCard}>
          <Text style={estilos.filtroCardTitulo}>Ubicación</Text>

          <DropdownComponent
            label="Naves"
            placeholder="Seleccione una nave"
            options={navesRealm}
            onChange={item => {
              if (item) {
                setLoteSeleccionado(item.lote);
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
        </View>

        <View style={estilos.filtroCard}>
          <Text style={estilos.filtroCardTitulo}>Periodo</Text>

          <View style={{ flexDirection: width > 600 ? "row" : "column", gap: 12 }}>
            <TouchableOpacity
              onPress={() => setMostrarFechaInicio(true)}
              activeOpacity={0.8}
              style={[estilos.selectorFecha, { width: width > 600 ? "48%" : "100%" }]}
            >
              <View style={estilos.fechaIconCircle}>
                <Ionicons name="calendar-outline" size={20} color="#16a34a" />
              </View>
              <View>
                <Text style={estilos.etiquetaFecha}>Fecha inicial</Text>
                <Text style={estilos.textoFecha}>
                  {fechaInicio ? formatearFecha(fechaInicio) : "Seleccione fecha"}
                </Text>
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
              activeOpacity={0.8}
              style={[estilos.selectorFecha, { width: width > 600 ? "48%" : "100%" }]}
            >
              <View style={estilos.fechaIconCircle}>
                <Ionicons name="calendar-outline" size={20} color="#16a34a" />
              </View>
              <View>
                <Text style={estilos.etiquetaFecha}>Fecha final</Text>
                <Text style={estilos.textoFecha}>
                  {fechaFin ? formatearFecha(fechaFin) : "Seleccione fecha"}
                </Text>
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
        </View>

        <Text style={estilos.seccionTitulo}>Generar reporte</Text>

        <View style={[estilos.contenedorBotones, { flexDirection: width > 600 ? "row" : "column" }]}>
          <TouchableOpacity
            onPress={manejarReporteActividades}
            activeOpacity={0.85}
            style={[estilos.botonReporte, { width: width > 600 ? "48%" : "100%" }]}
          >
            <View style={[estilos.botonIconCircle, { backgroundColor: "#fef3c7" }]}>
              <Image source={proteccion} style={estilos.botonIcono} resizeMode="contain" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={estilos.textoBoton}>Reporte por Actividades</Text>
              <Text style={estilos.textoBotonSub}>Avance por lote y tabla</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={manejarReporteEmpleados}
            activeOpacity={0.85}
            style={[estilos.botonReporte, { width: width > 600 ? "48%" : "100%" }]}
          >
            <View style={[estilos.botonIconCircle, { backgroundColor: "#e0f2fe" }]}>
              <Image source={agricultor} style={estilos.botonIcono} resizeMode="contain" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={estilos.textoBoton}>Reporte por Empleados</Text>
              <Text style={estilos.textoBotonSub}>Actividades capturadas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomOptions setModales={setModales} visible={false} />
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#f0fff0",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 22,
    paddingBottom: 26,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    width: "100%",
  },
  headerTexto: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerSubtexto: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 4,
  },
  scrollContenido: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
    width: "100%",
  },
  filtroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  filtroCardTitulo: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  seccionTitulo: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    marginTop: 4,
  },
  contenedorBotones: {
    justifyContent: "space-between",
    gap: 12,
  },
  botonReporte: {
    backgroundColor: "white",
    borderRadius: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  botonIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  botonIcono: {
    width: 32,
    height: 32,
  },
  textoBoton: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "bold",
  },
  textoBotonSub: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  selectorFecha: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 12,
  },
  fechaIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  etiquetaFecha: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "600",
  },
  textoFecha: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    marginTop: 2,
  },
});


export default ReportesScreen;
