import React, { use, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import { getRealmInstance } from "../realm";
import { toDate } from "date-fns";

//Funcion que pintara el surco si esta trabajado o no
const ListaSurcos = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [realmInstance, setRealmInstance] = useState(null);
  const [surcosTrabajados, setSurcostrabajado] = useState(null);
  const {
    CodigoLote,
    CodigoNave,
    CodigoActividad,
    CodigoAvance,
    CodTabla,
    cantidadSurcos,
    fechaIni,
    fechaFin,
    DescripcionTabla,
    numeroNave,
    nombreNave,
    descripcionAct
  } = route.params || {};

  const [surcosFill, setsurcosFill] = useState([]);

  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
  }, []);

  useEffect(
    () => {
      
      if (realmInstance != null) {
        const emp = realmInstance.objects("EmpleadoCapturado").filtered(
          `   CodigoLote == $0 AND 
              CodigoNave == $1 AND 
              CodigoActividad == $2 AND 
              CodigoAvance == $3 AND 
              CodTabla == $4 AND 
              FechaCaptura >= $5 AND
              FechaCaptura <= $6`,
          String(CodigoLote),
          String(CodigoNave),
          String(CodigoActividad),
          String(CodigoAvance),
          String(CodTabla),
          new Date(fechaIni),
          new Date(fechaFin)
        );

        console.log(fechaIni, fechaFin);
       
        const surcosTrabajados = new Set();
        emp.forEach(empleado => {
          if (empleado.surcos?.length) {
            empleado.surcos.forEach(s => {
             
              const fechaEmpleado = empleado.FechaCaptura;
  
              const dentroRango = new Date(fechaEmpleado) >= new Date(fechaIni)&& new Date(fechaEmpleado) <= new Date(fechaFin);
             
              if(dentroRango){
                 surcosTrabajados.add(Number(s));
              }
            });
          }
        });

        const surcos = [];
        for (let i = 1; i <= cantidadSurcos; i++) {
          surcos.push({ numSurco: i, trabajado: surcosTrabajados.has(i) });
        }

        function soloFecha(date) {
          return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          ).getTime();
        }

         let cantidad = 0;
         surcos.forEach(surco => {
            if(surco.trabajado)
              cantidad++;
         });
       
         setSurcostrabajado(cantidad);
        setsurcosFill(surcos);
      }
    },
    [realmInstance]
  );

  useEffect(() => {}, [surcosFill]);

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.surco, item.trabajado && styles.surcoTrabajado]}>
        <Text style={styles.numero}>
          {item.numSurco}
        </Text>
      </View>
    );
  };

  const formatearFecha = fecha => {
    if (!fecha) return "";
    const day = String(fecha.getDate()).padStart(2, "0");
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const year = fecha.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const GenerarFecha = (horaExtra = false, SoloFecha = true) => {
    const ahora = new Date();

    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    let horas = String(ahora.getHours()).padStart(2, "0");

    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const segundos = String(ahora.getSeconds()).padStart(2, "0");
    let fechaFormateada = ``;

    if (SoloFecha) {
      fechaFormateada = `${dia}/${mes}/${año}`;
    } else {
      fechaFormateada = `${año}-${mes}-${dia} ${horas}:${horaExtra
        ? Number(minutos) + Number(2)
        : minutos}:${segundos}`;
    }
    return fechaFormateada;
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {CodigoLote}
        </Text>
        <Text style={styles.headerText}>
          {CodigoNave} - {nombreNave}
        </Text>
        <Text style={styles.headerText}>
          {descripcionAct.trim()} {CodigoActividad} - {CodigoAvance}{" "}
        </Text>
        <Text style={styles.headerText}>
          {DescripcionTabla}
        </Text>
        <Text style={styles.headerText}>
          {GenerarFecha()}
        </Text>
        <Text style={styles.headerText}>
          Surcos totales: {cantidadSurcos}
        </Text>
         <Text style={styles.headerText}>
          Surcos trabajados: {surcosTrabajados}
        </Text>
         <Text style={styles.headerText}>
          Surcos restantes: {cantidadSurcos-surcosTrabajados}
        </Text>
      </View>

      <View style={{ flex: 1, backgroundColor: "#f0fff0" }}>
        <FlatList
          data={surcosFill}
          keyExtractor={item => item.numSurco.toString()}
          numColumns={3}
          renderItem={({ item }) =>
            <View
              style={[styles.surco, item.trabajado && styles.surcoTrabajado]}
            >
              <Text
                style={
                  item.trabajado ? styles.surcoTextTrabajado : styles.surcoText
                }
              >
                {item.numSurco}
              </Text>
            </View>}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#B3E0B3",
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 10
  },
  headerText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "bold",
    padding: 2
  },
  listContent: {
    padding: 8
  },
  surco: {
    flex: 1, // 🔑 NECESARIO para columnas
    margin: 5,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#ffff",
    elevation: 3,
    alignItems: "center",
    justifyContent: "center"
  },
  surcoTrabajado: {
    backgroundColor: "#4CAF50"
  },
  surcoText: {
    fontWeight: "bold"
  },
  surcoTextTrabajado: {
    fontWeight: "bold",
    color: "white"
  }
});
export default ListaSurcos;
