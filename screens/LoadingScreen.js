import React, { useState, useEffect } from "react";
import { Alert, View } from "react-native";
import { Text, ProgressBar} from "react-native-paper";
import { StyleSheet } from "react-native";
import LoadingDots from "../components/LoadingDots";
import { getRealmInstance } from "../realm";
import { syncNaves } from "../useCases/navesUseCase";
import { syncTablas } from "../useCases/tablasUseCase";
import { syncActividades } from "../useCases/actividadesUseCase";
import { syncEmpleados } from "../useCases/empleadosUseCase";
import { syncEmpleadosCapturados } from "../useCases/empleadosCapturadosUseCase";
import AsyncStorage from "@react-native-async-storage/async-storage";



export default function LoadingScreen({ navigation }) {
 
  const [realmInstance, setRealmInstance] = useState(null);
  const [StatusText, setStatusText] = useState("");
  const [progressBarValue, setProgressBarValue] = useState(0.0);

  
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

                //obtenemos lista de naves
                setStatusText("Sincronizando naves");
                const step1 =  await syncNaves(realmInstance, userData[0].codigo, semana[0].CodigoTemporada, datosToken.token);
                setStatusText("Naves sincronizadas");
                setProgressBarValue(0.2);
                //obtenemos lista de tablas    
                setStatusText("Sincronizando tablas");
                const step2 =  await syncTablas(realmInstance, userData[0].codigo, semana[0].CodigoTemporada,datosToken.token);
                step2 === false?Alert.alert("Error","LA CONSULTA DE TABLAS NO RETORNA DATOS!, ERROR AL INTENTAR SOBREESCRIBIR LAS TABLAS "):
                setStatusText("Tablas sincronizadas");
                setProgressBarValue(0.4);
                //obtenemos lista de actividades  
                setStatusText("Sincronizando actividades");
                const step3 =  await syncActividades(realmInstance, userData[0].codigo, semana[0].CodigoTemporada,datosToken.token); 
                setStatusText("Actividades sincronizadas");
                setProgressBarValue(0.6);
                //obtenemos lista de empleados
                setStatusText("Sincronizando empleados");
                const step4 =  await syncEmpleados(realmInstance,semana[0].CodigoTemporada,  datosToken.token);
                setStatusText("Empleados sincronizados");
                setProgressBarValue(0.8);
                //enviamos los empleados capturados
                setStatusText("Sincronizando empleados capturados");
                const step5 =  await syncEmpleadosCapturados( datosToken.token);
                setStatusText("Empleados capturados sincronizados");
                setProgressBarValue(1);

                const step6 = await BorrarRegistrosViejos(semana[0]);
                    console.log(step2,"asdasds")
                if(step1 && step2 && step3 && step4 && step5)
                {
                  Alert.alert("Del campo y asociados","Se han sincronizado los datos");
                
                }else
                {
                    navigation.goBack();
                //   Alert.alert("Error","No se han sincronizado los datos");
                }
                //mostramos la pantalla home
                navigation.replace("Home");   
              }
            }
          
           
        } 
        catch (error) {
          Alert.alert("Error", `${error}`);
        }
      }
      sincronizar();
      }

    },
    [realmInstance]

  );

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
        Alert.alert("Error", "Problemas al borrar registros viejos!");
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


  return (
    <View style={styles.container}>
      <View style={styles.uperContainer}>
        <LoadingDots />

        <Text variant="bodyMedium" style={{ marginTop: 50 , color:"black" }}>
          Sincronizando datos con el servidor
        </Text>
        <Text variant="bodyMedium" style={{ marginTop: 10 , color:"black" }}>
          Por favor espere!
        </Text>
      </View>
      <View style={styles.lowerContainer}>
        <ProgressBar
          style={{ marginTop: 250 }}
          progress={progressBarValue}
          color="green"
        />
        <Text variant="bodyMedium" style={{color:"black"}}>
          {StatusText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: ""
  },
  uperContainer: {
    width: "100%",
    height: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#f0fff0"
  },
  lowerContainer: {
    width: "100%",
    height: "50%",
    display: "flex",

    backgroundColor: "#f0fff0"
  }, botonTablas: {
    position: "absolute",
    bottom: 0,
    left: 50,
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

});
