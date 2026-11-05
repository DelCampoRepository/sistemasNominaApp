import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Modal, Portal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useConexionStore } from "../../../store/useConexionStore";

export default function ModalSinConexion() {
  const sinConexionVisible = useConexionStore(state => state.sinConexionVisible);
  const ocultarSinConexion = useConexionStore(state => state.ocultarSinConexion);

  return (
    <Portal>
      <Modal
        visible={sinConexionVisible}
        onDismiss={ocultarSinConexion}
        contentContainerStyle={styles.contenido}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="cloud-offline-outline" size={28} color="#dc2626" />
        </View>

        <Text style={styles.titulo}>Sin conexión a internet</Text>
        <Text style={styles.subtitulo}>
          No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.
        </Text>

        <TouchableOpacity
          style={styles.boton}
          activeOpacity={0.85}
          onPress={ocultarSinConexion}
        >
          <Text style={styles.botonTexto}>Entendido</Text>
        </TouchableOpacity>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  contenido: {
    backgroundColor: "white",
    borderRadius: 24,
    marginHorizontal: 30,
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center"
  },
  subtitulo: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18
  },
  boton: {
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30
  },
  botonTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14
  }
});
