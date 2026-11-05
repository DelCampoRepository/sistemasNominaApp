import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getRealmInstance } from "../realm";
import CustomOptions from "../src/components/CustomOptions";
import { finDiaCuliacanFecha, inicioDiaCuliacanFecha } from "../utils/obtenerHoraCuliacan";
import { consultarSurcosTrabajadosParaReporte, obtenerEstatusSurco } from "../services/SurcosTrabajadosService";
import ModalFechasTrabajadasSurco from "../src/components/Modal/ModalFechasTrabajadasSurco";
//Funcion que pintara el surco si esta trabajado o no
const ListaSurcos = ({ route }) => {
 
  const [realmInstance, setRealmInstance] = useState(null);
  const [surcosTrabajados, setSurcostrabajado] = useState(null);
  const [surcoPresionado, setSurcoPresionado] = useState(0);
  const [modalVisble, setModalVisible]= useState(false);
  const {
    lote,
    nave,
    tabla,
    fechaIni,
    fechaFin,
    cantidadSurcos,
    descNave,
    descLote,
    descTabla,
  } = route.params.parametros || {};

  const {CodigoActividad,CodigoAvance,Descripcion} =route.params.datosActivdad||{};

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

        const surcos = [];
        for (let i = 1; i <= cantidadSurcos; i++) {
          surcos.push({ numSurco: i, trabajado: false, estado:"w" });
        }

        setSurcostrabajado( consultarSurcosTrabajadosParaReporte(route.params,realmInstance))
        const trabajados= obtenerEstatusSurco(route.params, realmInstance);

        const listaRender = surcos.map(item => ({
          ...item,
          estado: trabajados.find(
            x => Number(x.surco) === item.numSurco
          )?.estado ?? item.estado
        }));

        setsurcosFill(listaRender);
      }
    },
    [realmInstance]
  );

 useEffect(()=>{
    if(surcosTrabajados != null && surcoPresionado != 0)
    {

      
    }
 },[surcoPresionado,surcosTrabajados])




  return (
    <View style={styles.contenedor}>
      {surcosTrabajados && <ModalFechasTrabajadasSurco visible={modalVisble} setVisible={setModalVisible} surco={surcoPresionado} registros={surcosTrabajados}  />}

      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      <View style={[styles.header, { paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 18 : 18 }]}>
        <Text style={styles.headerTexto}>Surcos trabajados</Text>
        <Text style={styles.headerSubtexto} numberOfLines={2}>
          Lote {lote}-{descLote} · Nave {nave}-{descNave} · Tabla {tabla}-{descTabla}
        </Text>
      </View>

      <View style={styles.encabezadoCard}>
        <View style={styles.filaResumen}>
          <Ionicons name="hammer-outline" size={16} color="#16a34a" style={{ marginRight: 8 }} />
          <Text style={styles.encabezadoTexto} numberOfLines={1}>
            {CodigoActividad}-{CodigoAvance} {Descripcion}
          </Text>
        </View>
        <View style={styles.filaResumen}>
          <Ionicons name="calendar-outline" size={16} color="#16a34a" style={{ marginRight: 8 }} />
          <Text style={styles.encabezadoTexto} numberOfLines={1}>
            {new Date(fechaIni).toLocaleDateString()} - {finDiaCuliacanFecha(fechaFin).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.leyendaFila}>
        <View style={styles.leyendaItem}>
          <View style={[styles.leyendaDot, { backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db" }]} />
          <Text style={styles.leyendaTexto}>Libre</Text>
        </View>
        <View style={styles.leyendaItem}>
          <View style={[styles.leyendaDot, { backgroundColor: "#f49a23" }]} />
          <Text style={styles.leyendaTexto}>Fraccionado</Text>
        </View>
        <View style={styles.leyendaItem}>
          <View style={[styles.leyendaDot, { backgroundColor: "#4CAF50" }]} />
          <Text style={styles.leyendaTexto}>Trabajado</Text>
        </View>
      </View>

      <View style={styles.listaCard}>
        <FlatList
          data={surcosFill}
          keyExtractor={item => item.numSurco.toString()}
          numColumns={6}
          renderItem={({ item }) =>
            <TouchableOpacity onPress={() =>{
              if (item.estado === "gr" || item.estado === "o") {
                setSurcoPresionado(item.numSurco);
                setModalVisible(true);
              }
            }}
              style={[styles.surco,
                  {
                    backgroundColor: item.estado ==="gr"? "#4CAF50" : item.estado === 'o'? "#f49a23":"#ffffff",
                    borderColor: item.estado === "w" ? "#e5e7eb" : "transparent"
                  }
               ]}
            >
              <Text
                style={
                  item.estado === "gr" || item.estado === "o" ? styles.surcoTextTrabajado : styles.surcoText
                }
              >
                {item.numSurco}
              </Text>
            </TouchableOpacity>}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
        />
      </View>
       <CustomOptions visible={false}/>
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
  listContent: {
    padding: 8
  },
  encabezadoCard: {
    backgroundColor: "white",
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: "92%",
    marginTop: 15,
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  filaResumen: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6
  },
  encabezadoTexto: {
    flex: 1,
    textAlign: "left",
    color: "#374151",
    fontSize: 13,
    fontWeight: "600"
  },
  leyendaFila: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    width: "92%",
    marginTop: 12
  },
  leyendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  leyendaDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  leyendaTexto: {
    fontSize: 11,
    color: "#6b7280"
  },
  listaCard: {
    backgroundColor: "white",
    borderRadius: 20,
    elevation: 5,
    width: "92%",
    height: "54%",
    marginTop: 12
  },
  surco: {
    flex: 1, // 🔑 NECESARIO para columnas
    margin: 5,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    alignItems: "center",
    justifyContent: "center"
  },
  surcoText: {
    fontWeight: "bold",
    color: "#374151"
  },
  surcoTextTrabajado: {
    fontWeight: "bold",
    color: "white"
  }
});
export default ListaSurcos;
