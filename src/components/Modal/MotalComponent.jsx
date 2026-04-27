import { Modal } from "react-native-paper";
import ListaNaves from "../Listas/ListaNaves";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import ListaActividades from "../Listas/ListaActividades";
import ListaTablas from "../Listas/ListaTablas";
import ListaActividadesAgregadasEmpleado from "../Listas/ListaActividadesAgregadasEmpleado";
import {  useWindowDimensions } from 'react-native';
export default function CustomModal({
  modales,
  setModales,

  setDatosEmpleadoNuevo,
  datosEmpleadoNuevo,
  datosEmpleadoSeleccionado,
  setDatosActividad,
  datosActividad
}) {
  const [datos, setDatos] = useState({
    nave: "",
    lote: "",
    tabla: "",
    actividad: "",
    avance: ""
  });

 
const { width, height } = useWindowDimensions();
  return (
    <Modal
      visible={modales.mainModal}
      transparent
      animationType="fade"
      style={styles.modal}
    >
      <View style={styles.modalPop}>
        <View style={styles.ViewCerrar}>
          <TouchableOpacity
            style={styles.cerrarIcono}
            onPress={() =>
              setModales((prev) => ({
                ...prev,
                modalNave: false,
                modalEmpleados: false,
                modalActividades: false,
                mainModal: false,
                modalTablas: false,
                modalActiviadesEmpleado: false
              }))
            }
          >
            <Image
              source={require("../../../assets/cerraar.png")}
              style={{ width: width > 600 ? 30 : 25, height: width > 600 ? 30 : 25 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          { modales.modalNave === false && modales.modalActiviadesEmpleado === false &&
          <TouchableOpacity
            style={styles.regresar}
            onPress={() =>
            {
               if(modales.modalTablas)
               {
                   setModales((prev) => ({
                  ...prev,
                  modalNave: true,
                  modalEmpleados: false,
                  modalActividades: false,
                  mainModal: true,
                  modalTablas: false,
                  modalActiviadesEmpleado: false
                }))
               }
               else if(modales.modalActividades)
               {
                   setModales((prev) => ({
                  ...prev,
                  modalNave: false,
                  modalEmpleados: false,
                  modalActividades: false,
                  mainModal: true,
                  modalTablas: true,
                  modalActiviadesEmpleado: false
                }))
               }
            
            }}
          >
            <Image
              source={require("../../../assets/regreso.png")}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </TouchableOpacity>}
        </View>

        <View style={styles.cardContainer}>
          { modales.modalNave === true && (
            <ListaNaves
              setDatosEmpleadoNuevo={setDatosEmpleadoNuevo}
              setModales={setModales}
              setDatos={setDatos}
            />
          )}
          {modales.modalActividades == true && (
            <ListaActividades
              setDatosEmpleadoNuevo={setDatosEmpleadoNuevo}
              setModales={setModales}
              datosEmpleadoNuevo={datosEmpleadoNuevo}
              datos={datos}
              setDatos={setDatos}
            />
          )}
          {modales.modalTablas === true && (
            <ListaTablas
              setDatosEmpleadoNuevo={setDatosEmpleadoNuevo}
              setModales={setModales}
              datos={datos}
              setDatos={setDatos}
            />
          )}
          {modales.modalActiviadesEmpleado === true && (
            <ListaActividadesAgregadasEmpleado
              setModales={setModales}
              modales={modales}
              datosEmpleadoSeleccionado={datosEmpleadoSeleccionado}
              setDatosActividad={setDatosActividad}
              datosActividad={datosActividad}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "#ffffff00",
    elevation: 5,
    zIndex: 100
  },
  modalPop: {
    width: "90%",
    height: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    margin: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  cardContainer: {
    width: "95%",
    height: "85%",

    borderRadius: 10
  },
  ViewCerrar: {
    height: "5%",
    width: "95%",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center"
  },
  cerrarIcono: {
    position: "absolute",
    
    right: 10,
    zIndex: 1
  },
  regresar: {
    position: "absolute",
  
    left: 20,
    zIndex: 1
  }
});
