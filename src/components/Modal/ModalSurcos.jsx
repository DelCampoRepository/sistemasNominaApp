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
import { DateTime } from 'luxon';
import {  useWindowDimensions } from 'react-native';
import { useSurcos } from "../../hooks/useSurcos";
import { ahoraTimestamp, finDiaCuliacan, formatearFechaCuliacan, inicioDiaCuliacan } from "../../../utils/obtenerHoraCuliacan";

import { fecha } from "../../../utils/generarHoraLimite";
export default function ModalSurcos({
  setModales,
  modales,
  datosActividad,
  realmInstance,
  datosEmpleadoSeleccionado
  
}) {

const {
  listaSurcos,
  modalFraccionado,
  
  SetModalFraccionado,
  handlePress,
  guardarSurcosSeleccionados,
  handleLongPress,
  datosSurcoTrabajado,
  mostraInfo, 
  setMostrarInfo,
  datosSurcoFraccionSelec,
  setDatosSurcoFraccionSele,
  setListaSurcos,
  BuscarFraccionesDeSurco
}= useSurcos(realmInstance,datosActividad, modales);

  const [surcoDecimal, setSurcoDecimal] = useState(false);
  
  const [avanceSurco, setAvanceSurco] = useState("");
  const [sumadorDeSurcos, setSumadorSurcos] = useState(0);
  const { width } = useWindowDimensions();

  const handleCerrarModal = () => {
    setModales((prev) => ({
      ...prev,
      modalSurcos: false
    }));
    setSurcoDecimal(false);
    setAvanceSurco("");
    setSumadorSurcos(0);
    setMostrarInfo(false);
  };

const  ViewDatosSurco =()=>{

  return(<View style={{width:'55%', heigh:'50%', margin:'auto', elevation:5, zIndex:9999, backgroundColor:"white",padding:10,borderRadius:10,borderWidth:2}}>
        <View style={styles.ViewCerrar}>
          <TouchableOpacity
            style={styles.cerrarIcono}
           onPress={()=>setMostrarInfo(false)}
          >
            <Image
              source={require("../../../assets/cerraar.png")}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <Text style={{marginTop:20}}>Avance: {datosSurcoTrabajado.avanceAcum}</Text>
        <Text>Empleado: {datosSurcoTrabajado.codEmpleado}</Text>
        <Text>Avance fraccionado: {datosSurcoTrabajado.avanceTotalOtros}</Text>
         <Text>Fecha trabajado: {datosSurcoTrabajado.fecha}</Text>
    </View>);
};


function confirmarAvanceDecimal(){
  const valor = parseFloat(avanceSurco);
   console.log("sasdasd",datosSurcoFraccionSelec)
    if (isNaN(valor) || valor < 0 || valor > 1) 
      {
        Alert.alert('la cantidad es mayor a  1')
        return;
      };

    const dif= valor ===0? 0: (datosSurcoFraccionSelec.avanceTotalOtros + valor + datosSurcoFraccionSelec.avanceAcum);
     if ( dif> 1) {
      Alert.alert(
        "Limite excedido",
        `Solo queda disponible ${(1 - (datosSurcoFraccionSelec.avanceTotalOtros +datosSurcoFraccionSelec.avanceAcum)).toFixed(2)}`
      );
      return;
    }
   
   
   const res =  BuscarFraccionesDeSurco(valor);
   
    if(res.estado)
    {
       const primerFraccionado = res.totalOtros === 0? true:false



        if(valor === 0)
      {
        setListaSurcos(prev => prev.map(surco =>
        surco.surco === datosSurcoFraccionSelec.surco ?
         {...surco,
          avanceAcum:Number(valor.toFixed(2)), 
           estado: Number(datosSurcoFraccionSelec.avanceTotalOtros.toFixed(2)) === 0 && valor === 0?'w' :Number(datosSurcoFraccionSelec.avanceTotalOtros.toFixed(2))===0?"w": "o",
           codEmpleado: "", 
           avanceTotalOtros:datosSurcoFraccionSelec.avanceTotalOtros,
           seleccionado: false, 
           fecha: "",
           primerFraccionado:false
          } : surco
        ));
      }
      else
      {
          setListaSurcos(prev => prev.map(surco =>
         surco.surco === datosSurcoFraccionSelec.surco ?
          {...surco,
           avanceAcum:Number(valor.toFixed(2)), 
            estado: valor === 1?'gr' :'o' , 
            codEmpleado: datosActividad.codigoEmpleado, 
            avanceTotalOtros:datosSurcoFraccionSelec.avanceTotalOtros,
            seleccionado: true, 
            fecha: new Date().toISOString(),
            primerFraccionado:primerFraccionado
          } : surco,
            
          ));
      }

    }

    else{
        return;
    }
}


return (
   <View style={{width:'100%', height:'100%', position:'absolute',}}>
      {mostraInfo &&<ViewDatosSurco/>}
     <Modal visible={modales.modalSurcos } style={styles.modal}>  
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
      
         {modalFraccionado &&<View style={{width:"100%",height:'20%'}}>
            <Text style={{marginTop:20, fontWeight:'bold',textAlign:'center'}}>Agregar avance  para surco fraccionado</Text>
            <TextInput
             style={{marginTop:20, marginHorizontal:'auto',height:35, textAlign:"center", width:"40%", borderWidth:1}}
              placeholder="  Avance"
               keyboardType="decimal-pad"
               onChangeText={(text) => {setAvanceSurco(text)}}
               value={avanceSurco}
               ></TextInput>
            <View style={{flexDirection:'row'}}>
              <TouchableOpacity 
            style={styles.botonesFormFraccionado}
            onPress={()=>{SetModalFraccionado(false);confirmarAvanceDecimal();}}
            >
              <Text style={{color:'white', fontWeight:'bold'}}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
            style={styles.botonesFormFraccionado}
            onPress={()=>SetModalFraccionado(false)}
            >
              <Text style={{color:'white', fontWeight:'bold'}}>Cancelar</Text>
            </TouchableOpacity>
            </View>
        </View>   

         }   

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
              numColumns={  width > 600 ?6:5}
              contentContainerStyle={styles.flatlistContent}
            />
          )}
        </View>
        <TouchableOpacity
          style={[styles.botonAgregar, { height: width > 600 ? "8%" : "8%" }]}
          onPress={()=>{
            guardarSurcosSeleccionados(),
            setMostrarInfo(false)
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
   </View>
  );
}

const styles = StyleSheet.create({
  modal: {
     flex: 1,
    backgrundColor: "#00000099",
    justifyContent: "center"
  },
    modalFraccion: {
   
    width:'100%',
    height:"100%",
    backgroundColor: "#00000099",
    justifyContent: "center"
  },
  containerFraccion: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 20,
    height:'60%',
    margin: "auto"
  },
  ViewCerrarFraccion: {
    marginTop: 10,
   
    height: "15%",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center"
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 20,
    height:'95%',
    margin: "auto"
  },
  textImput: {
    marginVertical:10,
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
    height: 310,
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
   
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: ""
  },
  botonesFormFraccionado:{
borderRadius:10,marginVertical:20,height:35, width:'40%',marginHorizontal:'auto',justifyContent:'center', alignItems:'center',backgroundColor:'green'
  }
});
