import { Modal } from "react-native-paper";
import {
  TextInput,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getRealmInstance } from "../../../realm";
import { useEffect, useState } from "react";
import { finDiaCuliacan, inicioDiaAyer, inicioDiaCuliacan } from "../../../utils/obtenerHoraCuliacan";
import { marcarPendienteSincronizacion } from "../../../utils/sincronizacionEstado";
export default function ModalAgregarAvance({
  setModales,
  modales,
  datosEmpleadoSeleccionado,
  datosActividad
}) {
  const [avance, setAvance] = useState("0");
  const [RealmInstance, setRealmInstance] = useState(null);
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



  useEffect(() => {
    setAvance(datosActividad.avances);
  }, [datosActividad]);
  
  const handleOnpress = () => {
    if (RealmInstance === null) return;
   
    if (( (Math.round(avance * 100) / 100) /  (Math.round(datosActividad.Rendimiento * 100) / 100)) > datosActividad.RendimientoTope) {

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
            FechaCaptura >= $5 AND 
            CodTabla == $6 AND
            FechaCaptura <= $7 
          `,
          datosEmpleadoSeleccionado.CodigoEmpleado,
          datosActividad.CodigoActividad,
          datosActividad.CodigoAvance,
          datosActividad.codigoLote,
          datosActividad.codigoNave,
          inicioDiaCuliacan(),
          datosActividad.codigoTabla,
          finDiaCuliacan()
        );
        console.log('encontrado',empleado, inicioDiaCuliacan(), finDiaCuliacan());
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
          fecha >= $5 AND 
          codigoTabla == $6 AND
          fecha <= $7 
      `,
          datosEmpleadoSeleccionado.CodigoEmpleado,
          datosActividad.CodigoActividad,
          datosActividad.CodigoAvance,
          datosActividad.codigoLote,
          datosActividad.codigoNave,
          inicioDiaCuliacan(),
          datosActividad.codigoTabla,
          finDiaCuliacan()
        );

        if (actividadesEncontradas.length == 0) return;

        const actividad = actividadesEncontradas[0];

        actividad.avances = Number(avance);
        actividad.jornal = Number(
          datosActividad.avances / datosActividad.Rendimiento
        );

        marcarPendienteSincronizacion(RealmInstance);

        setModales((prev) => ({
          ...prev,
          modalAvance: false
        }));
      });
    } catch (error) {
      console.log(error);
    }
  };

  const hayDatos = Object.keys(datosActividad).length > 0;
  const esNuevo = datosActividad.avances === 0;

  return (
    <View pointerEvents="box-none" style={styles.capaModal}>
    <Modal visible={modales.modalAvance} style={styles.mainModal} onDismiss={handleCerrarModal}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.cerrarIcono} onPress={handleCerrarModal}>
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Ionicons name="trending-up-outline" size={28} color="#16a34a" />
        </View>
        <Text style={styles.titulo}>
          {esNuevo ? "Agregar avance" : "Modificar avance"}
        </Text>

        {hayDatos && (
          <>
            <Text style={styles.subtitulo} numberOfLines={2}>
              {datosActividad.CodigoActividad}-{datosActividad.CodigoAvance} · {datosActividad.Descripcion.trim()}
            </Text>

            <View style={styles.resumenCard}>
              <View style={styles.filaResumen}>
                <Text style={styles.resumenLabel}>Empleado</Text>
                <Text style={styles.resumenValor} numberOfLines={1}>
                  {datosActividad.codigoEmpleado} - {datosActividad.nombreEmpleado}
                </Text>
              </View>
              <View style={styles.filaResumen}>
                <Text style={styles.resumenLabel}>Ubicación</Text>
                <Text style={styles.resumenValor}>
                  Lote {datosActividad.codigoLote} · Nave {datosActividad.codigoNave} · Tabla {datosActividad.codigoTabla}
                </Text>
              </View>

              <View style={styles.separador} />

              <View style={styles.metricasFila}>
                <View style={styles.metrica}>
                  <Text style={styles.metricaLabel}>Rend. aplic.</Text>
                  <Text style={styles.metricaValor}>{datosActividad.Rendimiento.toFixed(2)}</Text>
                </View>
                <View style={styles.metrica}>
                  <Text style={styles.metricaLabel}>Rend. tope</Text>
                  <Text style={styles.metricaValor}>{datosActividad.RendimientoTope}</Text>
                </View>
                <View style={styles.metrica}>
                  <Text style={styles.metricaLabel}>Jornal</Text>
                  <Text style={styles.metricaValor}>{datosActividad.jornal.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </>
        )}

        <View style={styles.campo}>
          <Text style={styles.labelAvance}>
            Avance {hayDatos ? `(${datosActividad.NomCortoUnidad})` : ""}
          </Text>
          <TextInput
            style={styles.textImput}
            value={avance}
            onChangeText={(text) => {
              setAvance(text);
            }}
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity style={styles.botonAgregar} activeOpacity={0.85} onPress={handleOnpress}>
          <Ionicons name={esNuevo ? "add-circle-outline" : "checkmark-circle-outline"} size={20} color="white" />
          <Text style={styles.botonTexto}>
            {esNuevo ? "Agregar avance" : "Modificar avance"}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  capaModal: {
    width: "100%",
    height: "100%",
    position: "absolute",
    elevation: 10,
    zIndex: 10
  },
  mainModal: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center"
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    width: "88%",
    alignItems: "center",
    margin: "auto",
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
    marginBottom: 16,
    textAlign: "center"
  },
  resumenCard: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16
  },
  filaResumen: {
    marginBottom: 8
  },
  resumenLabel: {
    fontSize: 10,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.3
  },
  resumenValor: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
    marginTop: 2
  },
  separador: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8
  },
  metricasFila: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  metrica: {
    alignItems: "center",
    flex: 1
  },
  metricaLabel: {
    fontSize: 10,
    color: "#9ca3af"
  },
  metricaValor: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginTop: 2
  },
  campo: {
    width: "100%",
    marginBottom: 18
  },
  labelAvance: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6
  },
  textImput: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#f9fafb"
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
    elevation: 3,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6
  },
  botonTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15
  }
});
