import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import herramientas from '../assets/herramientas.png';
import { SurcosContext } from '../Contexts/SurcosContext';



const ReporteAct = ({ route, navigation }) => {

    const { CodigoTemporada, codJefNave } = useContext(SurcosContext);
    const [loading, setLoading] = useState(false);


    const {
        opcion,
        nombre,
        descripcionLote,
        descripcionNave,
        tablaLabel,
        fechaInicio,
        fechaFin,
        codigoNave,
        codigoTabla,
        codigoLote,
        listaSurcosActividades,
        codigoEmpleado,

    } = route.params || {};


    const [lista, setLista] = useState([]);

    useEffect(() => {
        if (listaSurcosActividades) {
            setLoading(true)
            setTimeout(() => {
                setLoading(false);
            }, 1000);

        }
        setLista(listaSurcosActividades);

    }, [listaSurcosActividades])




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




    const Actividad = ({ CodigoActividad, Descripcion, CantidadSurcos, CodigoAvance, navigation }) => (


        <TouchableOpacity
            style={styles.surcoTarjeta}
            onPress={() => {

                const [dia, mes, anio] = formattedFechaInicio.split('/');
                const nuevaFechaIni = `${anio}-${mes}-${dia}`;
                const [diaf, mesf, aniof] = formattedFechaFin.split('/');
                const nuevaFechaFin = `${aniof}-${mesf}-${diaf}`;



                navigation.navigate('ListaSurcos', {
                    opcion: opcion,
                    codigoLote: codigoLote == undefined ? descripcionLote : codigoLote,
                    codigoNave: codigoNave,
                    codigoTabla: codigoTabla,
                    codigoTemporada: CodigoTemporada,
                    codigoActividad: CodigoActividad,
                    descripcion: Descripcion,
                    codigoAvance: CodigoAvance,
                    cantidadSurcos: CantidadSurcos,
                    descripcionLote: codigoLote,
                    descripcionNave: descripcionNave,
                    tablaLabel: tablaLabel,
                    fechaInicio: fechaInicio,
                    fechaFin: fechaFin,
                    codigoJefeNave: codJefNave,
                    codigoEmpleado: codigoEmpleado,
                    nombre: nombre

                });
            }}
        >
            <Image source={herramientas} style={styles.surcoIcono} />
            <Text style={styles.surcoCodigoActividad}> {CodigoActividad} - {CodigoAvance}</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: -2 }}>
                <Text style={styles.textoNegro}>
                    {capitalizar(Descripcion)}
                </Text>

            </View>

            <View style={styles.surcoCantSurcosContainer}>
                <Text style={styles.surcoCantSurcosLabel}>Cant. Surcos:</Text>
                <View style={styles.surcoCantSurcosValorCaja}>
                    <Text style={styles.surcoCantSurcosValor}>{CantidadSurcos}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );





    // fechas para el encabezado
    const formattedFechaInicio = fechaInicio || 'N/A';
    const formattedFechaFin = fechaFin || 'N/A';


    return (



        <View style={styles.contenedor}>
            <View style={styles.headerContainer}>
                {/*encabezado*/}
                <Text style={styles.headerDetailText}>{descripcionLote}</Text>
                <Text style={styles.headerDetailText}>{descripcionNave}</Text>
                <Text style={styles.headerDetailText}>{tablaLabel ? ` ${tablaLabel}` : 'Cargando Tabla...'}</Text>
                {codigoEmpleado && nombre && <Text style={styles.headerDetailText}>{codigoEmpleado} - {nombreCapitalizado}   </Text>}

                <Text style={styles.headerDetailText}>Del {formattedFechaInicio} Al {formattedFechaFin}</Text>
            </View>


            {loading ? (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="green" />
                </View>

            ) : (

                <FlatList
                    data={lista}
                    renderItem={({ item }) =>
                    (<Actividad CodigoActividad={item.CodigoActividad}
                        CodigoAvance={item.CodigoAvance}
                        Descripcion={item.Descripcion}
                        CantidadSurcos={item.CantidadSurcos}
                        navigation={navigation} />)}

                    keyExtractor={(item, index) => `${item.CodigoActividad}-${index}`}
                    numColumns={3}
                    contentContainerStyle={styles.flatListContent}


                    ListEmptyComponent={() => (
                        <Text style={styles.emptyListText}>
                            No hay actividades para el rango de fechas seleccionado.
                        </Text>
                    )}
                />
            )}
        </View>);
};


const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#f0fff0',
    },

    headerContainer: {
        backgroundColor: '#B3E0B3',
        paddingHorizontal: 10,
        paddingTop: 15,
        paddingBottom: 10,

    },
    textoNegro: {
        color: '#666',
        fontSize: 13.5,
        fontWeight: 'bold'
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: -4,
    },


    headerDetailText: {
        fontSize: 13,
        color: '#333',
        marginBottom: 3,
        marginLeft: 1,
        fontWeight: 'bold',
    },

    flatListContent: {
        padding: 10,
        justifyContent: 'space-around',
    },

    surcoTarjeta: {
        width: 130,
        height: 110,
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 5,
        paddingHorizontals: 8,
        marginTop: 10
    },
    surcoIcono: {
        width: 45,
        height: 33,
        resizeMode: 'contain',
    },
    surcoCodigoDescripcion: {
        backgroundColor: '#f0f0f0',
        width: '100%',

    },
    surcoCodigoActividad: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#333',

    },
    surcoCantSurcosContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    surcoCantSurcosLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 4,
    },
    surcoCantSurcosValorCaja: {
        backgroundColor: 'green',
        borderRadius: 5,
        paddingVertical: 1,
        paddingHorizontal: 6.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    surcoCantSurcosValor: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },


});

export default ReporteAct;