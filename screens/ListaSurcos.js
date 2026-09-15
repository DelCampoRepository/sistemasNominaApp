import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal
} from "react-native";
import { getRealmInstance } from "../realm";
import CustomOptions from "../src/components/CustomOptions";
import CustomTitle from "../src/components/CustomTitle";
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

         let cantidad = 0;
         surcos.forEach(surco => {  
           
              cantidad++;
         });
       
        setsurcosFill(surcos);
      }
    },
    [realmInstance]
  );
  
  useEffect(() => {

    if(surcosFill.length >0 && realmInstance !=null)
    {
     setSurcostrabajado( consultarSurcosTrabajadosParaReporte(route.params,realmInstance))
    const trabajados= obtenerEstatusSurco(route.params, realmInstance);

      const listaRender = surcosFill.map(item => ({
      ...item,
      estado: trabajados.find(
        x => Number(x.surco) === item.numSurco
    )?.estado ?? item.estado
    }));

     setsurcosFill(listaRender)
    }
   
  }, [realmInstance]);

 useEffect(()=>{
    if(surcosTrabajados != null && surcoPresionado != 0)
    {

      
    }
 },[surcoPresionado,surcosTrabajados])




  return (
    <View style={{ flex: 1, backgroundColor: "#f0fff0", zIndex: -2, alignItems: "center" }}>
      {surcosTrabajados && <ModalFechasTrabajadasSurco visible={modalVisble} setVisible={setModalVisible} surco={surcoPresionado} registros={surcosTrabajados}  />}
        <CustomTitle title="- Surcos trabajados -" />
        <View style={{justifyContent:'flex-start', width:"100%"}}>
          <Text style={{textAlign:'left', marginLeft:20}}>Lote: {lote}-{descLote}</Text>
          <Text style={{textAlign:'left', marginLeft:20}}>Nave: {nave}-{descNave}</Text>
          <Text style={{textAlign:'left', marginLeft:20}}>Tabla: {tabla}-{descTabla}</Text>
           <Text style={{textAlign:'left', marginLeft:20}}>Actividad: {CodigoActividad}-{CodigoAvance} {Descripcion}</Text>
            <Text style={{textAlign:'left', marginLeft:20}}>Periodo: {new Date(fechaIni).toLocaleString()} - {finDiaCuliacanFecha(fechaFin).toLocaleString()}</Text>
        </View>

      <View style={{  backgroundColor: "#f0fff0", zIndex: -2 , width: "100%", height:"61%"}}>
        <FlatList
          data={surcosFill}
          keyExtractor={item => item.numSurco.toString()}
          numColumns={6}
          renderItem={({ item }) =>
            <TouchableOpacity onPress={() =>{setSurcoPresionado(item.numSurco);
              setModalVisible(true)}
            }
              style={[styles.surco,

                  {
                    backgroundColor: item.estado ==="gr"? "#4CAF50" : item.estado === 'o'? "#f49a23":"white" 
                  }
               ]}
            >
              <Text
                style={
                  item.trabajado ? styles.surcoTextTrabajado : styles.surcoText
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
  header: {
    backgroundColor: "#B3E0B3",
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 10,
    width: "100%", 
    height:"25%",
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
