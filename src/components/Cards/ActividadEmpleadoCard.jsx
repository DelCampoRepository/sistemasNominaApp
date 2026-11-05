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
import { Ionicons } from "@expo/vector-icons";
import { ahoraTimestamp, expiracionDosHoras, finDiaCuliacan, inicioDiaCuliacan } from "../../../utils/obtenerHoraCuliacan";

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

  //console.log(item.horaInicioActividad);
  useEffect(() => {}, [item]);

  // El avance por surco (SCO) se calcula consultando Realm en cada render
  // (ver abajo), pero esa consulta no se vuelve a ejecutar sola si el dato
  // cambia desde otra pantalla (ej. al borrar un aporte en el modal de
  // avance por surcos). Este listener fuerza un re-render de la tarjeta
  // cuando cambian los registros de Surco de este empleado/actividad.
  const [, forzarActualizacion] = useState(0);

  useEffect(() => {
    if (item.NomCortoUnidad?.trim() !== "SCO" || !realmInstance) return;

    const resultados = realmInstance
      .objects("Surco")
      .filtered(
        "codEmpleado == $0 AND lote == $1 AND nave == $2 AND tabla == $3 AND actividad == $4 AND avance == $5",
        item.codigoEmpleado,
        item.codigoLote,
        item.codigoNave,
        item.codigoTabla,
        item.CodigoActividad,
        item.CodigoAvance
      );

    const listener = () => forzarActualizacion(n => n + 1);
    resultados.addListener(listener);

    return () => {
      resultados.removeListener(listener);
    };
  }, [
    realmInstance,
    item.NomCortoUnidad,
    item.codigoEmpleado,
    item.codigoLote,
    item.codigoNave,
    item.codigoTabla,
    item.CodigoActividad,
    item.CodigoAvance
  ]);

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
     
    if (item.solicitoPermiso ) {
      Alert.alert(
        "Del campo y asociados",
        "Esperando aprobación  de solicitud; recuerde sincronizar para mandar el permiso!"
      );
      return;
    }
    if (
      item.limiteMaximoDeCaptura !== null &&
      new Date().getTime() > new Date(item.limiteMaximoDeCaptura).getTime() && !item.solicitarPermiso
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
      fechaFormateada = `${año}-${mes}-${dia} ${horaExtra ? Number(horas) + Number(item.horasMaximasDeCaptura) : horas}:${minutos}:${segundos}`;
     //fechaFormateada = `${año}-${mes}-${dia} ${horas }:${horaExtra? Number(minutos) + Number(1) : minutos}:${segundos}`;
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
      fecha >= $4 AND 
      CodigoActividad == $5 AND
      CodigoAvance == $6 AND
      fecha <=$7`,
        item.codigoEmpleado,
        item.codigoLote,
        item.codigoNave,
        item.codigoTabla,
       inicioDiaCuliacan(),
        item.CodigoActividad,
        item.CodigoAvance,
         finDiaCuliacan()
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
          FechaCaptura >= $4 AND 
          CodigoActividad == $5 AND
          CodigoAvance == $6 AND
          FechaCaptura <=$7
        `,
        item.codigoEmpleado,
        item.codigoLote,
        item.codigoNave,
        item.codigoTabla,
        inicioDiaCuliacan(),
        item.CodigoActividad,
        item.CodigoAvance,
        finDiaCuliacan()
      );

      if (Empleado.length == 0) return;
      const emp = Empleado[0];
      emp.horaInicioActividad = ahoraTimestamp();
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
      fecha >= $4 AND 
      CodigoActividad == $5 AND
      CodigoAvance == $6 AND
      fecha <=$7`,
            item.codigoEmpleado,
            item.codigoLote,
            item.codigoNave,
            item.codigoTabla,
            inicioDiaCuliacan(),
            item.CodigoActividad,
            item.CodigoAvance,
            finDiaCuliacan()
          )[0];

        const data = {
          codigoEmpleado: item.codigoEmpleado,
          nombreEmpleado: item.nombreEmpleado,
          codigoLote: item.codigoLote,
          codigoNave: item.codigoNave,
          codigoTabla: item.codigoTabla,
          fecha: item.fecha,
          horaInicioActividad: item.horaInicioActividad,
          horaFinalActividad: finDiaCuliacan(),
          limiteMaximoDeCaptura: expiracionDosHoras() ,
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
          FechaCaptura >= $4 AND 
          CodigoActividad == $5 AND
          CodigoAvance == $6 AND
          FechaCaptura <=$7
        `,
          item.codigoEmpleado,
          item.codigoLote,
          item.codigoNave,
          item.codigoTabla,
          inicioDiaCuliacan(),
          item.CodigoActividad,
          item.CodigoAvance,
          finDiaCuliacan()
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
 function validarBloquead()
 {
   if(item.limiteMaximoDeCaptura !== null &&
      new Date().getTime() > new Date(item.limiteMaximoDeCaptura).getTime() && !item.solicitarPermiso)
      return true;

     return false;
 }
  function convertir(fechaItem) {
    const fecha = new Date(fechaItem);

    let horas = fecha.getHours();
    const minutos = String(fecha.getMinutes()).padStart(2, "0");

    const ampm = horas >= 12 ? "PM" : "AM";

    horas = horas % 12;
    horas = horas ? horas : 12; // 0 -> 12

    return `${horas}:${minutos} ${ampm}`;
  }
  const esPendiente = item.estado === 0;
  const esConfirmado = item.estado === 1;
  const colorAcento = esPendiente ? "#9ca3af" : esConfirmado ? "#16a34a" : "#dc2626";
  const colorFondoSuave = esPendiente ? "#f3f4f6" : esConfirmado ? "#dcfce7" : "#fee2e2";
  const etiquetaEstado = esPendiente ? "Pendiente" : esConfirmado ? "Sincronizado" : "No sincronizado";
  const bloqueado = validarBloquead();
  const puedeIniciar = item.horaInicioActividad === null && seleccion.acIni;
  const puedeFinalizar = item.limiteMaximoDeCaptura === null && item.horaInicioActividad !== null;

  // Para actividades por surco (SCO) el avance se guarda en el schema "Surco"
  // (por surco) y nunca se refleja en ActiviadesPorEmpleado.avances/jornal,
  // así que lo calculamos sumando los surcos del empleado para esta actividad.
  const esPorSurco = item.NomCortoUnidad?.trim() === "SCO";
  const avanceSurcos = esPorSurco && realmInstance
    ? realmInstance
        .objects("Surco")
        .filtered(
          "codEmpleado == $0 AND lote == $1 AND nave == $2 AND tabla == $3 AND actividad == $4 AND avance == $5 AND fecha >= $6 AND fecha <= $7",
          item.codigoEmpleado,
          item.codigoLote,
          item.codigoNave,
          item.codigoTabla,
          item.CodigoActividad,
          item.CodigoAvance,
          inicioDiaCuliacan(),
          finDiaCuliacan()
        )
        .reduce((acc, surco) => acc + surco.avanceAcum, 0)
    : null;

  const avanceMostrado = avanceSurcos !== null ? avanceSurcos : item.avances;
  const jornalMostrado = avanceSurcos !== null
    ? (item.Rendimiento ? avanceSurcos / item.Rendimiento : 0)
    : item.jornal;

  return (
    <TouchableOpacity style={styles.Card} activeOpacity={0.8} onPress={handleOnPress}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: colorFondoSuave }]}>
          <Image
            source={require("../../../assets/herramientas.png")}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textos}>
          <Text style={styles.tituloTexto} numberOfLines={1}>
            {item.CodigoActividad}-{String(item.CodigoAvance).trim()} · {item.NomCortoUnidad.trim()}
          </Text>
          <Text style={styles.subtexto} numberOfLines={1}>
            {item.Descripcion.trim()}
          </Text>
        </View>

        {/*CANDADITO: bloqueado por tiempo limite */}
        {bloqueado && (
          <View style={styles.candadoBadge}>
            <Ionicons name="lock-closed" size={16} color="#ffffff" />
          </View>
        )}

        {/*TIMER INICIAR */}
        {!bloqueado && puedeIniciar && (
          <TouchableOpacity style={styles.botonTimer} onPress={handleIniciar}>
            <Image source={require("../../../assets/timer-play.png")} style={styles.cardButton} />
          </TouchableOpacity>
        )}

        {/*TIMER FINALIZAR */}
        {!bloqueado && puedeFinalizar && (
          <TouchableOpacity style={styles.botonTimer} onPress={handleFinalzar}>
            <Image source={require("../../../assets/timer-check.png")} style={styles.cardButton} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filaMeta}>
        <View style={[styles.badge, { backgroundColor: colorFondoSuave }]}>
          <View style={[styles.badgeDot, { backgroundColor: colorAcento }]} />
          <Text style={[styles.badgeTexto, { color: colorAcento }]}>{etiquetaEstado}</Text>
        </View>
        <Text style={styles.ubicacionTexto}>
          Lote {item.codigoLote} · Nave {item.codigoNave} · Tabla {item.codigoTabla}
        </Text>
      </View>

      <View style={styles.separador} />

      <View style={styles.metricasFila}>
        <View style={styles.metrica}>
          <Text style={styles.metricaLabel}>Rend. tope</Text>
          <Text style={styles.metricaValor}>{item.RendimientoTope}</Text>
        </View>
        <View style={styles.metrica}>
          <Text style={styles.metricaLabel}>Jornal</Text>
          <Text style={styles.metricaValor}>{jornalMostrado.toFixed(2)}</Text>
        </View>
        <View style={styles.metrica}>
          <Text style={styles.metricaLabel}>Avances</Text>
          <Text style={styles.metricaValor}>{avanceMostrado.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.tiemposFila}>
        <View style={styles.tiempoItem}>
          <Text style={styles.detalleLabel}>Captura</Text>
          <Text style={styles.detalleValor}>{obtenerFechaYHora(item.fecha)}</Text>
        </View>
        <View style={styles.tiempoItem}>
          <Text style={styles.detalleLabel}>Inicio</Text>
          <Text style={styles.detalleValor}>
            {item.horaInicioActividad === null ? "Sin asignar" : convertir(item.horaInicioActividad)}
          </Text>
        </View>
        <View style={styles.tiempoItem}>
          <Text style={styles.detalleLabel}>Fin</Text>
          <Text style={styles.detalleValor}>
            {item.horaFinalActividad === null ? "Sin asignar" : convertir(item.horaFinalActividad)}
          </Text>
        </View>
        <View style={styles.tiempoItem}>
          <Text style={styles.detalleLabel}>Límite</Text>
          <Text style={[styles.detalleValor, bloqueado && styles.detalleValorAlerta]}>
            {item.limiteMaximoDeCaptura !== null ? convertir(item.limiteMaximoDeCaptura) : "Sin asignar"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  Card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8
  },
  header: {
    flexDirection: "row",
    alignItems: "center"
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  icon: {
    width: "50%",
    height: "50%"
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
  candadoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(17,24,39,0.65)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8
  },
  botonTimer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8
  },
  cardButton: {
    width: 20,
    height: 20
  },
  filaMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    flexWrap: "wrap",
    gap: 8
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 5
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  badgeTexto: {
    fontSize: 10,
    fontWeight: "700"
  },
  ubicacionTexto: {
    fontSize: 11,
    color: "#6b7280"
  },
  separador: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 10
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
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginTop: 2
  },
  tiemposFila: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 8
  },
  tiempoItem: {
    width: "47%"
  },
  detalleLabel: {
    fontSize: 10,
    color: "#9ca3af"
  },
  detalleValor: {
    fontSize: 11,
    color: "#111827",
    fontWeight: "600",
    marginTop: 1
  },
  detalleValorAlerta: {
    color: "#dc2626"
  }
});
