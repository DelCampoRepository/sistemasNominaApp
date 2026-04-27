import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";

import ActividadCard from "../Cards/ActividadesCard";
import { getRealmInstance } from "../../../realm";
import {  useWindowDimensions } from 'react-native';
const ITEM_MARGIN = 8;

export default function ListaActividades({
  setDatosEmpleadoNuevo,
  setModales,
  datosEmpleadoNuevo,
  datos
}) {
  const [realmInstance, setRealmInstance] = useState(null);
  const [activiades, setActiviades] = useState([]);
  const [codLote, setCodLote] = useState([]);
   const { width } = useWindowDimensions();
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
    <View style={{ flex: 1, borderRadius: 10 }}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerText,{fontSize: width > 600 ? 18 : 14}]}>SELECCIONE ACTIVIDAD</Text>
      </View>
      <View style={styles.container}>
        {activiades.length > 0 && (
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
            numColumns={ width > 600 ? 3 : 2}
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


