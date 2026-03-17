import React, { useState, useEffect, useContext, act } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import herramientas from "../assets/herramientas.png";
import { useNavigation } from "@react-navigation/native";
import { getRealmInstance } from "../realm";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import { SurcosContext } from "../Contexts/SurcosContext";
import { Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_MARGIN = 18;
const ITEM_WIDTH = SCREEN_WIDTH / 3 - ITEM_MARGIN * 3;
const ActividadesScreen = ({ route }) => {
  const [loading, setLoading] = useState(false);

  const [realmInstance, setRealmInstance] = useState(null);
  const [empleadosPorActividad, setEmpleadosPorActividad] = useState({});
  const [avancesPorActividad, setAvancesPorActividad] = useState({});
  const [jornalTotalPorActividad, setJornalTotalPorActividad] = useState({});
  const {
    numeroNave,
    nombreNave,
    Descripcion,
    descripcionTabla,
    nave,
    cantidadSurcos,
    tabla,
    codigoLote,
    mostrarReporte,
    fechaIni,
    fechaFin
  } =
    route.params || {};
  console.log("params", route.params);
  /*if (toDate(fechaIni) > toDate("2025-12-25")) {
    console.log(true);
  } else {
    console.log(false);
  }*/

  const [actividades, setActividades] = useState([]);
  const { setCodigoActividad } = useContext(SurcosContext);

  useFocusEffect(
    useCallback(
      () => {
        calcularEmpleadosPorActividad();
        calcularAvancesPorActividad();
      },
      [realmInstance, actividades]
    )
  );

  const navigation = useNavigation();

  const calcularEmpleadosPorActividad = () => {
    if (!realmInstance || !actividades.length) return;

    const totales = {};
    let avancesUnicos = {};
    actividades.forEach(actividad => {
      const key = `${actividad.CodigoActividad}-${actividad.CodigoAvance}`;

      const resultados = realmInstance
        .objects("EmpleadoCapturado")
        .filtered(
          "CodigoLote == $0 AND CodigoNave == $1 AND CodTabla == $2 AND CodigoActividad == $3 AND CodigoAvance == $4 AND FechaCaptura == $5",
          String(codigoLote),
          nave,
          String(tabla),
          String(actividad.CodigoActividad),
          String(actividad.CodigoAvance),
          new Date(fechaIni !== undefined ? fechaIni : GenerarFecha(true))
        );

      const empleadosUnicos = new Set(resultados.map(e => e.CodigoEmpleado));
      //  avancesUnicos = resultados.map(e => e.Avances);
      if (resultados.length > 0) {
      }
      totales[key] = empleadosUnicos.size;
    });

    setEmpleadosPorActividad(totales);
  };

  const calcularAvancesPorActividad = () => {
    if (!realmInstance || !actividades.length) return;

    const totales = {};
    const jornalesTotales = {};

    actividades.forEach(actividad => {
      const key = `${actividad.CodigoActividad}-${actividad.CodigoAvance}`;
      const rendimientoAct = actividad.Rendimiento;

      const resultados = realmInstance
        .objects("EmpleadoCapturado")
        .filtered(
          "CodigoLote == $0 AND CodigoNave == $1 AND CodTabla == $2 AND CodigoActividad == $3 AND CodigoAvance == $4  AND FechaCaptura == $5",
          String(codigoLote),
          nave,
          String(tabla),
          String(actividad.CodigoActividad),
          String(actividad.CodigoAvance),
          new Date(GenerarFecha(true))
        );

      let sumaAvances = 0;

      resultados.forEach(e => {
        sumaAvances += Number(e.Avances || 0);
      });
      totales[key] = sumaAvances;
      jornalesTotales[key] = sumaAvances / rendimientoAct;
      //console.log(jornalesTotales, "jornales");
      //console.log(rendimientoAct, "jornales");
    });

    setJornalTotalPorActividad(jornalesTotales);
    setAvancesPorActividad(totales);
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

  // Función para capitalizar la primera letra de cada palabra y limpiar espacios
  const capitalizarFrase = frase => {
    if (!frase) return "";
    return frase
      .trim()
      .toLowerCase()
      .split(" ")
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
  }, []);

  useEffect(
    () => {
      const getActividades = async () => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
        }, 1000);
        try {
          const actividadesRealm = realmInstance
            .objects("Actividades")
            .filtered(
              `CodigoLote == $0 
            `,
              String(codigoLote)
            );
          setActividades(actividadesRealm);
        } catch (error) {
          console.error("Error al cargar actividades de Realm:", error);
        } finally {
          //setLoading(false);
        }
      };
      if (realmInstance != null) getActividades();
    },
    [realmInstance]
  );

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setCodigoActividad(item.CodigoAvance);

          if (mostrarReporte) {
            const params = {
              CodigoLote: codigoLote,
              CodigoNave: nave,
              CodigoActividad: item.CodigoActividad,
              CodigoAvance: item.CodigoAvance,
              CodTabla: tabla,
              cantidadSurcos: cantidadSurcos
            };

            if (item.NomCortoUnidad !== "SCO") {
              Alert.alert(
                "Del Campo y Asociados",
                `Esta actividad no gestiona surcos.`
              );
              return;
            }
            navigation.navigate("ListaSurcos", {
              CodigoLote: codigoLote,
              CodigoNave: nave,
              CodigoActividad: item.CodigoActividad,
              CodigoAvance: item.CodigoAvance,
              CodTabla: tabla,
              cantidadSurcos: cantidadSurcos,
              fechaIni: fechaIni,
              fechaFin: fechaFin,
              DescripcionTabla: descripcionTabla,
              numeroNave: numeroNave,
              nombreNave: nombreNave,
              descripcionAct: item.Descripcion,
              codigoTabla: tabla
            });
          } else {
            const params = {
              actividadSeleccionada: item,
              naveSeleccionada: {
                numeroNave: numeroNave,
                nombreNave: nombreNave,
                DescripcionTabla: descripcionTabla,
                codigoActividad: item.CodigoActividad,
                CodigoAvance: item.CodigoAvance,
                nave: nave,
                rendimientoTope: item.RendimientoTope,
                codUnidad: item.CodUnidad,
                nomCortoUnidad: item.NomCortoUnidad,
                nomCompletoUnidad: item.NomCompletoUnidad,
                actividadTieneSurcos: item.tieneSurcos,
                cantidadSurcos: cantidadSurcos,
                limiteMaximoCaptura: item.limiteMaximoCaptura,
                codigoTabla: tabla
              }
            };

            navigation.navigate("Empleados", params);
          }
        }}
      >
        <View style={styles.imageContainer}>
          <Image source={herramientas} style={styles.icon} />
        </View>
        <Text style={styles.idTexto}>
          {item.CodigoActividad} - {item.CodigoAvance}
        </Text>
        <Text style={styles.nombreTexto}>
          {capitalizarFrase(item.Descripcion)}
        </Text>
        <Text style={styles.nombreTexto}>
          Av:{" "}
          {
            avancesPorActividad[
              `${item.CodigoActividad}-${item.CodigoAvance}` || 0
            ]
          }
        </Text>
        <Text style={styles.nombreTexto}>
          Jrn:{" "}
          {jornalTotalPorActividad[
            `${item.CodigoActividad}-${item.CodigoAvance}` || 0
          ].toFixed(2)}
        </Text>
        <Text style={styles.nombreTexto}>
          Emp:{" "}
          {empleadosPorActividad[
            `${item.CodigoActividad}-${item.CodigoAvance}`
          ] || 0}
        </Text>
        <Text style={styles.nomcorto}>
          {item.NomCortoUnidad}
        </Text>

        {empleadosPorActividad[`${item.CodigoActividad}-${item.CodigoAvance}`] >
          0 &&
          <Image
            source={require("../assets/check...png")}
            style={styles.checkIcon}
          />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.headerContainer}>
        <View style={styles.subcontainer}>
          <Text style={[styles.headerDetailText, styles.sharedoption]}>
            {nombreNave}
          </Text>

          <Text style={[styles.headerDetailText, styles.sharedoption]}>
            {descripcionTabla}
          </Text>
          <Text style={[styles.headerDetailText, styles.sharedoption]}>
            {GenerarFecha()}
          </Text>
        </View>
      </View>
      {loading
        ? <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00aa00" />
          </View>
        : <FlatList
            keyExtractor={(item, index) =>
              item.CodigoActividad && item.CodigoAvance
                ? `${item.CodigoActividad}-${item.CodigoAvance}`
                : index.toString()}
            numColumns={3}
            data={actividades}
            renderItem={renderItem}
            showsVerticalScrollIndicator={true}
          />}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#f0fff0",
    paddingTop: 18,
    alignItems: "center"
  },
  subcontenedor: {
    flex: 1,
    backgroundColor: "#f0fff0",
    paddingTop: 18,
    alignItems: "center"
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1, // 🔥 cuadrado y responsive
    justifyContent: "center",
    alignItems: "center"
  },

  icon: {
    width: "60%",
    height: "60%"
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  subtitulos: {
    alignItems: "center"
  },
  subtituloTexto: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 20
  },
  lista: {
    alignItems: "center",
    paddingTop: 5,
    paddingHorizontal: 3,
    rowGap: 15,
    marginLeft: -11, // 🔸 Esto lo empuja hacia la derecha

    columnGap: 18
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
  icono: {
    width: 35,
    height: 35,
    marginTop: 1
  },
  idTexto: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    fontSize: 13,
    marginTop: 2
  },
  nombreTexto: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    paddingVertical: 6,
    fontWeight: "bold",
    marginTop: -4
  },
  checkIcon: {
    width: 23,
    height: 23,
    position: "absolute",
    top: 3,
    right: 5
  },

  nomcorto: {
    width: "30%",
    height: 23,
    position: "absolute",
    top: 3,
    left: 5
  },

  headerContainer: {
    backgroundColor: "#B3E0B3",
    paddingVertical: 16,
    marginBottom: 18,
    borderRadius: 2,
    width: "100%"
  },

  subcontainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 2
  },

  headerDetailText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center"
  },
  codlote: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    left: 15.5
  },

  sharedoption: {
    fontWeight: "600"
  }
});

export default ActividadesScreen;
