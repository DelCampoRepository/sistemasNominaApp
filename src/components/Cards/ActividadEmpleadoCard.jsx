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

const divisor = SCREEN_WIDTH <= 610 ? 2.6 : 3.7;
const multipli = SCREEN_WIDTH <= 610 ? 2 : 4;
const ITEM_WIDTH = SCREEN_WIDTH / divisor - ITEM_MARGIN * multipli;

export default function ActividadEmpleadoCard({
  item,
  setModales,
  modales,
  setDatosActividad,
  datosActividad,
  realmInstance
}) {
  const [seleccion, setSeleccion] = useState({
    acIni: true,
    actFin: true
  });
  //console.log("item", JSON.stringify(item, null, 2));
  // console.log(item.horaInicioActividad);
  useEffect(() => {}, [item]);
  const obtenerFechaYHora = () => {
    const ahora = new Date();

    // Fecha
    const dia = String(ahora.getDate()).padStart(2, "0");
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const anio = ahora.getFullYear();

    // Hora Local
    const horas = String(ahora.getHours()).padStart(2, "0");
    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const segundos = String(ahora.getSeconds()).padStart(2, "0");

    return `${dia}/${mes}/${anio}`;
  };

  //console.log("itemm", JSON.stringify(item, null, 2));

  useEffect(() => {}, [item]);

  const handleOnPress = () => {
    // console.log(JSON.stringify(item, null, 2));

    if (item.solicitoPermiso) {
      Alert.alert(
        "Del campo y asociados",
        "Esperando aprobación  de solicitud; recuerde sincronizar para mandar el permiso!"
      );
      return;
    }
    if (
      item.limiteMaximoDeCaptura !== null &&
      new Date() > new Date(item.limiteMaximoDeCaptura)
    ) {
      Alert.alert(
        "Del campo y Asociados",
        "Ya no tiene permiso para editar , el tiempo ha expirado ¿Deseas solictar?",
        [
          {
            text: "Cancelar",
            onPress: () => console.log("Cancelado"),
            style: "cancel"
          },
          {
            text: "Aceptar",
            onPress: solicitarPermiso
          }
        ]
      );
      return;
    }

    if (item.horaInicioActividad === null) {
      Alert.alert("Del campo y asociados", "No se ha iniciado la actividad!");
      return;
    }
    setSeleccion(true);
    setDatosActividad(item);
    if (item.NomCortoUnidad === "SCO") {
      setModales((prev) => ({
        ...prev,
        modalSurcos: true
      }));
    } else {
      setModales((prev) => ({
        ...prev,
        modalAvance: true
      }));
    }
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
      fechaFormateada = `${año}-${mes}-${dia} ${horas}:${horaExtra ? Number(minutos) + Number(2) : minutos}:${segundos}`;
    }
    return fechaFormateada;
  };

  const handleIniciar = () => {
    realmInstance.write(() => {
      const actividad = realmInstance.objects("ActiviadesPorEmpleado").filtered(
        `
      codigoEmpleado == $0 AND 
      codigoLote == $1 AND 
      codigoNave == $2 AND 
      codigoTabla == $3 AND 
      fecha == $4 AND 
      CodigoActividad == $5 AND
      CodigoAvance == $6`,
        item.codigoEmpleado,
        item.codigoLote,
        item.codigoNave,
        item.codigoTabla,
        item.fecha,
        item.CodigoActividad,
        item.CodigoAvance
      )[0];

      const data = {
        codigoEmpleado: item.codigoEmpleado,
        nombreEmpleado: item.nombreEmpleado,
        codigoLote: item.codigoLote,
        codigoNave: item.codigoNave,
        codigoTabla: item.codigoTabla,
        fecha: item.fecha,
        horaInicioActividad: new Date(),
        horaFinalActividad: item.horaFinalActividad,
        limiteMaximoDeCaptura: item.limiteMaximoDeCaptura,
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
        tieneSurcos: item.tieneSurcos,
        tablaLabel: item.tablaLabel,
        avances: item.avances,
        jornal: item.jornal
      };
      if (actividad) {
        // Actualizar existente
        Object.assign(actividad, data);
      }
      setSeleccion((prev) => ({
        ...prev,
        acIni: false
      }));

      const Empleado = realmInstance.objects("EmpleadoCapturado").filtered(
        `
          CodigoEmpleado == $0 AND 
          CodigoLote == $1 AND 
          CodigoNave == $2 AND 
          CodTabla == $3 AND 
          FechaCaptura == $4 AND 
          CodigoActividad == $5 AND
          CodigoAvance == $6
        `,
        item.codigoEmpleado,
        item.codigoLote,
        item.codigoNave,
        item.codigoTabla,
        item.fecha,
        item.CodigoActividad,
        item.CodigoAvance
      );

      if (Empleado.length == 0) return;
      const emp = Empleado[0];
      emp.horaInicioActividad = new Date();
    });
    /*
     if (existe) {
            // Actualizar existente
            Object.assign(existe, data);
    */
  };

  const handleFinalzar = () => {
    try {
      realmInstance.write(() => {
        const actividad = realmInstance
          .objects("ActiviadesPorEmpleado")
          .filtered(
            `
      codigoEmpleado == $0 AND 
      codigoLote == $1 AND 
      codigoNave == $2 AND 
      codigoTabla == $3 AND 
      fecha == $4 AND 
      CodigoActividad == $5 AND
      CodigoAvance == $6`,
            item.codigoEmpleado,
            item.codigoLote,
            item.codigoNave,
            item.codigoTabla,
            item.fecha,
            item.CodigoActividad,
            item.CodigoAvance
          )[0];

        const data = {
          codigoEmpleado: item.codigoEmpleado,
          nombreEmpleado: item.nombreEmpleado,
          codigoLote: item.codigoLote,
          codigoNave: item.codigoNave,
          codigoTabla: item.codigoTabla,
          fecha: item.fecha,
          horaInicioActividad: item.horaInicioActividad,
          horaFinalActividad: new Date(GenerarFecha(false, false)),
          limiteMaximoDeCaptura: new Date(GenerarFecha(true, false)),
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
          tieneSurcos: item.tieneSurcos,
          tablaLabel: item.tablaLabel,
          avances: item.avances,
          jornal: item.jornal
        };
        if (actividad) {
          // Actualizar existente
          Object.assign(actividad, data);
        }
        setSeleccion((prev) => ({
          ...prev,
          acIni: false
        }));

        const Empleado = realmInstance.objects("EmpleadoCapturado").filtered(
          `
          CodigoEmpleado == $0 AND 
          CodigoLote == $1 AND 
          CodigoNave == $2 AND 
          CodTabla == $3 AND 
          FechaCaptura == $4 AND 
          CodigoActividad == $5 AND
          CodigoAvance == $6
        `,
          item.codigoEmpleado,
          item.codigoLote,
          item.codigoNave,
          item.codigoTabla,
          item.fecha,
          item.CodigoActividad,
          item.CodigoAvance
        );

        if (Empleado.length == 0) return;

        const emp = Empleado[0];
        emp.horaFinalActividad = new Date();
        emp.limiteMaximoDeCaptura = new Date(GenerarFecha(true, false));
      });
    } catch (error) {
      console.log(error);
    }
  };

  const solicitarPermiso = () => {
    try {
      realmInstance.write(() => {
        const actividad = realmInstance
          .objects("ActiviadesPorEmpleado")
          .filtered(
            `
            codigoEmpleado == $0 AND 
            codigoLote == $1 AND 
            codigoNave == $2 AND 
            codigoTabla == $3 AND 
            fecha == $4 AND 
            CodigoActividad == $5 AND
            CodigoAvance == $6`,
            item.codigoEmpleado,
            item.codigoLote,
            item.codigoNave,
            item.codigoTabla,
            item.fecha,
            item.CodigoActividad,
            item.CodigoAvance
          )[0];

        const data = {
          codigoEmpleado: item.codigoEmpleado,
          nombreEmpleado: item.nombreEmpleado,
          codigoLote: item.codigoLote,
          codigoNave: item.codigoNave,
          codigoTabla: item.codigoTabla,
          fecha: item.fecha,
          horaInicioActividad: item.horaInicioActividad,
          horaFinalActividad: new Date(GenerarFecha(false, false)),
          limiteMaximoDeCaptura: new Date(GenerarFecha(true, false)),
          CodigoUsuario: item.CodigoUsuario,
          CodigoCultivo: item.CodigoCultivo,
          CodigoActividad: item.CodigoActividad,
          CodigoAvance: item.CodigoAvance,
          Descripcion: item.Descripcion,
          Rendimiento: item.Rendimiento,
          CodigoTemporada: item.CodigoTemporada,
          RendimientoTope: item.RendimientoTope,
          tienePermiso: item.tienePermiso,
          solicitoPermiso: true,
          CodUnidad: item.CodUnidad,
          NomCortoUnidad: item.NomCortoUnidad,
          NomCompletoUnidad: item.NomCompletoUnidad,
          tieneSurcos: item.tieneSurcos,
          tablaLabel: item.tablaLabel,
          avances: item.avances,
          jornal: item.jornal
        };
        if (actividad) {
          // Actualizar existente
          Object.assign(actividad, data);
        }
        const Empleado = realmInstance.objects("EmpleadoCapturado").filtered(
          `
          CodigoEmpleado == $0 AND 
          CodigoLote == $1 AND 
          CodigoNave == $2 AND 
          CodTabla == $3 AND 
          FechaCaptura == $4 AND 
          CodigoActividad == $5 AND
          CodigoAvance == $6 
        `,
          item.codigoEmpleado,
          item.codigoLote,
          item.codigoNave,
          item.codigoTabla,
          item.fecha,
          item.CodigoActividad,
          item.CodigoAvance
        );

        if (Empleado.length == 0) return;

        const emp = Empleado[0];
        emp.solicitoPermiso = true;
        emp.tienePermiso = false;

        Alert.alert(
          "Del Campo y asociados",
          "solicitud guardada, se necesita sincronizar para enviar los cambios!"
        );
      });
    } catch (error) {
      Alert.alert("", error);
    }
  };

  function convertir(fechaItem) {
    const fecha = new Date(fechaItem);

    let horas = fecha.getHours();
    const minutos = String(fecha.getMinutes()).padStart(2, "0");

    const ampm = horas >= 12 ? "PM" : "AM";

    horas = horas % 12;
    horas = horas ? horas : 12; // 0 -> 12

    return `${horas}:${minutos} ${ampm}`;
  }
  return (
    <TouchableOpacity style={styles.Card} onPress={handleOnPress}>
      {item.horaInicioActividad === null && seleccion.acIni && (
        <TouchableOpacity
          style={{
            width: 50,
            position: "absolute",
            top: -10,
            right: -2,
            borderRadius: 100,
            height: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fffffffb",
            elevation: 5
          }}
          onPress={handleIniciar}
        >
          <Image
            source={require("../../../assets/timer-play.png")}
            style={styles.cardButton}
          />
        </TouchableOpacity>
      )}

      {item.horaInicioActividad !== null &&
        item.limiteMaximoDeCaptura === null && (
          <TouchableOpacity
            onPress={handleFinalzar}
            style={{
              width: 50,
              position: "absolute",
              top: -10,
              right: -2,
              borderRadius: 100,
              height: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fffffffb",
              elevation: 5
            }}
          >
            <Image
              source={require("../../../assets/timer-check.png")}
              style={styles.cardButton}
            />
          </TouchableOpacity>
        )}

      <View style={styles.imageContainer}>
        <Text
          style={{
            fontSize: 15,
            textAlign: "left",
            marginBottom: 3
          }}
        >
          {item.NomCortoUnidad.trim()}
        </Text>

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
      <Text style={{ fontSize: 10, textAlign: "left", margin: "auto" }}>
        Rend. Tope: {item.RendimientoTope}
      </Text>
      <Text style={{ fontSize: 10, textAlign: "left", margin: "auto" }}>
        Lote: {item.codigoLote}
      </Text>
      <Text style={{ fontSize: 10, textAlign: "left", margin: "auto" }}>
        Nave: {item.codigoNave}
      </Text>
      <Text style={{ fontSize: 10, textAlign: "left", margin: "auto" }}>
        Tabla: {item.codigoTabla}
      </Text>
      <Text style={{ fontSize: 10, textAlign: "left", margin: "auto" }}>
        Jornal:{item.jornal.toFixed(2)}
      </Text>
      <Text style={{ fontSize: 10, textAlign: "left", margin: "auto" }}>
        Avaces: {item.avances.toFixed(2)}
      </Text>
      <Text style={{ fontSize: 10, textAlign: "left", margin: "auto" }}>
        Fecha captura: {obtenerFechaYHora(item.fecha)}
      </Text>
      <Text style={{ fontSize: 10, textAlign: "left", margin: "auto" }}>
        Hora Inicio:{" "}
        {item.horaInicioActividad === null
          ? "Sin asignar"
          : convertir(item.horaInicioActividad)}
      </Text>
      <Text style={{ fontSize: 10, textAlign: "left", margin: "auto" }}>
        Hora Fin:{" "}
        {item.horaFinalActividad === null
          ? "sin asignar"
          : convertir(item.horaFinalActividad)}
      </Text>
      <Text style={{ fontSize: 10, textAlign: "left", margin: "auto" }}>
        Hora limite:{" "}
        {item.limiteMaximoDeCaptura !== null
          ? convertir(item.limiteMaximoDeCaptura)
          : "sin asignar"}
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
  cardButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5
  }
});
