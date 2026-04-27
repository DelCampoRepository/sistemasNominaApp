import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
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
        columnWrapperStyle={{
          margin: "auto",
          marginTop: 0,
          paddingHorizontal: 7
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    
    width: "100%",
    height: "86.8%",
    
    zIndex: -1
  }
});
