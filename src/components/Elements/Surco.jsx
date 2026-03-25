import React from "react";
import { Text, StyleSheet, Pressable } from "react-native";

export default function Surco({ item, onPressSurco, onLongPressSurco }) {
  // Determinamos si el surco está bloqueado (ocupado al 100% por otros)
  const esGris = item.estado === "g";

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
      default:
        return "#ffffff";
    }
  };

  return (
    <Pressable
      onPress={() => {
        !esGris && onPressSurco(item);
      }}
      onLongPress={() => !esGris && onLongPressSurco(item)}
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
            fontSize: item.estado === "o" ? 10 : 14 // Se achica si es naranja
          }
        ]}
      >
        {item.surco}
      </Text>

      {/* Si es naranja, mostramos el valor decimal debajo */}
      {item.estado === "o" && (
        <Text style={styles.textoAvance}>{item.avanceAcum.toFixed(2)}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    width: 50,
    height: 50,
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
