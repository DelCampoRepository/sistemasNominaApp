import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ActividadEmpleadoCard from "../Cards/ActividadEmpleadoCard";
import { getRealmInstance } from "../../../realm";
import { finDiaCuliacan, inicioDiaCuliacan } from "../../../utils/obtenerHoraCuliacan";

export default function ListaActividadesAgregadasEmpleado({
  setModales,
  modales,
  datosEmpleadoSeleccionado,
  setDatosActividad,
  datosActividad
}) {
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
    <View style={{ height: "92%", width: "100%", borderRadius: 10 }}>
      <View style={styles.container}>
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
          showsVerticalScrollIndicator={true}
          contentContainerStyle={activiades.length === 0 && styles.vacioContenedor}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <View style={styles.vacioIconCircle}>
                <Ionicons name="clipboard-outline" size={30} color="#9ca3af" />
              </View>
              <Text style={styles.vacioTitulo}>Sin actividades agregadas</Text>
              <Text style={styles.vacioTexto}>
                Toca el botón "+" para agregarle una actividad a este empleado.
              </Text>
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
    color: "#374151",
    marginBottom: 4
  },
  vacioTexto: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center"
  }
});
