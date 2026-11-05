
import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { exportarRealmAJSON } from "../../../utils/CreadorArchivos";
import { id } from "date-fns/locale";
import { ahoraTimestamp, finDiaCuliacan, formatearFechaCuliacan, inicioDiaCuliacan } from "../../../utils/obtenerHoraCuliacan";
import { marcarPendienteSincronizacion } from "../../../utils/sincronizacionEstado";

export default function ActividadCard({
  item,

  setDatosEmpleadoNuevo,
  setModales,
  datosEmpleadoNuevo
}) {
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
        marcarPendienteSincronizacion(realmInstance);
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
    <TouchableOpacity style={styles.Card} activeOpacity={0.75} onPress={handleOnPress}>
      <View style={styles.iconCircle}>
        <Image
          source={require("../../../assets/herramientas.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textos}>
        <Text style={styles.tituloTexto} numberOfLines={1}>
          {item.CodigoActividad}-{String(item.CodigoAvance).trim()}
        </Text>
        <Text style={styles.subtexto} numberOfLines={1}>
          {item.Descripcion.trim()} · {item.NomCortoUnidad}
        </Text>
      </View>

      {activadadTrabajada && (
        <View style={styles.trabajadaBadge}>
          <Ionicons name="checkmark" size={14} color="#16a34a" />
        </View>
      )}

      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  Card: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  icon: {
    width: "55%",
    height: "55%"
  },
  textos: {
    flex: 1
  },
  tituloTexto: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#111827"
  },
  subtexto: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2
  },
  trabajadaBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8
  }
});
