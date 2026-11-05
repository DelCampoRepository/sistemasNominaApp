import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
  Alert
} from "react-native";
import React, { useEffect, useState } from "react";
import { Modal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { getRealmInstance } from "../../../realm";
import {  useWindowDimensions } from 'react-native';
export default function ModalBuscarEmpleado({
  visible,
  setModales,
  setDatosEmpleadoNuevo
}) {
  const [realmInstance, setRealmInstance] = useState(null);
  const [datosEmpleado, setDatosEmpleado] = useState({
    codEmpleado: "",
    nombreEmpleado: "",
    codigoTemporada: "",
    codigoJefe: ""
  });
const { width, height } = useWindowDimensions();
  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
  }, []);

  useEffect(() => {
    if (String(datosEmpleado.codEmpleado).length === 6) {
      const listaEmpleados = realmInstance
        .objects("Empleado")
        .filtered(`CodigoEmpleado ==$0`, datosEmpleado.codEmpleado.toString());

      if (listaEmpleados.length === 0) {
        Alert.alert(
          "Del campo y asociados",
          "No se ha encontrado ningun empleado con ese codigo"
        );
        setDatosEmpleado((prev) => ({ ...prev, nombreEmpleado: "" }));
        return;
      }

      setDatosEmpleado((prev) => ({
        ...prev,
        nombreEmpleado: String(listaEmpleados[0].Nombre),
        codigoTemporada: String(listaEmpleados[0].CodigoTemporada),
        codigoJefe: listaEmpleados[0].CodigoJefeNave
      }));
    }
  }, [datosEmpleado.codEmpleado]);

  const handleOnPressAgregar = () => {
    if(String(datosEmpleado.codEmpleado).length <6)
    {
      Alert.alert(
        "Del campo y asociados",
        "El codigo de empleado no es valido!"
      );
      return;
    }


    if (String(datosEmpleado.nombreEmpleado) === "") {
      Alert.alert(
        "Del campo y asociados",
        "Los datos del empleado aun no esta completo "
      );
      return;
    }

    setDatosEmpleadoNuevo((prev) => ({
      ...prev,
      CodigoEmpleado: datosEmpleado.codEmpleado,
      Nombre: datosEmpleado.nombreEmpleado,
      CodigoTemporada: datosEmpleado.codigoTemporada,
      CodigoJefe: datosEmpleado.codigoJefe
    }));

    setModales((prev) => ({
      ...prev,
      modalEmpleados: false,
      mainModal: true,
      modalNave: true
    }));

    setDatosEmpleado((prev) => ({
      ...prev,
      codEmpleado: "",
      nombreEmpleado: ""
    }));
  };

  const handleCloseModal = () => {
    setDatosEmpleado({
      codEmpleado: "",
      nombreEmpleado: ""
    });

    setModales((prev) => ({
      ...prev,
      modalEmpleados: false
    }));
  };

  const empleadoEncontrado = datosEmpleado.nombreEmpleado !== "";

  return (
    <Modal visible={visible} style={styles.modal} onDismiss={handleCloseModal}>
      <View style={[styles.viewContainer,{ width:width > 600 ? "65%" : "90%",}]}>
        <TouchableOpacity
          style={styles.cerrarIcono}
          onPress={handleCloseModal}
        >
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Ionicons name="person-add-outline" size={28} color="#16a34a" />
        </View>
        <Text style={styles.titulo}>Agregar empleado</Text>
        <Text style={styles.subtitulo}>Ingresa el código para buscarlo</Text>

        <View style={styles.campo}>
          <Text style={styles.labelCodigo}>Código de empleado</Text>
          <TextInput
            maxLength={6}
            placeholder="000000"
            placeholderTextColor="#9ca3af"
            style={styles.textImput}
            value={datosEmpleado.codEmpleado}
            keyboardType="numeric"
            onChangeText={(text) =>
              setDatosEmpleado((prev) => ({ ...prev, codEmpleado: text }))
            }
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.labelCodigo}>Nombre del empleado</Text>
          <View style={styles.nombreFila}>
            <Ionicons
              name={empleadoEncontrado ? "checkmark-circle" : "person-circle-outline"}
              size={20}
              color={empleadoEncontrado ? "#16a34a" : "#9ca3af"}
            />
            <TextInput
              style={styles.nombreTexto}
              value={datosEmpleado.nombreEmpleado}
              placeholder="Se completa automáticamente"
              placeholderTextColor="#9ca3af"
              editable={false}
              numberOfLines={1}
              ellipsizeMode="tail"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.botonAgregar}
          activeOpacity={0.85}
          onPress={handleOnPressAgregar}
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text style={styles.labelButtom}>Agregar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    zIndex: 1
  },
  viewContainer: {
    margin: "auto",
    borderRadius: 24,
    backgroundColor: "white",
    padding: 22,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12
  },
  cerrarIcono: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 12
  },
  titulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827"
  },
  subtitulo: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 18,
    textAlign: "center"
  },
  campo: {
    width: "100%",
    marginBottom: 14
  },
  labelCodigo: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6
  },
  textImput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#f9fafb"
  },
  nombreFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 14,
    backgroundColor: "#f9fafb"
  },
  nombreTexto: {
    flex: 1,
    marginLeft: 6,
    paddingVertical: 12,
    fontSize: 13,
    color: "#111827"
  },
  botonAgregar: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    paddingVertical: 14,
    backgroundColor: "#16a34a",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    elevation: 3,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6
  },
  labelButtom: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15
  }
});
