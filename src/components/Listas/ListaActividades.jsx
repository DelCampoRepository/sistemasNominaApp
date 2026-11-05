import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ActividadCard from "../Cards/ActividadesCard";
import { getRealmInstance } from "../../../realm";

export default function ListaActividades({
  setDatosEmpleadoNuevo,
  setModales,
  datosEmpleadoNuevo,
  datos
}) {
  const [realmInstance, setRealmInstance] = useState(null);
  const [activiades, setActiviades] = useState([]);
  const [codLote, setCodLote] = useState([]);
  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
    setCodLote(datos.lote);
  }, []);

  useEffect(() => {
    if (realmInstance != null) {
      const ListaActiviades = realmInstance
        .objects("Actividades")
        .filtered("CodigoLote ==$0", codLote);
      //.filtered('CodigoLote ==$0', )
      setActiviades(ListaActiviades);
    }
  }, [realmInstance]);

  return (
    <View style={{ height: "92%", width: "100%", borderRadius: 10 }}>
      <View style={styles.container}>
        <FlatList
          data={activiades}
          keyExtractor={(item) =>
            `${item.CodigoActividad}-${item.CodigoAvance}-${item.CodigoLote}`
          }
          renderItem={({ item }) => (
            <ActividadCard
              item={item}
              setDatosEmpleadoNuevo={setDatosEmpleadoNuevo}
              setModales={setModales}
              datosEmpleadoNuevo={datosEmpleadoNuevo}
            />
          )}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={activiades.length === 0 && styles.vacioContenedor}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <View style={styles.vacioIconCircle}>
                <Ionicons name="build-outline" size={30} color="#9ca3af" />
              </View>
              <Text style={styles.vacioTitulo}>Sin actividades disponibles</Text>
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

