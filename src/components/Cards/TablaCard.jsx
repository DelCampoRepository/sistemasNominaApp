import React from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TablaCard({
  item,
  icono,
  setDatosEmpleadoNuevo,
  setModales,
  setDatos
}) {

  const handleOnPress = () => {
    setDatosEmpleadoNuevo((prev) => ({
      ...prev,
      CodTabla: String(item.CodigoTabla)
    }));
    setDatos((prev) => ({
      ...prev,
      tabla: String(item.CodigoTabla)
    }));
    setModales((prev) => ({
      ...prev,
      modalTablas: false,
      modalActividades: true
    }));
  };

  return (
    <TouchableOpacity style={styles.Card} activeOpacity={0.75} onPress={handleOnPress}>
      <View style={styles.iconCircle}>
        <Image
          source={require("../../../assets/plantas.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textos}>
        <Text style={styles.tituloTexto} numberOfLines={1}>
          Tabla {item.CodigoTabla}
        </Text>
        <Text style={styles.subtexto} numberOfLines={1}>
          {item.Descripcion.trim()}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  Card: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  icon: {
    width: "55%",
    height: "55%"
  },
  textos: {
    flex: 1
  },
  tituloTexto: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#111827"
  },
  subtexto: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2
  }
});
