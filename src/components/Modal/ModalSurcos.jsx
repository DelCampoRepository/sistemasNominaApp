
import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Alert
} from "react-native";
import { Modal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import Surco from "../Elements/Surco";
import { DateTime } from 'luxon';
import {  useWindowDimensions } from 'react-native';
import { useSurcos } from "../../hooks/useSurcos";
import { ahoraTimestamp, finDiaCuliacan, formatearFechaCuliacan, inicioDiaCuliacan } from "../../../utils/obtenerHoraCuliacan";

import { fecha } from "../../../utils/generarHoraLimite";

const redondear2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export default function ModalSurcos({
  setModales,
  modales,
  datosActividad,
  realmInstance,
  datosEmpleadoSeleccionado
  
}) {

const {
  listaSurcos,
  modalFraccionado,
  
  SetModalFraccionado,
  handlePress,
  guardarSurcosSeleccionados,
  handleLongPress,
  datosSurcoTrabajado,
  mostraInfo, 
  setMostrarInfo,
  datosSurcoFraccionSelec,
  setDatosSurcoFraccionSele,
  setListaSurcos,
  BuscarFraccionesDeSurco,
  aportesSurco,
  mostrarAportes,
  setMostrarAportes,
  aportesEditable,
  confirmarEliminarAporteDeSurco
}= useSurcos(realmInstance,datosActividad, modales);

  const [surcoDecimal, setSurcoDecimal] = useState(false);

  const [avanceSurco, setAvanceSurco] = useState("");
  const [sumadorDeSurcos, setSumadorSurcos] = useState(0);
  const { width, height } = useWindowDimensions();

  const [rangoInicio, setRangoInicio] = useState("");
  const [rangoFin, setRangoFin] = useState("");
  const [mostrarRango, setMostrarRango] = useState(false);

  const handleMarcarRango = () => {
    const inicio = parseInt(rangoInicio, 10);
    const fin = parseInt(rangoFin, 10);

    if (isNaN(inicio) || isNaN(fin) || inicio < 1 || fin < inicio) {
      Alert.alert(
        "Del campo y asociados",
        "Verifica que el rango sea válido (inicio y fin, fin mayor o igual a inicio)."
      );
      return;
    }

    let marcados = 0;

    setListaSurcos((prev) =>
      prev.map((surco) => {
        const enRango = surco.surco >= inicio && surco.surco <= fin;
        if (!enRango || surco.estado !== "w") return surco;

        marcados++;
        const primerFraccionado = surco.avanceTotalOtros === 0;

        return {
          ...surco,
          avanceAcum: 1,
          estado: "gr",
          codEmpleado: datosActividad.codigoEmpleado,
          seleccionado: true,
          avanceCompleto: surco.avanceTotalOtros + 1,
          fecha: new Date().toISOString(),
          primerFraccionado
        };
      })
    );

    setRangoInicio("");
    setRangoFin("");

    if (marcados === 0) {
      Alert.alert(
        "Del campo y asociados",
        "Ningún surco del rango estaba disponible (libre) para marcar."
      );
    }
  };

  const handleCerrarModal = () => {
    setModales((prev) => ({
      ...prev,
      modalSurcos: false
    }));
    setSurcoDecimal(false);
    setAvanceSurco("");
    setSumadorSurcos(0);
    setMostrarInfo(false);
  };

const  ViewDatosSurco =()=>{

  return(
    <View style={styles.infoSurcoCard}>
        <TouchableOpacity
          style={styles.cerrarIconoInfo}
         onPress={()=>setMostrarInfo(false)}
        >
          <Ionicons name="close" size={18} color="#6b7280" />
        </TouchableOpacity>

        <View style={styles.infoIconCircle}>
          <Ionicons name="person" size={22} color="#16a34a" />
        </View>

        <Text style={styles.infoNombreEmpleado}>
          {datosSurcoTrabajado.nombreEmpleado || "Sin nombre registrado"}
        </Text>
        <Text style={styles.infoCodigoEmpleado}>{datosSurcoTrabajado.codEmpleado}</Text>

        <View style={styles.infoDatosCard}>
          <View style={styles.filaResumen}>
            <Text style={styles.resumenLabel}>Avance</Text>
            <Text style={styles.resumenValor}>{datosSurcoTrabajado.avanceAcum}</Text>
          </View>
          <View style={styles.filaResumen}>
            <Text style={styles.resumenLabel}>Avance fraccionado</Text>
            <Text style={styles.resumenValor}>{datosSurcoTrabajado.avanceTotalOtros}</Text>
          </View>
          <View style={[styles.filaResumen, { marginBottom: 0 }]}>
            <Text style={styles.resumenLabel}>Fecha trabajado</Text>
            <Text style={styles.resumenValor}>{datosSurcoTrabajado.fecha}</Text>
          </View>
        </View>
    </View>
  );
};

const ViewAportesSurco = () => {
  return (
    <View style={styles.infoSurcoCard}>
      <TouchableOpacity
        style={styles.cerrarIconoInfo}
        onPress={() => setMostrarAportes(false)}
      >
        <Ionicons name="close" size={18} color="#6b7280" />
      </TouchableOpacity>

      <Text style={styles.aportesTitulo}>Aportes a este surco</Text>

      {aportesSurco.length === 0 ? (
        <Text style={styles.aportesVacio}>Sin aportes registrados en el periodo.</Text>
      ) : (
        <FlatList
          data={aportesSurco}
          keyExtractor={(item, index) => `${item.codEmpleado}-${index}`}
          style={styles.aportesLista}
          contentContainerStyle={{ paddingBottom: 4 }}
          renderItem={({ item }) => (
            <View style={styles.aporteCard}>
              <View style={styles.aporteCardHeader}>
                <View style={styles.aporteIconCircle}>
                  <Ionicons name="person-outline" size={16} color="#16a34a" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.aporteNombre}>
                    {item.nombreEmpleado || "Sin nombre registrado"}
                  </Text>
                  <Text style={styles.aporteCodigo}>{item.codEmpleado}</Text>
                </View>
                <Text style={styles.aporteValor}>{item.avanceAcum.toFixed(2)}</Text>
                {aportesEditable && (
                  <TouchableOpacity
                    style={styles.aporteBotonEliminar}
                    onPress={() => confirmarEliminarAporteDeSurco(item)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#dc2626" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.aporteFecha}>{item.fecha}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};


function confirmarAvanceDecimal(){
  const valor = redondear2(parseFloat(avanceSurco));
   console.log("sasdasd",datosSurcoFraccionSelec)
    if (isNaN(valor) || valor < 0 || valor > 1)
      {
        Alert.alert('la cantidad es mayor a  1')
        return;
      };

    const avanceTotalOtros = redondear2(datosSurcoFraccionSelec.avanceTotalOtros);
    const avanceAcumActual = redondear2(datosSurcoFraccionSelec.avanceAcum);

    const dif= valor ===0? 0: redondear2(avanceTotalOtros + valor + avanceAcumActual);
     if ( dif> 1) {
      Alert.alert(
        "Limite excedido",
        `Solo queda disponible ${redondear2(1 - (avanceTotalOtros + avanceAcumActual)).toFixed(2)}`
      );
      return;
    }
   
   
   const res =  BuscarFraccionesDeSurco(valor);
   
    if(res.estado)
    {
       const primerFraccionado = res.totalOtros === 0? true:false



        if(valor === 0)
      {
        setListaSurcos(prev => prev.map(surco =>
        surco.surco === datosSurcoFraccionSelec.surco ?
         {...surco,
          avanceAcum: valor,
           estado: redondear2(avanceTotalOtros) === 0 ?'w':"o",
           codEmpleado: "",
           avanceTotalOtros:avanceTotalOtros,
           seleccionado: false,
           fecha: "",
           avanceCompleto: redondear2(avanceTotalOtros + valor),
           primerFraccionado:false
          } : surco
        ));
      }
      else
      {
          setListaSurcos(prev => prev.map(surco =>
         surco.surco === datosSurcoFraccionSelec.surco ?
          {...surco,
           avanceAcum: valor,
            estado: 'o',
            codEmpleado: datosActividad.codigoEmpleado,
            avanceTotalOtros:avanceTotalOtros,
            seleccionado: true,
            avanceCompleto: redondear2(avanceTotalOtros + valor),
            fecha: new Date().toISOString(),
            primerFraccionado:primerFraccionado
          } : surco,

          ));
      }

    }

    else{
        return;
    }
}


  const hayDatos = Object.keys(datosActividad || {}).length > 0;

  const avanceSeleccionado = redondear2(listaSurcos
    .filter(surco => surco.codEmpleado === datosActividad.codigoEmpleado)
    .reduce((acc, surco) => acc + surco.avanceAcum, 0));

  const jornalCalculado = datosActividad.Rendimiento
    ? avanceSeleccionado / datosActividad.Rendimiento
    : 0;

  return (
   <View pointerEvents="box-none" style={{width:'100%', height:'100%', position:'absolute', elevation: 10, zIndex: 10}}>
      {mostraInfo &&<ViewDatosSurco/>}
      {mostrarAportes &&<ViewAportesSurco/>}
     <Modal
       visible={modales.modalSurcos}
       onDismiss={handleCerrarModal}
       contentContainerStyle={[
         styles.container,
         { width: width > 600 ? "65%" : "95%", height: height * 0.92 }
       ]}
     >
        <TouchableOpacity
          style={styles.cerrarIcono}
         onPress={handleCerrarModal}
        >
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Ionicons name="trending-up-outline" size={26} color="#16a34a" />
        </View>
        <Text style={styles.titulo}>Avance por surcos</Text>

        {hayDatos && (
          <>
            <Text style={styles.subtitulo} numberOfLines={2}>
              {datosActividad.CodigoActividad}-{datosActividad.CodigoAvance} · {datosActividad.Descripcion?.trim()}
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
                  <Text style={styles.metricaValor}>{Number(datosActividad.Rendimiento).toFixed(2)}</Text>
                </View>
                <View style={styles.metrica}>
                  <Text style={styles.metricaLabel}>Rend. tope</Text>
                  <Text style={styles.metricaValor}>{datosActividad.RendimientoTope}</Text>
                </View>
                <View style={styles.metrica}>
                  <Text style={styles.metricaLabel}>Jornal</Text>
                  <Text style={styles.metricaValor}>{jornalCalculado.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {datosActividad.dias_frecuencia_surcos != null && (
              <View style={styles.vigenciaFila}>
                <Ionicons name="time-outline" size={14} color="#2563eb" />
                <Text style={styles.vigenciaTexto}>
                  Un surco trabajado se bloquea {datosActividad.dias_frecuencia_surcos} día{datosActividad.dias_frecuencia_surcos === 1 ? "" : "s"} antes de volver a estar disponible
                </Text>
              </View>
            )}
          </>
        )}

        <TouchableOpacity
          style={styles.rangoToggle}
          activeOpacity={0.8}
          onPress={() => setMostrarRango((prev) => !prev)}
        >
          <Ionicons name="apps-outline" size={16} color="#2563eb" />
          <Text style={styles.rangoToggleTexto}>Marcar surcos por rango</Text>
          <Ionicons name={mostrarRango ? "chevron-up" : "chevron-down"} size={16} color="#2563eb" />
        </TouchableOpacity>

        {mostrarRango && (
          <View style={styles.rangoCard}>
            <Text style={styles.rangoSubtitulo}>
              Solo se marcan en verde (avance 1) los surcos libres (blancos) dentro del rango.
            </Text>

            <View style={styles.rangoFila}>
              <View style={styles.rangoCampo}>
                <Text style={styles.rangoLabel}>Inicio</Text>
                <TextInput
                  style={styles.rangoInput}
                  placeholder="1"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  value={rangoInicio}
                  onChangeText={setRangoInicio}
                />
              </View>

              <Ionicons name="arrow-forward" size={18} color="#9ca3af" style={{ marginTop: 18 }} />

              <View style={styles.rangoCampo}>
                <Text style={styles.rangoLabel}>Fin</Text>
                <TextInput
                  style={styles.rangoInput}
                  placeholder="20"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  value={rangoFin}
                  onChangeText={setRangoFin}
                />
              </View>

              <TouchableOpacity
                style={styles.rangoBoton}
                activeOpacity={0.85}
                onPress={handleMarcarRango}
              >
                <Ionicons name="checkmark" size={18} color="white" />
                <Text style={styles.rangoBotonTexto}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

         {modalFraccionado &&<View style={styles.fraccionadoCard}>
            <Text style={styles.fraccionadoTitulo}>Agregar avance para surco fraccionado</Text>
            <TextInput
             style={styles.fraccionadoInput}
              placeholder="Avance"
              placeholderTextColor="#9ca3af"
               keyboardType="decimal-pad"
               onChangeText={(text) => {setAvanceSurco(text)}}
               value={avanceSurco}
               ></TextInput>
            <View style={{flexDirection:'row', gap: 10}}>
              <TouchableOpacity
            style={[styles.botonesFormFraccionado, styles.botonConfirmar]}
            onPress={()=>{SetModalFraccionado(false);confirmarAvanceDecimal();}}
            >
              <Text style={styles.botonFraccionadoTexto}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={[styles.botonesFormFraccionado, styles.botonCancelar]}
            onPress={()=>SetModalFraccionado(false)}
            >
              <Text style={[styles.botonFraccionadoTexto, { color: "#374151" }]}>Cancelar</Text>
            </TouchableOpacity>
            </View>
        </View>

         }

        <View style={styles.contenedorSurcos}>
          {listaSurcos.length - 1 > 0 && (
            <FlatList
              data={listaSurcos}
              renderItem={({ item }) => (
                <Surco
                  item={item}
                  onPressSurco={handlePress}
                  onLongPressSurco={handleLongPress}
                  setSumadorSurcos={setSumadorSurcos}
                />
              )}
              keyExtractor={(item) => item.surco.toString()}
              horizontal={false}
              numColumns={  width > 600 ?6:5}
              contentContainerStyle={styles.flatlistContent}
            />
          )}
        </View>
        <TouchableOpacity
          style={styles.botonAgregar}
          activeOpacity={0.85}
          onPress={()=>{
            guardarSurcosSeleccionados(),
            setMostrarInfo(false)
          }}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="white" />
          <Text style={styles.botonAgregarTexto}>
            Agregar avances
          </Text>
        </TouchableOpacity>
    </Modal>
   </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignSelf: "center",
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 10
  },
  titulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center"
  },
  subtitulo: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 14,
    textAlign: "center"
  },
  resumenCard: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14
  },
  vigenciaFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "100%",
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 10
  },
  vigenciaTexto: {
    flex: 1,
    fontSize: 11,
    color: "#2563eb"
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
  rangoToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe"
  },
  rangoToggleTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563eb"
  },
  rangoCard: {
    width: "100%",
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    padding: 14,
    marginTop: 8
  },
  rangoSubtitulo: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 10
  },
  rangoFila: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8
  },
  rangoCampo: {
    flex: 1
  },
  rangoLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 4
  },
  rangoInput: {
    height: 38,
    textAlign: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    fontSize: 14,
    color: "#111827"
  },
  rangoBoton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#16a34a"
  },
  rangoBotonTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13
  },
  fraccionadoCard: {
    width: "100%",
    backgroundColor: "#f0fdf4",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    padding: 14,
    marginTop: 14,
    alignItems: "center"
  },
  fraccionadoTitulo: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
    marginBottom: 10
  },
  fraccionadoInput: {
    height: 42,
    textAlign: "center",
    width: "50%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    fontSize: 15,
    color: "#111827"
  },
  botonesFormFraccionado: {
    borderRadius: 10,
    marginTop: 14,
    paddingVertical: 10,
    minWidth: "40%",
    justifyContent: "center",
    alignItems: "center"
  },
  botonConfirmar: {
    backgroundColor: "#16a34a"
  },
  botonCancelar: {
    backgroundColor: "#e5e7eb"
  },
  botonFraccionadoTexto: {
    color: "white",
    fontWeight: "bold"
  },
  contenedorSurcos: {
    flex: 1,
    backgroundColor: "#f8fafc",
    width: "100%",
    marginTop: 14,
    borderRadius: 14
  },
  flatlistContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 10
  },
  botonAgregar: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    paddingVertical: 14,
    backgroundColor: "#16a34a",
    borderRadius: 14,
    marginTop: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6
  },
  botonAgregarTexto: {
    fontWeight: "bold",
    fontSize: 14,
    color: "white"
  },
  infoSurcoCard: {
    width: "88%",
    maxWidth: 420,
    margin: "auto",
    elevation: 6,
    zIndex: 9999,
    backgroundColor: "white",
    padding: 20,
    paddingTop: 36,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10
  },
  cerrarIconoInfo: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1
  },
  infoIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  infoNombreEmpleado: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center"
  },
  infoCodigoEmpleado: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    marginBottom: 16
  },
  infoDatosCard: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14
  },
  aportesTitulo: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#111827",
    marginBottom: 12,
    textAlign: "center"
  },
  aportesVacio: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 10
  },
  aportesLista: {
    width: "100%",
    maxHeight: 320
  },
  aporteCard: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10
  },
  aporteCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  aporteIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center"
  },
  aporteNombre: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    flexWrap: "wrap"
  },
  aporteCodigo: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2
  },
  aporteFecha: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 8
  },
  aporteValor: {
    fontSize: 14,
    fontWeight: "700",
    color: "#16a34a"
  },
  aporteBotonEliminar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10
  }
});
