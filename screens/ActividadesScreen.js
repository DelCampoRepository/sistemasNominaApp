import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import herramientas from '../assets/herramientas.png';
import { useNavigation } from '@react-navigation/native';
import { getRealmInstance } from '../realm';
import * as services from '../services/services';
import localStorage from '../utils/localStorage';
import { SurcosContext } from '../Contexts/SurcosContext';


const ActividadesScreen = ({ route }) => {
    const [loading, setLoading] = useState(false)
    const [realmInstance, setRealmInstance] = useState(null);

    const { numeroNave, nombreNave, Descripcion, descripcionTabla } = route.params || {};
    const [actividades, setActividades] = useState([]);
    const { CodigoActividad, setCodigoActividad, CodigoTemporada } = useContext(SurcosContext);

    // console.log(CodigoTemporada, "wwwwwwwwwwww")
    const navigation = useNavigation();

    // Función para capitalizar la primera letra de cada palabra y limpiar espacios
    const capitalizarFrase = (frase) => {
        if (!frase) return '';
        return frase
            .trim()
            .toLowerCase()
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
            .join(' ');
    };


    useEffect(() => {
        const inicializarRealm = async () => {

            setRealmInstance(await getRealmInstance());
        };
        inicializarRealm();
    }, []);


    useEffect(() => {
        const getActividades = async () => {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
            }, 1000);
            try {
                const actividadesRealm = realmInstance.objects('Actividades');
                setActividades(actividadesRealm);
            } catch (error) {
                console.error("Error al cargar actividades de Realm:", error);
            } finally {
                //setLoading(false);
            }
        }
        if (realmInstance != null)
            getActividades();
    }, [realmInstance]);



    const getUserData = async () => {
        const userData = await localStorage.get("USER_DATA");
        return userData ? JSON.parse(userData) : null;
    };


    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                setCodigoActividad(item.CodigoAvance)

                navigation.navigate('Empleados', {
                    actividadSeleccionada: item,
                    naveSeleccionada: {
                        numeroNave: numeroNave,
                        nombreNave: nombreNave,
                        Descripcion: descripcionTabla,
                        codigoActividad: item.CodigoActividad,
                        CodigoAvance: item.CodigoAvance
                    }
                });
            }}
        >


            <Image source={herramientas} style={styles.icono} />
            <Text style={styles.idTexto}>{item.CodigoActividad} - {item.CodigoAvance}</Text>
            <Text style={styles.nombreTexto}>{capitalizarFrase(item.Descripcion)}</Text>

            {item.tieneSurcos && (
                <Image source={require("../assets/check...png")} style={styles.checkIcon} />
            )}
        </TouchableOpacity>
    );




    return (
        <View style={styles.contenedor}>
            <View style={styles.headerContainer}>
                <View style={styles.subcontainer}>
                    <Text style={[styles.headerDetailText, styles.sharedoption]}>         {numeroNave}</Text>
                    <Text style={[styles.headerDetailText, styles.sharedoption]}>{nombreNave}
                    </Text>

                    <Text style={[styles.headerDetailText, styles.sharedoption]}>{descripcionTabla}</Text>

                </View>
            </View>



            {loading ? (<View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#00aa00" />
            </View>
            ) : (

                <FlatList
                    data={actividades}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.CodigoActividad && item.CodigoAvance ? `${item.CodigoActividad}-${item.CodigoAvance}` : index.toString()}
                    numColumns={3}
                    contentContainerStyle={styles.lista}
                />
            )}

        </View>
    );

};







const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#f0fff0',
        paddingTop: 18,
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtitulos: {
        alignItems: 'center',
    },
    subtituloTexto: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        marginBottom: 20,
    },
    lista: {
        alignItems: 'center',
        paddingTop: 5,
        paddingHorizontal: 3,
        rowGap: 15,
        marginLeft: -11, // 🔸 Esto lo empuja hacia la derecha

        columnGap: 18,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 13,
        width: '30%', // Ajusta según tu diseño para 3 columnas
        minWidth: 122,
        padding: 2,
        margin: 3.5,
        alignItems: 'center',
        elevation: 5,
        height: 102,
        justifyContent: 'center',
    },
    icono: {
        width: 29,
        height: 29,
        marginTop: 1
    },
    idTexto: {
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
        fontSize: 13,
        marginTop: 2,
    },
    nombreTexto: {
        fontSize: 11,
        textAlign: 'center',
        color: '#666',
        textTransform: 'none',
        flex: 1,
        fontWeight: 'bold'
    },
    checkIcon: {
        width: 23,
        height: 23,
        position: 'absolute',
        top: 3,
        right: 5,
    },

    headerContainer: {
        backgroundColor: '#B3E0B3',
        paddingVertical: 16,
        marginBottom: 18,
        borderRadius: 2,
    },

    subcontainer: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
    },

    headerDetailText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',


    },

    sharedoption: {
        fontWeight: '600',
    },

});

export default ActividadesScreen;