import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as services from '../services/services';
import { useNavigation } from '@react-navigation/native';
import { SurcosContext } from '../Contexts/SurcosContext';
import { Dimensions } from 'react-native';
import { obtenerReporteActividades } from '../services/services';
const screenWidth = Dimensions.get("window").width;



const ListaEmpleados = ({ route }) => {

    const { codJefNave, CodigoTemporada } = useContext(SurcosContext)
    const [lista, setLista] = useState([]);
    const [listaActividades, setListaActividades] = ([]);
    const [codigoEmpleado, setcodigoEmpleado] = useState("")

    const [loading, setLoading] = useState(false)

    const navigation = useNavigation()

    const {
        opcion,
        codigoLote,
        codigoNave,
        codigoTabla,
        codigoTemporada,
        codigoActividad,
        codigoAvance,
        descripcionLote,
        descripcionNave,
        tablaLabel,
        fechaInicio,
        fechaFin,
        codigoJefeNave,
        CantidadActividades,
        nombre,
        listaReporteEmpleados,
        fecha,



    } = route.params || {};

    // console.log(nombre, "22222222222222222222222222")


    useEffect(() => {
        if (listaReporteEmpleados) {
            setLoading(true)
            setTimeout(() => {
                setLoading(false);
            }, 1000);

            setLista(listaReporteEmpleados);

        }

    }, [listaReporteEmpleados]);



    useEffect(() => {
        // setLoading(true);
        //  console.log("listaReporteEmpleados recibida:", listaReporteEmpleados);

    }, []);


    const cargarListaActividades = async (CodEmpleado, Nombre) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1000);

        try {
            //console.log('wwwwwwwwwwwww')
            //  console.log(codigoLote, codigoNave, 27, formatearFecha3(fechaInicio), formatearFecha3(fechaFin), CodEmpleado)
            const parametros = {
                opcion: 2,
                codigoLote,
                codigoNave,
                codigoTemporada: CodigoTemporada,
                fechaInicio: formatearFecha3(fechaInicio),
                fechaFin: formatearFecha3(fechaFin),
                codigoEmpleado: CodEmpleado,
                codigoJefeNave: codJefNave,
                codigoTabla: parseInt(codigoTabla),
                nombre: nombre
            };




            const response = await services.obtenerReporteActividades(parametros);

            if (!response || !response.datos || response.datos.length === 0) {
                Alert.alert("Información", "No hay datos disponibles para el rango de fechas seleccionado.");
                return;
            }
            navigation.navigate("ReporteAct", {
                opcion: opcion,
                descripcionLote: codigoLote,
                descripcionNave: descripcionNave,
                tablaLabel: tablaLabel,
                fechaInicio: formatearFecha3(fechaInicio),
                fechaFin: formatearFecha3(fechaFin),
                codigoNave: codigoNave,
                codigoTabla: codigoTabla,
                codigoJefeNave: codJefNave,
                listaSurcosActividades: response.datos,
                codigoEmpleado: CodEmpleado,
                nombre: Nombre,
            });

        } catch (error) {
            Alert.alert("Del Campo y Asociados", "Ocurrio un problema al cargar las activ");
            console.error(error);
        }
        finally {
            // setLoading(false);
        }

    }


    const navegarPantallaAct = async (CodEmpleado, Nombre) => {
        await cargarListaActividades(CodEmpleado, Nombre)

    }



    const formatearFecha3 = (fechaInicio) => {
        const [dia, mes, anio] = fechaInicio.split("/");
        return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
    };








    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navegarPantallaAct(item.CodigoEmpleado, item.Nombre)}>

            <View style={styles.card}>
                <Image
                    source={require('../assets/usuario2.png')}
                    style={styles.icono}
                />
                <Text style={styles.codigo}>{item.CodigoEmpleado}</Text>
                <Text style={styles.nombre}>{item.Nombre}</Text>


                <View style={styles.actividadRow}>
                    <Text style={styles.label}>Acts. realizadas: </Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.CantidadActividades}</Text>
                    </View>
                </View>

            </View>
        </TouchableOpacity >
    );



    return (

        <View style={{ flex: 1, backgroundColor: '#f0fff0' }}>

            <View style={styles.headerContainer}>
                <View style={styles.subcontainer}>
                    <Text style={[styles.headerDetailText, styles.sharedoption]}>{codigoLote}</Text>
                    <Text style={[styles.headerDetailText, styles.sharedoption]}>{descripcionNave}</Text>

                    <Text style={[styles.headerDetailText, styles.sharedoption]}>{tablaLabel ? ` ${tablaLabel}` : 'Cargando Tabla...'} </Text>
                    <Text style={[styles.headerDetailText, styles.sharedoption]}>
                        Del {fechaInicio} al {fechaFin}
                    </Text>
                </View>
            </View>



            {loading ? (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="green" style={{ marginTop: 30 }} />
                </View>

            ) : (
                lista && (
                    <FlatList
                        data={lista}
                        keyExtractor={(item) => item.CodigoEmpleado.toString()}
                        numColumns={3}
                        horizontal={false}
                        contentContainerStyle={styles.lista}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={true}
                    />
                )
            )}
        </View>
    );
};




const styles = StyleSheet.create({


    headerContainer: {
        backgroundColor: '#B3E0B3',
        paddingVertical: 7,
        paddingHorizontal: 13,
        marginBottom: 10,
    },

    lista: {
        justifyContent: 'flex-start',

    },
    subcontainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    headerDetailText: {
        color: '#333',
        fontSize: 13,
        marginVertical: 3,
    },
    sharedoption: {
        fontWeight: 'bold',
    },
    actividadRow: {
        flexDirection: 'colum',
        alignItems: 'center',
        marginTop: 8,
    },


    nombre: {
        fontWeight: 'bold',
        fontSize: 12.1,
        color: '#666',
        marginBottom: 10,
        textTransform: 'capitalize',
        textAlign: "center",
        flexWrap: "wrap",
        maxWidth: "90%",
        alignSelf: "center",

    },

    codigo: {
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 3,
        margin: 3.5
    },
    icono: {
        width: 45,
        height: 45,
        marginTop: 1,
        resizeMode: 'contain',

    },


    card: {
        backgroundColor: '#fff',
        margin: 7, // margen pequeño entre tarjetas
        borderRadius: 10,
        alignItems: 'center',
        padding: 13,
        justifyContent: 'center',
        elevation: 7,
        height: 180,
        elevation: 7,
        flex: 1,                 //  ocupa espacio proporcional
        maxWidth: screenWidth / 3 - 12, //  máximo 3 columnas
    },


    badge: {
        backgroundColor: 'green',
        borderRadius: 7,
        paddingHorizontal: 9,
        paddingVertical: 2,
        marginLeft: 4,
        alignSelf: 'center',
        marginTop: 4
    },
    badgeText: {
        color: 'white',
        fontSize: 9.5,
        fontWeight: 'bold',
    },


    negrita: {
        fontWeight: 'bold',
    },

    label: {
        fontSize: 11,
        color: '#666',
        fontWeight: 'bold',
        marginTop: -6
    },
    loadingOverlay: {
        flex: 1, // 👈 Importante: Esto hace que ocupe todo el espacio vertical disponible
        justifyContent: 'center', // 👈 Centra el contenido (ActivityIndicator) verticalmente
        alignItems: 'center',    // 👈 Centra el contenido horizontalmente
    },
});







export default ListaEmpleados;
