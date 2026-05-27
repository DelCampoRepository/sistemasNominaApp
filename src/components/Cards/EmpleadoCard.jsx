import React from "react";
import {
 
  View,
  Text,
  Image,
  StyleSheet,
  Pressable
} from "react-native";

import {  useWindowDimensions } from 'react-native';
import { formatearFechaCuliacan } from "../../../utils/obtenerHoraCuliacan";

const ITEM_MARGIN = 7;


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

   const { width } = useWindowDimensions();
  return (
    <Pressable
      style={[styles.Card,{ 
        backgroundColor: item.estado ===0  || item.estado ===3? "#e9e8e8" : item.estado === 1 ? "#00c9bf" : "#ff4d4d", 
         borderColor: item.estado ===0|| item.estado ===3? "#cdcdcd" : item.estado === 1 ? "#00eade" : "#de0202",
        width: width > 600 ? "25%" : "40%" }]}
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
        <Text style={styles.textSecundario}>{formatearFechaCuliacan(item.FechaCaptura)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  Card: {
  
    margin: ITEM_MARGIN,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    elevation: 3,
    
    borderWidth:3,
    borderColor:"#00eade",
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
    paddingVertical: 10,
    
  }
});
