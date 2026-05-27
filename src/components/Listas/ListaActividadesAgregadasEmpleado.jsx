import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import ActividadEmpleadoCard from "../Cards/ActividadEmpleadoCard";
import { getRealmInstance } from "../../../realm";
import { Dimensions } from "react-native";
import {  useWindowDimensions } from 'react-native';
import { finDiaCuliacan, inicioDiaCuliacan } from "../../../utils/obtenerHoraCuliacan";
const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_MARGIN = 0;

export default function ListaActividadesAgregadasEmpleado({
  setModales,
  modales,
  datosEmpleadoSeleccionado,
  setDatosActividad,
  datosActividad
}) {
  //console.log('datosss',datosEmpleadoSeleccionado)
  
     const { width } = useWindowDimensions();
  const [realmInstance, setRealmInstance] = useState(null);
  const [activiades, setActiviades] = useState([]);
  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
  }, []);

  useEffect(() => {
    if (realmInstance != null) {
      const ListaActiviades = realmInstance
        .objects("ActiviadesPorEmpleado")
        .filtered(
          `codigoEmpleado == $0 AND fecha >=$1 AND 
          fecha <=$2`,
          datosEmpleadoSeleccionado.CodigoEmpleado,
          inicioDiaCuliacan(),
          finDiaCuliacan()
        )
        .sorted([
          ["codigoLote", false],
          ["codigoNave", false],
          ["CodigoActividad", false],
          ["CodigoAvance", false],
          ["codigoTabla", false]
        ]);
      // console.log("lista", JSON.stringify(ListaActiviades, null, 2));

      setActiviades(ListaActiviades);
    }
  }, [realmInstance]);
//console.log(JSON.stringify(activiades,null,2));
  return (
    <View style={{ flex: 1, borderRadius: 10 }}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerText,{fontSize: width > 600 ? 18 : 14}]}>ACTIVIDADES DEL EMPLEADO</Text>
      </View>
      <View style={styles.container}>
        {activiades.length > 0 && (
          <FlatList
            data={activiades}
            keyExtractor={(item) =>
              `${item.CodigoActividad}-${item.CodigoAvance}-${item.codigoLote}-${item.codigoNave}-${item.codigoTabla}`
            }
            renderItem={({ item }) => (
              <ActividadEmpleadoCard
                item={item}
                setModales={setModales}
                modales={modales}
                setDatosActividad={setDatosActividad}
                datosActividad={datosActividad}
                realmInstance={realmInstance}
              />
            )}
            numColumns={width > 400 ? 3 : 2}
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
