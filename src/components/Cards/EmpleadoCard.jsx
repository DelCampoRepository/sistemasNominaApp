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

   const esPendiente = item.estado === 0 || item.estado === 3;
   const esConfirmado = item.estado === 1;

   const colorAcento = esPendiente ? "#9ca3af" : esConfirmado ? "#16a34a" : "#dc2626";
   const colorFondoSuave = esPendiente ? "#f3f4f6" : esConfirmado ? "#dcfce7" : "#fee2e2";
   const etiquetaEstado = esPendiente ? "Pendiente" : esConfirmado ? "Sincronizado " : "No sincronizado";

  return (
    <Pressable
      style={[styles.Card, { width: width > 600 ? "25%" : "44%" }]}
      onPress={handleOnPress}
      onLongPress={handleLongPress}
    >
      <View style={[styles.imageContainer, { backgroundColor: colorFondoSuave }]}>
        <Image
          source={require("../../../assets/usuario2.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.codigo} numberOfLines={1}>
        {item.CodigoEmpleado}
      </Text>
      <Text style={styles.textSecundario} numberOfLines={1}>{item.Nombre}</Text>
      <Text style={styles.textFecha}>{formatearFechaCuliacan(item.FechaCaptura)}</Text>

      <View style={[styles.badge, { backgroundColor: colorFondoSuave }]}>
        <View style={[styles.badgeDot, { backgroundColor: colorAcento }]} />
        <Text style={[styles.badgeTexto, { color: colorAcento }]}>{etiquetaEstado}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  Card: {
    margin: ITEM_MARGIN,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8
  },
  imageContainer: {
    width: "70%",
    aspectRatio: 1,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8
  },
  icon: {
    width: "45%",
    height: "45%"
  },
  codigo: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#111827"
  },
  textSecundario: {
    fontSize: 12,
    color: "#374151",
    textAlign: "center",
    marginTop: 2
  },
  textFecha: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 8
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 5
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  badgeTexto: {
    fontSize: 11,
    fontWeight: "700"
  }
});
