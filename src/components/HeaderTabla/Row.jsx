import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function RowTabla({
  surco,
  tabla,
  nave,
  lote,
  actividad,
  avance,
  codEmpleado,
  fecha,
  avanceAcum,
  semanaActiva,
  nombreEmpleado,
  descripcion
}) {
  return (
    <View
      style={{
        height: 50,
        backgroundColor: "white",
        width: "100%",
        display: "flex",
        flexDirection: "row"
      }}
    >
      <View style={styles.columnaBoton}>
        <TouchableOpacity
          style={{
            height: "100%",
            backgroundColor: "#ff5353",
            borderRadius: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text style={{ color: "white" }}>Borrar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.columna}>
        <Text style={styles.texto}>
          {String(Number(avanceAcum).toFixed(2))}
        </Text>
      </View>
      <View style={styles.columna}>
        <Text style={styles.texto}>{String(surco)}</Text>
      </View>
      <View style={styles.columna}>
        <Text style={styles.texto}>{lote}</Text>
      </View>
      <View style={styles.columna}>
        <Text style={styles.texto}>{tabla}</Text>
      </View>

      <View style={styles.columna}>
        <Text style={styles.texto}>{actividad}</Text>
      </View>
      <View style={styles.columna}>
        <Text style={styles.texto}>{avance}</Text>
      </View>
      <View style={styles.columnaGrande}>
        <Text style={styles.texto}>{String(descripcion).trim()}</Text>
      </View>
      <View style={styles.columna}>
        <Text style={styles.texto}>{nave}</Text>
      </View>
      <View style={[styles.columnafecha]}>
        <Text style={styles.texto}>{fecha}</Text>
      </View>
      <View style={[styles.columnaMed]}>
        <Text style={styles.texto}>{semanaActiva}</Text>
      </View>
      <View style={styles.columnaMed}>
        <Text style={styles.texto}>{codEmpleado}</Text>
      </View>
      <View style={[styles.columnaGrande, { borderRightWidth: 1 }]}>
        <Text style={styles.texto}>{nombreEmpleado}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  columna: {
    padding: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#acacac",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 90
  },
  columnaMed: {
    padding: 10,
    borderLeftWidth: 2,

    borderBottomWidth: 2,
    borderColor: "#acacac",
    width: 150,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  columnafecha: {
    padding: 10,
    borderLeftWidth: 2,

    borderBottomWidth: 2,
    borderColor: "#acacac",
    width: 110,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  columnaGrande: {
    padding: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#acacac",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 300
  },
  texto: {
    color: "#acacac"
  },
  columnaBoton: {
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#acacac",
    padding: 10,
    width: 90
  }
});
