import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getRealmInstance } from "../realm";
import { guardarPatron, PUNTOS_MINIMOS_PATRON } from "../utils/patronUtils";
import { useSesionStore } from "../store/useSesionStore";
import PatronLock from "../src/components/PatronLock";

export default function CrearPatronScreen({ navigation }) {
  const [realmInstance, setRealmInstance] = useState(null);
  const [nomUsuario, setNomUsuario] = useState(null);
  const [primerPatron, setPrimerPatron] = useState(null);
  const [paso, setPaso] = useState("dibujar"); // dibujar | confirmar
  const setPatronHabilitado = useSesionStore((s) => s.setPatronHabilitado);
  const lockRef = useRef(null);

  useEffect(() => {
    (async () => {
      const instancia = await getRealmInstance();
      setRealmInstance(instancia);
      const userData = instancia.objects("UserData");
      if (userData.length > 0) {
        setNomUsuario(userData[0].nomUsuario);
      } else {
        Alert.alert("Error", "No hay una sesión activa para asociar el patrón.");
        navigation.goBack();
      }
    })();
  }, []);

  function manejarPatronIncompleto() {
    Alert.alert("Patrón muy corto", `Conecta al menos ${PUNTOS_MINIMOS_PATRON} puntos.`);
  }

  function manejarPatronCompleto(patronArray) {
    if (patronArray.length < PUNTOS_MINIMOS_PATRON) {
      lockRef.current?.marcarEstado("error");
      Alert.alert("Patrón muy corto", `Conecta al menos ${PUNTOS_MINIMOS_PATRON} puntos.`);
      return;
    }

    if (paso === "dibujar") {
      setPrimerPatron(patronArray);
      setPaso("confirmar");
      lockRef.current?.marcarEstado("exito");
      return;
    }

    // paso === "confirmar"
    const coincide =
      primerPatron.length === patronArray.length &&
      primerPatron.every((valor, i) => valor === patronArray[i]);

    if (!coincide) {
      lockRef.current?.marcarEstado("error");
      Alert.alert("No coincide", "El patrón no coincide con el anterior, inténtalo de nuevo.");
      setPrimerPatron(null);
      setPaso("dibujar");
      return;
    }

    guardarPatron(realmInstance, nomUsuario, patronArray);
    setPatronHabilitado(true);
    lockRef.current?.marcarEstado("exito");
    Alert.alert("Listo", "Tu patrón de acceso se guardó correctamente.", [
      { text: "OK", onPress: () => navigation.goBack() }
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Crear patrón</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.contenido}>
        <Text style={styles.instrucciones}>
          {paso === "dibujar"
            ? "Dibuja el patrón que usarás para iniciar sesión."
            : "Dibújalo de nuevo para confirmarlo."}
        </Text>

        <View style={styles.lockContainer}>
          <PatronLock
            ref={lockRef}
            size={260}
            onPatronCompleto={manejarPatronCompleto}
            onPatronIncompleto={manejarPatronIncompleto}
          />
        </View>

        {paso === "confirmar" && (
          <TouchableOpacity
            style={styles.botonSecundario}
            onPress={() => {
              setPrimerPatron(null);
              setPaso("dibujar");
              lockRef.current?.limpiar();
            }}
          >
            <Text style={styles.botonSecundarioTexto}>Empezar de nuevo</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0fff0"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black"
  },
  contenido: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  instrucciones: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    marginBottom: 30
  },
  lockContainer: {
    marginBottom: 30
  },
  botonSecundario: {
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  botonSecundarioTexto: {
    color: "green",
    fontWeight: "bold"
  }
});
