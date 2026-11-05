import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, StatusBar, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FlatList } from "react-native-gesture-handler";
import ReporteActividadCard from "../src/components/actividadesScreenComponents/ReporteActiCard";
import { getRealmInstance } from "../realm";
import { obtenerActividadesLote } from "../services/reporteActiviadesService";
import CustomOptions from "../src/components/CustomOptions";


const ReporteAct = ({ route, navigation }) => {

  const [realmInstamce, setRealmInstance] = useState(null);
  const [listaActividades, setListaActividades] = useState(null);

    const [modales, setModales] = useState({});
  useEffect(()=>{

    const inicializarRealm = async () => {
         setRealmInstance(await getRealmInstance());
       };
       inicializarRealm();

  },[])

useEffect(()=>{
  if(realmInstamce !=null )
  {

    const lista = obtenerActividadesLote(realmInstamce, route.params)
    setListaActividades(lista)
  }

},[realmInstamce])

  const { lote, nave, tabla } = route.params || {};

  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      <View style={[styles.header, { paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 18 : 18 }]}>
        <Text style={styles.headerTexto}>Reporte de actividades</Text>
        {(lote || nave || tabla) && (
          <Text style={styles.headerSubtexto}>
            Lote {lote} · Nave {nave} · Tabla {tabla}
          </Text>
        )}
      </View>

      <View style={styles.listaContenedor}>
        <FlatList
          data={listaActividades}
          renderItem={({ item }) => <ReporteActividadCard item={item} parametros={route.params} />}
          numColumns={1}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={(!listaActividades || listaActividades.length === 0) && styles.vacioContenedor}
          keyExtractor={item => `${item.CodigoActividad.toString()}-${item.CodigoAvance.toString()}-${item.CodigoLote.toString()}`}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <View style={styles.vacioIconCircle}>
                <Ionicons name="bar-chart-outline" size={30} color="#9ca3af" />
              </View>
              <Text style={styles.vacioTitulo}>Sin actividades para mostrar</Text>
            </View>
          }
        />
      </View>
      <CustomOptions setModales={setModales} visible={false}/>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
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
  listaContenedor: {
    flex: 1,
    width: "100%"
  },
  vacioContenedor: {
    flexGrow: 1,
    justifyContent: "center"
  },
  vacio: {
    alignItems: "center",
    paddingHorizontal: 30
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
  }
});

export default ReporteAct;
