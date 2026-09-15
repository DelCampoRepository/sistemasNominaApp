import React, { useEffect, useState } from "react";
import {View,StyleSheet,} from "react-native";
import CustomTitle from "../src/components/CustomTitle";
import { FlatList } from "react-native-gesture-handler";
import ReporteActividadCard from "../src/components/actividadesScreenComponents/ReporteActiCard";
import { getRealmInstance } from "../realm";
import { obtenerActividadesLote } from "../services/reporteActiviadesService";



const ReporteAct = ({ route, navigation }) => {
  
  const [realmInstamce, setRealmInstance] = useState(null);
  const [listaActividades, setListaActividades] = useState(null);
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


  return (
    <View style={styles.contenedor}>
      <View style={styles.title}>
        <CustomTitle title="-Reporte de actividades-" style={{ elevation: 0 }} />   
      </View>
      <View style={{height:"85%"}}>
        <FlatList
          data={listaActividades}
          renderItem={({ item }) => <ReporteActividadCard item={item} parametros={route.params} />}
          numColumns={1}
          showsVerticalScrollIndicator={true}
          keyExtractor={item => `${item.CodigoActividad.toString()}-${item.CodigoAvance.toString()}-${item.CodigoLote.toString()}`}
          
        />
        
      </View> 
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#f0fff0"
  },
  title:{
    height:'6%',
    alignItems:'center',
    justifyContent:'center'
  }
});

export default ReporteAct;
