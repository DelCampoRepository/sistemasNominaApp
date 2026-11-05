import { StyleSheet, View, Text } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import EmpleadoCard from "../Cards/EmpleadoCard";
import {  useWindowDimensions } from 'react-native';
export default function ListaEmpleadosAgregados({
  listaEmpleados,
  setModales,
  setDatosEmpleadoSeleccionado,
  modales,
  setDatosEmpleadoNuevo
}) {

    const { width, height } = useWindowDimensions();

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={listaEmpleados}
        keyExtractor={(item) => `${item.CodigoEmpleado}-${item.FechaCaptura}`}
        renderItem={({ item }) => (
          <EmpleadoCard
            item={item}
            setModales={setModales}
            modales={modales}
            setDatosEmpleadoSeleccionado={setDatosEmpleadoSeleccionado}
            setDatosEmpleadoNuevo={setDatosEmpleadoNuevo}
          />
        )}
        numColumns={width > 600 ? 3 : 2}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={[
          styles.contenido,
          listaEmpleados.length === 0 && styles.vacioContenedor
        ]}
        columnWrapperStyle={{
          margin: "auto",
          marginTop: 0,
          paddingHorizontal: 7
        }}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <View style={styles.vacioIconCircle}>
              <Ionicons name="people-outline" size={32} color="#9ca3af" />
            </View>
            <Text style={styles.vacioTitulo}>Sin empleados agregados</Text>
            <Text style={styles.vacioTexto}>
              Usa el botón de agregar para capturar empleados del día.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    height: "80%",
    zIndex: -1
  },
  contenido: {
    paddingBottom: 90
  },
  vacioContenedor: {
    flexGrow: 1,
    justifyContent: "center"
  },
  vacio: {
    alignItems: "center",
    paddingHorizontal: 40
  },
  vacioIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  vacioTitulo: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4
  },
  vacioTexto: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center"
  }
});
