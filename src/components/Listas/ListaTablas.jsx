import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import TablaCard from "../Cards/TablaCard";
import { getRealmInstance } from "../../../realm";

export default function ListaTablas({
  setDatosEmpleadoNuevo,
  setModales,
  datos,
  setDatos
}) {
  const [realmInstance, setRealmInstance] = useState(null);
  const [tablas, setTablas] = useState([]);
  const [nave, setNave] = useState("");
  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
    setNave(datos.nave);
  }, []);

  useEffect(() => {
    if (realmInstance != null) {
      const listaTablas = realmInstance
        .objects("Tablas")
        .filtered("CodigoNave ==$0 AND CodigoLote ==$1", nave, datos.lote);

      //.filtered('CodigoLote ==$0', )
      setTablas(listaTablas);
    }
  }, [realmInstance]);

  return (
    <View style={{ height: "92%", width: "100%", borderRadius: 10 }}>
      <View style={styles.container}>
        <FlatList
          data={tablas}
          keyExtractor={(item) =>
            `${item.CodigoTabla}-${item.CodigoNave}-${item.CodigoLote}`
          }
          renderItem={({ item }) => (
            <TablaCard
              item={item}
              setDatosEmpleadoNuevo={setDatosEmpleadoNuevo}
              setModales={setModales}
              setDatos={setDatos}
            />
          )}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={tablas.length === 0 && styles.vacioContenedor}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <View style={styles.vacioIconCircle}>
                <Ionicons name="grid-outline" size={30} color="#9ca3af" />
              </View>
              <Text style={styles.vacioTitulo}>Sin tablas disponibles</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 8
  },
  vacioContenedor: {
    flexGrow: 1,
    justifyContent: "center"
  },
  vacio: {
    alignItems: "center",
    paddingHorizontal: 30
  },
  vacioIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  vacioTitulo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151"
  }
});
