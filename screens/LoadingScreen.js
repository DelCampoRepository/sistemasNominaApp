import React, { useState, useEffect } from "react";
import { Alert, View, Modal, Pressable, ActivityIndicator, StatusBar, Platform } from "react-native";
import { Text, ProgressBar} from "react-native-paper";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LoadingDots from "../components/LoadingDots";
import { getRealmInstance } from "../realm";
import { syncNaves } from "../useCases/navesUseCase";
import { syncTablas } from "../useCases/tablasUseCase";
import { syncActividades } from "../useCases/actividadesUseCase";
import { syncEmpleados } from "../useCases/empleadosUseCase";
import { syncEmpleadosCapturados } from "../useCases/empleadosCapturadosUseCase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EnviarRegistrosSurcosTrabajados } from "../useCases/SurcosTrabajadosUseCase";
import { ApiError, setAlertasApiSilenciadas } from "../services/apiClient";
import { marcarSincronizado } from "../utils/sincronizacionEstado";

const PASOS_INICIALES = [
  { key: "naves", label: "Naves" },
  { key: "tablas", label: "Tablas" },
  { key: "actividades", label: "Actividades" },
  { key: "empleados", label: "Empleados" },
  { key: "empleadosCapturados", label: "Empleados capturados" },
  { key: "surcosTrabajados", label: "Surcos trabajados" },
  { key: "limpieza", label: "Limpieza de registros antiguos" }
].map((paso) => ({ ...paso, status: "pending", error: null }));

export default function LoadingScreen({ navigation }) {

  const [realmInstance, setRealmInstance] = useState(null);
  const [StatusText, setStatusText] = useState("");
  const [progressBarValue, setProgressBarValue] = useState(0.0);
  const [pasos, setPasos] = useState(PASOS_INICIALES);
  const [pasoSeleccionado, setPasoSeleccionado] = useState(null);
  const [huboErrores, setHuboErrores] = useState(false);
  const [sincronizacionTerminada, setSincronizacionTerminada] = useState(false);

  
  useEffect(
    () => {
      
      const inicializarRealm = async () => {
    
        setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
  }, []);

  useEffect(
    () => {
      if (realmInstance && realmInstance !== null) {
          
          async function sincronizar() 
          {
        try {
         //                                              await BorrarDatos();
          
        // await borrar_token();  
         //si token no existe
              const userData = realmInstance.objects('UserData');
                console.log("data",userData);
            if(await ValidarExistenciaToken() ===false  || userData.length <= 0){
                Alert.alert("No existen datos de usuario, solo token, vuelva a ingresar las credenciales")
                navigation.navigate("Login");
                return;
            }
            else{//si si existe
              
                //si el token expira
                if(await ValidarVigenciaFechaToken() === true)
                { 
                   navigation.navigate("Login");
                   return;
                }
                else
                {
                    //  const tok =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJqZWZuYXZjb3MyMzEiLCJDb2RpZ29VYmljYWNpb24iOiIwMDEiLCJuYmYiOjE3NzYxODM0OTYsImV4cCI6MTc3NjI5NzYwMCwiaWF0IjoxNzc2MTgzNDk2LCJpc3MiOiJBcHAxMDIwMDEiLCJhdWQiOiJBcHAxMDIwMDFVc2VycyJ9.BMt8y1va4CaRoHPW0UaQfZpTHtWqPSRK2_Fsgt1_6ww"
        //throw new Error("LA CONSULTA DE TABLAS NO RETORNA DATOS!, ERROR AL INTENTAR SOBREESCRIBIR LAS TABLAS ");
                const userData = await realmInstance.objects("UserData");
                const semana = await realmInstance.objects("Semana");
                const datosToken = await  ObtenerTokenGuardado();

                setPasos(PASOS_INICIALES.map((paso) => ({ ...paso })));
                setHuboErrores(false);
                setSincronizacionTerminada(false);
                setAlertasApiSilenciadas(true);

                let huboAlgunError = false;

                try {
                  const resultados = [];

                  resultados.push(await runStep("naves", () =>
                    syncNaves(realmInstance, userData[0].codigo, semana[0].CodigoTemporada, datosToken.token),
                    "La consulta de naves no retornó datos válidos."
                  ));
                  setProgressBarValue(0.15);

                  resultados.push(await runStep("tablas", () =>
                    syncTablas(realmInstance, userData[0].codigo, semana[0].CodigoTemporada, datosToken.token),
                    "La consulta de tablas no retornó datos, error al intentar sobreescribir las tablas."
                  ));
                  setProgressBarValue(0.3);

                  resultados.push(await runStep("actividades", () =>
                    syncActividades(realmInstance, userData[0].codigo, semana[0].CodigoTemporada, datosToken.token),
                    "La consulta de actividades no retornó datos válidos."
                  ));
                  setProgressBarValue(0.45);

                  resultados.push(await runStep("empleados", () =>
                    syncEmpleados(realmInstance, semana[0].CodigoTemporada, datosToken.token),
                    "La consulta de empleados no retornó datos válidos."
                  ));
                  setProgressBarValue(0.6);

                  resultados.push(await runStep("empleadosCapturados", () =>
                    syncEmpleadosCapturados(datosToken.token),
                    "No se pudieron sincronizar los empleados capturados."
                  ));
                  setProgressBarValue(0.75);

                  resultados.push(await runStep("surcosTrabajados", () =>
                    EnviarRegistrosSurcosTrabajados(realmInstance, datosToken.token),
                    null,
                    { falseEsError: false }
                  ));
                  setProgressBarValue(0.9);

                  resultados.push(await runStep("limpieza", () =>
                    BorrarRegistrosViejos(semana[0]),
                    "Problemas al borrar registros viejos."
                  ));
                  setProgressBarValue(1);

                  huboAlgunError = resultados.some((ok) => ok === false);
                } finally {
                  setAlertasApiSilenciadas(false);
                }

                setHuboErrores(huboAlgunError);
                setSincronizacionTerminada(true);

                if (!huboAlgunError) {
                  realmInstance.write(() => {
                    marcarSincronizado(realmInstance);
                  });
                  setStatusText("Sincronización completa. Pulsa continuar para seguir.");
                } else {
                  await LimpiarAccesoYSincronizacion();
                  setStatusText("Se encontraron errores. Se limpiaron los datos de acceso, vuelve a iniciar sesión.");
                }
              }
            }


        }
        catch (error) {
          setAlertasApiSilenciadas(false);
          if (!(error instanceof ApiError)) {
            Alert.alert("Error", `${error}`);
          }
          navigation.goBack();
        }
      }
      sincronizar();
      }

    },
    [realmInstance]

  );

  async function runStep(key, fn, mensajeSiFalse, { falseEsError = true } = {}) {
    setPasos((prev) => prev.map((p) => (p.key === key ? { ...p, status: "running", error: null } : p)));
    try {
      const resultado = await fn();
      if (falseEsError && resultado === false) {
        setPasos((prev) => prev.map((p) => (p.key === key ? { ...p, status: "error", error: { message: mensajeSiFalse } } : p)));
        return false;
      }
      setPasos((prev) => prev.map((p) => (p.key === key ? { ...p, status: "success", error: null } : p)));
      return true;
    } catch (error) {
      const info = error instanceof ApiError
        ? { message: error.message, codigo: error.codigo, status: error.status }
        : { message: error?.message || String(error) };
      setPasos((prev) => prev.map((p) => (p.key === key ? { ...p, status: "error", error: info } : p)));
      return false;
    }
  }

  // Si la sincronización falló, borramos el token/datos de usuario (acceso) y las
  // listas de referencia descargadas (naves/tablas/actividades/empleados) para que
  // la próxima vez el login no se brinque a Home con datos a medio sincronizar,
  // sino que vuelva a pasar por el login completo y por esta misma pantalla.
  // No se tocan EmpleadoCapturado / ActiviadesPorEmpleado / Surco: son captura del
  // empleado aún no enviada al servidor y no se debe perder.
  async function LimpiarAccesoYSincronizacion() {
    try {
      await AsyncStorage.removeItem("TOKEN");
      await AsyncStorage.removeItem("TOKEN_EXPIRA");

      realmInstance.write(() => {
        realmInstance.delete(realmInstance.objects("UserData"));
        realmInstance.delete(realmInstance.objects("Nave"));
        realmInstance.delete(realmInstance.objects("Tablas"));
        realmInstance.delete(realmInstance.objects("Actividades"));
        realmInstance.delete(realmInstance.objects("Empleado"));
      });
    } catch (error) {
      console.log("Error al limpiar datos tras fallo de sincronizacion", error);
    }
  }

  async function BorrarRegistrosViejos(datosSemanaRealm)
  {
      try{
        const semanaActual = datosSemanaRealm.CodigoSemana;
      const margen = 11;
      const limite = semanaActual - margen;
    
      realmInstance.write(() => {
        const viejos = realmInstance.objects("EmpleadoCapturado")
        .filtered("semana <= $0", limite);
        realmInstance.delete(viejos);

         const viejosActividades = realmInstance.objects("ActiviadesPorEmpleado")
        .filtered("semana <= $0", limite);
        realmInstance.delete(viejosActividades);
      });
      return true;
      }
      catch(error)
      {
        return false;
      }
  }

   async function ValidarExistenciaToken(){
    
    const token = await AsyncStorage.getItem("TOKEN");
    const fechaExpiracionToken = await AsyncStorage.getItem("TOKEN_EXPIRA");
    const res = token !== null &&  fechaExpiracionToken !== null;
    
       return res; 
    
  }
async function ObtenerTokenGuardado() {
    const token=await AsyncStorage.getItem("TOKEN");
    const fechaExpiracion= await AsyncStorage.getItem("TOKEN_EXPIRA");

    return{token, fechaExpiracion};
}

async function ValidarVigenciaFechaToken() {
  const fechaExpiracionToken = await AsyncStorage.getItem("TOKEN_EXPIRA");

  const fechaLimite = new Date(fechaExpiracionToken).getTime();
  const fechaActual = Date.now();

  const TokenExpiro = fechaActual > fechaLimite;
  console.log("Expira:", fechaExpiracionToken);
  console.log("Expiró el token?:", TokenExpiro);
  return TokenExpiro;
}

  async function BorrarDatos() {
  //await deleteRealmDatabase();
  realmInstance.write(() => {
  realmInstance.deleteAll();
});
  await borrar_token();  
}
async function borrar_token() {
  await AsyncStorage.removeItem("TOKEN");
  await AsyncStorage.removeItem("TOKEN_EXPIRA");
}


  function renderIconoPaso(status) {
    if (status === "running") {
      return (
        <View style={[styles.pasoIconCircle, styles.pasoIconCircleRunning]}>
          <ActivityIndicator size="small" color="#16a34a" />
        </View>
      );
    }
    if (status === "success") {
      return (
        <View style={[styles.pasoIconCircle, styles.pasoIconCircleSuccess]}>
          <Ionicons name="checkmark" size={16} color="#16a34a" />
        </View>
      );
    }
    if (status === "error") {
      return (
        <View style={[styles.pasoIconCircle, styles.pasoIconCircleError]}>
          <Ionicons name="close" size={16} color="#dc2626" />
        </View>
      );
    }
    return (
      <View style={[styles.pasoIconCircle, styles.pasoIconCirclePending]}>
        <Ionicons name="ellipse-outline" size={14} color="#9ca3af" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />

      <View style={[styles.header, { paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 36 : 70 }]}>
        <View style={styles.loadingDotsBox}>
          <LoadingDots />
        </View>

        <Text style={styles.headerTitulo}>Sincronizando datos</Text>
        <Text style={styles.headerSubtitulo}>
          {StatusText || "Esto puede tardar unos segundos..."}
        </Text>
      </View>

      <View style={styles.sheet}>
        <View style={styles.progresoFila}>
          <ProgressBar
            style={styles.progressBar}
            progress={progressBarValue}
            color="#16a34a"
          />
          <Text style={styles.progresoTexto}>{Math.round(progressBarValue * 100)}%</Text>
        </View>

        <View style={styles.listaPasos}>
          {pasos.map((paso) => (
            <Pressable
              key={paso.key}
              style={({ pressed }) => [
                styles.filaPaso,
                paso.status === "error" && styles.filaPasoError,
                pressed && paso.status === "error" && { opacity: 0.7 }
              ]}
              disabled={paso.status !== "error"}
              onPress={() => setPasoSeleccionado(paso)}
            >
              {renderIconoPaso(paso.status)}
              <Text style={styles.textoPaso}>{paso.label}</Text>
              {paso.status === "error" && (
                <Ionicons name="chevron-forward" size={18} color="#dc2626" />
              )}
            </Pressable>
          ))}
        </View>

        {sincronizacionTerminada && !huboErrores && (
          <Pressable style={styles.botonContinuar} onPress={() => navigation.replace("Home")}>
            <Ionicons name="checkmark-circle" size={18} color="white" />
            <Text style={styles.botonTexto}>Continuar</Text>
          </Pressable>
        )}
        {huboErrores && (
          <Pressable style={styles.botonRegresar} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-circle" size={18} color="white" />
            <Text style={styles.botonTexto}>Regresar</Text>
          </Pressable>
        )}
      </View>

      <Modal
        visible={pasoSeleccionado !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPasoSeleccionado(null)}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="alert-circle" size={28} color="#dc2626" />
            </View>
            <Text style={styles.modalTitulo}>{pasoSeleccionado?.label}</Text>
            <Text style={styles.modalMensaje}>
              {pasoSeleccionado?.error?.message || "Sin información adicional."}
            </Text>
            {pasoSeleccionado?.error?.codigo && (
              <Text style={styles.modalDetalle}>Código: {pasoSeleccionado.error.codigo}</Text>
            )}
            {pasoSeleccionado?.error?.status && (
              <Text style={styles.modalDetalle}>Status HTTP: {pasoSeleccionado.error.status}</Text>
            )}
            <Pressable style={styles.botonCerrarModal} onPress={() => setPasoSeleccionado(null)}>
              <Text style={styles.botonTexto}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#16a34a"
  },
  header: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 24
  },
  loadingDotsBox: {
    width: 120,
    height: 90,
    borderRadius: 45,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  headerTitulo: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold"
  },
  headerSubtitulo: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center"
  },
  sheet: {
    flex: 1,
    backgroundColor: "#f0fff0",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28
  },
  progresoFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dcfce7"
  },
  progresoTexto: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
    width: 38
  },
  listaPasos: {
    marginTop: 20,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6
  },
  filaPaso: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6"
  },
  filaPasoError: {
    backgroundColor: "#fef2f2",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 10
  },
  pasoIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  pasoIconCircleSuccess: {
    backgroundColor: "#dcfce7"
  },
  pasoIconCircleError: {
    backgroundColor: "#fee2e2"
  },
  pasoIconCircleRunning: {
    backgroundColor: "#f0fdf4"
  },
  pasoIconCirclePending: {
    backgroundColor: "#f3f4f6"
  },
  textoPaso: {
    flex: 1,
    marginLeft: 12,
    color: "#111827",
    fontSize: 14
  },
  botonRegresar: {
    flexDirection: "row",
    gap: 8,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "#dc2626",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: "100%"
  },
  botonContinuar: {
    flexDirection: "row",
    gap: 8,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: "100%",
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
  },
  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContenido: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center"
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  modalTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center"
  },
  modalMensaje: {
    color: "#374151",
    marginBottom: 8,
    textAlign: "center"
  },
  modalDetalle: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "center"
  },
  botonCerrarModal: {
    alignSelf: "stretch",
    alignItems: "center",
    marginTop: 16,
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: 12
  }
});
