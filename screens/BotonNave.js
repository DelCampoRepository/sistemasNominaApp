import React, { useEffect, useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect
} from "@react-navigation/native";
import localStorage from "../utils/localStorage";
import { getRealmInstance } from "../realm";
import { SurcosContext } from "../Contexts/SurcosContext";
import { useCallback } from "react";
import { Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_MARGIN = 40;
const ITEM_WIDTH = SCREEN_WIDTH / 2 - ITEM_MARGIN * 3;

const BotonNave = () => {
  const { codigoLote, setNave, setCodigoTabla } = useContext(SurcosContext);
  const route = useRoute();
  const navigation = useNavigation();

  const [tablaNorte, setTablaNorte] = useState(false);
  const [tablaSur, setTablaSur] = useState(false);
  const [tablas, setTablas] = React.useState([]);
  const [loading, setLoading] = useState(false);

  const [naveSeleccionada, setNaveSeleccionada] = useState(numeroNave);
  const [empleadosPorTabla, setEmpleadosPorTabla] = useState({});
  const [listaTablas, setListaTablas] = useState([]);
  const [ActividadesPorTabla, setActividadesPorTabla] = useState({});

  const { numeroNave, nombreNave, nave, codLote } = route.params || {};
  const [realmInstance, setRealmInstance] = useState(null);

  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
  }, []);

  useEffect(
    () => {
      if (realmInstance) {
      }
    },
    [realmInstance]
  );

  useEffect(
    () => {
      const cargarTablas = async () => {
        if (!numeroNave || !nombreNave || !realmInstance) return;

        const resultado = await obtenerTablasPorNave(numeroNave, nombreNave);
        //   console.log(JSON.stringify(resultado, null, 2));

        const listas = [];

        resultado.forEach(tabla => {
          listas.push({
            descripcion: tabla.Descripcion,
            codigoTabla: tabla.CodigoTabla,
            CodigoLote: tabla.CodigoLote,
            cantidadSurcos: tabla.CantidadSurcos
          });
        });

        // console.log(resultado);
        setListaTablas(listas);
      };

      cargarTablas();
    },
    [numeroNave, nombreNave, realmInstance]
  );

  useFocusEffect(
    useCallback(
      () => {
        calcularEmpleadosTotales();
        calcularActividadesTotales();
      },
      [realmInstance, listaTablas]
    )
  );

  useFocusEffect(
    React.useCallback(() => {
      async function estadosSurcos() {
        await verificacionTabla("NORTE");
        await verificacionTabla("SUR");
      }
      estadosSurcos();
    }, [])
  );

  useEffect(
    () => {
      setNave(nombreNave.substring(0, 2));
    },
    [nombreNave]
  );

  const obtenerTablasPorNave = async (numeroNave, nombreNave) => {
    try {
      if (!realmInstance) return { norte: [], sur: [] }; // si aún no cargó

      // Extraer los valores de los parámetros recibidos
      const codigoLote = parseInt(numeroNave.split(" - ")[0]);
      const codigoNave = nombreNave.split(" - ")[0]; // "E2 - Nave A" => "E2"
      console.log("LOTES", codigoLote);
      console.log("NAVE", codigoNave);
      // console.log(codigoLote, codigoNave);
      const tablas = realmInstance
        .objects("Tablas")
        .filtered(
          "CodigoLote == $0 AND CodigoNave == $1",
          codigoLote,
          codigoNave
        );
      console.log("lista de tablas", tablas);
      if (tablas.length === 0) {
        //   console.log(`No se encontraron tablas para la nave ${numeroNave}`);
        return { norte: [], sur: [] };
      }

      const tablasNave = tablas
        .filter(tabla => tabla.CodigoNave === codigoNave)
        .map(tabla => tabla);

      console.log(JSON.stringify(tablasNave, 2, null));
      // Separar Norte y Sur
      const tablaNorte = tablas.filtered("CodigoTabla == 1");
      const tablaSur = tablas.filtered("CodigoTabla == 2");

      // console.log('Tablas filtradas Norte:', tablaNorte);
      //console.log('Tablas filtradas Sur:', tablaSur);

      return tablasNave;
    } catch (error) {
      console.error("Error al obtener tablas de Realm:", error);
      return { norte: [], sur: [] };
    }
  };

  const calcularEmpleadosTotales = () => {
    if (!realmInstance || !listaTablas.length) return;

    const totales = {};

    listaTablas.forEach(tabla => {
      const resultados = realmInstance
        .objects("EmpleadoCapturado")
        .filtered(
          "CodigoLote == $0 AND CodigoNave == $1 AND CodTabla == $2 AND FechaCaptura == $3",
          String(codLote),
          nave,
          String(tabla.codigoTabla),
          new Date(GenerarFecha(true))
        );

      const empleadosUnicos = new Set(resultados.map(e => e.CodigoEmpleado));

      totales[tabla.codigoTabla] = empleadosUnicos.size;
    });

    setEmpleadosPorTabla(totales);
  };

  const calcularActividadesTotales = () => {
    if (!realmInstance || !listaTablas.length) return;
    const totales = {};

    listaTablas.forEach(tabla => {
      const resultados = realmInstance
        .objects("EmpleadoCapturado")
        .filtered(
          "CodigoLote == $0 AND CodigoNave == $1 AND CodTabla == $2 AND FechaCaptura == $3",
          String(codLote),
          nave,
          String(tabla.codigoTabla),
          new Date(GenerarFecha(true))
        );

      const ActividadesUnicas = new Set(
        resultados.map(e => `${e.CodigoActividad}-${e.CodigoAvance}`)
      );

      totales[tabla.codigoTabla] = ActividadesUnicas.size;

      //  console.log(totales, "actividades totales");
    });
    setActividadesPorTabla(totales); // 🔥 esto fuerza el re-render
  };

  const GenerarFecha = (formato = false) => {
    //   console.log(limiteMaximoCaptura, "limiteMaximoCaptura");
    const ahora = new Date();
    let fechaFormateada = "";
    //if (horaExtra) ahora.setHours(ahora.() + limiteMaximoCaptura);
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    if (formato) fechaFormateada = `${año}-${mes}-${dia}`;
    else fechaFormateada = `${dia}/${mes}/${año}`;
    return fechaFormateada;
  };

  const obtenerEmpleadosTotales = codtabla => {
    try {
      if (!realmInstance) return 0;

      const resultados = realmInstance
        .objects("EmpleadoCapturado")
        .filtered(
          "CodigoLote == $0 AND CodigoNave == $1 AND CodTabla == $2",
          String(codLote),
          nave,
          String(codtabla)
        );
      //console.log(resultados.length, "empleados encontrados");
      // Quitar duplicados por CodigoEmpleado
      const empleadosUnicos = [
        ...new Map(resultados.map(e => [e.CodigoEmpleado, e])).values()
      ];

      return empleadosUnicos.length;
    } catch (e) {
      console.log("Error en handleIniciar:", e);
      return 0;
    }
  };

  const obtenerTotalAvances = codtabla => {
    try {
      if (!realmInstance) return 0;

      const resultados = realmInstance
        .objects("EmpleadoCapturado")
        .filtered(
          "CodigoLote == $0 AND CodigoNave == $1 AND CodTabla == $2 AND FechaCaptura == $3",
          String(codLote),
          nave,
          String(codtabla),
          new Date(GenerarFecha(true))
        );
      // console.log(resultados, "empleados encontrados");
      // Quitar duplicados por CodigoEmpleado
      const totalAvances = resultados.reduce(
        (acc, e) => acc + (Number(e.Avances) || 0),
        0
      );
      return totalAvances;
    } catch (e) {
      console.log("Error en handleIniciar:", e);
      return 0;
    }
  };
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        key={item.codigoTabla}
        onPress={() => {
          setCodigoTabla(item.codigoTabla);
          navigation.navigate("ActividadesScreen", {
            numeroNave,
            nombreNave,
            codigoLote: item.CodigoLote, // o CodigoTabla
            descripcionTabla: item.descripcion,
            nave: nave,
            cantidadSurcos: item.cantidadSurcos,
            tabla: item.codigoTabla
          });
        }}
        style={styles.tablaCard}
      >
        <View style={styles.imageContainer}>
          {empleadosPorTabla[item.codigoTabla] > 0 &&
            <Image
              source={require("../assets/check...png")}
              style={styles.checkIcon}
            />}

          <Image
            source={require("../assets/plantas.png")}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.tablaText}>
          {item.descripcion}
        </Text>
        <Text style={styles.estiloEmp}>
          {" "}Emp: {empleadosPorTabla[item.codigoTabla] || 0}
        </Text>
        <Text style={styles.estilotabla}>
          Act: {ActividadesPorTabla[item.codigoTabla] || 0}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading
        ? <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00aa00" />
          </View>
        : <View style={styles.loadingOverlay}>
            {/* Encabezado */}
            <View style={styles.headerContainer}>
              <View style={styles.subcontainer}>
                <Text style={[styles.headerDetailText, styles.sharedoption]}>
                  {numeroNave} {nombreNave} {GenerarFecha()}
                </Text>
              </View>
            </View>

            <FlatList
              data={listaTablas}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              numColumns={2}
              columnWrapperStyle={{
                justifyContent: "space-between",
                paddingHorizontal: ITEM_MARGIN
              }}
              showsVerticalScrollIndicator={true}
            />
          </View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fff0",
    paddingTop: 17,
    width: "100%"
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  // Tarjeta/botón de tabla
  tablaCard: {
    width: ITEM_WIDTH,
    margin: ITEM_MARGIN,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    elevation: 3
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1, // 🔥 cuadrado y responsive
    justifyContent: "center",
    alignItems: "center"
  },
  icon: {
    width: "40%",
    height: "40%"
  },

  tablaIcon: {
    width: 60,
    height: 65,
    left: 10
  },
  checkIcon: {
    width: "10%",
    height: "10%",
    position: "absolute",
    top: 0,
    right: 0
  },
  // Texto de la tabla
  tablaText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 6,
    textAlign: "center"
  },
  estiloEmp: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#787272ff",
    textAlign: "center",
    paddingVertical: 2,
    marginTop: -2
  },
  estilotabla: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#787272ff",
    textAlign: "center",
    paddingVertical: 4
  },
  headerContainer: {
    backgroundColor: "#B3E0B3",
    paddingTop: 17,
    paddingBottom: 16,
    marginBottom: 16,
    width: "100%",
    alignItems: "center"
  },
  subcontainer: {
    paddingTop: 12,
    paddingBottom: 8
  },
  headerDetailText: {
    fontSize: 13.5,
    color: "#333",
    fontWeight: "bold"
  },
  sharedoption: {
    paddingBottom: 1
  }
});

export default BotonNave;
