import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
export default function HeaderTab() {
  return (
    <View
      style={{
        height: 45,
        backgroundColor: "white",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
      }}
    >
      <View style={[styles.columna]}>
        <Text style={styles.texto}>Acciones</Text>
      </View>

      <View style={styles.columna}>
        <Text style={styles.texto}>Avance</Text>
      </View>
      <View style={styles.columna}>
        <Text style={styles.texto}>Surco</Text>
      </View>
      <View style={styles.columna}>
        <Text style={styles.texto}>Lote</Text>
      </View>
      <View style={styles.columna}>
        <Text style={styles.texto}>Tabla</Text>
      </View>
      <View style={styles.columna}>
        <Text style={styles.texto}>Actividad</Text>
      </View>
      <View style={styles.columna}>
        <Text style={styles.texto}>Avance</Text>
      </View>
      <View style={[styles.columnaGrande]}>
        <Text style={styles.texto}>Descripcion</Text>
      </View>

      <View style={styles.columna}>
        <Text style={styles.texto}>Nave</Text>
      </View>

      <View style={styles.columnafecha}>
        <Text style={styles.texto}>Fecha</Text>
      </View>
      <View style={styles.columnaMed}>
        <Text style={styles.texto}>Semana Act.</Text>
      </View>

      <View style={[styles.columnaMed]}>
        <Text style={styles.texto}>Cod. Empleado</Text>
      </View>
      <View style={[styles.columnaGrande, { borderRightWidth: 1 }]}>
        <Text style={styles.texto}>Nombre</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  columna: {
    padding: 10,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#acacac",
    width: 90,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  columnafecha: {
    padding: 10,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#acacac",
    width: 110,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  columnaMed: {
    padding: 10,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#acacac",
    width: 150,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  texto: {
    color: "#acacac"
  },
  columnaGrande: {
    padding: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#acacac",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 300
  }
});
