import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextInput } from "react-native-paper";
import logo from "../assets/logo.png";
import * as services from "../services/services";
import { deleteRealmDatabase, getRealmInstance } from "../realm";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { importarJSONaRealm } from "../utils/LeerArchivoExportado";
import { ConsultarDatosSemanaActiva } from "../services/obtenerSemanaService";
import ModalCargando from "../src/components/ModalSesion";
import { exportarRealmAJSON2 } from "../utils/recuperaLocal";
import { importarJSONaRealmManual } from "../utils/importarManual";
import { exportarRealmAJSON } from "../utils/CreadorArchivos";
import { ApiError } from "../services/apiClient";
import PatronLock from "../src/components/PatronLock";
import { existePatron, validarPatron } from "../utils/patronUtils";
import { useSesionStore } from "../store/useSesionStore";

export default function LoginScreen({ navigation }) {


  const [passwordVisible, setPasswordVisible] = useState(false);
  const [inputUser, setInputUser] = useState("Jefnavcos41");
  const [inputPassword, setInputPassword] = useState("Jncos41");
  const [realmInstance, setRealmInstance] = useState(null);
  const [desbloquear, setDesbloquear] = useState(false);
  const [MostraModal, setMostraModal] = useState(false);
  const [patronDisponible, setPatronDisponible] = useState(false);
  const [nomUsuarioConPatron, setNomUsuarioConPatron] = useState(null);
  const [mostrarModalPatron, setMostrarModalPatron] = useState(false);
  const patronLockRef = useRef(null);
  const setPatronHabilitadoGlobal = useSesionStore((s) => s.setPatronHabilitado);
  const setNombreUsuarioActivoGlobal = useSesionStore((s) => s.setNombreUsuarioActivo);
  // Inicializamos Realm solo una vez
  useEffect(() => {
   //deleteRealmDatabase();
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
     //await borrar_token();  
    };
    inicializarRealm();
  }, []);

  useEffect(() => {
//BorrarDatos()
  }, [realmInstance]);

  useEffect(() => {
    if (realmInstance) {
      const userData = realmInstance.objects("UserData");
      if (userData.length > 0) {
        const nombre = userData[0].nomUsuario;
        setNomUsuarioConPatron(nombre);
        const disponible = existePatron(realmInstance, nombre);
        setPatronDisponible(disponible);
        setNombreUsuarioActivoGlobal(nombre);
        setPatronHabilitadoGlobal(disponible);
      }
    }
  }, [realmInstance]);
async function borrar_token() {
  await AsyncStorage.removeItem("TOKEN");
  await AsyncStorage.removeItem("TOKEN_EXPIRA");
}

  async function HandleLogin(usuarioOverride, passwordOverride) {

       try{

        setMostraModal(true);
            if(ValidarCredencialesIngresadas(usuarioOverride, passwordOverride))
            {
               const userData = realmInstance.objects('UserData');

              //si el token existe
              if( await ValidarExistenciaToken() ){
              
                //Si el token aun no expira
                if(await ValidarVigenciaFechaToken() === false && userData.length > 0)
                  {   
                    //navegamos a home    
                    navigation.navigate("Home");
                     return;
                  }
                  else // si el token ya expiro
                  {   
                    //obtenemos uno nuevo
                    const loginRes=  await Login(usuarioOverride, passwordOverride);
                    //validamos que la semana activa
                   if(loginRes)
                   {
                     const res = await ValidarSemanaActiva();
                        if(res.valido)
                          {
                            //si la semana activa se actualizo
                            if(res.semanaCambio)
                            { 
                              //sincronizamos
                              navigation.navigate("Loading");
                              return;
                            }
                            else{//si no se actualizo vamos a home
                              
                              navigation.navigate("Home");
                               return;
                            }
                          }else{
                      
                          Alert.alert("error","erro en la validacion de la semana")
                     }
                   }
                    
                  }
          }else{ //si el token no existe en el dispositivo
            //pedimos uno

            const  loginRes= await Login(usuarioOverride, passwordOverride);
             //validamos la semana
           if(loginRes)
           {
              const res = await ValidarSemanaActiva();
              if(res.valido)
              {
                
                if(res.semanaCambio){ 
                   navigation.navigate("Loading");
                }
                else{                 
                   navigation.navigate("Home");   
                }
              }else{
                console.log("eee");
              }
           }

          }
         }else
         {
          return;
         }
       }catch(error)
       {
        if (!(error instanceof ApiError)) {
          Alert.alert(`${error}`)
        }
       }
       finally{
             setMostraModal(false);
       }
    
  }

  async function handlePatronIngresado(patronArray) {
    const valido = validarPatron(realmInstance, nomUsuarioConPatron, patronArray);

    if (!valido) {
      patronLockRef.current?.marcarEstado("error");
      Alert.alert("Error", "Patrón incorrecto.");
      return;
    }

    const credenciales = realmInstance
      .objects("CredencialesSchema")
      .filtered("nomUsuario == $0", nomUsuarioConPatron)[0];

    if (!credenciales) {
      Alert.alert("Error", "No se encontraron credenciales guardadas para este patrón.");
      return;
    }

    patronLockRef.current?.marcarEstado("exito");
    setMostrarModalPatron(false);
    setInputUser(credenciales.nomUsuario);
    setInputPassword(credenciales.password);
    await HandleLogin(credenciales.nomUsuario, credenciales.password);
  }

  async function ValidarExistenciaToken(){
    
    const token = await AsyncStorage.getItem("TOKEN");
    const fechaExpiracionToken = await AsyncStorage.getItem("TOKEN_EXPIRA");
    const res = token !== null &&  fechaExpiracionToken !== null;
    
       return res; 
    
  }
  
  async function Login(usuarioOverride, passwordOverride){

     const usuario = usuarioOverride ?? inputUser;
     const password = passwordOverride ?? inputPassword;

     const response = await services.login({
        nombreUsuario: usuario,
        password: password
      });



      if (response.estado !== undefined && response.estado !== 1) {

        Alert.alert(`Del campo y asociados`,`${response.mensaje}`);
        return false;
      }
      else if(response.estado ===0){

          return false;
      }else{

          await GuardarTokenEnAsyncStorage(response.token, response.tokenExpira);
          await GuardarDatosUsuarioEnRealm(response);
          await GuardarCredenciales({user: response.nomUsuario,pass:password});
          return true;
      }
  }

  async function GuardarTokenEnAsyncStorage(token, fechaExpiracion) {
    
  await AsyncStorage.setItem("TOKEN", token);
  await AsyncStorage.setItem("TOKEN_EXPIRA", fechaExpiracion);
  }

  async function GuardarDatosUsuarioEnRealm(response) {
    if (realmInstance !== null) {
        await realmInstance.write(() => {
          if (realmInstance.objects("UserData") !== null)
            realmInstance.delete(realmInstance.objects("UserData"));
            realmInstance.create("UserData", {
            estado: response.estado,
            codigo: response.codigo,
            nomUsuario: response.nomUsuario,
            nombre: response.nombre,
            codigoUbicacion: response.codigoUbicacion,
            token: response.token,
            tokenExpira: response.tokenExpira
          });
        });
      }
  }

  function ValidarCredencialesIngresadas(usuarioOverride, passwordOverride){

     const usuario = usuarioOverride ?? inputUser;
     const password = passwordOverride ?? inputPassword;

     if(usuario.trim() === "Delcampo21"){
      setDesbloquear(true);
      return false;
    }
    else if(usuario.trim() === "Delcampo22"){
      setDesbloquear(false);
      return false;
    }
     else if(usuario.trim() === "" || password.trim() === ""){
      Alert.alert("Error", "Por favor ingrese usuario y contraseña");
      return false;
    }
    else{
      const credenciales= realmInstance.objects("CredencialesSchema");
      if(credenciales.length > 0)
      {
         if(usuario.toLowerCase() === credenciales[0].nomUsuario.toLowerCase()  && password.toLowerCase() === credenciales[0].password.toLowerCase())
         {
          return true
         }
         else{
            Alert.alert("Error", "Credenciales incorrectas!");
          return false;
         }
      }
      else{
        return true;
      }

    }
  }

 async function ValidarVigenciaFechaToken(){
    const fechaExpiracionToken = await AsyncStorage.getItem("TOKEN_EXPIRA");
    const soloFecha = fechaExpiracionToken.split("T")[0];

    const [y, m, d] = soloFecha.split("-").map(Number);
    const fechaLimite = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
    const fechaActual = Date.now();

    const TokenExpiro =fechaLimite  < fechaActual ;
  //  console.log("expiro el token?: ",TokenExpiro);
    return TokenExpiro;
  }

async function  GuardarCredenciales(data) {
 try{
    realmInstance.write(()=>{
    realmInstance.create("CredencialesSchema",{
        nomUsuario: data.user,
        password: data.pass
    },"modified");
  })
 }
 catch(error)
 {
    console.log(error)
 }
}
 async function ValidarSemanaActiva()
  {
    const semanaRealm = await realmInstance.objects("Semana");
    const datosUsuarioRrealm = await realmInstance.objects("UserData"); 
    const datosToken = await ObtenerTokenGuardado();
    if(datosUsuarioRrealm.length > 0)
    {
     
      try{
        const RespuesApiSemana = await ConsultarDatosSemanaActiva(datosUsuarioRrealm[0].token);
            console.log(RespuesApiSemana)
            if(RespuesApiSemana === null)
            {
              Alert.alert("Error","La consulta para obtener la semana activa de la api  no retorno lo esperado!");
              return { valido: false, semanaCambio: false };
            } 

            if(semanaRealm.length > 0)
            {  
              
              if (compararSemanaApiVsGuardada(RespuesApiSemana, semanaRealm[0])) {
                 
                await GuardarSemanaActivaEnRealm(RespuesApiSemana);
                return { valido: true, semanaCambio: true };
              }
              else{
                
                return { valido: true, semanaCambio: false };
              }

            }else{
             
              await GuardarSemanaActivaEnRealm(RespuesApiSemana);
              return { valido: true, semanaCambio: true };
            }
         
      }
      catch(error){
          Alert.alert("Error", `No se pudo conectar con el servidor.  ${error}`);
          return { valido: false, semanaCambio: false };
        }
    }else{
            Alert.alert("Error","La busqueda de la semanaActiva guardada en el dispositivo no arrojo resultados, no se puede realizar consulta de la semana si no hay token en UserDataSchema!");
              return { valido: false, semanaCambio: false };
           }

  }

  async function GuardarSemanaActivaEnRealm(datosSemana){
    await realmInstance.write(() => {

        realmInstance.delete(realmInstance.objects("Semana"));

        realmInstance.create(
        "Semana",
        {
          CodigoSemana: Number(datosSemana.codigoSemana),
          CodigoTemporada: Number(datosSemana.codigoTemporada),
          FechaInicial: datosSemana.fechaInicial,
          FechaFinal:datosSemana.fechaFinal
        },
        "modified"
      );
    });
  }

  async function compararSemanaApiVsGuardada(semanaApi, semanaRealm) {
  
    const semanaDeApi = Number(semanaApi.codigoSemana); 
    
    const semanaDeRealm = Number(semanaRealm.CodigoSemana);
     // console.log(semanaDeApi,semanaDeRealm);
    if(semanaDeApi > semanaDeRealm)
    {
       console.log(semanaDeApi,"mayor a ",semanaDeRealm);
        return true;
    }
  
  else{
     return false;
  }
    
  } 
 
  //NO USAR EN PRODUCCION
async function borrar_token() {
  await AsyncStorage.removeItem("TOKEN");
  await AsyncStorage.removeItem("TOKEN_EXPIRA");
}

   
async function ObtenerTokenGuardado() {
    const token=await AsyncStorage.getItem("TOKEN");
    const fechaExpiracion= await AsyncStorage.getItem("TOKEN_EXPIRA");

    return{token, fechaExpiracion};
}
     
async function BorrarDatos() {
  try {
    if (!realmInstance) {
      Alert.alert("Del Campo y Asociados", "Realm aún no está listo, intenta de nuevo.");
      return;
    }
    realmInstance.write(() => {
      realmInstance.deleteAll();
    });
    Alert.alert("Del Campo y Asociados", "Datos locales borrados correctamente.");
  } catch (error) {
    console.error("Error al borrar datos de Realm:", error);
    Alert.alert("Del Campo y Asociados", `No se pudo borrar: ${error.message}`);
  }
}

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      <ModalCargando visible={MostraModal} />

      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Image source={logo} style={styles.logo} />
        </View>
        <Text style={styles.title}>Actividades</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.sheetWrapper}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.sheet}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <TextInput
              label="Usuario"
              value={inputUser}
              style={styles.input}
              mode="outlined"
              maxLength={15}
              onChangeText={text => setInputUser(text)}
              textColor="#111827"
              selectionColor="#16a34a"
              outlineColor="#d1d5db"
              activeOutlineColor="#16a34a"
              outlineStyle={styles.inputOutline}
              theme={{
                colors: {
                  primary: "#16a34a",
                  onSurfaceVariant: "#6b7280",
                  surfaceVariant: "#f9fafb"
                }
              }}
            />

            <TextInput
              label="Contraseña"
              value={inputPassword}
              secureTextEntry={!passwordVisible}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? "eye-off" : "eye"}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  color="#6b7280"
                />
              }
              style={styles.input}
              mode="outlined"
              maxLength={20}
              onChangeText={text => setInputPassword(text)}
              textColor="#111827"
              selectionColor="#16a34a"
              outlineColor="#d1d5db"
              activeOutlineColor="#16a34a"
              outlineStyle={styles.inputOutline}
              theme={{
                colors: {
                  primary: "#16a34a",
                  onSurfaceVariant: "#6b7280",
                  surfaceVariant: "#f9fafb"
                }
              }}
            />

            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.85}
              onPress={() => HandleLogin()}
            >
              <Text style={styles.loginButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            {patronDisponible && (
              <TouchableOpacity
                style={styles.patternButton}
                activeOpacity={0.7}
                onPress={() => setMostrarModalPatron(true)}
              >
                <Ionicons name="keypad-outline" size={18} color="#16a34a" />
                <Text style={styles.patternButtonText}>Ingresar con patrón</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.footer}>Del Campo y Asociados S.A. de C.V.</Text>

          {/* Herramientas de desarrollo — NO USAR EN PRODUCCION */}
          <View style={styles.devBar}>
            <TouchableOpacity style={styles.devBoton} onPress={() => exportarRealmAJSON(realmInstance)}>
              <Ionicons name="arrow-up-circle-outline" size={18} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.devBoton} onPress={() => importarJSONaRealm(realmInstance)}>
              <Ionicons name="download-outline" size={18} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.devBoton} onPress={() => navigation.navigate("pantallaTablaDatos")}>
              <Ionicons name="cloud-outline" size={18} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.devBoton} onPress={() => BorrarDatos()}>
              <Ionicons name="trash-outline" size={18} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.devBoton} onPress={() => exportarRealmAJSON2(realmInstance)}>
              <Ionicons name="document-text-outline" size={18} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.devBoton} onPress={() => importarJSONaRealmManual(realmInstance)}>
              <Ionicons name="folder-open-outline" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={mostrarModalPatron}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarModalPatron(false)}
      >
        <View style={styles.modalPatronFondo}>
          <View style={styles.modalPatronContenido}>
            <Text style={styles.modalPatronTitulo}>Ingresa tu patrón</Text>
            <PatronLock
              ref={patronLockRef}
              size={240}
              onPatronCompleto={handlePatronIngresado}
            />
            <TouchableOpacity
              style={styles.modalPatronCerrar}
              onPress={() => setMostrarModalPatron(false)}
            >
              <Text style={{ color: "#16a34a", fontWeight: "bold" }}>Cancelar</Text>
            </TouchableOpacity>
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
    justifyContent: "center",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 36 : 70,
    paddingBottom: 40
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  logo: {
    width: 72,
    height: 72,
    resizeMode: "contain"
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 0.3
  },
  sheetWrapper: {
    flex: 1
  },
  sheet: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24
  },
  form: {
    width: "100%"
  },
  input: {
    width: "100%",
    marginTop: 14,
    backgroundColor: "#f9fafb"
  },
  inputOutline: {
    borderRadius: 10
  },
  loginButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    marginTop: 24,
    elevation: 3,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15
  },
  patternButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
    marginTop: 14
  },
  patternButtonText: {
    color: "#16a34a",
    fontWeight: "600",
    fontSize: 14
  },
  footer: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 22
  },
  devBar: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
    opacity: 0.6
  },
  devBoton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center"
  },
  modalPatronFondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalPatronContenido: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    alignItems: "center"
  },
  modalPatronTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginBottom: 20
  },
  modalPatronCerrar: {
    marginTop: 20
  }
});
