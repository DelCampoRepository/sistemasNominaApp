import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable
} from "react-native";
import { Dimensions } from "react-native";
import main from "../../..";

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_MARGIN = 7;
const ITEM_WIDTH = SCREEN_WIDTH / 3.7 - ITEM_MARGIN * 4;

export default function EmpleadoCard({
  item,
  setModales,
  setDatosEmpleadoSeleccionado,
  setDatosEmpleadoNuevo
}) {
  const handleOnPress = () => {
    setDatosEmpleadoSeleccionado(item);

    setModales((prev) => ({
      ...prev,
      modalActiviadesEmpleado: true,
      mainModal: true
    }));
  };

  const handleLongPress = () => {
    setDatosEmpleadoNuevo((prev) => ({
      ...prev,
      CodigoEmpleado: item.CodigoEmpleado,
      Nombre: item.Nombre
    }));
    setModales((prev) => ({
      ...prev,

      mainModal: true,
      modalNave: true
    }));
  };

  return (
    <Pressable
      style={styles.Card}
      onPress={handleOnPress}
      onLongPress={handleLongPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={require("../../../assets/usuario2.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      <Text style={{ fontWeight: "bold", fontSize: 14 }}>
        {item.CodigoEmpleado}
      </Text>
      <Text style={styles.textSecundario}>{item.Nombre}</Text>
    </Pressable>
  );
}

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
  },
  textSecundario: {
    fontSize: 12,
    textAlign: "center",
    margin: "auto",
    paddingVertical: 10
  }
});
