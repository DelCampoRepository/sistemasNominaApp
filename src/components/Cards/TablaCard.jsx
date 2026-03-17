import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import { Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_MARGIN = 7;
const ITEM_WIDTH = SCREEN_WIDTH / 3.7 - ITEM_MARGIN * 4;

const IMAGENES = {
  nave: require("../../../assets/nave2.png"),
  actividad: require("../../../assets/herramientas.png"),
  tabla: require("../../../assets/nave2.png")
};

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
    <TouchableOpacity style={styles.Card} onPress={handleOnPress}>
      <View style={styles.imageContainer}>
        <Image
          source={require("../../../assets/plantas.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      <Text style={{ fontWeight: "bold", fontSize: 12 }}>
        {item.CodigoTabla}
      </Text>
      <Text style={{ fontSize: 10, textAlign: "center", margin: "auto" }}>
        {item.Descripcion.trim()}
      </Text>
    </TouchableOpacity>
  );
}
//source={require("../../../assets/nave2.png")}
const styles = StyleSheet.create({
  Card: {
    width: ITEM_WIDTH,
    margin: ITEM_MARGIN,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    elevation: 3,
    borderStartColor: "green"
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  icon: {
    width: "40%",
    height: "40%"
  }
});
