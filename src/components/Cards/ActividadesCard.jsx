
import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  Alert
} from "react-native";
import { Dimensions } from "react-native";
import {  useWindowDimensions } from 'react-native';
import { exportarRealmAJSON } from "../../../utils/CreadorArchivos";
import { id } from "date-fns/locale";
import { ahoraTimestamp, finDiaCuliacan, formatearFechaCuliacan, inicioDiaCuliacan } from "../../../utils/obtenerHoraCuliacan";
const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_MARGIN = 7;
const ITEM_WIDTH = SCREEN_WIDTH / 3.7 - ITEM_MARGIN * 4;

export default function ActividadCard({
  item,
 
  setDatosEmpleadoNuevo,
  setModales,
  datosEmpleadoNuevo
}) {
   const { width } = useWindowDimensions();

  const [seleccion, setSeleccion] = useState(false);
  const [activadadTrabajada, setActividadTrabajada] = useState(false);
  
  useEffect(
    () => {}, [datosEmpleadoNuevo]);
  useEffect(
    () => {
    if (seleccion) {
      try {
        async function  guardado() {
             
          await GuardarEmpleadoCapturado();
         
          
          setSeleccion(false);
        }
        guardado();
      } catch (error) {
        console.log(error);
      }
    }
  }, [seleccion]);
 useEffect(()=>{
  revisarSiTieneActividadAsignada();
 
  function revisarSiTieneActividadAsignada(){
    try {
      const ActividadesRepetidas = realmInstance
        .objects("ActiviadesPorEmpleado")
        .filtered(
          `
          codigoEmpleado ==$0 AND
          codigoLote ==$1 AND
          codigoNave == $2 AND
          codigoTabla ==$3  AND
          CodigoActividad ==$4  AND
          CodigoAvance ==$5 AND 
          fecha >=$6 AND
          fecha <=$7
       `,
          ActividaEmpleado.codigoEmpleado,
          ActividaEmpleado.codigoLote,
          ActividaEmpleado.codigoNave,
          ActividaEmpleado.codigoTabla,
          item.CodigoActividad,
          item.CodigoAvance,
          inicioDiaCuliacan(),
          finDiaCuliacan()
        );

      if (ActividadesRepetidas.length > 0) {
        setActividadTrabajada(true);
      }

    } catch (error) {
      console.log(error);
    }

  }
 }, [])


 

  const handleOnPress = () => {
  
    const semana = realmInstance.objects("Semana");
     
    const userData = realmInstance.objects("UserData");
     
      const fechaCaptura =inicioDiaCuliacan()
    const id = `${datosEmpleadoNuevo.CodigoEmpleado}-${datosEmpleadoNuevo.CodigoLote}-${datosEmpleadoNuevo.CodigoNave}-${datosEmpleadoNuevo.CodTabla}-${item.CodigoActividad}-${item.CodigoAvance}-${ fechaCaptura.toLocaleDateString()}`;
 
  
    setDatosEmpleadoNuevo((prev) => ({
      ...prev,
       id: prev.id !== id? id: prev.id,
      CodigoActividad: item.CodigoActividad,
      CodigoAvance: item.CodigoAvance,
      rendimientoApli: item.Rendimiento,
      codUnidad: item.NomCortoUnidad,
      FechaCaptura: ahoraTimestamp(),
      horaInicioActividad: null,
      horaFinalActividad: finDiaCuliacan(),
      limiteMaximoDeCaptura: null,
      avances: 0,
      jornal: 0,
      CodigoTemporada: String(semana[0].CodigoTemporada),
      CodigoJefe: String(userData[0].codigo),
      semana: ObtenerSemanaActiva()
    }));

    setSeleccion(true);
  };

  const [ActividaEmpleado, setActividadEmpleado] = useState({
    codigoEmpleado: datosEmpleadoNuevo.CodigoEmpleado,
    nombreEmpleado: datosEmpleadoNuevo.Nombre,
    codigoLote: datosEmpleadoNuevo.CodigoLote,
    codigoNave: datosEmpleadoNuevo.CodigoNave,
    codigoTabla: datosEmpleadoNuevo.CodTabla,
    fecha: ahoraTimestamp(),
    CodigoUsuario: item.CodigoUsuario,
    CodigoCultivo: item.CodigoCultivo,
    CodigoActividad: item.CodigoActividad,
    CodigoAvance: item.CodigoAvance,
    Descripcion: item.Descripcion,
    Rendimiento: item.Rendimiento,
    CodigoTemporada: item.CodigoTemporada,
    RendimientoTope: item.RendimientoTope,
    CodUnidad: item.CodUnidad,
    NomCortoUnidad: item.NomCortoUnidad,
    NomCompletoUnidad: item.NomCompletoUnidad,
    tieneSurcos: false,
    tienePermiso: false,
    solicitoPermiso: false,
    tablaLabel: "",
    limiteMaximoCaptura: item.limiteMaximoCaptura,
    avances: 0,
    jornal: 0,
    semana: ObtenerSemanaActiva(),
    horasMaximasDeCaptura :Number( item.limiteMaximoCaptura),
    dias_frecuencia_surcos: item.dias_frecuencia_surcos
  });

async  function  GuardarEmpleadoCapturado() {
  

  const fechaCaptura = inicioDiaCuliacan();
  const id = `${ActividaEmpleado.codigoEmpleado}-${ActividaEmpleado.codigoLote}-${ActividaEmpleado.codigoNave}-${ActividaEmpleado.codigoTabla}-${ActividaEmpleado.CodigoActividad}-${ActividaEmpleado.CodigoAvance}-${fechaCaptura.toLocaleDateString()}`;
  const BuscarEmpleado =
  await realmInstance
  .objects("EmpleadoCapturado")
  .filtered(`id == $0`,id);

console.log(BuscarEmpleado);
   
    if (BuscarEmpleado.length > 0) {
      Alert.alert(
        "Del campo y asociados",
        "Empleado ya esta agregado con esta actividad!"
      );
      setSeleccion(false);
      return;
    }
    await GuardarActividadEmpleado();
  }

 async function GuardarActividadEmpleado() {
    try {
      const ActividadesRepetidas = realmInstance
        .objects("ActiviadesPorEmpleado")
        .filtered(
          `
            codigoEmpleado ==$0 AND
            codigoLote ==$1 AND
            codigoNave == $2 AND
            codigoTabla ==$3  AND
            CodigoActividad ==$4  AND
            CodigoAvance ==$5 AND 
            fecha >=$6 AND
            fecha <=$7
      `,
          ActividaEmpleado.codigoEmpleado,
          ActividaEmpleado.codigoLote,
          ActividaEmpleado.codigoNave,
          ActividaEmpleado.codigoTabla,
          ActividaEmpleado.CodigoActividad,
          ActividaEmpleado.CodigoAvance,
          inicioDiaCuliacan(),
          finDiaCuliacan()
        );
//const id = `${datosEmpleadoNuevo.CodigoEmpleado}-${datosEmpleadoNuevo.CodigoLote}-${datosEmpleadoNuevo.CodigoNave}-${datosEmpleadoNuevo.CodTabla}-${item.CodigoActividad}-${item.CodigoAvance}-${ fechaCaptura.getTime()}`;
 //console.log(id);
       
      if (ActividadesRepetidas.length > 0) {
        Alert.alert(
          "Del campo y asociados",
          "Empleado ya esta agregado con esta actividad!"
        );
    
      }

      realmInstance.write(() => {
        realmInstance.create("ActiviadesPorEmpleado", ActividaEmpleado);
        realmInstance.create("EmpleadoCapturado", datosEmpleadoNuevo,"modified");
      });



      // await 
        
      setModales((prev) => ({
        ...prev,
        modalActividades: false,
        mainModal: false
      }));
    } catch (error) {
      console.log(error);
    }
  }
  function ObtenerSemanaActiva()
  {
    const semana = realmInstance.objects("Semana");
    
     if(semana.length > 0)
     return semana[0].CodigoSemana
    
     return 0;
  }
  
  return (
    <TouchableOpacity style={[styles.Card, { width: width > 600 ? "30%" : "44%" }]} onPress={handleOnPress}>
      {activadadTrabajada && (
         <Image
                  source={require("../../../assets/check...png")}
                  style={styles.checkIcon}
                />
      )}
      <Text style={styles.nomcorto}>
                {item.NomCortoUnidad}
              </Text>
      <View style={styles.imageContainer}>
        <Image
          source={require("../../../assets/herramientas.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      <Text style={{ fontWeight: "bold", fontSize: width > 600 ? 17 : 15 }}>
        {item.CodigoActividad}-{String(item.CodigoAvance).trim()}
      </Text>
      <Text style={{ fontSize: 10, textAlign: "center", margin: "auto" }}>
        {item.Descripcion.trim()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  Card: {
    width: ITEM_WIDTH,
    margin: ITEM_MARGIN,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    elevation: 3,
    borderStartColor: "green"
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  icon: {
    width: "40%",
    height: "40%"
  },
  nomcorto: {
    width: "30%",
    height: 23,
    position: "absolute",
    top: 3,
    left: 5
  },
  checkIcon: {
    width: 23,
    height: 23,
    position: "absolute",
    top: 3,
    right: 5
  }
});
