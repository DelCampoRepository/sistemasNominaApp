import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { StyleSheet } from "react-native";
import React, { useState, useEffect, use } from "react";
import { deleteRealmDatabase, getRealmInstance } from "../realm";
import { ScrollView } from "react-native-gesture-handler";
import { Modal } from "react-native";
export default function PantallaTablaDatos() {
  const [realmInstance, setRealmInstance] = useState(null);
  const [modelos, setModelos] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [visible, setVisible] = useState(false);
  const [schemasProp, setSchemasProp] = useState([]);

  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
  }, []);

  useEffect(
    () => {
      if (registros.length > 0) {
        console.log(registros[0]);
      }
    },
    [registros]
  );

  useEffect(
    () => {
      if (realmInstance) {
        obtenerDatos();
      }

      function obtenerDatos() {
        const allModelNames = realmInstance.schema.map(model => model.name);
        console.log(allModelNames);
        setModelos(allModelNames);
      }
    },
    [realmInstance]
  );
  const obtenerFechaYHora = date => {
    const ahora = new Date(date);

    // Fecha
    const dia = String(ahora.getDate()).padStart(2, "0");
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const anio = ahora.getFullYear();

    // Hora Local
    const horas = String(ahora.getHours()).padStart(2, "0");
    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const segundos = String(ahora.getSeconds()).padStart(2, "0");

    return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
  };

  const handleTouch = modelo => {
    const schema = realmInstance.schema.find(s => s.name === modelo);

    const names = Object.values(schema.properties).map(prop => prop.name);
    setSchemasProp(names);
    // setVisible(true);
    const results = realmInstance.objects(modelo);
    const data = results.map(item => ({ ...item }));
    //console.log(data);
    setRegistros(data);
  };

  return (
    <SafeAreaView style={styles.conatainer}>
      <View
        style={{
          height: "50%",
          marginTop: 20,
          elevation: 4
        }}
      >
        <ScrollView
          style={{
            width: "100%"
          }}
        >
          <View
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              backgroundColor: "#dcdcdcff",
              display: "flex",
              alignItems: "center"
            }}
          >
            {modelos.map((modelo, index) =>
              <TouchableOpacity
                style={styles.touchable}
                key={index}
                onPress={() => handleTouch(modelo)}
              >
                <Text style={{ fontSize: 18, paddingLeft: 10 }}>
                  {modelo}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>

      <View
        style={{
          height: "50%",
          marginTop: 20,
          elevation: 4,
          backgroundColor: "red"
        }}
      >
        <ScrollView
          horizontal
          style={{ height: "100%", width: "100%", backgroundColor: "green" }}
        >
          <ScrollView>
            <View
              style={{
                height: "100%",
                width: "100%",
                backgroundColor: "orange"
              }}
            >
              <View
                style={{
                  height: 20,
                  width: "100%",
                  backgroundColor: "yellow",
                  display: "flex",
                  flexDirection: "row"
                }}
              >
                {schemasProp.map((prop, index) =>
                  <View key={index}>
                    <View style={{ width: 300, borderLeftWidth: 1 }}>
                      <Text style={{ textAlign: "center" }}>
                        {prop}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              <View>
                {registros.map((registro, index) =>
                  <View
                    key={index}
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderColor: "#ccc",
                      display: "flex",
                      flexDirection: "row"
                    }}
                  >
                    {schemasProp.map((prop, i) =>
                      <View key={i} style={{ width: 300, borderLeftWidth: 1 }}>
                        <Text
                          key={i}
                          style={{ fontSize: 16, textAlign: "center" }}
                        >
                          {String(registro[prop])}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </ScrollView>
      </View>
      <Modal visible={visible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 20
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              padding: 20
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}
            >
              Campos del Schema
            </Text>

            {schemasProp.map((campo, index) =>
              <Text key={index} style={{ fontSize: 18, marginVertical: 3 }}>
                • {campo}
              </Text>
            )}

            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={{ marginTop: 20, alignSelf: "flex-end" }}
            >
              <Text style={{ fontSize: 16, color: "blue" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conatainer: {
    flex: 1,
    backgroundColor: "#fff"
  },
  touchable: {
    width: "90%",
    height: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "start",
    marginVertical: 5,

    backgroundColor: "#fcfdffff",
    borderBottomColor: "#ccc",
    elevation: 4
  }
});
