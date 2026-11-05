import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NaveCard from "../Cards/NaveCard";
import { getRealmInstance } from "../../../realm";


export default function ListaNaves({
  setDatosEmpleadoNuevo,
  setModales,
  setDatos
}) {

  const [realmInstance, setRealmInstance] = useState(null);
  const [naves, setNaves] = useState([]);
  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
  }, []);

  useEffect(() => {
    if (realmInstance != null) {
      const ListaNaves = realmInstance.objects("Nave");

      setNaves(ListaNaves);
    }
  }, [realmInstance]);

  
  return (
    <View style={{ height: "92%", width: "100%", borderRadius: 10 }}>
      <View style={styles.container}>
        <FlatList
          data={naves}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <NaveCard
              item={item}
              setDatosEmpleadoNuevo={setDatosEmpleadoNuevo}
              setModales={setModales}
              setDatos={setDatos}
            />
          )}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={naves.length === 0 && styles.vacioContenedor}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <View style={styles.vacioIconCircle}>
                <Ionicons name="boat-outline" size={30} color="#9ca3af" />
              </View>
              <Text style={styles.vacioTitulo}>Sin naves disponibles</Text>
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
