import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EmpleadoReporteCard({ empleado, onPress }) {
  return (
    <TouchableOpacity style={styles.Card} activeOpacity={0.75} onPress={onPress}>
      <Image source={require("../../../assets/usuario2.png")} style={styles.avatar} />

      <View style={styles.textos}>
        <Text style={styles.tituloTexto} numberOfLines={1}>
          {empleado.CodigoEmpleado}
        </Text>
        <Text style={styles.subtexto} numberOfLines={1}>
          {empleado.Nombre}
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
    width: "94%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 14
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
