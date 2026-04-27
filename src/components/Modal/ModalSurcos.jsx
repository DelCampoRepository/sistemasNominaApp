import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Alert
} from "react-native";
import { Modal } from "react-native-paper";

import Surco from "../Elements/Surco";

import {  useWindowDimensions } from 'react-native';
export default function ModalSurcos({
  setModales,
  modales,
  datosActividad,
  realmInstance,
  datosEmpleadoSeleccionado
}) {
  const [surcoDecimal, setSurcoDecimal] = useState(false);
  const [surcosSeleccionados, setSurcoSeleccionados] = useState([]);
  const [avanceSurco, setAvanceSurco] = useState("");
  const [semanaActiva, setSemanaActiva] = useState("");
  const [surcoSeleccionado, setSurcoSeleccionado] = useState({});
  const [listaSurcos, setListaSurcos] = useState([]);
  const [sumaSurcos, setSumasurcos] = useState(0);
  const [surcosIndexSele, setSurcosIndexSele] = useState([]);
  const [sumadorDeSurcos, setSumadorSurcos] = useState(0);
  const [guardado, setguardardado] = useState(false);
   const { width } = useWindowDimensions();
  useEffect(() => {}, []);

  useEffect(() => {
    if (realmInstance && modales.modalSurcos === true) {
      setListaSurcos([]);
      setSurcoSeleccionados([]);

      const inicializar = async () => {
        const semana = realmInstance.objects("Semana")[0]?.CodigoSemana || "";
        setSemanaActiva(semana);

        // Obtener cantidad de surcos de la tabla
        const tabla = realmInstance
          .objects("Tablas")
          .filtered(
            "CodigoLote == $0 AND CodigoNave == $1 AND CodigoTabla == $2",
            datosActividad.codigoLote,
            datosActividad.codigoNave,
            datosActividad.codigoTabla
          )[0];

        if (tabla) {
          generarListaBase(tabla.CantidadSurcos);
        }
      };
      inicializar();
    }
  }, [realmInstance, modales.modalSurcos, datosActividad.codigoEmpleado]);

  //funcion que nos carga  la informacion.
  const generarListaBase = (cantidad) => {
    try {
      //  console.log("se ejecuta");
      //se obitenen los surcos ya trabajados en este lote,nave,tabla
      const trabajadosEnRealm = realmInstance.objects("Surco").filtered(
        `lote == $0 AND
         nave == $1 AND 
         tabla == $2 AND 
         actividad == $3 AND  
         avance == $4 AND 
         fecha == $5`,
        datosActividad.codigoLote,
        datosActividad.codigoNave,
        datosActividad.codigoTabla,
        datosActividad.CodigoActividad,
        datosActividad.CodigoAvance,
        new Date(datosEmpleadoSeleccionado.FechaCaptura)
      );

      const temporalGeneral = [];
      const temporalSeleccionados = [];

      //buscamos todos los registros del mismo surco para ver si hay surcos decimales de diferentes
      //empleados, los acummula en arreglos de objetos separados que sean del mismo surco
      for (let i = 1; i <= cantidad; i++) {
        const registrosSurco = trabajadosEnRealm.filter(
          (s) => Number(s.surco) === i
        );

        //si se encuentran registros se suman para ver si suman la unidad
        const totalAvance = registrosSurco.reduce(
          (acc, curr) => acc + curr.avanceAcum,
          0
        );

        //se compara cada el condigo de empleado seleccionado
        //con  los registros encontrados y se asigna a miRegistro
        const miRegistro = registrosSurco.find(
          (s) => s.codEmpleado === datosActividad.codigoEmpleado
        );

        //evaluamos el estado para reasignar
        let estado = "w";
        if (totalAvance >= 1 && !miRegistro) estado = "g";
        else if (miRegistro)
          estado =
            miRegistro.avanceAcum !== 1
              ? "o"
              : new Date(miRegistro.fecha).getTime() !==
                  new Date(GenerarFecha(false, true)).getTime()
                ? "g"
                : "gr";
        else if (totalAvance > 0) estado = "o";

        //creamos un objeto que representa nuestro surco
        const objetoSurco = {
          surco: i,
          avanceAcum: miRegistro ? miRegistro.avanceAcum : 0,
          avanceTotalOtros:
            totalAvance - (miRegistro ? miRegistro.avanceAcum : 0),
          estado: estado,
          codEmpleado: datosActividad.codigoEmpleado
        };

        //agregamos el surco en cuestion como objeto dentro de temporalgeneral
        temporalGeneral.push(objetoSurco);

        //surcos seleccionados para ser guardados en el realm
        if (miRegistro) temporalSeleccionados.push(objetoSurco);
      }

      setListaSurcos(temporalGeneral);
      setSurcoSeleccionados(temporalSeleccionados);
    } catch (error) {
      console.log(error);
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
      fechaFormateada = `${año}-${mes}-${dia} ${horas}:${
        horaExtra ? Number(minutos) + Number(2) : minutos
      }:${segundos}`;
    }
    return fechaFormateada;
  };
  //actualzacion de listas
  const actualizarEstadoSurco = (nuevoSurco) => {
    //actualizar vista general
    //remapeamos los surcos si el surco en la lista es igual al surco del paramtro tomamos el nuevo surco, si no
    //nos quedamos con el surco que seria uno no seleccionado
    setListaSurcos((prev) =>
      prev.map((s) => (s.surco === nuevoSurco.surco ? nuevoSurco : s))
    );

    //actualizamos los surcos seleccionados a guardar e ncazo que se seleccione uno en la lista de la pantalla
    setSurcoSeleccionados((prev) => {
      const limpia = prev.filter((s) => s.surco !== nuevoSurco.surco);
      return nuevoSurco.avanceAcum > 0 ? [...limpia, nuevoSurco] : limpia;
    });
  };

  //controlamos si el surco se presiona ligeramente

  const handlePress = (item) => {
    // Si ya tiene avance (está seleccionado) → deseleccionar
    if (item.avanceAcum > 0) {
      const valorQuitar = item.avanceAcum; // puede ser 1, 0.5, 0.25, etc.

      actualizarEstadoSurco({
        ...item,
        avanceAcum: 0,
        estado: "w"
      });

      setSumadorSurcos((prev) => prev - valorQuitar);
      return;
    }

    // Si no tiene avance → seleccionar con valor 1
    const nuevoAvance = 1;

    if (item.avanceTotalOtros + nuevoAvance > 1) {
      Alert.alert(
        "Error",
        "Este surco ya está siendo trabajado por otro empleado"
      );
      return;
    }

    actualizarEstadoSurco({
      ...item,
      avanceAcum: nuevoAvance,
      estado: "gr"
    });

    setSumadorSurcos((prev) => prev + nuevoAvance);
  };
  const handleLongPress = (item) => {
    //seteamos el nuevo surco seleccionado
    setSurcoSeleccionado(item);
    //valor que seteamos que tendra el textinput que sera
    //si el surco seleccionado con longPress tiene un avance mayor a 0 muestra
    //ese avance de lo contrario si no tiene nada asignado mostramos el input en blanco
    setAvanceSurco(item.avanceAcum > 0 ? item.avanceAcum.toString() : "");
    //hacemos true para mostrar el texinput en pantalla
    setSurcoDecimal(true);
  };

  const confirmarAvanceDecimal = () => {
    const valor = parseFloat(avanceSurco);
    if (isNaN(valor) || valor < 0 || valor > 1) return;

    if (surcoSeleccionado.avanceTotalOtros + valor > 1) {
      Alert.alert(
        "Limite excedido",
        `Solo queda disponible ${1 - surcoSeleccionado.avanceTotalOtros}`
      );
      return;
    }

    // Restar el avance anterior y sumar el nuevo, redondeado
    setSumadorSurcos(
      (prev) =>
        Math.round((prev - surcoSeleccionado.avanceAcum + valor) * 100) / 100
    );

    actualizarEstadoSurco({
      ...surcoSeleccionado,
      avanceAcum: valor,
      estado: valor === 1 ? "gr" : valor === 0 ? "w" : "o"
    });

    setSurcoDecimal(false);
  };
  // console.log("del usuario", surcosSeleccionados);
  const guardarSurcos = async () => {
    try {
      const totalAvances =
        Number(sumadorDeSurcos) + Number(datosActividad.avances);
      const rendimiento = Number(datosActividad.Rendimiento);
      const tope = Number(datosActividad.RendimientoTope);

      // Redondear a 2 decimales para evitar falsos positivos por punto flotante
      const jornalCalculado =
        Math.round((totalAvances / rendimiento) * 100) / 100;

      if (rendimiento > 0 && jornalCalculado > tope) {
        Alert.alert(
          "Error",
          `Rendimiento tope excedido.\n\nJornal calculado: ${jornalCalculado}\nTope permitido: ${tope}`
        );
        return;
      }
      //Alert.alert("Éxito", "Avances guardados correctamente");
      //  handleCerrarModal();
      //      console.log(obtenerFechaYHora());
      const semana = realmInstance.objects("Semana");

      await realmInstance.write(() => {
        const surcosPrevios = realmInstance.objects("Surco").filtered(
          `tabla == $0 AND
             nave == $1 AND 
             lote == $2 AND 
             codEmpleado == $3  AND 
             actividad == $4 AND 
             avance == $5  AND
             semanaActiva == $6 AND 
             fecha == $7`,

          datosActividad.codigoTabla,
          datosActividad.codigoNave,
          datosActividad.codigoLote,
          datosActividad.codigoEmpleado,
          datosActividad.CodigoActividad,
          datosActividad.CodigoAvance,
          String(semana[0].CodigoSemana),
          new Date(GenerarFecha(false, true))
        );

        realmInstance.delete(surcosPrevios);

        let sumat = 0;
        let surcosSele = [];
        surcosSeleccionados.forEach((s) => {
          surcosSele.push(s.surco);
          // 1. Buscar si ya existe para actualizarlo
          sumat += s.avanceAcum;

          const existe = realmInstance.objects("Surco").filtered(
            `codEmpleado == $0 AND 
              surco == $1 AND 
              tabla == $2 AND
               nave == $3 AND 
               lote == $4 AND 
               actividad == $5 AND 
               avance == $6 AND 
               semanaActiva == $7 AND
               fecha ==$8`,
            datosActividad.codigoEmpleado,
            s.surco.toString(),
            datosActividad.codigoTabla,
            datosActividad.codigoNave,
            datosActividad.codigoLote,
            datosActividad.CodigoActividad,
            datosActividad.CodigoAvance,
            String(semanaActiva),
            new Date(GenerarFecha(false, true))
          )[0];

          const data = {
            surco: s.surco.toString(),
            tabla: datosActividad.codigoTabla,
            nave: datosActividad.codigoNave,
            lote: datosActividad.codigoLote,
            actividad: datosActividad.CodigoActividad,
            avance: datosActividad.CodigoAvance,
            codEmpleado: datosActividad.codigoEmpleado,
            avanceAcum: Number(s.avanceAcum.toFixed(2)),
            estado: s.estado,
            fecha: new Date(GenerarFecha(false, true)),
            semanaActiva: String(semanaActiva),
            trabajadoTotal:
              s.avanceAcum + s.avanceTotalOtros === 1 ? true : false,
            seleccionado: true
          };
          if (existe) {
            // Actualizar existente
            Object.assign(existe, data);
          } else {
            // CREAR NUEVO (Esto faltaba)
            realmInstance.create("Surco", data);
          }
        });

        setSumasurcos(sumat);
        setSurcosIndexSele(surcosSele);
        const surcosEnBase = realmInstance
          .objects("Surco")
          .filtered(
            "codEmpleado == $0 AND tabla == $1 AND fecha ==$2",
            datosActividad.codigoEmpleado,
            datosActividad.codigoTabla,
            new Date(GenerarFecha(false, true))
          );
        //  console.log(surcosEnBase);
        // ...pero que YA NO están en la lista de seleccionados (porque el usuario los limpió)
        const surcosABorrar = surcosEnBase.filter(
          (sb) =>
            !surcosSeleccionados.some((ss) => ss.surco.toString() === sb.surco)
        );

        // setModales((prev) => ({ ...prev, modalSurcos: false }));
        // 2. Opcional: Borrar los que el empleado desmarcó (avance 0)
        // (Lógica de borrado explicada en pasos anteriores)
      });
      setSumadorSurcos(0);
      setguardardado(true);
    } catch (error) {
      Alert.alert("Error al guardar", error.toString());
    }
  };

  const handleCerrarModal = () => {
    setModales((prev) => ({
      ...prev,
      modalSurcos: false
    }));
    setSurcoDecimal(false);
    setAvanceSurco("");
    setSumadorSurcos(0);
  };

  useEffect(() => {
    if (guardado) {
      GuardatAvancesEmpleado_Actividad();
      setguardardado(false);
    }
  }, [guardado]);

  const GuardatAvancesEmpleado_Actividad = () => {
    try {
      realmInstance.write(() => {
        const actividadesEncontradas = realmInstance
          .objects("ActiviadesPorEmpleado")
          .filtered(
            `
              codigoEmpleado == $0 AND
              CodigoActividad == $1 AND
              CodigoAvance == $2 AND
              codigoLote == $3 AND
              codigoNave == $4 AND 
              fecha == $5 AND 
              codigoTabla == $6`,
            datosEmpleadoSeleccionado.CodigoEmpleado,
            datosActividad.CodigoActividad,
            datosActividad.CodigoAvance,
            datosActividad.codigoLote,
            datosActividad.codigoNave,
            new Date(GenerarFecha(false, true)),
            datosActividad.codigoTabla
          );

        if (actividadesEncontradas.length == 0) return;

        const actividad = actividadesEncontradas[0];

        actividad.avances = Number(sumaSurcos);
        actividad.jornal = Number(sumaSurcos / datosActividad.Rendimiento);
      });

      realmInstance.write(() => {
        const empleado = realmInstance.objects("EmpleadoCapturado").filtered(
          `
              CodigoEmpleado == $0 AND
              CodigoActividad == $1 AND
              CodigoAvance == $2 AND
              CodigoLote == $3 AND
              CodigoNave == $4 AND 
              FechaCaptura == $5 AND 
              CodTabla == $6`,
          datosEmpleadoSeleccionado.CodigoEmpleado,
          datosActividad.CodigoActividad,
          datosActividad.CodigoAvance,
          datosActividad.codigoLote,
          datosActividad.codigoNave,
          new Date(GenerarFecha(false, true)),
          datosActividad.codigoTabla
        );

        if (empleado.length == 0) return;
        const emp = empleado[0];

        emp.Avances = Number(sumaSurcos);
        emp.surcos = surcosIndexSele;
      });
      setSurcosIndexSele([]);
      handleCerrarModal();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal visible={modales.modalSurcos} style={styles.modal}>
      <View style={[styles.container, { width: width > 600 ? "65%" : "95%" }]}>
        <View style={styles.ViewCerrar}>
          <TouchableOpacity
            style={styles.cerrarIcono}
            onPress={handleCerrarModal}
          >
            <Image
              source={require("../../../assets/cerraar.png")}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        {Object.keys(datosActividad).length > 0 && (
          <View style={{ marginTop: 20, borderWidth: 1, padding: 10, borderRadius: 5 }}>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Cod. empleado: {datosActividad.codigoEmpleado}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Nom. empleado: {datosActividad.nombreEmpleado}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Lote: {datosActividad.codigoLote}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Nave: {datosActividad.codigoNave}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Tabla: {datosActividad.codigoTabla}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Actividad: {datosActividad.CodigoActividad}-
              {datosActividad.CodigoAvance}, {datosActividad.Descripcion.trim()}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Rend. aplicado: {datosActividad.Rendimiento}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Rend. tope: {datosActividad.RendimientoTope}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Avances: {Number(datosActividad.avances) + sumadorDeSurcos}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Unidad: {datosActividad.NomCortoUnidad}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {" "}
              Jornal:{" "}
              {(
                Number(datosActividad.jornal) +
                Number(sumadorDeSurcos) / Number(datosActividad.Rendimiento)
              ).toFixed(2)}
            </Text>
          </View>
        )}
        <Text style={{ fontWeight: "bold", fontSize: width > 600 ? 14 : 13, marginTop: 10 }}>
          Avance
        </Text>
        {surcoDecimal === true && (
          <View style={[styles.viewAvanceDecimal, { height: width > 600 ? "7%" : "6%" }]}>
            <TextInput
              value={avanceSurco}
              onChangeText={(text) => {
                setAvanceSurco(text);
              }}
              keyboardType="decimal-pad"
              style={styles.textImput}
            />
            <TouchableOpacity
              style={{
                width: "45%",
                height: "100%",
                backgroundColor: "#419eeb",
                borderRadius: 6
              }}
              onPress={confirmarAvanceDecimal}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 18,
                  margin: "auto",
                  color: "white"
                }}
              >
                Aceptar
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.contenedorSurcos}>
          {listaSurcos.length - 1 > 0 && (
            <FlatList
              data={listaSurcos}
              renderItem={({ item }) => (
                <Surco
                  item={item}
                  onPressSurco={handlePress}
                  onLongPressSurco={handleLongPress}
                  setSumadorSurcos={setSumadorSurcos}
                />
              )}
              keyExtractor={(item) => item.surco.toString()}
              horizontal={false}
              numColumns={5}
              contentContainerStyle={styles.flatlistContent}
            />
          )}
        </View>
        <TouchableOpacity
          style={[styles.botonAgregar, { height: width > 600 ? "8%" : "%" }]}
          onPress={() => {
            guardarSurcos();
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 10,
              color: "white",
              margin: "auto"
            }}
          >
            AGREGAR AVANCES
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center"
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 20,
    width: "60%",
    margin: "auto"
  },
  textImput: {
    borderRadius: 5,
    borderWidth: 1,
    paddingLeft: 10,
    height: "100%",
    width: "45%",
    backgroundColor: "#ebebeb9d",
    fontSize: 18
  },
  ViewCerrar: {
    marginTop: 10,
    height: "5%",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center"
  },
  botonAgregar: {
    width: "100%",
    height: "10%",
    backgroundColor: "green",
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 20,
    alignItems: "center"
  },
  contenedorSurcos: {
    backgroundColor: "#ccc",
    height: 200,
    width: "100%",
    marginTop: 20,
    borderRadius: 10
  },
  flatlistContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center"
  },
  viewAvanceDecimal: {
    width: "100%",
    height: "7%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: ""
  }
});
