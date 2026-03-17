import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import EmpleadoCard from "../Cards/EmpleadoCard";

export default function ListaEmpleadosAgregados({
  listaEmpleados,
  setModales,
  setDatosEmpleadoSeleccionado,
  modales,
  setDatosEmpleadoNuevo
}) {
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
        numColumns={3}
        showsVerticalScrollIndicator={true}
        columnWrapperStyle={{
          margin: "auto",
          marginTop: 40,
          paddingHorizontal: 7
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    zIndex: -1
  }
});
