import { StyleSheet, View, Text, TouchableOpacity, ScrollView, StatusBar, Platform, useWindowDimensions } from "react-native";
import React, { useState, useEffect } from "react";
import { getRealmInstance } from "../realm";
import { Ionicons } from "@expo/vector-icons";
import { Modal } from "react-native-paper";
import { FlatList } from "react-native-gesture-handler";
import CustomOptions from "../src/components/CustomOptions";
import EmpleadoReporteCard from "../src/components/Cards/EmpleadoReporteCard";
import DetalleActividadEmpleadoCard from "../src/components/Cards/DetalleActividadEmpleadoCard";
export default function ReporteEmpleadosScreen({ route }) {
  const { height: screenHeight } = useWindowDimensions();
  const [realmInstance, setRealmInstance] = useState(null);
  const [listaEmpleados, setListaEmpleados] = useState([]);
  const [ListaFinalEmp, setListaFinalEmp] = useState([]);
  const [actividadesPorEmp, setActividadesPorEmp] = useState([]);
  const [actividades, setActividades] = useState([]);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
  const {
   
    nombreNave,
    Descripcion,
    descripcionTabla,
    nave,
    tabla,
    codigoLote,
    fechaIni,
    fechaFin
  } = route.params || {};

  useEffect(() => {
    const inicializarRealm = async () => {
      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();
  }, []);

  useEffect(
    () => {
      if (realmInstance !== null) {
        buscarEmpleadoPorCodigo();
      }
    },
    [realmInstance]
  );

  useEffect(
    () => {
      if (actividades.length > 0 && listaEmpleados.length > 0) {
        const empleadosFinal = listaEmpleados.map(emp => {
          const actividad = actividades.find(
            act =>
              act.CodigoActividad == emp.CodigoActividad &&
              act.CodigoAvance == emp.CodigoAvance
          );

          return {...emp, 
                Descripcion: actividad?.Descripcion ?? "Sin Actividad"
          }
        });

        setListaFinalEmp(empleadosFinal);

      }
    },
    [actividades, listaEmpleados]
  );

  useEffect(() =>{
 
  },[actividadesPorEmp])
 

const buscarEmpleadoPorCodigo = async () => {

    console.log(new Date(fechaIni), fechaFin)
    
    try {
      const inicioDia = new Date(fechaIni);
inicioDia.setHours(0, 0, 0, 0);

const finDia = new Date(fechaFin);
finDia.setHours(23, 59, 59, 999);
     const listaEmpleados = realmInstance
  .objects("EmpleadoCapturado")
  .filtered(
    "CodigoLote == $0 AND CodigoNave == $1 AND CodTabla == $2 AND FechaCaptura >= $3  AND FechaCaptura <= $4",
    String(codigoLote),
    String(nave),
    String(tabla),
     inicioDia,
    finDia
  )

  const empleadosPlano = JSON.parse(JSON.stringify(listaEmpleados));
  const empleadosUnicos = Object.values(
  empleadosPlano.reduce((acc, emp) => {
    acc[emp.CodigoEmpleado] = emp; // pisa duplicados
    return acc;
  }, {})
);
        
      setListaEmpleados(empleadosUnicos);

      const actividadesRealm = realmInstance.objects("Actividades");
      setActividades(actividadesRealm);
    } catch (error) {
      console.log(error);
      Alert.alert("Del Campo y Asociados", err);
    }
  };

const buscarActividadesEmpleado = (item) =>{

    
    try{

         const inicioDia = new Date(fechaIni);
              inicioDia.setHours(0, 0, 0, 0);
        
        const finDia = new Date(fechaFin);
           finDia.setHours(23, 59, 59, 999);
           // console.log(fechaFin, fechaIni)
        const listaEmpleadosRealm = realmInstance
        .objects("EmpleadoCapturado")
        .filtered(
          "CodigoLote == $0 AND CodigoNave == $1 AND CodTabla == $2 AND  CodigoEmpleado ==$3 AND FechaCaptura >= $4 AND FechaCaptura <=$5",
          String(codigoLote),
          String(nave),
          String(tabla),
          item.CodigoEmpleado,
          inicioDia,
          finDia
        )

        // Convertimos a plano (los objetos "vivos" de Realm no se copian bien con spread)
        const listaEmpleados = JSON.parse(JSON.stringify(listaEmpleadosRealm));

          if (actividades.length > 0 && listaEmpleados.length > 0) {
        const empleadosFinal = listaEmpleados.map(emp => {
          const actividad = actividades.find(
            act =>
              act.CodigoActividad == emp.CodigoActividad &&
              act.CodigoAvance == emp.CodigoAvance
          );

          return {...emp, 
                Descripcion: actividad?.Descripcion ?? "Sin Actividad",
                Rendimiento: actividad?.Rendimiento ?? 0,
                RendimientoTope: actividad?.RendimientoTope ?? 0,
          }
        });
        
         setActividadesPorEmp(empleadosFinal)
      setIsMenuVisible(true);
    }
     
   
    }catch{
        
    }
  }

const formatFecha =(fecha) =>{

    return  fecha.substring(0, 10).split('-').reverse().join('/');
  }

  

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      <View style={[styles.header, { paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 18 : 18 }]}>
        <Text style={styles.headerTexto}>Reporte por empleados</Text>
        <Text style={styles.headerSubtexto} numberOfLines={2}>
          Lote {codigoLote}-{Descripcion} · Nave {nave}-{nombreNave} · {descripcionTabla}
        </Text>
      </View>

      <View style={styles.resumenCard}>
        <Ionicons name="calendar-outline" size={16} color="#16a34a" style={{ marginRight: 8 }} />
        <Text style={styles.resumenTexto}>
          {formatFecha(fechaIni)} - {formatFecha(fechaFin)}
        </Text>
      </View>

      <View style={styles.listaContenedor}>
        <ScrollView style={{ width: "100%" }} contentContainerStyle={styles.listaContenido}>
          {ListaFinalEmp && ListaFinalEmp.length > 0 ? (
            ListaFinalEmp.map(empleado => (
              <EmpleadoReporteCard
                key={`${empleado.CodigoActividad}-${empleado.CodigoAvance}-${empleado.CodigoEmpleado}`}
                empleado={empleado}
                onPress={() => buscarActividadesEmpleado(empleado)}
              />
            ))
          ) : (
            <View style={styles.vacio}>
              <View style={styles.vacioIconCircle}>
                <Ionicons name="people-outline" size={30} color="#9ca3af" />
              </View>
              <Text style={styles.vacioTitulo}>Sin empleados para mostrar</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <Modal
        visible={isMenuVisible}
        onDismiss={() => setIsMenuVisible(false)}
        contentContainerStyle={[styles.modalContenido, { height: screenHeight * 0.75 }]}
      >
        <TouchableOpacity
          style={styles.cerrarIcono}
          onPress={() => setIsMenuVisible(false)}
        >
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>

        {actividadesPorEmp.length > 0 && (
          <View style={styles.modalHeaderEmpleado}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="person" size={22} color="#16a34a" />
            </View>
            <Text style={styles.modalCodigoEmpleado}>{actividadesPorEmp[0].CodigoEmpleado}</Text>
            <Text style={styles.modalNombreEmpleado}>{actividadesPorEmp[0].Nombre}</Text>
          </View>
        )}

        <FlatList
          style={{ width: "100%", flex: 1 }}
          data={actividadesPorEmp}
          keyExtractor={(item, index) => `${item.CodigoActividad}-${item.CodigoAvance}-${index}`}
          renderItem={({ item }) => (
            <DetalleActividadEmpleadoCard item={item} formatFecha={formatFecha} realmInstance={realmInstance} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </Modal>

      <CustomOptions visible={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fff0",
    alignItems: "center"
  },
  header: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 22,
    paddingBottom: 26,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    width: "100%"
  },
  headerTexto: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold"
  },
  headerSubtexto: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 4
  },
  resumenCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: "92%",
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  resumenTexto: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151"
  },
  listaContenedor: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    marginTop: 8
  },
  listaContenido: {
    alignItems: "center",
    paddingBottom: 100
  },
  vacio: {
    alignItems: "center",
    paddingHorizontal: 30,
    marginTop: 40
  },
  vacioIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  vacioTitulo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151"
  },
  modalContenido: {
    backgroundColor: "#fff",
    borderRadius: 24,
    width: "92%",
    alignSelf: "center",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12
  },
  cerrarIcono: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1
  },
  modalHeaderEmpleado: {
    alignItems: "center",
    marginBottom: 12
  },
  modalIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8
  },
  modalCodigoEmpleado: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#111827"
  },
  modalNombreEmpleado: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2
  }
});
