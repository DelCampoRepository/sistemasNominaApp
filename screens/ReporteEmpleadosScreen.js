import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import React, { useState, useEffect, useContext, use } from "react";
import { getRealmInstance } from "../realm";
import { Touchable } from "react-native";
import { Modal } from "react-native-paper";
import { FlatList } from "react-native-gesture-handler";
export default function ReporteEmpleadosScreen({ route }) {
  const [realmInstance, setRealmInstance] = useState(null);
  const [listaEmpleados, setListaEmpleados] = useState([]);
  const [ListaFinalEmp, setListaFinalEmp] = useState([]);
  const [actividadesPorEmp, setActividadesPorEmp] = useState([]);
  const [actividades, setActividades] = useState([]);
      const [isMenuVisible, setIsMenuVisible] = useState(false);
  const {
    numeroNave,
    nombreNave,
    Descripcion,
    descripcionTabla,
    nave,
    cantidadSurcos,
    tabla,
    codigoLote,
    mostrarReporte,
    fechaIni,
    fechaFin
  } =
    route.params || {};

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


  const buscarActividadesEmpleado = (item) =>{

    
    try{

         const inicioDia = new Date(fechaIni);
              inicioDia.setHours(0, 0, 0, 0);
        
        const finDia = new Date(fechaFin);
           finDia.setHours(23, 59, 59, 999);
           // console.log(fechaFin, fechaIni)
        const listaEmpleados = realmInstance
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

  useEffect(() =>{
 
  },[actividadesPorEmp])
 

const renderIntem = ({ item }) => (
  <View
    style={{ 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: 25, 
      width: 25,
      backgroundColor: '#B3E0B3', 
      borderRadius: 12.5,
      marginHorizontal: 2, 
      marginVertical: 2,
    
      borderWidth: 0.01
    }}
  >
    <Text style={{ fontWeight: 'bold' }}>
      {item}
    </Text>
  </View>
);


  return (
    <View style={styles.container}>
      <View style={styles.infoSuperior}>
        <Text style={styles.infoText}>
          {codigoLote} - {Descripcion}
        </Text>
        <Text style={styles.infoText}>
          {nave} - {nombreNave}
        </Text>
        <Text style={styles.infoText}>
          {descripcionTabla}
        </Text>
        <Text style={styles.infoText}>
          Fecha Inicial: {formatFecha(fechaIni)}
        </Text>
        <Text style={styles.infoText}>
          Fecha Final: {formatFecha(fechaFin)}
        </Text>
        <View style={styles.rowInfo}>
          <Text style={styles.rendimiento2} />
          <Text style={styles.fecha} />
        </View>
        <View style={styles.rowInfo} />
      </View>
      <View style={{ width: "100%", height: "*83%", flex: 1 }}>
        <View
          style={{
            flex: 1,
            display: "flex",
            width: "100%",
            alignItems: "center"
          }}
        >
          {ListaFinalEmp &&
            ListaFinalEmp.map(empleado =>
              <TouchableOpacity
                key={`${empleado.CodigoActividad}-${empleado.CodigoAvance}-${empleado.CodigoEmpleado}`}
                style={{
                  height: 75,
                  backgroundColor: "white",
                  marginTop: 10,
                  display: "flex",
                  flexDirection: "row",
                  borderWidth: 0.5,
                  borderRadius: 10,
                  elevation:isMenuVisible?0: 5,
                  width: "94%",
                  
                }}
                onPress={ ()=> buscarActividadesEmpleado(empleado)}
              >
                <View
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginRight: 20,
                    marginLeft: 8
                  }}
                >
                  <Image
                    source={require("../assets/usuario2.png")}
                    style={styles.avatar}
                  />
                </View>
                <View
                  style={{
                    display: "flex",
                    justifyContent: "center"
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      
                    }}
                  >
               
               
                     <View>
                    <Text style={{ fontWeight: "bold" }}>
                      {empleado.CodigoEmpleado}
                    </Text>
                  </View>
                  </View>
                  <Text>
                    {empleado.Nombre}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
        </View>
      </View>
      <Modal visible={isMenuVisible}>
        <View style={{
           width:'100%',
          
                        height:'100%',
            backgroundColor: "#00000099",
            justifyContent: "center",  
             backgroundColor:"gree",         
            alignItems: "center"}}>
                    <View  style={{
                        backgroundColor: "#fff",
                        borderRadius: 10, 
                        width:'90%',
                        height:'50%',
                        alignItems: "center"
                    }}>
                           <TouchableOpacity
                                            style={styles.cerrarIcono}
                                            onPress={() => {
                                              setIsMenuVisible(false);
                                            }}
                                          >
                                            <Image
                                              source={require("../assets/cerraar.png")}
                                              style={{ width: 30, height: 30 }}
                                              resizeMode="contain"
                                            />
                                          </TouchableOpacity>
                       <View style={{marginTop:40}} >
                      {actividadesPorEmp.length > 0 &&
                         <View style={{backgroundColor:"#ffffffff", width:"100%", marginTop:10, marginBottom:10, display:'flex', alignItems:'center'}}>
                              <Text style={{fontWeight:'bold'}}>   {actividadesPorEmp[0].CodigoEmpleado}    </Text>
                             <Text style={{fontWeight:'bold'}}>   {actividadesPorEmp[0].Nombre}    </Text>
                         </View>
                      }
                       </View>
                     <View style={{
                        backgroundColor: "#fff",
                        borderRadius: 10, 
                        width:'100%',
                        height:'100%',
                  
                    }}>
                          <FlatList
                  data={actividadesPorEmp}
                  keyExtractor={(item, index) =>
                    `${item.CodigoActividad}-${item.CodigoAvance}-${index}`
                  }
                  renderItem={({ item }) => (
                    <View style={{ marginVertical: 10 }}>
                        <View style={{   
                          backgroundColor: 
                          item.estado > 0 
                          ?  item.estado === 1
                          ? "#aeccffff" :"#e9a7a7ff"  :"#B3E0B3", 
                          width:"90%", 
                          display:'flex', 
                          alignItems:"flex-start", 
                          justifyContent:'flex-start', 
                          marginLeft:20, 
                          borderRadius:5, 
                          paddingVertical:5, 
                          elevation:3}}>
                        <Text style={{marginLeft:10, fontWeight: 'bold' }}>
                            {item.CodigoActividad} - {item.CodigoAvance} {item.Descripcion}
                        </Text>
                    </View>
                     
                  
                     <View style={{
                    width:"100%", 
                    display:'flex', 
                    alignItems:"flex-start",
                     justifyContent:'flex-start', 
                     marginLeft:20}}>
                       <View style={{
                        backgroundColor:"#f0fff0", 
                        width:"90%", 
                        height:30, 
                        marginVertical:5, 
                        marginTop:5, 
                        display:'flex', 
                        justifyContent:'center', 
                        borderRadius:10 , 
                        elevation:3}}>
                          <Text  style={{fontWeight:'bold', marginLeft:10}}>Fecha: {formatFecha(item.FechaCaptura.toISOString())}</Text>
                       </View>
                       <View style={{
                            backgroundColor:"#f0fff0", 
                            width:"90%", 
                            height:30,
                            marginVertical:5,
                            marginTop:5, 
                            display:'flex', 
                            justifyContent:'center', 
                            borderRadius:10 , 
                            elevation:3
                            }}>  
                              <Text   style={{
                                fontWeight:'bold', 
                                marginLeft:10}}>
                                  Avance: {item.Avances.toFixed(2)}
                              </Text>
                            </View>

                             <View style={{
                                backgroundColor:"#f0fff0", 
                                width:"90%",
                                 height:30,
                                  marginVertical:5,
                                   display:'flex',
                                    justifyContent:'center',
                                     borderRadius:10,
                                      elevation:3}}> 
                            <Text style={{fontWeight:'bold'}} >{" "} Jrn: {(item.Avances/item.Rendimiento).toFixed(2)} </Text>
                             </View> 
                             <View style={{
                        backgroundColor:"#f0fff0",
                         width:"90%", 
                         height:30, 
                         marginVertical:5,
                          display:'flex',
                           justifyContent:'center', 
                           borderRadius:10, 
                           elevation:3}}
                    > 
                     
                   <Text style={{fontWeight:'bold', marginLeft:10}}>Unindad:{item.codUnidad}</Text>
                   
                   </View>


                           {item.surcos.length > 0 &&
                              <View style={{
                                  backgroundColor:"#f0fff0", 
                                  width:"90%", 
                                  height:89, 
                                  marginVertical:5, 
                                  display:'flex', 
                                  justifyContent:'center', 
                                  alignItems:'center', 
                                  borderRadius:10, 
                                  elevation:3, 
                                  flexDirection:"row"
                        }}>
                          <Text style={{ marginLeft:10, fontWeight:'bold' }}> Surcos: </Text>
                            <FlatList
                                          data={item.surcos}
                                          renderItem={renderIntem}
                                          keyExtractor={(item, index) => index.toString()}
                                          numColumns={8}
                                          contentContainerStyle={styles.lista}/>
                          </View>
                           }
                     </View>
                      </View>
                          )}
                        />
                          </View>
                        </View>
                      </View>
                      </Modal>
                    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fff0",
    padding: 3
  },

  botonContainer: { marginTop: 10 },

  infoSuperior: {
    padding: 10,
    backgroundColor: "#B3E0B3",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    height: "14%"
  },
  infoText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#333",
    marginRight: 50
  },
  rendimiento2: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#333",
    marginRight: 50,
    marginTop: -3
  },
  unidad: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#333",
    marginRight: 50,
    marginTop: 1
  },
  fecha: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#333",
    marginRight: 3
  },
  rowInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 5
  },
  lista: {
    paddingBottom: 100,
    justifyContent: "center",

    width: "100%",
    display: "flex"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    margin: 7,
    width: "42%",
    height: 215,
    marginTop: 18,
    left: 15,

    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    position: "relative"
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 20,
    marginBottom: 5
  },
  cardButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5
  },
  codigo: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2
  },
  nombre: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 10,
    paddingTop: -2,
    textTransform: "capitalize",
    color: "#666",
    fontWeight: "bold"
  },
  surc: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: "bold"
  },
  avanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5
  },
  avanceLabel: {
    color: "green",
    fontSize: 12,
    fontWeight: "bold"
  },
  avanceBox: {
    backgroundColor: "green",
    paddingHorizontal: 6,
    borderRadius: 3,
    marginLeft: 6
  },
  avanceText: {
    color: "white",
    fontWeight: "bold"
  },
  botonAgregar: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "green",
    borderRadius: 40,
    width: 66,
    height: 66,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center"
  },
  cerrar: {
    position: "absolute",
    top: 10,
    right: 10
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20
  },
  label: {
    alignSelf: "flex-start",
    fontWeight: "bold",
    marginTop: 7,
    fontSize: 14
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    width: "100%",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 5
  },
  nombreBloqueado: {
    backgroundColor: "#ddd"
  },
  botonBuscar: {
    backgroundColor: "green",
    marginTop: 15,
    paddingVertical: 7,
    borderRadius: 5,
    alignItems: "center",
    width: "100%"
  },
  botonTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13
  },
  botonModal: {
    backgroundColor: "green",
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center"
  },
  nuevoModalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    alignItems: "center"
  },
  cerrarIcono: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1
  },
  filaCodigoBuscar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    width: "100%",
    gap: 11,
    marginBottom: 8
  },
  filaSurcoAvance: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    gap: 10,
    marginTop: 15
  },
  boxInputChico: {
    flex: 1
  },
  botonAgregarMini: {
    backgroundColor: "green",
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end"
  },
  zonaGrisPreview: {
    backgroundColor: "#ccc",
    height: 145,
    width: "100%",
    marginTop: 20,
    borderRadius: 10
  },
  flatlistContent: {
    flexGrow: 1,
    justifyContent: "flex-start"
  },
  botonAceptar: {
    backgroundColor: "green",
    marginTop: 18,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    width: "100%"
  },
  botonBuscar: {
    backgroundColor: "green",
    paddingVertical: 6.5,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center"
  },
  itemPreview: {
    backgroundColor: "white",
    margin: 7,
    padding: 2,
    borderRadius: 10,
    alignItems: "center",
    width: 60,
    height: 50,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "green",
    position: "relative"
  },
  itemPreviewSelected: {
    backgroundColor: "green",
    margin: 7,
    padding: 2,
    borderRadius: 10,
    alignItems: "center",
    width: 60,
    height: 50,
    display: "flex",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
    position: "relative"
  },
  surcoPreview: {
    fontSize: 13.5,
    color: "#666",
    fontWeight: "bold",
    textAlign: "center"
  },
  surcoPreviewSelected: {
    fontSize: 13.5,
    color: "#ffffffff",
    fontWeight: "bold",
    textAlign: "center"
  },
  surcoPreviewBlock: {
    fontSize: 13.5,
    color: "#ffffffff",
    fontWeight: "bold",
    textAlign: "center"
  },
  itemPreviewBlock: {
    backgroundColor: "gray",
    margin: 7,
    padding: 2,
    borderRadius: 10,
    alignItems: "center",
    width: 60,
    height: 50,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
    position: "relative"
  },
  avancePreview: {
    fontSize: 12,
    color: "green",
    textAlign: "center",
    marginTop: 2,
    fontWeight: "bold"
  },
  eliminarBoton: {
    position: "absolute",
    top: -10,
    right: -10,
    zIndex: 1
  },
  loadingOverlay: {
    flex: 1, // 👈 Importante: Esto hace que ocupe todo el espacio vertical disponible
    justifyContent: "center", // 👈 Centra el contenido (ActivityIndicator) verticalmente
    alignItems: "center" // 👈 Centra el contenido horizontalmente
  }
});
