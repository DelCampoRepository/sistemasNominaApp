import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert
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

export default function LoginScreen({ navigation }) {
  
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [inputUser, setInputUser] = useState("Jefnavcos232");
  const [inputPassword, setInputPassword] = useState("Jncos232");
  const [realmInstance, setRealmInstance] = useState(null);
  const [desbloquear, setDesbloquear] = useState(false);
 
  const [MostraModal, setMostraModal] = useState(false);
  // Inicializamos Realm solo una vez
  useEffect(() => {
  // deleteRealmDatabase();
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
       // await borrar_token();  
    };
    inicializarRealm();
  }, []);

  useEffect(() => {
//BorrarDatos()
  }, [realmInstance]);
async function borrar_token() {
  await AsyncStorage.removeItem("TOKEN");
  await AsyncStorage.removeItem("TOKEN_EXPIRA");
}

  async function BorrarDatos() {
  //await deleteRealmDatabase();
  realmInstance.write(() => {
  realmInstance.deleteAll();
});
   
}

  async function HandleLogin() {

       try{
           
        setMostraModal(true);
            if(ValidarCredencialesIngresadas())
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
                    const loginRes=  await Login(); 
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
           
            const  loginRes= await Login();
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
        Alert.alert(`${error}`)
       }
       finally{
             setMostraModal(false);
       }
    
  }

  async function ValidarExistenciaToken(){
    
    const token = await AsyncStorage.getItem("TOKEN");
    const fechaExpiracionToken = await AsyncStorage.getItem("TOKEN_EXPIRA");
    const res = token !== null &&  fechaExpiracionToken !== null;
    
       return res; 
    
  }
  
  async function Login(){

     const response = await services.login({
        nombreUsuario: inputUser,
        password: inputPassword
      });
    
      if (response.estado !== undefined && response.estado !== 1) {
        
        Alert.alert(`Del campo y asociados`,`${response.mensaje}`);
        return false;
      }
      else if(response.estado ===0){
           
          return false;
      }else{
         console.log('ddd')
          await GuardarTokenEnAsyncStorage(response.token, response.tokenExpira);
          await GuardarDatosUsuarioEnRealm(response);
          await GuardarCredenciales({user: response.nomUsuario,pass:inputPassword});
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

  function ValidarCredencialesIngresadas(){
   
     if(inputUser.trim() === "Delcampo21"){
      setDesbloquear(true);
      return false;
    }
    else if(inputUser.trim() === "Delcampo22"){
      setDesbloquear(false);
      return false;
    }
     else if(inputUser.trim() === "" || inputPassword.trim() === ""){
      Alert.alert("Error", "Por favor ingrese usuario y contraseña");
      return false;
    }
    else{
      const credenciales= realmInstance.objects("CredencialesSchema");
      if(credenciales.length > 0)
      {
         if(inputUser.toUpperCase() === credenciales[0].nomUsuario.toUpperCase()  && inputPassword === credenciales[0].password)
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
    console.log("expiro el token?: ",TokenExpiro);
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
      console.log(semanaDeApi,semanaDeRealm);
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
  //await deleteRealmDatabase();
  realmInstance.write(() => {
  realmInstance.deleteAll();
});
 // await borrar_token();  
}

  return (
    <View style={styles.container}>
     <ModalCargando visible={MostraModal}/>
      <View style={styles.inputGroup}>
        <Image source={logo} style={styles.logo} />
        <TextInput
          label="Usuario"
          value={inputUser}
          style={{ width: "70%", marginTop: 10, backgroundColor: "#FFF" }}
          mode="outlined"
          maxLength={15}
          onChangeText={text => setInputUser(text)}
          textColor="black"
          selectionColor="black"
          outlineColor="green"
          activeOutlineColor="#006000"
          theme={{
            colors: {
              primary: "green",
              onSurfaceVariant: "green",
              surfaceVariant: "#FFF"
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
              color="black"
            />
          }
          style={{ width: "70%", marginTop: 10, backgroundColor: "#FFF" }}
          mode="outlined"
          maxLength={20}
          onChangeText={text => setInputPassword(text)}
          textColor="black"
          selectionColor="black"
          outlineColor="green"
          activeOutlineColor="#006000"
          theme={{
            colors: {
              primary: "green",
              onSurfaceVariant: "green",
              surfaceVariant: "#FFF"
            }
          }}
        />

        <TouchableOpacity style={styles.loginButton} onPress={HandleLogin}>
          <Text style={styles.loginButtonText}>INICIAR SESION</Text>
        </TouchableOpacity>

{/*desbloquear === true &&*/}
     { 
      <>
          <TouchableOpacity
                style={styles.botonTablas}
                 onPress={() => exportarRealmAJSON(realmInstance)}
              >
                <Ionicons name="arrow-up-circle-outline" size={35} color="white" />
                
              </TouchableOpacity>

               <TouchableOpacity
                style={styles.botonTablas2}
                 onPress={() => importarJSONaRealm(realmInstance)}
              >
                <Ionicons name="download-outline" size={35} color="white" />
                
              </TouchableOpacity>
              
      <TouchableOpacity
        style={styles.botonTablas3}
        onPress={() => {
          navigation.navigate("pantallaTablaDatos");
        }}
      >
        <Ionicons name="cloud-outline" size={35} color="white" />
      </TouchableOpacity>
       <TouchableOpacity
        style={styles.botonTablas4}
        onPress={() => BorrarDatos()}
      >
        <Ionicons name="trash-outline" size={35} color="white" />
      </TouchableOpacity>
       <TouchableOpacity
        style={styles.botonTablas5}
        onPress={() =>exportarRealmAJSON2(realmInstance)}
      >
        <Ionicons name="trash-outline" size={35} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.botonTablas6}
        onPress={() =>importarJSONaRealmManual(realmInstance)}
      >
        <Ionicons name="trash-outline" size={35} color="white" />
      </TouchableOpacity>
      </>
     }
      </View>
    </View>
  );

  
}
 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fff0",
    width: "100%"
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20
  },
  inputGroup: {
    flex: 1,
    alignItems: "center",
    marginBottom: 10,
    marginTop: 80
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
    fontWeight: "bold"
  },
  input: {
    width: "100%",
    height: 35,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 8,
    fontSize: 12,
    backgroundColor: "white",
    color: "black"
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%"
  },
  PasswordInput: {
    flex: 1,
    height: 35,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 12,
    backgroundColor: "white",
    color: "black"
  },
  passwordIcon: {
    right: 10
  },
  loginButton: {
    backgroundColor: "green",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    width: "70%",
    alignItems: "center",
    marginTop: 25
  },
  botonTablas: {
    position: "absolute",
    bottom: 0,
    left:10,
    backgroundColor: "green",
    borderRadius: 40,
    width: 66,
    height: 66,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10
  },
  botonTablas2: {
    position: "absolute",
    bottom: 0,
    left: 80,
    backgroundColor: "green",
    borderRadius: 40,
    width: 66,
    height: 66,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10

  }, 
  botonTablas3: 
  {
    position: "absolute",
    bottom: 0,
    left: 150,
    backgroundColor: "green",
    borderRadius: 40,
    width: 66,
    height: 66,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10
  },

  loginButtonText: {
    color: "white",
    fontWeight: "bold"
  },
   botonTablas4: 
   {
    position: "absolute",
    bottom: 0,
    left: 220,
    backgroundColor: "green",
    borderRadius: 40,
    width: 66,
    height: 66,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10
  },
   botonTablas5: 
   {
    position: "absolute",
    bottom: 0,
    left: 300,
    backgroundColor: "green",
    borderRadius: 40,
    width: 66,
    height: 66,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10
  },
   botonTablas6: 
   {
    position: "absolute",
    bottom: 0,
    left: 360,
    backgroundColor: "green",
    borderRadius: 40,
    width: 66,
    height: 66,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10
  }
});
