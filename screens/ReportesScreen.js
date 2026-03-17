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
import * as services from "../services/services";
import { SurcosContext } from "../Contexts/SurcosContext";
import { Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_MARGIN = 8;
const ITEM_WIDTH = SCREEN_WIDTH / 3 - ITEM_MARGIN * 2;
import { getRealmInstance } from "../realm";

const ReportesScreen = () => {
  const navegacion = useNavigation();

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

  const formatearFecha2 = fecha => {
    if (!fecha) return "";
    const day = String(fecha.getDate()).padStart(2, "0");
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const year = fecha.getFullYear();
    return `${year}-${month}-${day}`;
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

  const cargarReportesEmp = async userData => {
    setLoadingEmpleados(true);
    try {
      if (!userData) {
        console.warn("userData es undefined");
        return null;
      }

      const { codigoNave, codigoTabla, fechaInicio, fechaFin } = userData;

      const realm = await getRealmInstance();

      const codigoTemporada = CodigoTemporada;

      const tablas = realm
        .objects("Tablas")
        .filtered(
          `CodigoNave == "${codigoNave}" && CodigoTabla == ${codigoTabla}`
        );

      if (!tablas || tablas.length === 0) {
        console.warn("No se encontró información de la tabla.");
        return null;
      }

      const codigoLote = tablas[0].CodigoLote.toString();
      const jefeNave = tablas[0].CodigoJefeNave;

      const parametros = {
        codigoLote,
        codigoNave,
        codigoTemporada,
        fechaInicio,
        fechaFin,
        codigoJefeNave: jefeNave,
        codigoTabla: parseInt(codigoTabla)
      };
      //console.log(parametros, "dwqdw")

      //   console.log(" enviados:", parametros);

      const response = await services.obtenerReporteEmpleados(parametros);
      const empleados = response.datos || [];

      if (!response.datos || response.datos.length === 0) {
        //console.warn("No se recibió información del backend.");
        // return null;
      }
      //  console.log(response.datos, "dedwa")

      setListaEmpleados(response.datos);
      //console.log(listaEmpleados, "edwas")
      //  setListaEmpleados(listaReporteEmpleados)
      realm.write(() => {
        realm.delete(realm.objects("ReporteEmpleados"));
        empleados.forEach(item => {
          realm.create(
            "ReporteEmpleados",
            {
              CodigoEmpleado: item.CodigoEmpleado,
              Nombre: item.Nombre,
              CantidadActividades: String(item.CantidadActividades)
            },
            "modified"
          );
        });
      });

      setListaEmpleados(empleados);

      return {
        codigoLote,
        codigoJefeNave: jefeNave,
        datos: empleados
      };
    } catch (error) {
      console.error("Error en cargarReportesEmp:", error.message);
      return null;
    } finally {
      setLoadingEmpleados(false);
    }
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.contenedorDropdown}>
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
      </View>
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

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity
          onPress={() => setMostrarFechaInicio(true)}
          style={estilos.selectorFecha}
        >
          <Text style={estilos.etiquetaFecha}>Fecha Inicial</Text>
          <View style={estilos.filaFecha}>
            <Text style={estilos.textoFecha}>
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
          style={estilos.selectorFecha}
        >
          <Text style={estilos.etiquetaFecha}>Fecha Final</Text>
          <View style={estilos.filaFecha}>
            <Text style={estilos.textoFecha}>
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

      <View style={estilos.contenedorBotones}>
        <TouchableOpacity
          onPress={manejarReporteActividades}
          style={estilos.botonReporte}
        >
          <Image
            source={proteccion}
            style={estilos.imagenBoton2}
            resizeMode="contain"
          />
          <Text style={estilos.textoBoton}>Reporte por Actividades</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={manejarReporteEmpleados}
          style={estilos.botonReporte}
        >
          <Image
            source={agricultor}
            style={estilos.imagenBoton}
            resizeMode="contain"
          />
          <Text style={estilos.textoBoton}>Reporte por Empleados</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0fff0",
    paddingTop: 30
  },
  contenedorDropdown: {
    marginBottom: 20
  },
  contenedorBotones: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center"
  },

  botonReporte: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 22,
    elevation: 7,
    alignItems: "center",
    height: 150,
    width: ITEM_WIDTH,
    margin: ITEM_MARGIN,
    borderWidth: 0.5
  },

  imagenBoton: {
    width: 90,
    height: 90
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
    width: "45%",
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 10
  },
  etiquetaFecha: {
    width: 100,
    position: "relative",
    top: -10,
    right: -20,
    zIndex: 1,
    backgroundColor: "#f0fff0",
    fontWeight: "bold",
    color: "black"
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
    fontSize: 13
  },
  iconoCalendario: {
    marginLeft: 10,
    width: 33,
    height: 33
  }
});

export default ReportesScreen;
