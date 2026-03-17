import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";

import NaveCard from "../Cards/NaveCard";
import { getRealmInstance } from "../../../realm";

const ITEM_MARGIN = 8;

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
    <View style={{ flex: 1, borderRadius: 10 }}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>SELECCIONE NAVE</Text>
      </View>
      <View style={styles.container}>
        {naves.length > 0 && (
          <FlatList
            data={naves}
            keyExtractor={(item) => item.CodigoNave.toString()}
            renderItem={({ item }) => (
              <NaveCard
                item={item}
                setDatosEmpleadoNuevo={setDatosEmpleadoNuevo}
                setModales={setModales}
                setDatos={setDatos}
              />
            )}
            numColumns={2}
            showsVerticalScrollIndicator={true}
            columnWrapperStyle={{
              margin: "auto",
              marginTop: 40,
              paddingHorizontal: ITEM_MARGIN
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "95%",
    backgroundColor: "#f0fff0",
    borderWidth: 0.4,
    borderColor: "#1fcb30",
    borderRadius: 10
  },
  headerContainer: {
    height: "5%",
    backgroundColor: "white",
    marginBottom: 10
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    margin: "auto"
  }
});
