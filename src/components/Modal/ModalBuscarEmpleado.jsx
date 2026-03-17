import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  TextInput,
  Alert
} from "react-native";
import React, { useEffect, useState } from "react";
import { Modal } from "react-native-paper";
import { getRealmInstance } from "../../../realm";

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
    if (String(datosEmpleado.codEmpleado).length < 6) {
      Alert.alert(
        "Del campo y asociados",
        "El codigo de empleado aun no esta completo"
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

  return (
    <Modal visible={visible} style={styles.modal}>
      <View style={styles.viewContainer}>
        <View style={styles.ViewCerrar}>
          <TouchableOpacity
            style={styles.cerrarIcono}
            onPress={handleCloseModal}
          >
            <Image
              source={require("../../../assets/cerraar.png")}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.labelCodigo}>Codigo de empleado</Text>
        <TextInput
          style={styles.textImput}
          value={datosEmpleado.codEmpleado}
          keyboardType="numeric"
          onChangeText={(text) =>
            setDatosEmpleado((prev) => ({ ...prev, codEmpleado: text }))
          }
        />
        <Text style={styles.labelCodigo}>Nombre empleado</Text>
        <TextInput
          style={styles.textImput}
          value={datosEmpleado.nombreEmpleado}
          editable={false}
        ></TextInput>
        <TouchableOpacity
          style={styles.botonAgregar}
          onPress={handleOnPressAgregar}
        >
          <Text style={styles.labelButtom}>Agregar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    zIndex: 9
  },
  viewContainer: {
    margin: "auto",
    width: "65%",
    borderRadius: 10,
    backgroundColor: "white",
    padding: 10
  },
  ViewCerrar: {
    marginTop: 10,
    height: "5%",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center"
  },
  labelCodigo: {
    fontSize: 16,
    fontWeight: "Bold",
    marginTop: 10
  },
  textImput: {
    marginTop: 10,
    borderRadius: 5,
    borderWidth: 1,
    paddingLeft: 10,
    height: "15%",
    backgroundColor: "#ebebeb9d",
    fontSize: 18
  },
  botonAgregar: {
    width: "100%",
    height: "10$",
    backgroundColor: "green",
    borderRadius: 5,
    padding: 20,
    marginTop: 20,
    alignItems: "center"
  },
  labelButtom: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  }
});
