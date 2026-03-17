import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import { Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_MARGIN = 10;
const ITEM_WIDTH = SCREEN_WIDTH / 3 - ITEM_MARGIN * 4;

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
    <TouchableOpacity style={styles.Card} onPress={handleOnPress}>
      <View style={styles.imageContainer}>
        <Image source={fuenteImagen} style={styles.icon} resizeMode="contain" />
      </View>

      <Text style={{ fontWeight: "bold", fontSize: 12 }}>
        {item.CodigoLote}-{String(item.DescripcionLote).trim()}
      </Text>
      <Text>{item.DescripcionNave}</Text>
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
