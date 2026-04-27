import { Modal } from "react-native-paper";
import {
  TextInput,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert
} from "react-native";
import { getRealmInstance } from "../../../realm";
import { useEffect, useState } from "react";
import {  useWindowDimensions } from 'react-native';
export default function ModalAgregarAvance({
  setModales,
  modales,
  datosEmpleadoSeleccionado,
  datosActividad
}) {
  const [avance, setAvance] = useState("0");
  const [RealmInstance, setRealmInstance] = useState(null);
  const { width } = useWindowDimensions();
  useEffect(() => {
    async function getRealm() {
      setRealmInstance(await getRealmInstance());
    }
    getRealm();

    setAvance(String(datosActividad.avances));
  }, []);

  const handleCerrarModal = () => {
    setModales((prev) => ({
      ...prev,
      modalAvance: false
    }));
    setAvance("0");
  };

  const GenerarFecha = (horaExtra = false, SoloFecha = true) => {
    //   console.log(limiteMaximoCaptura, "limiteMaximoCaptura");
    const ahora = new Date();

    //if (horaExtra) ahora.setHours(ahora.() + limiteMaximoCaptura);

    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    let horas = String(ahora.getHours()).padStart(2, "0");

    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const segundos = String(ahora.getSeconds()).padStart(2, "0");
    let fechaFormateada = ``;

    if (SoloFecha) {
      fechaFormateada = `${año}-${mes}-${dia}`;
    } else {
      fechaFormateada = `${año}-${mes}-${dia} ${horas}:${
        horaExtra ? Number(minutos) + Number(2) : minutos
      }:${segundos}`;
    }
    return fechaFormateada;
  };
  //console.log(JSON.stringify(datosActividad, null, 2));

  useEffect(() => {
    setAvance(datosActividad.avances);
  }, [datosActividad]);
  const handleOnpress = () => {
    if (RealmInstance === null) return;
    if (avance / datosActividad.Rendimiento > datosActividad.RendimientoTope) {
      Alert.alert(
        "Del campo y asociados",
        "avance supera el rendimineto Tope!"
      );
      return;
    }
    try {
      RealmInstance.write(() => {
        const empleado = RealmInstance.objects("EmpleadoCapturado").filtered(
          `
            CodigoEmpleado == $0 AND
            CodigoActividad == $1 AND
            CodigoAvance == $2 AND
            CodigoLote == $3 AND
            CodigoNave == $4 AND 
            FechaCaptura == $5 AND 
            CodTabla == $6
          `,
          datosEmpleadoSeleccionado.CodigoEmpleado,
          datosActividad.CodigoActividad,
          datosActividad.CodigoAvance,
          datosActividad.codigoLote,
          datosActividad.codigoNave,
          new Date(GenerarFecha(false, true)),
          datosActividad.codigoTabla
        );

        if (empleado.length == 0) return;

        const emp = empleado[0];

        emp.Avances = Number(avance);

        const actividadesEncontradas = RealmInstance.objects(
          "ActiviadesPorEmpleado"
        ).filtered(
          `
          codigoEmpleado == $0 AND
          CodigoActividad == $1 AND
          CodigoAvance == $2 AND
          codigoLote == $3 AND
          codigoNave == $4 AND
          fecha == $5 AND 
          codigoTabla == $6
      `,
          datosEmpleadoSeleccionado.CodigoEmpleado,
          datosActividad.CodigoActividad,
          datosActividad.CodigoAvance,
          datosActividad.codigoLote,
          datosActividad.codigoNave,
          new Date(GenerarFecha(false, true)),
          datosActividad.codigoTabla
        );

        if (actividadesEncontradas.length == 0) return;

        const actividad = actividadesEncontradas[0];

        actividad.avances = Number(avance);
        actividad.jornal = Number(
          datosActividad.avances / datosActividad.Rendimiento
        );

        setModales((prev) => ({
          ...prev,
          modalAvance: false
        }));
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal visible={modales.modalAvance} style={styles.mainModal}>
      <View style={[styles.container,{width: width > 600 ? "60%" : "80%"}]}>
        <View style={styles.ViewCerrar}>
          <TouchableOpacity
            style={styles.cerrarIcono}
            onPress={handleCerrarModal}
          >
            <Image
              source={require("../../../assets/cerraar.png")}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {Object.keys(datosActividad).length > 0 && (
          <View style={{ marginTop: 20, borderWidth: 1, padding: 10, borderRadius: 5 }}>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Cod. empleado: {datosActividad.codigoEmpleado}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Nom. empleado: {datosActividad.nombreEmpleado}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Lote: {datosActividad.codigoLote}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Nave: {datosActividad.codigoNave}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Tabla: {datosActividad.codigoTabla}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Actividad: {datosActividad.CodigoActividad}-
              {datosActividad.CodigoAvance}, {datosActividad.Descripcion.trim()}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Rend. aplicado: {datosActividad.Rendimiento}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Rend. tope: {datosActividad.RendimientoTope}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Avances: {datosActividad.avances.toFixed(2)}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Unidad: {datosActividad.NomCortoUnidad}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Jornal: {datosActividad.jornal.toFixed(2)}
            </Text>
          </View>
        )}

        <Text style={{ fontWeight: "bold", fontSize: 16, marginTop: 20 }}>
          Avance
        </Text>
        <TextInput
          style={[styles.textImput, { height: width > 600 ? "12%" : "10%" ,fontSize: width > 600 ? 13 : 12 }]}
          value={avance}
          onChangeText={(text) => {
            setAvance(text);
          }}
          keyboardType="decimal-pad"
        />
        <TouchableOpacity style={[styles.botonAgregar, { height: width > 600 ? "12%" : "10%" }]} onPress={handleOnpress}>
          <Text style={{ fontWeight: "bold", fontSize: width > 600 ? 13 : 12, color: "white" }}>
            {datosActividad.avances === 0
              ? "AGREGAR AVANCE"
              : "MODIFICAR AVANCE"}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mainModal: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center"
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "60%",

    margin: "auto"
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
    justifyContent: "center",
    marginTop: 20,
    alignItems: "center"
  },
  cerrarIcono: {
    position: "absolute",
    
    
    zIndex: 1
  },
  ViewCerrar: {
    marginTop: 10,
    height: "5%",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center"
  }
});
