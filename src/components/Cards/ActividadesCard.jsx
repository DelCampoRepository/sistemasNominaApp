import { se, tr } from "date-fns/locale";
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

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_MARGIN = 7;
const ITEM_WIDTH = SCREEN_WIDTH / 3.7 - ITEM_MARGIN * 4;

export default function ActividadCard({
  item,
  icono,
  setDatosEmpleadoNuevo,
  setModales,
  datosEmpleadoNuevo
}) {
  const [seleccion, setSeleccion] = useState(false);
  // console.log("employe", item);
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
      fechaFormateada = `${año}-${mes}-${dia} ${horas}:${horaExtra ? Number(minutos) + Number(2) : minutos}:${segundos}`;
    }
    return fechaFormateada;
  };
  const obtenerFechaFormateada = () => {
    const ahora = new Date();

    // 1️⃣ Crear fecha local plana (sin conversión de zona)
    const fechaLocalPlana = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      23,
      59,
      59,
      999
    );

    // 2️⃣ Convertir a UTC manteniendo la hora plana
    const fechaFinDiaLocalSinUTC = new Date(
      Date.UTC(
        fechaLocalPlana.getFullYear(),
        fechaLocalPlana.getMonth(),
        fechaLocalPlana.getDate(),
        fechaLocalPlana.getHours(),
        fechaLocalPlana.getMinutes(),
        fechaLocalPlana.getSeconds(),
        fechaLocalPlana.getMilliseconds()
      )
    );

    return fechaFinDiaLocalSinUTC;
  };

  const handleOnPress = () => {
    setDatosEmpleadoNuevo((prev) => ({
      ...prev,
      CodigoActividad: item.CodigoActividad,
      CodigoAvance: item.CodigoAvance,
      rendimientoApli: item.Rendimiento,
      codUnidad: item.NomCortoUnidad,
      FechaCaptura: new Date(GenerarFecha(false, true)),
      horaInicioActividad: null,
      horaFinalActividad: obtenerFechaFormateada(),
      limiteMaximoDeCaptura: null,
      avances: 0,
      jornal: 0
    }));

    setSeleccion(true);
  };
  const [ActividaEmpleado, setActividadEmpleado] = useState({
    codigoEmpleado: datosEmpleadoNuevo.CodigoEmpleado,
    nombreEmpleado: datosEmpleadoNuevo.Nombre,
    codigoLote: datosEmpleadoNuevo.CodigoLote,
    codigoNave: datosEmpleadoNuevo.CodigoNave,
    codigoTabla: datosEmpleadoNuevo.CodTabla,
    fecha: new Date(GenerarFecha(false, true)),
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
    tienePermiso: true,
    solicitoPermiso: false,
    tablaLabel: "",
    limiteMaximoCaptura: item.limiteMaximoCaptura,
    avances: 0,
    jornal: 0
  });
  useEffect(() => {}, [datosEmpleadoNuevo]);
  useEffect(() => {
    if (seleccion) {
      try {
        GuardarEmpleadoCapturado();

        GuardarActividadEmpleado();
      } catch (error) {
        console.log(error);
      }
    }
  }, [seleccion]);

  /*//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
  function GuardarEmpleadoCapturado() {
    const BuscarEmpleado = realmInstance.objects("EmpleadoCapturado").filtered(
      `
        CodigoEmpleado == $0 AND
        CodigoLote == $1 AND 
        CodigoNave == $2 AND
        CodTabla == $3 AND
        CodigoActividad == $4 AND
        CodigoAvance == $5 AND
        FechaCaptura == $6
        `,
      ActividaEmpleado.codigoEmpleado,
      ActividaEmpleado.codigoLote,
      ActividaEmpleado.codigoNave,
      ActividaEmpleado.codigoTabla,
      ActividaEmpleado.CodigoActividad,
      ActividaEmpleado.CodigoAvance,
      new Date(GenerarFecha(false, true))
    );
    // console.log(BuscarEmpleado);
    if (BuscarEmpleado.length > 0) {
      Alert.alert(
        "Del campo y asociados",
        "Empleado ya esta agregado con esta actividad!"
      );
      setSeleccion(false);
      return;
    }
  }

  function GuardarActividadEmpleado() {
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
      fecha ==$6
      `,
          ActividaEmpleado.codigoEmpleado,
          ActividaEmpleado.codigoLote,
          ActividaEmpleado.codigoNave,
          ActividaEmpleado.codigoTabla,
          ActividaEmpleado.CodigoActividad,
          ActividaEmpleado.CodigoAvance,
          new Date(GenerarFecha(false, true))
        );

      if (ActividadesRepetidas.length > 0) {
        Alert.alert(
          "Del campo y asociados",
          "Empleado ya esta agregado con esta actividad!"
        );
        setSeleccion(false);
        return;
      }

      realmInstance.write(() => {
        realmInstance.create("ActiviadesPorEmpleado", ActividaEmpleado);
      });

      realmInstance.write(() => {
        realmInstance.create("EmpleadoCapturado", datosEmpleadoNuevo);
      });

      setModales((prev) => ({
        ...prev,
        modalActividades: false,
        mainModal: false
      }));
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <TouchableOpacity style={styles.Card} onPress={handleOnPress}>
      <View style={styles.imageContainer}>
        <Image
          source={require("../../../assets/herramientas.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      <Text style={{ fontWeight: "bold", fontSize: 12 }}>
        {item.CodigoActividad}-{String(item.CodigoAvance).trim()}
      </Text>
      <Text style={{ fontSize: 10, textAlign: "center", margin: "auto" }}>
        {item.Descripcion.trim()}
      </Text>
    </TouchableOpacity>
  );
}
//source={require("../../../assets/nave2.png")}
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
  }
});
