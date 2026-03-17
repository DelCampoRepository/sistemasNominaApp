import React, { useState, useEffect, use } from "react";
import { Alert, View } from "react-native";
import { Text, ProgressBar, ActivityIndicator } from "react-native-paper";
import { StyleSheet } from "react-native";
import { getRealmInstance } from "../realm";
import * as services from "../services/services";
import LoadingDots from "../components/LoadingDots";
import { setQuarter } from "date-fns";
import { se } from "date-fns/locale";
export default function LoadingScreen({ navigation }) {
  const [progressBarValue, setProgressBarValue] = useState(0.0);
  const [realmInstance, setRealmInstance] = useState(null);
  const [StatusText, setStatusText] = useState("");
  const [semanaStatus, setSemanaStatus] = useState(false);
  const [semanaActiva, setSemanaActiva] = useState("");

  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
  }, []);

  useEffect(
    () => {
      if (realmInstance && realmInstance !== null) {
        const semana = realmInstance.objects("Semana");
        if (semana.length > 0) {
          setSemanaActiva(semana[0].CodigoSemana);
          setSemanaStatus(true);
          setStatusText("Obteniendo semana activa");
          setProgressBarValue(0.1);
          return;
        }

        obtenerSemana();
      }

      async function obtenerSemana() {
        try {
          setStatusText("Obteniendo semana activa");

          //semana de consulta
          const response = await services.obtenerSemanaActiva();

          if (!response)
            Alert.alert(
              "Del  Campo y Asociados",
              "No se pudo obtener la semana activa"
            );

          //datos semana realm
          const semanaRealm = realmInstance.objects("Semana");
          const semanaRespuesta = response.codigoSemana;
          //si no hay semana guardada en el realm , la guardamos

          if (semanaRealm.length === 0) {
            realmInstance.write(() => {
              realmInstance.create(
                "Semana",
                {
                  CodigoSemana: Number(response.codigoSemana),
                  CodigoTemporada: Number(response.codigoTemporada),
                  FechaInicial: response.fechaFinal,
                  FechaFinal: response.fechaInicial
                },
                "modified"
              );
            });
          } else if (
            Number(semanaRespuesta) !== Number(semanaRealm[0].CodigoSemana)
          ) {
            //si hay semana guardada pero no coincide con la de la peticion entonces es jueves
            //nueva semana por lo tanto borramos la semana en nuestro realm todos los datos , despues volvemos a guardar la semana
            borrarDatos();
            GuardarSemanaEnRealm(response);
          } else {
            //por defecto pues quiere decir que si hay semana guardada y que si sonn iguales por lo que seguimos en semana activas
            console.log("rerer");
          }
          setStatusText("Datos de semana activa guardados");
          setProgressBarValue(0.1);
          setSemanaStatus(true);

          realmInstance.write(() => {
            const existe = realmInstance.objectForPrimaryKey("Sincronizar", 0);

            if (!existe) {
              realmInstance.create("Sincronizar", {
                id: 0,
                sincronizado: false
              });
            }
          });
        } catch (error) {
          Alert.alert("error", error);
          console.log(error);
        }
      }
    },
    [realmInstance]
  );

  useEffect(
    () => {
      if (semanaStatus === true) {
        sincronizar();
      }

      async function sincronizar() {
        const userData = await realmInstance.objects("UserData");
        const semana = await realmInstance.objects("Semana");

        await obtenerNavesDeUsuario(
          userData[0].codigo,
          semana[0].CodigoTemporada,
          userData[0].token
        );

        await obtenerTablasDeUsuario(
          userData[0].codigo,
          semana[0].CodigoTemporada,
          userData[0].token
        );

        await obtenerActividades(
          userData[0].codigo,
          semana[0].CodigoTemporada,
          userData[0].token
        );

        await obtenerEmpleados(semana[0].CodigoTemporada, userData[0].token);

        await EnviarEmpleadosCapturados(userData[0].token);

        navigation.replace("Home");
      }
    },
    [semanaStatus]
  );

  const obtenerNavesDeUsuario = async (codigo, temporada, token) => {
    try {
      setStatusText("Obteniendo naves del usuario");
      const response = await services.obtenerNavesPorUsuario(
        codigo,
        temporada,
        token
      );
      const data = response;

      if (data.estado !== 1) {
        Alert.alert("Error", "No hay informacion disponible de la semana");
        navigation.replace("Login");
      }

      realmInstance.write(() => {
        // Borrar tabla completa
        const todasLasNaves = realmInstance.objects("Nave");
        realmInstance.delete(todasLasNaves);

        // Insertar nuevas
        data.naves.forEach(nave => {
          realmInstance.create(
            "Nave",
            {
              CantidadSurcos: nave.cantidadSurcos,
              CodigoLote: Number(nave.codigoLote),
              CodigoNave: nave.codigo,
              CodigoTemporada: Number(nave.temporada),
              CodigoUsuario: nave.codigoUsuario,
              DescripcionLote: nave.descripcionLote,
              DescripcionNave: nave.descripcion,
              TieneTablas: nave.tieneTablas
            },
            "modified"
          );
        });
      });
      setStatusText("Naves de usuario guardadas");
      setProgressBarValue(0.3);
    } catch (error) {
      Alert.alert("Error", `${error}`);
      console.log(error);
    }
  };

  const obtenerTablasDeUsuario = async (codigo, codigoTemporada, token) => {
    try {
      setStatusText("Obteniendo lista de tablas de las naves");
      const response = await services.obtenerTablasPorUsuario(
        codigo,
        codigoTemporada,
        token
      );

      const data = response;

      if (data.estado !== 1) {
        Alert.alert("Error", "No se logró obtener infomración de las tablas");
      }
      realmInstance.write(() => {
        if (realmInstance.objects("Tablas") !== null)
          realmInstance.delete(realmInstance.objects("Tablas"));
      });

      if (realmInstance) {
        realmInstance.write(() => {
          data.tablasDeNave.forEach(tabla => {
            const idUnico = `${tabla.codigoLote}-${tabla.codigoNave}-${tabla.codigoTabla}`;

            realmInstance.create(
              "Tablas",
              {
                idCompuesto: idUnico,
                CodigoTemporada: parseInt(tabla.temporada),
                CodigoLote: parseInt(tabla.codigoLote),
                CodigoNave: tabla.codigoNave,
                CodigoTabla: parseInt(tabla.codigoTabla),
                Descripcion: tabla.descripcion,
                CantidadSurcos: parseInt(tabla.cantidadSurcos),
                CodigoJefeNave: tabla.codigoUsuario
              },
              "modified"
            );
          });
        });
      }
      const tab = realmInstance.objects("Tablas");

      setStatusText("Se han guardado las tablas de las naves");
      setProgressBarValue(0.5);
    } catch (error) {
      Alert.alert(error);
      console.log(error);
    }
  };

  const obtenerActividades = async (codigo, codigoTemporada, token) => {
    try {
      setStatusText("Obteniendo lista de actividades del usuario");
      const response = await services.obtenerActividadesPorUsuario(
        codigo,
        codigoTemporada,
        token
      );

      if (response.estado !== 1) {
        Alert.alert("Error", "No se ha logrado obtener las actividades");
      }
      realmInstance.write(() => {
        if (realmInstance.objects("Actividades") !== null)
          realmInstance.delete(realmInstance.objects("Actividades"));
      });

      //  console.log(response.actividades, "sss");
      realmInstance.write(() => {
        response.actividades.forEach(act => {
          realmInstance.create(
            "Actividades",
            {
              CodigoUsuario: act.codigoUsuario,
              CodigoLote: act.codigoLote,
              CodigoCultivo: act.codigoCultivo,
              CodigoActividad: act.codigoActividad,
              CodigoAvance: act.codigoAvance,
              Descripcion: act.descripcion,
              Rendimiento: act.rendimiento,
              CodigoTemporada: act.temporada,
              tablaLabel: "",
              RendimientoTope: act.rendimientoTope,
              CodUnidad: act.codUnidad,
              NomCortoUnidad: act.nomCortoUnidad,
              NomCompletoUnidad: act.nomCompletoUnidad,
              limiteMaximoCaptura: String(act.limiteMaximoCaptura)
            },
            "modified"
          );
        });
      });

      setStatusText("Se han guardado las actividades del usuario");
      setProgressBarValue(0.7);
    } catch (error) {
      console.log(error);
      Alert.alert("error", error);
    }
  };

  const obtenerEmpleados = async (temporada, token) => {
    try {
      setStatusText("Obteniendo lista de empleados");
      const response = await services.obtenerEmpleadosPorTemporada(
        temporada,
        token
      );

      if (response.estado !== 1) {
        Alert.alert("Error", "No se encontro ningun empleado");
      }

      realmInstance.write(() => {
        if (realmInstance.objects("Empleado") !== null)
          realmInstance.delete(realmInstance.objects("Empleado"));
      });
      if (realmInstance !== null) {
        async function obtenerSemana() {
          const response = await services.obtenerSemanaActiva();
          console.log(response);
        }
        obtenerSemana();
      }

      realmInstance.write(() => {
        response.empleados.forEach(emp => {
          realmInstance.create(
            "Empleado",
            {
              CodigoEmpleado: emp.codigoEmpleado,
              Nombre: emp.nombre,
              CodigoTemporada: emp.temporada,
              CodigoLote: emp.codigoLote,
              CodigoNave: emp.codigoNave,
              CodigoJefeNave:
                emp.codigoJefeNave === null ? "" : emp.codigoJefeNave
            },
            "modified"
          );
        });
      });

      setStatusText("Se han guardado los empleados");
      setProgressBarValue(1);
    } catch (error) {
      console.log(error);
      Alert.alert("error", error);
    }
  };
  /*
  .filtered("FechaCaptura == $0", new Date(GenerarFecha(false, true))).map(emp => ({
            CodigoEmpleado: emp.CodigoEmpleado,
            Nombre: emp.Nombre,
            CodigoTemporada: emp.CodigoTemporada,
            CodigoLote: emp.CodigoLote,
            CodigoNave: emp.CodigoNave,
            CodTabla: emp.CodTabla,
            CodigoActividad: emp.CodigoActividad,
            CodigoAvance: emp.CodigoAvance,
            FechaCaptura: emp.FechaCaptura?.toISOString(),
            horaInicioActividad: emp.horaInicioActividad?.toISOString(),
            horaFinalActividad: emp.horaFinalActividad?.toISOString(),
            limiteMaximoDeCaptura: emp.limiteMaximoDeCaptura?.toISOString(),
            tienePermiso: emp.tienePermiso,
            solicitoPermiso: emp.solicitoPermiso,
            Avances: emp.Avances,
            rendimientoApli: emp.rendimientoApli,
            codUnidad: emp.codUnidad,
            CodigoJefe: emp.CodigoJefe,
            surcos: [...emp.surcos],
            tieneSurcos: emp.tieneSurcos
  }));
*/
  const EnviarEmpleadosCapturados = async token => {
    try {
      const EmpleadosAEnviar = realmInstance.objects("EmpleadoCapturado");
      realmInstance.write(() => {
        EmpleadosAEnviar.forEach(empleado => {
          const surcosEmpleadoAEnviar = realmInstance.objects("Surco").filtered(
            `
              codEmpleado == $0 AND
              lote == $1 AND
              nave == $2 AND
              tabla ==$3 AND
              actividad == $4 AND 
              avance ==$5 
             `,
            empleado.CodigoEmpleado,
            empleado.CodigoLote,
            empleado.CodigoNave,
            empleado.CodTabla,
            empleado.CodigoActividad,
            empleado.CodigoAvance
          );

          empleado.surcosAvances.splice(0);
          surcosEmpleadoAEnviar.forEach(surco => {
            empleado.surcosAvances.push({
              numeroSurco: Number(surco.surco),
              avance: surco.avanceAcum
            });
          });
        });
      });

      const emp = realmInstance.objects("EmpleadoCapturado");

      const response = await services.EnviarEmpleados(EmpleadosAEnviar, token);

      console.log("✅Sincronización completada");
      Alert.alert("Del Campo y Asociados", "Sincronización completa");
      //console.log(JSON.stringify(listaEmpleados, null, 2));
    } catch (err) {
      console.log("error", err);
    }
  };

  const borrarDatos = () => {
    if (realmInstance !== null) {
      realmInstance.write(() => {
        realmInstance.delete(realmInstance.objects("Actividades"));
        realmInstance.delete(realmInstance.objects("EmpleadoCapturado"));
        realmInstance.delete(realmInstance.objects("Empleado"));
        realmInstance.delete(realmInstance.objects("Tablas"));
        realmInstance.delete(realmInstance.objects("Nave"));
        realmInstance.delete(realmInstance.objects("ReportesAct"));
        realmInstance.delete(realmInstance.objects("Surco"));
        realmInstance.delete(realmInstance.objects("Sincronizar"));
        realmInstance.delete(realmInstance.objects("Semana"));
      });
    }
  };

  const GuardarSemanaEnRealm = response => {
    realmInstance.write(() => {
      realmInstance.create(
        "Semana",
        {
          CodigoSemana: Number(response.codigoSemana),
          CodigoTemporada: Number(response.codigoTemporada),
          FechaInicial: response.fechaFinal,
          FechaFinal: response.fechaInicial
        },
        "modified"
      );
    });
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
      fechaFormateada = `${año}-${mes}-${dia} ${horas}:${horaExtra
        ? Number(minutos) + Number(2)
        : minutos}:${segundos}`;
    }
    return fechaFormateada;
  };

  return (
    <View style={styles.container}>
      <View style={styles.uperContainer}>
        <LoadingDots />

        <Text variant="bodyMedium" style={{ marginTop: 50 }}>
          Sincronizando datos con el servidor
        </Text>
        <Text variant="bodyMedium" style={{ marginTop: 10 }}>
          Por favor espere!
        </Text>
      </View>
      <View style={styles.lowerContainer}>
        <ProgressBar
          style={{ marginTop: 250 }}
          progress={progressBarValue}
          color="green"
        />
        <Text variant="bodyMedium">
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
  }
});
