import React, { use, useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert, } from 'react-native';
import { getRealmInstance } from '../realm';
import * as services from '../services/services';
import { SurcosContext } from '../Contexts/SurcosContext';


//Funcion que pintara el surco si esta trabajado o no
const ListaSurcos = ({ route, navigation }) => {

    const [loading, setLoading] = useState(false);


    const { CodigoTemporada, navesPorUsuario, setNavesporUsuario, token } = useContext(SurcosContext);

    const [surcosFill, setSurcosFill] = useState([]);
    const {
        opcion,
        codigoLote,
        codigoNave,
        codigoTabla,
        codigoTemporada,
        codigoActividad,
        descripcion,
        codigoAvance,
        cantidadSurcos,
        descripcionLote,
        descripcionNave,
        tablaLabel,
        fechaInicio,
        fechaFin,
        codigoJefeNave,
        codigoEmpleado,
        nombre

    } = route.params || {};

    //console.log(nombre, 'aaaaaaaaaaaaaaaaaa')

    useEffect(() => {
        // console.log("Parametros enviados:", parametros);
        obtenerNavesPorUsuario();


    }, []);

    /*  useEffect(() => {
  
          const parametros = {
              opcion: opcion,
              codigoLote: codigoLote,
              codigoNave: codigoNave,
              codigoTemporada: codigoTemporada,
              codigoActividad: codigoActividad,
              codigoAvance: codigoAvance,
              fechaInicial: fechaInicio,
              fechaFinal: fechaFin,
              codigoJefeNave: codigoJefeNave,
              codigoTabla: codigoTabla,
              codigoEmpleado: codigoEmpleado,
              nombre: nombre
          }
          //console.log(parametros, "aaaaaaaaaaaaaaaaaaaaaaaaa")
          obtenerSurcos(parametros);
      }, [navesPorUsuario]);
  
  
  */

    useEffect(() => {
        // Verifica si la lista de naves ya se cargó y tiene elementos
        if (navesPorUsuario && navesPorUsuario.length > 0) {

            // Busca la nave específica que necesitamos para CantidadSurcos
            const naveEncontrada = navesPorUsuario.find(n => n.CodigoNave === codigoNave);

            // Solo si la nave existe, llamamos a la función de carga
            if (naveEncontrada) {
                const parametros = {
                    opcion: opcion,
                    codigoLote: codigoLote,
                    codigoNave: codigoNave,
                    codigoTemporada: codigoTemporada,
                    codigoActividad: codigoActividad,
                    codigoAvance: codigoAvance,
                    fechaInicial: fechaInicio,
                    fechaFinal: fechaFin,
                    codigoJefeNave: codigoJefeNave,
                    codigoTabla: codigoTabla,
                    codigoEmpleado: codigoEmpleado,
                    nombre: nombre
                };

                obtenerSurcos(parametros);
            }
        }
    }, [navesPorUsuario, codigoNave, codigoLote, codigoTabla, codigoEmpleado]);




    async function obtenerSurcos(params) {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1000);


        try {

            const Surcos = [];
            const response = await services.ObtenerSurcosTrabajados(params);

            if (!response.datos || response.datos.length === 0) {
                return null;
            }

            const ListaSurcosTrabajados = response.datos;

            const nave = navesPorUsuario.find(nave => nave.CodigoNave === codigoNave);

            if (!nave) {

                console.log("PREVENCIÓN DE ERROR: Nave no encontrada al obtener surcos.");
                setLoading(false);
                return;
            }


            for (let i = 0; i < nave.CantidadSurcos; i++) {


                if (ListaSurcosTrabajados[i] !== undefined) {
                    Surcos.push({
                        index: i,
                        surco: ListaSurcosTrabajados[i].CodigoSurco.toString(),
                        avance: ListaSurcosTrabajados[i].Avance.toString(),
                        trabajado: true,
                    })
                }
                else {
                    Surcos.push({
                        index: i,
                        surco: i + 1,
                        avance: 0,
                        trabajado: false,
                    })

                }


            };

            setSurcosFill(Surcos);

        } catch (error) {
            Alert.alert("Del Campo y Asociados", "Ocurrio un problema al cargar los surcos.")
            console.error(error);

        }
        finally {
            //setLoading(false);
        }
    };



    async function obtenerNavesPorUsuario() {
        const response = await services.obtenerNavesPorUsuario(codigoJefeNave, CodigoTemporada, token);

        if (!response.data || response.data.length === 0) {

            return null;
        }
        //console.log("Naves por usuario:");
        //console.log(response.data);
        setNavesporUsuario(response.data);
        //console.log("Naves por usuario:", navesPorUsuario);

        const naveE2 = navesPorUsuario.find(nave => nave.CodigoNave === codigoNave);
        if (naveE2) {
            console.log("Nave E2 encontrada:", naveE2.CantidadSurcos);
        } else {
            console.log("Nave E2 no encontrada");
        }


    }

    const renderItem = ({ item }) => {
        const trabajado = Number(item.avance) === 1;

        return (
            <View style={[styles.surco, trabajado && styles.surcoTrabajado]}>
                <Text style={styles.numero}>{item.surco}</Text>

                <View style={styles.avanceBox}>
                    <Text style={styles.avanceLabel}>A:</Text>
                    <View style={styles.avanceValueBox}>
                        <Text style={styles.avanceValue}>{item.avance}</Text>
                    </View>
                </View>
            </View>
        );
    };
    if (surcosFill.length === 0) return null;



    const capitalizar = (texto) => {
        if (!texto) return '';
        return texto
            .trim()
            .toLowerCase()
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
            .join(' ');
    };
    const nombreCapitalizado = capitalizar(nombre);
    const descripcionCapitalizado = capitalizar(descripcion)


    return (
        <View style={styles.contenedor}>

            {
                surcosFill.length > 0 &&
                (
                    <View>

                        <View style={styles.headerContainer}>
                            <View style={styles.subcontainer}>
                                <Text style={[styles.headerDetailText, styles.sharedoption]} >{codigoLote} </Text>
                                <Text style={[styles.headerDetailText, styles.sharedoption]}>{descripcionNave}</Text>
                                <Text style={[styles.headerDetailText, styles.sharedoption]}>{tablaLabel}</Text>
                                <Text style={[styles.headerDetailText, styles.sharedoption]}>{codigoActividad}-{codigoAvance}  {descripcionCapitalizado} </Text>
                                {nombre && codigoEmpleado && <Text style={[styles.headerDetailText, styles.sharedoption]}>{codigoEmpleado} - {nombreCapitalizado}</Text>}

                                <Text style={[styles.headerDetailText, styles.sharedoption]}>Del {fechaInicio}  Al  {fechaFin} </Text>
                            </View>
                        </View>


                        <View style={styles.contsecondary}>
                            <View style={styles.leyenda}>
                                <View style={styles.indicador} />
                                <Text style={styles.leyendaTexto}>Surco Trabajado</Text>
                            </View>




                            <View>


                                {loading ? (
                                    <View style={styles.loadingOverlay}>
                                        <ActivityIndicator size="large" color="green" />
                                    </View>

                                ) : (
                                    <FlatList
                                        data={surcosFill}
                                        renderItem={renderItem}
                                        keyExtractor={(item) => item.index.toString()}
                                        numColumns={3}
                                        contentContainerStyle={styles.lista}
                                        ListEmptyComponent={() => (
                                            <Text style={styles.emptyListText}>
                                                No hay surcos para el rango de fechas seleccionado.
                                            </Text>
                                        )}
                                    />
                                )}
                            </View>
                        </View>
                    </View>
                )}
        </View>
    );
};

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#ecf8eb',
    },

    subcontainer: {
        paddingTop: 8,
        paddingBottom: 8
    },
    contsecondary: {
        padding: 10,
    },

    sharedoption: {
        paddingBottom: 1
    },

    headerDetailText: {
        fontSize: 13.5,
        color: '#333',
        fontWeight: 'bold',
    },
    headerContainer: {
        backgroundColor: '#B3E0B3',
        paddingHorizontal: 10,
        paddingTop: 2,
        paddingBottom: 8,
        borderRadius: 5,

    },
    leyenda: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        marginBottom: 20
    },
    indicador: {
        width: 13,
        height: 12,
        backgroundColor: '#aee5b1',
        borderRadius: 2,
        marginRight: 9,

    },
    leyendaTexto: {
        fontSize: 12.5,
        color: '#555',
        paddingBottom: -10,
        fontWeight: 'bold'
    },
    lista: {
        marginTop: -10,
    },

    surco: {
        width: 95,
        height: 55,
        borderRadius: 10,
        backgroundColor: '#fff',
        margin: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 2 },
        elevation: 3,
        paddingTop: 2,
    },
    surcoTrabajado: {
        backgroundColor: '#b2eacb',
    },
    numero: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    avanceBox: {
        flexDirection: 'row',
        alignItems: 'center',

    },
    avanceLabel: {
        fontSize: 13,
        marginRight: 6,
        color: '#000',
    },
    avanceValueBox: {
        backgroundColor: '#0b7a0b',
        paddingHorizontal: 13,
        paddingVertical: -3,
        borderRadius: 4,

    },
    avanceValue: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 11.5
    },
    loadingOverlay: {
        flex: 1, // 👈 Importante: Esto hace que ocupe todo el espacio vertical disponible
        justifyContent: 'center', // 👈 Centra el contenido (ActivityIndicator) verticalmente
        alignItems: 'center',    // 👈 Centra el contenido horizontalmente
    },

});




export default ListaSurcos;
