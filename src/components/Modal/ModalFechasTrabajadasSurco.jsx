import { useEffect, useState } from "react";
import { StyleSheet,View,TouchableOpacity,Image, FlatList,Text} from "react-native"
import { Modal } from "react-native-paper";


 export default function ModalFechasTrabajadasSurco({registros,surco,visible,setVisible}){
      
  
    const [render, setRender]= useState([]);

    useEffect(()=>{

       if(visible === true)
       {
         const informacionSurco = registros.find(
             s => s.surco == surco
        );
        setRender(informacionSurco);
       }
        
    },[visible])
      
   

    return(
       
            <Modal  
                visible={visible}
                
            >
                <View style={styles.container}>
                    <View style={styles.ViewCerrar}>
                        <TouchableOpacity
                          style={styles.cerrarIcono}
                          onPress={()=>setVisible(false)}
                        >
                          <Image
                            source={require("../../../assets/cerraar.png")}
                            style={{ width: 30, height: 30 }}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                    </View>
                      <Text>Surco: {render.surco}</Text>
                      <Text>Avance Total: {render.avanceTotal}</Text>
                      <Text>cantidad de empleados: {render.cantidadEmpleados}</Text>
                    <FlatList
                        data={render.registros}
                        keyExtractor={(item) => `${item.codEmpleado}-${item.fecha}`}
                        renderItem={({ item }) => (
                        <TouchableOpacity
                        style={styles.card}
                        
                        >
                            
                            <Text>Fecha {new Date(item.fecha).toLocaleString()}</Text>
                            <Text>Cod. Empleado {item.codEmpleado}</Text>
                            <Text>Avance {item.avanceAcum}</Text>
                           
                        </TouchableOpacity>

                        )}
                    />
                </View>
            </Modal>
        )
  }
  
const styles = StyleSheet.create({

   container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",

    margin: "auto"
  },
  ViewCerrar: {
    marginTop: 10,
    height: "5%",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center"
  },
  cerrarIcono: {
    position: "absolute",
    
    
    zIndex: 1
  },
   card: {
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    elevation: 3,          // Android
    shadowColor: "#000",   // iOS
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
    

});