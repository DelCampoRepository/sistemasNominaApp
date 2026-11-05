import React from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const IMAGENES = {
  nave: require("../../../assets/nave2.png"),
  actividad: require("../../../assets/herramientas.png"),
  tabla: require("../../../assets/nave2.png")
};
export default function NaveCard({
  item,
  icono,
  setDatosEmpleadoNuevo,
  setModales,
  setDatos
}) {
  const fuenteImagen = IMAGENES[icono] || IMAGENES.nave;

  const handleOnPress = () => {
    setDatosEmpleadoNuevo((prev) => ({
      ...prev,
      CodigoLote: String(item.CodigoLote),
      CodigoNave: String(item.CodigoNave)
    }));

    setDatos({
      nave: String(item.CodigoNave),
      lote: String(item.CodigoLote),
      tabla: "",
      actividad: "",
      avance: ""
    });

    setModales((prev) => ({
      ...prev,
      modalNave: false,
      modalTablas: true
    }));
  };

  return (
    <TouchableOpacity style={styles.Card} activeOpacity={0.75} onPress={handleOnPress}>
      <View style={styles.iconCircle}>
        <Image source={fuenteImagen} style={styles.icon} resizeMode="contain" />
      </View>

      <View style={styles.textos}>
        <Text style={styles.tituloTexto} numberOfLines={1}>
          {item.CodigoLote}-{String(item.DescripcionLote).trim()}
        </Text>
        <Text style={styles.subtexto} numberOfLines={1}>
          {item.DescripcionNave}
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
    backgroundColor: "#dcfce7",
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
