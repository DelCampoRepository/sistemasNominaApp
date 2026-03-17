import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getRealmInstance } from "../realm";
import { tr } from "date-fns/locale";
import { FlatList } from "react-native-gesture-handler";
import { Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_MARGIN = 40;
const ITEM_WIDTH = SCREEN_WIDTH / 2 - ITEM_MARGIN * 3;

export default function Actividades() {
  const navigation = useNavigation();
  const [naves, setNaves] = useState([]);
  const [realmInstance, setRealmInstance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
  }, []);

  useEffect(
    () => {
      if (realmInstance != null) {
        const getNaves = async () => {
          try {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 500);

            const naves = realmInstance.objects("Nave");

            const NavesFinales = [];

            naves.forEach(nave => {
              console.log(new Date(GenerarFecha(false, true)));
              const empleados = realmInstance
                .objects("EmpleadoCapturado")
                .filtered(
                  "CodigoLote == $0 AND CodigoNave == $1 AND FechaCaptura == $2 ",
                  String(nave.CodigoLote),
                  String(nave.CodigoNave),
                  new Date(GenerarFecha(false, true))
                );
              const navePlana = JSON.parse(JSON.stringify(nave));
              NavesFinales.push({
                ...navePlana,
                tieneEmp: empleados.length > 0
              });
              console.log(JSON.stringify(NavesFinales, 2, null), "sss");
              setNaves(NavesFinales);
            });
          } catch (error) {
            console.log(error);
          }
        };

        getNaves();
      }
    },
    [realmInstance]
  );

  const handleNavePress = async nave => {
    navigation.navigate("BotonNave", {
      numeroNave: `${nave.CodigoLote} - ${nave.DescripcionLote}`,
      nombreNave: `${nave.CodigoNave} - ${nave.DescripcionNave}`,
      nave: nave.CodigoNave,
      codLote: nave.CodigoLote
    });
  };

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

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleNavePress(item)}
      >
        {item.tieneEmp &&
          <Image
            source={require("../assets/check...png")}
            style={styles.checkIcon}
          />}
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/naves.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          {item.tieneSurcos &&
            <Image
              source={require("../assets/check...png")} // 👈 Ruta de tu imagen de check
              style={styles.checkIcon}
            />}
        </View>

        <Text style={styles.loteTexto}>
          {item.CodigoLote} - {item.DescripcionLote.trim()}
        </Text>

        <Text style={styles.naveTexto}>
          {item.CodigoNave} - {item.DescripcionNave}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container1}>
      <View style={styles.headerContainer}>
        <View style={styles.subcontainer}>
          <Text style={[styles.headerDetailText, styles.sharedoption]}>
            {GenerarFecha()}
          </Text>
        </View>
      </View>

      <FlatList
        data={naves}
        keyExtractor={item => item.CodigoNave.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={{}}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: ITEM_MARGIN
        }}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container1: {
    flex: 1,
    backgroundColor: "#f0fff0"
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
  checkIcon: {
    width: 40,
    height: 40,
    position: "absolute",
    top: 6,
    right: 1
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

  loteTexto: {
    fontSize: 16,
    fontWeight: "bold",

    textAlign: "center"
  },

  naveTexto: {
    fontSize: 14,
    color: "#555",
    textAlign: "center"
  },

  headerDetailText: {
    fontSize: 13.5,
    color: "#333",
    fontWeight: "bold"
  },
  subcontainer: {
    paddingTop: 12,
    paddingBottom: 8
  },

  headerContainer: {
    backgroundColor: "#B3E0B3",
    paddingTop: 17,
    paddingBottom: 16,
    marginBottom: 16,
    width: "100%",
    alignItems: "center"
  }
});
