import { Modal } from "react-native-paper";
import ListaNaves from "../Listas/ListaNaves";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import ListaActividades from "../Listas/ListaActividades";
import ListaTablas from "../Listas/ListaTablas";
import ListaActividadesAgregadasEmpleado from "../Listas/ListaActividadesAgregadasEmpleado";

const PASOS = [
  { key: "modalNave", label: "Nave" },
  { key: "modalTablas", label: "Tabla" },
  { key: "modalActividades", label: "Actividad" }
];
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


  const esModoWizard = !modales.modalActiviadesEmpleado;
  const pasoActivoIndex = PASOS.findIndex((p) => modales[p.key]);

  const tituloPaso = modales.modalNave
    ? "Selecciona la nave"
    : modales.modalTablas
    ? "Selecciona la tabla"
    : modales.modalActividades
    ? "Selecciona la actividad"
    : "Actividades registradas";

  const mostrarRegresar = modales.modalNave === false && modales.modalActiviadesEmpleado === false;

  return (
    <Modal
      visible={modales.mainModal}
      transparent
      animationType="fade"
      style={styles.modal}
    >
      <View style={styles.modalPop}>
        <View style={styles.header}>
          {mostrarRegresar ? (
            <TouchableOpacity
              style={styles.iconBtn}
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
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconBtnPlaceholder} />
          )}

          <Text style={styles.titulo} numberOfLines={1}>{tituloPaso}</Text>

          <TouchableOpacity
            style={styles.iconBtn}
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
            <Ionicons name="close" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {esModoWizard && (
          <View style={styles.pasosFila}>
            {PASOS.map((paso, index) => (
              <React.Fragment key={paso.key}>
                <View style={styles.pasoItem}>
                  <View
                    style={[
                      styles.pasoCirculo,
                      index <= pasoActivoIndex && styles.pasoCirculoActivo
                    ]}
                  >
                    {index < pasoActivoIndex ? (
                      <Ionicons name="checkmark" size={14} color="#ffffff" />
                    ) : (
                      <Text
                        style={[
                          styles.pasoNumero,
                          index === pasoActivoIndex && styles.pasoNumeroActivo
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.pasoLabel,
                      index === pasoActivoIndex && styles.pasoLabelActivo
                    ]}
                  >
                    {paso.label}
                  </Text>
                </View>
                {index < PASOS.length - 1 && (
                  <View
                    style={[
                      styles.pasoLinea,
                      index < pasoActivoIndex && styles.pasoLineaActiva
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        )}

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
    width: "94%",
    height: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    margin: "auto",
    alignItems: "center",
    paddingTop: 16,
    paddingHorizontal: 10,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center"
  },
  iconBtnPlaceholder: {
    width: 36,
    height: 36
  },
  titulo: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginHorizontal: 8
  },
  pasosFila: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 16,
    marginBottom: 6
  },
  pasoItem: {
    alignItems: "center",
    width: 60
  },
  pasoCirculo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center"
  },
  pasoCirculoActivo: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a"
  },
  pasoNumero: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9ca3af"
  },
  pasoNumeroActivo: {
    color: "#ffffff"
  },
  pasoLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "center"
  },
  pasoLabelActivo: {
    color: "#16a34a",
    fontWeight: "600"
  },
  pasoLinea: {
    flex: 1,
    height: 2,
    backgroundColor: "#e5e7eb",
    marginTop: 12,
    marginHorizontal: -6
  },
  pasoLineaActiva: {
    backgroundColor: "#16a34a"
  },
  cardContainer: {
    width: "100%",
    flex: 1,
    overflow: "hidden",
    marginTop: 10,
    borderRadius: 10,
    justifyContent: "center"
  }
});
