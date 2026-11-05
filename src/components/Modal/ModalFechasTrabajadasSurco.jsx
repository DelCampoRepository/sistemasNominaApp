import { useEffect, useMemo, useState } from "react";
import { StyleSheet,View,TouchableOpacity,Image, FlatList,Text} from "react-native"
import { Modal, Portal } from "react-native-paper";


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

    // Agrupa los registros (uno por empleado/día) por fecha, para mostrar en
    // cada fecha a todos los empleados que trabajaron el surco ese día.
    const registrosPorFecha = useMemo(() => {
      if (!render?.registros) return [];

      const grupos = {};
      render.registros.forEach((item) => {
        const fechaObj = new Date(item.fecha);
        const clave = fechaObj.toDateString();

        if (!grupos[clave]) {
          grupos[clave] = { clave, fecha: fechaObj, empleados: [] };
        }
        grupos[clave].empleados.push(item);
      });

      return Object.values(grupos).sort((a, b) => a.fecha - b.fecha);
    }, [render]);

    return(

          <Portal>
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
                      <Text style={styles.titulo}>Surco: {render.surco}</Text>
                      <Text>Avance total del surco: {Number(render.avanceTotal || 0).toFixed(2)}</Text>
                      <Text>Cantidad de empleados: {render.cantidadEmpleados}</Text>

                    <FlatList
                        data={registrosPorFecha}
                        keyExtractor={(grupo) => grupo.clave}
                        renderItem={({ item: grupo }) => (
                        <View style={styles.card}>
                            <Text style={styles.subtitulo}>{grupo.fecha.toLocaleDateString()}</Text>
                            {grupo.empleados.map((empleado, index) => (
                              <View key={`${empleado.codEmpleado}-${index}`} style={styles.filaEmpleado}>
                                  <Text>Cod. Empleado {empleado.codEmpleado} - {empleado.nombreEmpleado}</Text>
                                  <Text>Avance {Number(empleado.avanceAcum || 0).toFixed(2)}</Text>
                              </View>
                            ))}
                        </View>
                        )}
                    />
                </View>
            </Modal>
          </Portal>
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
  titulo: {
    fontWeight: "bold",
    fontSize: 16
  },
  subtitulo: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4
  },
  filaEmpleado: {
    marginTop: 4,
    paddingLeft: 10
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