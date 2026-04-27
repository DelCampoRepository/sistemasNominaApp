import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";

import TablaCard from "../Cards/TablaCard";
import { getRealmInstance } from "../../../realm";
import {  useWindowDimensions } from 'react-native';

const ITEM_MARGIN = 8;

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

  const { width, height } = useWindowDimensions();
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
    <View style={{ flex: 1, borderRadius: 10 }}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerText,{fontSize: width > 600 ? 18 : 14}]}>SELECCIONE TABLA</Text>
      </View>

      <View style={styles.container}>
        {tablas.length > 0 && (
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
            numColumns={width > 600 ? 3 : 2}
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

<FlatList />;
