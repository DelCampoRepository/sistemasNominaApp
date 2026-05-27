import React from "react";
import { Text, StyleSheet, Pressable, TouchableOpacity } from "react-native";

export default function Surco({
  item,
  onPressSurco,
  onLongPressSurco,
  setSumadorSurcos
}) {
  // Determinamos si el surco está bloqueado (ocupado al 100% por otros)
  const esGris = item.estado === "g" || item.estado ==="b" || item.estado === "r";

  const obtenerColor = () => {
    switch (item.estado) {
      case "gr":
        return "#2e7d32"; // Verde (Completado)
      case "o":
        return "#ef6c00"; // Naranja (Parcial)
      case "g":
        return "#9e9e9e"; // Gris (De otro empleado / Bloqueado)
      case "w":
        return "#ffffff"; // Blanco (Disponible)
      case "b":
        return "#30ddce";
         case "r":
        return "#9e65ed";
      default:
        return "#ffffff";
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
         onPressSurco(item);
      }}
      onLongPress={() => onLongPressSurco(item)}
      style={[
        styles.mainContainer,
        {
          backgroundColor: obtenerColor(),
          borderColor: item.estado === "w" ? "#ccc" : "transparent"
        }
      ]}
    >
      <Text
        style={[
          styles.textoSurco,
          {
            color: item.estado === "w" ? "#000" : "#fff",
            fontSize:  item.avanceAcum <1  ? 10: 14 // Se achica si es naranja
          }
        ]}
      >
        {item.surco}
      </Text>

      {/* Si es naranja, mostramos el valor decimal debajo */}
      {(item.estado === "o" || (item.estado === "g" && item.avanceAcum <1 )|| (item.estado === "b" && item.avanceAcum <1 ) || (item.estado === "r" && item.avanceAcum <1 ))&& (
        <>
        <Text style={styles.textoAvance}>AE: {item.avanceAcum.toFixed(2)}</Text>
        <Text  style={styles.textoAvance}>AO: {item.avanceTotalOtros.toFixed(2)}</Text>
         <Text  style={styles.textoAvance}>AT: {Number(item.avanceTotalOtros.toFixed(2)) + Number(item.avanceAcum.toFixed(2))}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    width: 51,
    height: 60,
    borderRadius: 8,
    margin: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    elevation: 2 // Sombra para Android
  },
  textoSurco: {
    fontWeight: "bold"
  },
  textoAvance: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "900"
  }
});
