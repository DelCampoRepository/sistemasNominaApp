import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getRealmInstance } from "../realm";
import { eliminarPatron, establecerPatronHabilitado, existePatron } from "../utils/patronUtils";
import { useSesionStore } from "../store/useSesionStore";

export default function ConfiguracionScreen({ navigation }) {
  const [realmInstance, setRealmInstance] = useState(null);
  const [nomUsuario, setNomUsuario] = useState(null);
  const [patronExiste, setPatronExiste] = useState(false);
  const [patronActivo, setPatronActivo] = useState(false);
  const setPatronHabilitadoGlobal = useSesionStore((s) => s.setPatronHabilitado);

  useEffect(() => {
    (async () => {
      const instancia = await getRealmInstance();
      setRealmInstance(instancia);
      cargarEstadoPatron(instancia);
    })();
  }, []);

  function cargarEstadoPatron(instancia) {
    const userData = instancia.objects("UserData");
    if (userData.length === 0) return;

    const usuario = userData[0].nomUsuario;
    setNomUsuario(usuario);

    const registro = instancia.objectForPrimaryKey("PatronSchema", usuario);
    setPatronExiste(!!registro);
    setPatronActivo(!!registro && registro.habilitado === true);
  }

  function manejarCambioHabilitado(valor) {
    establecerPatronHabilitado(realmInstance, nomUsuario, valor);
    setPatronActivo(valor);
    setPatronHabilitadoGlobal(valor);
  }

  function manejarEliminarPatron() {
    Alert.alert(
      "Eliminar patrón",
      "¿Seguro que deseas eliminar tu patrón de acceso?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            eliminarPatron(realmInstance, nomUsuario);
            setPatronExiste(false);
            setPatronActivo(false);
            setPatronHabilitadoGlobal(false);
          }
        }
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Configuración</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.seccion}>
        <Text style={styles.tituloSeccion}>Patrón de acceso</Text>
        <Text style={styles.descripcionSeccion}>
          Úsalo para volver a entrar sin escribir tu usuario y contraseña cada vez que cierres la app.
        </Text>

        {patronExiste && (
          <View style={styles.filaSwitch}>
            <Text style={styles.textoFila}>Usar patrón para iniciar sesión</Text>
            <Switch value={patronActivo} onValueChange={manejarCambioHabilitado} />
          </View>
        )}

        <TouchableOpacity
          style={styles.boton}
          onPress={() => navigation.navigate("CrearPatron")}
        >
          <Text style={styles.botonTexto}>
            {patronExiste ? "Cambiar patrón" : "Crear patrón"}
          </Text>
        </TouchableOpacity>

        {patronExiste && (
          <TouchableOpacity style={styles.botonEliminar} onPress={manejarEliminarPatron}>
            <Text style={styles.botonEliminarTexto}>Eliminar patrón</Text>
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
  seccion: {
    backgroundColor: "white",
    borderRadius: 15,
    margin: 20,
    padding: 20,
    elevation: 5
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginBottom: 8
  },
  descripcionSeccion: {
    fontSize: 14,
    color: "grey",
    marginBottom: 15
  },
  filaSwitch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15
  },
  textoFila: {
    fontSize: 15,
    color: "black",
    flex: 1,
    marginRight: 10
  },
  boton: {
    backgroundColor: "green",
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 5
  },
  botonTexto: {
    color: "white",
    fontWeight: "bold"
  },
  botonEliminar: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10
  },
  botonEliminarTexto: {
    color: "#c62828",
    fontWeight: "bold"
  }
});
