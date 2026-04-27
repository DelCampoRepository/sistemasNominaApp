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
      <View style={[styles.viewContainer,{ width:width > 600 ? "65%" : "90%",}]}>
        <View style={styles.ViewCerrar}>
          <TouchableOpacity
            style={styles.cerrarIcono}
            onPress={handleCloseModal}
          >
            <Image
              source={require("../../../assets/cerraar.png")}
              style={{ width: width > 600 ? 30 : 25, height: width > 600 ? 30 : 25 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.labelCodigo}>Codigo de empleado</Text>
        <TextInput
          maxLength={6}
          style={[styles.textImput, { height: width > 600 ? "15%" : "13%",fontSize: width > 600 ? 15 : 13 }]}
          value={datosEmpleado.codEmpleado}
          keyboardType="numeric"
          onChangeText={(text) =>
            setDatosEmpleado((prev) => ({ ...prev, codEmpleado: text }))
          }
        />
        <Text style={styles.labelCodigo}>Nombre empleado</Text>
        <TextInput
          style={[styles.textImput, { height: width > 600 ? "15%" : "13%" ,fontSize: width > 600 ? 15 : 13 }]}
          value={datosEmpleado.nombreEmpleado}
          editable={false}
        ></TextInput>
        <TouchableOpacity
          style={[styles.botonAgregar, { height: width > 600 ? "15%" : "13%" }]}
          onPress={handleOnPressAgregar}
        >
          <Text style={[styles.labelButtom,{fontSize: width > 600 ? 18 : 16 }]}>Agregar</Text>
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
   
    backgroundColor: "#ebebeb9d",
    
  },
  botonAgregar: {
    width: "100%",
   
    backgroundColor: "green",
    borderRadius: 5,
    justifyContent: "center",
    marginTop: 20,
    alignItems: "center"
  },
  labelButtom: {
    color: "white",
   
    fontWeight: "bold"
  }
});
